// 이벤트 관련 요청을 내부 API 서버로 프록시하는 모듈 정의

import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { EventsProxyController } from './events-proxy.controller';
import { AuthMiddleware } from '../auth/auth.middleware';

@Module({
  controllers: [EventsProxyController],
  providers: [],
})
export class EventsProxyModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware) // AuthMiddleware를 요청에 적용
      .forRoutes({
        path: 'events/*',              // /events로 시작하는 모든 경로에 대해
        method: RequestMethod.ALL,     // 모든 HTTP 메서드(GET, POST 등) 대상
      });
  }
}
