// JWT 전략 설정을 위한 커스텀 Strategy 클래스 (NestJS + Passport 기반)

import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from "@nestjs/config";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private configService: ConfigService) {
        super({
            // 요청 헤더에서 Bearer 토큰 형태의 JWT 추출
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

            // 토큰 만료 체크 설정
            ignoreExpiration: false,

            // .env 또는 설정 파일에서 JWT 비밀키 로드
            secretOrKey: configService.get<string>('JWT_SECRET'),
        });
    }

    // JWT 토큰의 payload를 검증한 뒤 반환
    async validate(payload: any) {
        return {
            userId: payload.sub,      // 토큰에 담긴 사용자 ID
            username: payload.username,
            role: payload.role,
        };
    }
}
