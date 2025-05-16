// src/invites/invite.service.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Invite } from './invite.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class InviteService {
    constructor(
        @InjectModel(Invite.name) private readonly inviteModel: Model<Invite>,
    ) { }

    async checkDuplicate(inviter: string, invited: string): Promise<boolean> {
        const found = await this.inviteModel.findOne({
            inviter: new Types.ObjectId(inviter),
            invited: new Types.ObjectId(invited),
        });
        return !!found;
    }

    async create(inviter: string, invited: string) {
        const invite = new this.inviteModel({
            inviter: new Types.ObjectId(inviter),
            invited: new Types.ObjectId(invited),
        });
        return invite.save();
    }

    async countInvites(userId: string): Promise<number> {
        return this.inviteModel.countDocuments({
            inviter: new Types.ObjectId(userId),
        });
    }

}
