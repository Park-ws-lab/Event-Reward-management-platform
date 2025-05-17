// JWT 인증을 위한 가드 설정

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
// Passport의 'jwt' 전략을 사용하는 인증 가드
export class JwtAuthGuard extends AuthGuard('jwt') {}
