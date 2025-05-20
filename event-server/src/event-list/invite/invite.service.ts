// 친구초대 이벤트 관련 로직을 처리하는 서비스

import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Invite } from './schemas/invite.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class InviteService {
    constructor(
        // MongoDB의 Invite 모델 주입
        @InjectModel(Invite.name)
        private readonly inviteModel: Model<Invite>,
    ) { }

    // 전체 초대 처리 로직
    async handleInvite(inviter: string, invited: string) {
        if (!inviter || !invited) {
            throw new BadRequestException('인원 부족');
        }

        if (inviter === invited) {
            throw new BadRequestException('같이 사람 불가');
        }

        const alreadyInvited = await this.checkDuplicate(inviter, invited);
        if (alreadyInvited) {
            throw new BadRequestException('이미 초대된 유저');
        }

        return this.create(inviter, invited);
    }

    // 중복 여부 확인
    async checkDuplicate(inviter: string, invited: string): Promise<boolean> {
        const found = await this.inviteModel.findOne({
            inviter: new Types.ObjectId(inviter),
            invited: new Types.ObjectId(invited),
        });
        return !!found;
    }

    // 초대 정보 저장
    async create(inviter: string, invited: string) {
        return this.inviteModel.create({
            inviter: new Types.ObjectId(inviter),
            invited: new Types.ObjectId(invited),
        });
    }

    // 초대한 유저 수 조회
    async countInvites(userId: string): Promise<number> {
        return this.inviteModel.countDocuments({
            inviter: new Types.ObjectId(userId),
        });
    }
}
