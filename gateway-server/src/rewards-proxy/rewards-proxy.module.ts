import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { RewardsProxyController } from './rewards-proxy.controller';
import { AuthMiddleware } from '../auth/auth.middleware';

@Module({
  controllers: [RewardsProxyController],
})
export class RewardsProxyModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(RewardsProxyController);
  }
}
