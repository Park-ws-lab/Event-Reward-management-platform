// reward-request 관련 로직을 처리하는 서비스 클래스

import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RewardRequest } from './reward-request.schema';
import { Model, Types } from 'mongoose';
import { Event } from '../event/event.schema';
import { Reward } from '../reward/reward.schema';
import { InviteService } from '../event/invite.service';

@Injectable()
export class RewardRequestService {
  constructor(
    // 보상 요청 모델
    @InjectModel(RewardRequest.name)
    private readonly requestModel: Model<RewardRequest>,

    // 이벤트 모델
    @InjectModel(Event.name)
    private readonly eventModel: Model<Event>,

    // 보상 모델
    @InjectModel(Reward.name)
    private readonly rewardModel: Model<Reward>,

    // 초대 수 검증을 위한 서비스
    private readonly inviteService: InviteService,
  ) { }

  // 이벤트 조건 문자열에 따라 보상 수령 자격 검증
  async validateCondition(userId: string, condition: string): Promise<boolean> {
    switch (condition) {
      case 'FIRST_LOGIN':
        return true; // 단순 조건: 항상 통과
      case 'INVITE_THREE':
        const count = await this.inviteService.countInvites(userId);
        return count >= 3; // 3명 이상 초대 여부
      default:
        return false; // 조건 미일치 시 실패
    }
  }

  // 보상 요청 생성 로직
  async createRequest(userId: string, eventId: string) {
    // 이미 보상을 지급받은 이벤트인지 확인
    const existing = await this.requestModel.findOne({
      userId: new Types.ObjectId(userId),
      event: new Types.ObjectId(eventId),
      status: 'SUCCESS',
    });
    if (existing) {
      throw new BadRequestException('이미 보상을 지급받은 이벤트입니다.');
    }

    // 보상이 존재하는지 확인
    const rewards = await this.rewardModel.find({ event: new Types.ObjectId(eventId) });
    if (rewards.length === 0) {
      throw new BadRequestException('이벤트에 등록된 보상이 없습니다.');
    }

    // 이벤트 유효성 검사 (존재 여부 + 활성 상태)
    const event = await this.eventModel.findById(eventId);
    if (!event || event.isActive !== true) {
      throw new BadRequestException('존재하지 않거나 비활성화된 이벤트입니다.');
    }

    // 조건 충족 여부 판단
    const isEligible = await this.validateCondition(userId, event.condition);
    const status = isEligible ? 'SUCCESS' : 'FAILED';

    // 보상 요청 생성 및 저장
    const request = new this.requestModel({
      userId: new Types.ObjectId(userId),
      event: new Types.ObjectId(eventId),
      status,
    });
    await request.save();

    // 결과 메시지 및 상태 반환
    return {
      message: isEligible
        ? '보상이 지급되었습니다.'
        : '조건을 만족하지 않았습니다.',
      status,
    };
  }

  // 전체 보상 요청 목록 조회 (유저 + 이벤트 정보 포함)
  async getAllRequests() {
    return this.requestModel
      .find()
      .populate('userId')   // 유저 정보 포함
      .populate('event')    // 이벤트 정보 포함
      .sort({ createdAt: -1 })
      .exec();
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
