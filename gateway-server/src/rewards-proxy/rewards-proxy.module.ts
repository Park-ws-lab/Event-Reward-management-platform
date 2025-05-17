// 보상 프록시 컨트롤러에 JWT 인증 미들웨어를 적용하는 모듈 정의

import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { RewardsProxyController } from './rewards-proxy.controller';
import { AuthMiddleware } from '../auth/auth.middleware';

@Module({
  // 보상 프록시 컨트롤러 등록
  controllers: [RewardsProxyController],
})
export class RewardsProxyModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)                  // JWT 인증 미들웨어 적용
      .forRoutes(RewardsProxyController);     // 해당 컨트롤러의 모든 라우트에 적용
  }
}
