// reward 관련 로직을 처리하는 서비스 클래스

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Reward, RewardDocument } from './reward.schema';
import { Model, Types } from 'mongoose';
import { CreateRewardDto } from './dto/create-reward.dto';

@Injectable()
export class RewardService {
    constructor(
        // MongoDB Reward 모델 주입
        @InjectModel(Reward.name) private rewardModel: Model<RewardDocument>,
    ) {}

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
}
