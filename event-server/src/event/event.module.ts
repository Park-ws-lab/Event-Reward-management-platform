// 이벤트 관련 스키마, 서비스, 컨트롤러를 구성하는 모듈

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Event, EventSchema } from './event.schema';
import { Reward, RewardSchema } from '../reward/reward.schema';
import { EventService } from './event.service';
import { EventController } from './event.controller';

@Module({
  imports: [
    // Mongoose 모델 등록: Event와 Reward 스키마 연결
    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema },
      { name: Reward.name, schema: RewardSchema },
    ]),
  ],

  // 이벤트 비즈니스 로직 서비스 등록
  providers: [EventService],

  // API 요청을 처리할 컨트롤러 등록
  controllers: [EventController],

  // 다른 모듈에서도 EventService와 Mongoose 모델 사용 가능하게 export
  exports: [EventService, MongooseModule],
})
export class EventModule {}
