// reward-request 관련 로직을 처리하는 서비스 클래스

import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel, } from '@nestjs/mongoose';
import { RewardRequest } from './schemas/reward-request.schema';
import { Model, Types } from 'mongoose';
import { Event, EventDocument } from '../event/schemas/event.schema';
import { Reward, RewardDocument } from '../reward/schemas/reward.schema';
import { InviteService } from '../event-list/invite/invite.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RewardRequestService {
  constructor(
    // 보상 요청 모델
    @InjectModel(RewardRequest.name)
    private readonly requestModel: Model<RewardRequest>,

    // 이벤트 모델
    @InjectModel(Event.name)
    private readonly eventModel: Model<EventDocument>,

    // 보상 모델
    @InjectModel(Reward.name)
    private readonly rewardModel: Model<RewardDocument>,

    // 초대 수 검증을 위한 서비스
    private readonly inviteService: InviteService,

    private readonly httpService: HttpService,
  ) { }

  // 이벤트 조건 문자열에 따라 보상 수령 자격을 검증하는 메서드
  async validateCondition(userId: string, condition: string): Promise<boolean> {
    switch (condition) {

      // 첫 로그인 조건: 별도 검사 없이 무조건 통과
      case 'FIRST_LOGIN':
        return true;

      // 초대한 친구 수가 3명 이상인지 검사
      case 'INVITE_THREE':
        const count = await this.inviteService.countInvites(userId); // 초대한 친구 수 조회
        return count >= 3;

      // 로그인 횟수 기반 조건 검사
      case 'LOGIN_THREE':
      case 'LOGIN_SEVEN_RECENT': {
        try {
          // 내부 API를 통해 로그인 로그 데이터 요청
          const { data } = await firstValueFrom(
            this.httpService.get(`http://auth-server:${process.env.AUTH_PORT}/user/login-count/${userId}`)
          );
          // 전체 고유 로그인 일수가 3일 이상인지 검사
          if (condition === 'LOGIN_THREE') {
            return data.totalUniqueDays >= 3;

            // 7일 연속 출석 검사
          } else {
            return data.recent7DaysUnique == 7;
          }
        } catch (error) {
          // 로그인 로그 서버 요청 실패 시 조건 불충족 처리
          console.error('Login log fetch failed:', error.message);
          return false;
        }
      }

      // 로그인 횟수 기반 조건 검사
      case 'DAILY_LOGIN': {
        const { data } = await firstValueFrom(
          this.httpService.get(`http://auth-server:${process.env.AUTH_PORT}/user/login-count/${userId}`)
        );

        // 오늘 하루에만 로그인했는지 확인
        const today = new Date().toISOString().slice(0, 10);
        return data.loggedDates?.includes(today);
      }

      // 등록되지 않은 조건일 경우 무조건 실패 처리
      default:
        return false;
    }
  }

  // 보상 요청 생성 로직
  async createRequest(userId: string, eventId: string) {
    // 이벤트 정보 조회 (존재 여부 + 활성 상태 확인 포함)
    const event = await this.eventModel.findById(eventId);
    if (!event || !event.isActive) {
      throw new BadRequestException('존재하지 않거나 비활성화된 이벤트입니다.');
    }

    // 중복 보상 방지
    if (event.condition === 'DAILY_LOGIN') {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);

      const todayReward = await this.requestModel.findOne({
        userId: new Types.ObjectId(userId),
        eventId: new Types.ObjectId(eventId),
        status: 'SUCCESS',
        createdAt: { $gte: start, $lte: end },
      });

      if (todayReward) {
        throw new BadRequestException('오늘 이미 보상을 지급받았습니다.');
      }
    } else {
      const existing = await this.requestModel.findOne({
        userId: new Types.ObjectId(userId),
        eventId: new Types.ObjectId(eventId),
        status: 'SUCCESS',
      });

      if (existing) {
        throw new BadRequestException('이미 보상을 지급받은 이벤트입니다.');
      }
    }

    // 보상 존재 여부 확인
    const rewards = await this.rewardModel.find({ event: eventId });
    if (rewards.length === 0) {
      throw new BadRequestException('이벤트에 등록된 보상이 없습니다.');
    }

    // 조건 충족 여부 판단
    const isEligible = await this.validateCondition(userId, event.condition);
    const status = isEligible ? 'SUCCESS' : 'FAILED';

    // 요청 생성
    const request = new this.requestModel({
      userId: new Types.ObjectId(userId),
      event: new Types.ObjectId(eventId),
      status,
    });
    await request.save();

    // 조건 충족 시 리워드 정보 포함
    const rewardList = isEligible
      ? rewards.map((r) => ({
        type: r.type,
        value: r.value,
        quantity: r.quantity,
      }))
      : undefined;

    return {
      message: isEligible
        ? '보상이 지급되었습니다.'
        : '조건을 만족하지 않았습니다.',
      status,
      ...(isEligible && { rewards: rewardList }),
    };
  }


  // 전체 보상 요청 목록 조회 (eventId 또는 status로 필터링 가능)
  async getAllRequests(filters: { eventId?: string; status?: string }) {
    const query: any = {};

    // 필터 조건 설정
    if (filters.eventId) {
      query.event = new Types.ObjectId(filters.eventId);
    }
    if (filters.status) {
      query.status = filters.status;
    }

    const requests = await this.requestModel
      .find(query)
      .populate('event')
      .sort({ createdAt: -1 })
      .exec();

    // 유저 정보 병렬 요청
    const results = await Promise.all(
      requests.map(async (req) => {
        let user = null;
        try {
          const response = await firstValueFrom(
            this.httpService.get(`http://auth-server:${process.env.AUTH_PORT}/user/${req.userId}`)
          );
          user = response.data;
        } catch (err) {
          console.error(`유저 정보 조회 실패: ${req.userId}`, err.message);
        }

        return {
          ...req.toObject(),
          user,
        };
      })
    );

    return results;
  }


  // 특정 유저가 요청한 보상 내역 조회 (이벤트 정보 포함)
  async getRequestsByUser(userId: string) {
    return this.requestModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate('event')
      .sort({ createdAt: -1 })
      .exec();
  }

}
