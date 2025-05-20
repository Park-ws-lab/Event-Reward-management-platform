// 친구 초대 요청 프록시 컨트롤러에 인증 미들웨어를 적용하는 모듈

import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { InviteProxyController } from './invite-proxy.controller';
import { AuthMiddleware } from '../auth/auth.middleware';
import { HttpModule } from '@nestjs/axios';

@Module({

  imports: [HttpModule],
  // 친구 초대 프록시 컨트롤러 등록
  controllers: [InviteProxyController],
})
export class InviteProxyModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // InviteProxyController 전체에 AuthMiddleware를 적용
    consumer
      .apply(AuthMiddleware)
      .forRoutes(InviteProxyController);
  }
}
