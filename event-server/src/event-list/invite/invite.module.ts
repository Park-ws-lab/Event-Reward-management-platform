// 친구 초대 기능 관련 스키마, 서비스, 컨트롤러를 구성하는 모듈

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Invite, InviteSchema } from './schemas/invite.schema';
import { InviteService } from './invite.service';
import { InviteController } from './invite.controller';

@Module({
  imports: [
    // Invite 스키마를 Mongoose에 등록
    MongooseModule.forFeature([{ name: Invite.name, schema: InviteSchema }]),
  ],

  // 비즈니스 로직을 처리할 서비스 등록
  providers: [InviteService],

  // API 요청을 처리할 컨트롤러 등록
  controllers: [InviteController],
  
  // 다른 모듈에서도 InviteService 또는 Invite 모델을 사용할 수 있도록 export
  exports: [InviteService, MongooseModule],
})
export class InviteModule {}
