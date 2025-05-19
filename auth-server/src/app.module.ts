// 애플리케이션의 최상위 모듈 (전역 설정 및 핵심 모듈 구성)

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    // 환경변수(.env) 사용을 위한 전역 설정
    ConfigModule.forRoot({
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
      isGlobal: true,
    }),

    // MongoDB 연결 설정 (MONGO_URL 환경변수에서 주소 로드)
    MongooseModule.forRoot(process.env.MONGO_URL),

    // 사용자 관련 기능 모듈
    UserModule,

    // JWT 설정 모듈 (비동기 방식으로 secret 값을 환경변수에서 로드)
    JwtModule.registerAsync({
      global: true, // 애플리케이션 전체에서 사용 가능하도록 설정
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // JWT 비밀키
        signOptions: { expiresIn: '1d' }, // 토큰 만료시간: 1일
      }),
    }),
  ],

  controllers: [],
  providers: [],
})
export class AppModule { }
