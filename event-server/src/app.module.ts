// 애플리케이션의 최상위 모듈 (전역 설정 및 핵심 모듈 구성)

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { EventModule } from './event/event.module';
import { RewardModule } from './reward/reward.module';
import { RewardRequestModule } from './reward-request/reward-request.module';
import { InviteModule } from './event-list/invite/invite.module';

@Module({
  imports: [
    // .env 환경변수 사용을 위한 전역 설정
    ConfigModule.forRoot({
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
      isGlobal: true,
    }),

    // MongoDB 연결 설정 (MONGO_URL 환경변수 사용)
    MongooseModule.forRoot(process.env.MONGO_URL),

    // 주요 기능 모듈 등록
    EventModule,
    RewardModule,
    RewardRequestModule,
    InviteModule,
  ],

  // 루트 컨트롤러 등록 (기본 라우팅용)
  controllers: [
    AppController,
  ],

  // 루트 서비스 등록 (기본 비즈니스 로직 처리)
  providers: [AppService],
})
export class AppModule {}
