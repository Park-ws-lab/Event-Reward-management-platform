// 보상 관련 기능을 구성하는 모듈

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Reward, RewardSchema } from './reward.schema';
import { RewardService } from './reward.service';
import { RewardController } from './reward.controller';

@Module({
  imports: [
    // Reward 스키마를 Mongoose에 등록
    MongooseModule.forFeature([{ name: Reward.name, schema: RewardSchema }]),
  ],

  // 보상 생성 및 조회 로직을 처리할 서비스
  providers: [RewardService],
  
  // 보상 API 요청을 처리할 컨트롤러
  controllers: [RewardController],
  
  // 다른 모듈에서 Reward 모델을 사용할 수 있도록 export
  exports: [MongooseModule],
})
export class RewardModule {}
