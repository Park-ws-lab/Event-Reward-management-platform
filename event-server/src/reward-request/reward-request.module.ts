// 보상 요청 관련 기능을 구성하는 모듈

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RewardRequestService } from './reward-request.service';
import { RewardRequestController } from './reward-request.controller';
import { RewardRequest, RewardRequestSchema } from './reward-request.schema';
import { EventModule } from '../event/event.module';
import { InviteModule } from '../event-list/invite/invite.module';
import { RewardModule } from '../reward/reward.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    // Mongoose를 통해 RewardRequest 스키마를 MongoDB 모델로 등록
    MongooseModule.forFeature([
      { name: RewardRequest.name, schema: RewardRequestSchema },
    ]),

    // 보상 요청 처리에 필요한 모듈들 의존성 주입
    EventModule,
    InviteModule,
    RewardModule,
    HttpModule
  ],

  // 비즈니스 로직을 처리할 서비스
  providers: [RewardRequestService],

  // API 요청을 처리할 컨트롤러
  controllers: [RewardRequestController],
})
export class RewardRequestModule {}
