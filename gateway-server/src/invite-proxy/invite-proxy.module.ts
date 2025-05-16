import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { InviteProxyController } from './invite-proxy.controller';
import { AuthMiddleware } from '../auth/auth.middleware';

@Module({
  controllers: [InviteProxyController],
})
export class InviteProxyModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(InviteProxyController);
  }
}
