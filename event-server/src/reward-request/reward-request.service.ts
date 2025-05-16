// src/reward-request/reward-request.service.ts

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
    @InjectModel(RewardRequest.name)
    private readonly requestModel: Model<RewardRequest>,
    @InjectModel(Event.name)
    private readonly eventModel: Model<Event>,
    @InjectModel(Reward.name)
    private readonly rewardModel: Model<Reward>,
    private readonly inviteService: InviteService,
  ) { }

  async validateCondition(userId: string, condition: string): Promise<boolean> {
    switch (condition) {
      case 'FIRST_LOGIN':
        return true;

      case 'INVITE_THREE':
        const count = await this.inviteService.countInvites(userId);
        return count >= 3;

      default:
        return false;
    }
  }

  async createRequest(userId: string, eventId: string) {
    const existing = await this.requestModel.findOne({
      userId: new Types.ObjectId(userId),
      event: new Types.ObjectId(eventId),
      status: 'SUCCESS',
    });
    if (existing) {
      throw new BadRequestException('이미 보상을 지급받은 이벤트입니다.');
    }

    const rewards = await this.rewardModel.find({ event: new Types.ObjectId(eventId) });
    if (rewards.length === 0) {
      throw new BadRequestException('이벤트에 등록된 보상이 없습니다.');
    }

    const event = await this.eventModel.findById(eventId);
    if (!event || event.isActive !== true) {
      throw new BadRequestException('존재하지 않거나 비활성화된 이벤트입니다.');
    }

    const isEligible = await this.validateCondition(userId, event.condition);
    const status = isEligible ? 'SUCCESS' : 'FAILED';

    const request = new this.requestModel({
      userId: new Types.ObjectId(userId),
      event: new Types.ObjectId(eventId),
      status,
    });

    await request.save();

    return {
      message: isEligible
        ? '보상이 지급되었습니다.'
        : '조건을 만족하지 않았습니다.',
      status,
    };
  }

  async getAllRequests() {
    return this.requestModel
      .find()
      .populate('userId')
      .populate('event')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getRequestsByUser(userId: string) {
    const query: any = { user: userId };

    return this.requestModel
      .find(query)
      .populate('event')
      .sort({ createdAt: -1 })
      .exec();
  }
}
