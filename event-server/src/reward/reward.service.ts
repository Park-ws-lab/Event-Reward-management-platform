import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Reward, RewardDocument } from './reward.schema';
import { Model,Types } from 'mongoose';
import { CreateRewardDto } from './dto/create-reward.dto';

@Injectable()
export class RewardService {
    constructor(
        @InjectModel(Reward.name) private rewardModel: Model<RewardDocument>,
    ) { }

    async createReward(dto: CreateRewardDto): Promise<Reward> {
        const { eventId, ...rest } = dto;
        const reward = new this.rewardModel({
            event: new Types.ObjectId(eventId),
            ...rest,
        });
        return reward.save();
    }

    async getAllRewards(): Promise<Reward[]> {
        return this.rewardModel.find().populate('event').exec();
    }
}
