// JWT 인증을 처리하는 미들웨어

import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    // Authorization 헤더가 없거나 형식이 잘못된 경우 예외 처리
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }

    // "Bearer <토큰>" 중 토큰만 추출
    const token = authHeader.split(' ')[1];
    try {
      // 토큰을 검증하고 사용자 정보 추출
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = decoded;

      next();
    } catch (err) {
      // 토큰이 유효하지 않은 경우 예외 처리
      throw new UnauthorizedException('Invalid token');
    }
  }
}
