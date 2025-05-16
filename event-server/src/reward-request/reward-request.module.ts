import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RewardRequestService } from './reward-request.service'
import { RewardRequestController } from './reward-request.controller'
import { RewardRequest, RewardRequestSchema } from './reward-request.schema';
import { EventModule } from '../event/event.module'
import { InviteModule } from '../event/invite.module'
import { RewardModule } from '../reward/reward.module'

@Module({
    imports: [
        MongooseModule.forFeature([{ name: RewardRequest.name, schema: RewardRequestSchema }]),
        EventModule,
        InviteModule,
        RewardModule
    ],
    providers: [RewardRequestService],
    controllers: [RewardRequestController],
})
export class RewardRequestModule { }
