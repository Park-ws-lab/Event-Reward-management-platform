// 보상 요청 프록시 컨트롤러에 인증 미들웨어를 적용하는 모듈

import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { RewardRequestProxyController } from './reward-request-proxy.controller';
import { AuthMiddleware } from '../auth/auth.middleware';

@Module({
  // 보상 요청 프록시 컨트롤러 등록
  controllers: [RewardRequestProxyController],
})
export class RewardRequestProxyModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware) // JWT 토큰 인증 미들웨어 적용
      .forRoutes(RewardRequestProxyController); // 해당 컨트롤러의 모든 라우트에 적용
  }
}
