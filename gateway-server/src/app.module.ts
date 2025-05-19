// 게이트웨이 서버의 루트 모듈
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './auth/jwt.strategy';
import { HttpModule } from '@nestjs/axios';
import { EventsProxyModule } from './events-proxy/events-proxy.module';
import { AuthProxyModule } from './auth-proxy/auth-proxy.module';
import { RewardsProxyModule } from './rewards-proxy/rewards-proxy.module';
import { RewardRequestProxyModule } from './reward-request-proxy/reward-request-proxy.module';
import { InviteProxyModule } from './invite-proxy/invite-proxy.module';

@Module({
  imports: [
    // .env 환경변수 사용을 위한 전역 설정
    ConfigModule.forRoot({ isGlobal: true }),

    // HttpService 사용을 위한 설정
    HttpModule,

    // 기능별 프록시 모듈들 등록
    EventsProxyModule,
    AuthProxyModule,
    RewardsProxyModule,
    RewardRequestProxyModule,
    InviteProxyModule,
  ],

  controllers: [],

  // JWT 전략 등록
  providers: [
    JwtStrategy
  ],
})
export class AppModule { }
