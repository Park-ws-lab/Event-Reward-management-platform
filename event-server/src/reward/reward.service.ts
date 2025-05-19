// reward 관련 로직을 처리하는 서비스 클래스

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Reward, RewardDocument } from './schemas/reward.schema';
import { Model, Types } from 'mongoose';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class RewardService {
    constructor(
        // MongoDB Reward 모델 주입
        @InjectModel(Reward.name) private rewardModel: Model<RewardDocument>,
    ) { }

    // 보상 생성
    async createReward(dto: CreateRewardDto): Promise<Reward> {
        const { eventId, ...rest } = dto;

        // 문자열 형태의 이벤트 ID를 ObjectId로 변환
        const reward = new this.rewardModel({
            event: new Types.ObjectId(eventId),
            ...rest,
        });

        return reward.save(); // DB에 저장
    }

    // 전체 보상 목록 조회 (이벤트 정보도 함께 조회)
    async getAllRewards(): Promise<Reward[]> {
        return this.rewardModel
            .find()                 // 전체 보상 조회
            .populate('event')     // 연관된 이벤트 정보 포함
            .exec();               // 쿼리 실행
    }

    // 보상 수정
    async updateRewardOrFail(id: string, dto: UpdateRewardDto) {
        const updated = await this.rewardModel.findByIdAndUpdate(id, dto, {
            new: true,
        }).exec();

        if (!updated) {
            throw new NotFoundException('보상을 찾을 수 없습니다.');
        }

        return {
            message: '보상이 수정되었습니다.',
            reward: updated,
        };
    }


    // 보상 삭제
    async deleteRewardOrFail(id: string) {
        const result = await this.rewardModel.deleteOne({ _id: id }).exec();

        if (result.deletedCount === 0) {
            throw new NotFoundException('이미 삭제되었거나 존재하지 않는 보상입니다.');
        }

        return { message: '보상이 삭제되었습니다.' };
    }
}
