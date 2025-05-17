// 인증 관련 요청을 내부 API 서버로 프록시하는 모듈 정의

import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AuthProxyController } from './auth-proxy.controller';

@Module({

    // 내부 인증 서버와 HTTP 통신을 위한 모듈
    imports: [
        HttpModule,
    ],

    // 로그인/회원가입 요청을 프록시하는 컨트롤러
    controllers: [
        AuthProxyController,
    ],
})
export class AuthProxyModule { }
