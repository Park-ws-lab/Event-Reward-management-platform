// 친구 초대 요청을 내부 이벤트 서버로 프록시하는 컨트롤러

import {
  Controller,
  Req,
  Res,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/auth.guard';

// 프론트에서 요청 시 /invites 경로로 진입
@Controller('invites')
@UseGuards(JwtAuthGuard, RolesGuard) // JWT 인증 + 역할 기반 권한 검사 적용
export class InviteProxyController {
  // [POST] /invites - 친구 초대 요청 프록시
  @Post()
  @Roles('USER', 'ADMIN') // USER 또는 ADMIN 역할만 접근 가능
  async createInvite(@Req() req: ExpressRequest, @Res() res: ExpressResponse) {
    return this.proxy(req, res);
  }

  // 공통 프록시 처리 함수: 요청을 내부 이벤트 서버로 전달
  private async proxy(req: ExpressRequest, res: ExpressResponse) {
    const targetUrl = `http://event-server:3002${req.originalUrl}`;
    const axios = await import('axios');

    try {
      const response = await axios.default({
        method: req.method,
        url: targetUrl,
        data: req.body,
        headers: {
          ...req.headers,
          host: undefined,              // 원본 host 제거
          'content-length': undefined,  // 재계산 필요하므로 제거
        },
      });

      // 내부 서버 응답을 클라이언트에 그대로 전달
      res.status(response.status).json(response.data);
    } catch (err) {
      // 내부 서버 오류가 발생한 경우 에러 상태 및 메시지 반환
      res.status(err.response?.status || 500).json(
        err.response?.data || { message: 'Proxy error' }
      );
    }
  }
}
