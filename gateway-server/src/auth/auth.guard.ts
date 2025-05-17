// NestJS의 의존성 주입 기능을 위한 데코레이터 import
import { Injectable } from '@nestjs/common';
// Passport 모듈에서 제공하는 기본 AuthGuard 클래스를 import
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT 기반 인증을 처리하는 가드 클래스
 * - Passport의 'jwt' 전략을 사용하는 AuthGuard를 확장
 * - 인증이 필요한 라우트에서 @UseGuards(JwtAuthGuard) 데코레이터를 통해 사용
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
