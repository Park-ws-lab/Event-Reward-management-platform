// 친구초대 이벤트 관련 로직을 처리하는 서비스

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Invite } from './schemas/invite.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class InviteService {
    constructor(
        // MongoDB의 Invite 모델 주입
        @InjectModel(Invite.name) private readonly inviteModel: Model<Invite>,
    ) {}

    // 이미 초대한 적 있는지 중복 여부 확인
    async checkDuplicate(inviter: string, invited: string): Promise<boolean> {
        const found = await this.inviteModel.findOne({
            inviter: new Types.ObjectId(inviter),
            invited: new Types.ObjectId(invited),
        });
        return !!found; // 존재하면 true, !!found === Boolean(found)
    }

    // 초대 정보 저장
    async create(inviter: string, invited: string) {
        const invite = new this.inviteModel({
            inviter: new Types.ObjectId(inviter),
            invited: new Types.ObjectId(invited),
        });
        return invite.save();
    }

    // 특정 사용자가 초대한 인원 수 조회
    async countInvites(userId: string): Promise<number> {
        return this.inviteModel.countDocuments({
            inviter: new Types.ObjectId(userId),
        });
    }
}
