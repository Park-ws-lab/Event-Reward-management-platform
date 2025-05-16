import { Module,NestModule,MiddlewareConsumer,RequestMethod } from '@nestjs/common';
import { EventsProxyController } from './events-proxy.controller';
import {AuthMiddleware} from '../auth/auth.middleware';


@Module({
  controllers: [EventsProxyController],
  providers: [
  ],
})
export class EventsProxyModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware) // 어떤 미들웨어를
      .forRoutes({ path: 'events/*', method: RequestMethod.ALL }); // 어떤 경로(컨트롤러)에 적용할지
  }
}
