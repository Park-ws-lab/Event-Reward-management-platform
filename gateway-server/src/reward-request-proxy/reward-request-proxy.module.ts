import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { RewardRequestProxyController } from './reward-request-proxy.controller';
import { AuthMiddleware } from '../auth/auth.middleware';

@Module({
  controllers: [RewardRequestProxyController],
})
export class RewardRequestProxyModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(RewardRequestProxyController);
  }
}
