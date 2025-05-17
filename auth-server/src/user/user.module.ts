// 유저 관련 서비스, 컨트롤러, 스키마, 인증 전략 등을 등록하는 모듈

import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { JwtStrategy } from './jwt.strategy';
import { LoginLog, LoginLogSchema } from './login-log.schema';

@Module({
  imports: [
    // Mongoose를 통해 User 스키마를 MongoDB 모델로 등록
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: LoginLog.name, schema: LoginLogSchema },
    ]),
  ],
  
  // 의존성으로 주입할 서비스 및 인증 전략
  providers: [UserService, JwtStrategy],

  // 외부 요청을 처리할 컨트롤러 등록
  controllers: [UserController],
})
export class UserModule {}
