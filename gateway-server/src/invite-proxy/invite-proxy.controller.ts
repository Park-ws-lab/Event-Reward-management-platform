// 친구 초대 요청을 내부 이벤트 서버로 프록시하는 컨트롤러

import {
  Controller,
  Req,
  Res,
  Post,
  UseGuards,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Request, Response } from 'express';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/auth.guard';

// 프론트에서 요청 시 /invites 경로로 진입
@Controller('invites')
@UseGuards(JwtAuthGuard, RolesGuard) // JWT 인증 + 역할 기반 권한 검사 적용
export class InviteProxyController {
  constructor(private readonly httpService: HttpService) { }

  // [POST] /invites - 친구 초대 요청 프록시
  @Post()
  @Roles('USER', 'ADMIN') // USER 또는 ADMIN 역할만 접근 가능
  async createInvite(@Req() req: Request, @Res() res: Response) {
    return this.proxy(req, res);
  }

  // 공통 프록시 처리 함수: 요청을 내부 이벤트 서버로 전달
  private async proxy(req: Request, res: Response) {
    const targetUrl = `http://event-server:3002${req.originalUrl}`;

    try {
      const { data, status } = await this.httpService
        .request({
          method: req.method,
          url: targetUrl,
          data: req.body,
          headers: {
            ...req.headers,
            host: undefined,                // 외부 요청 헤더 제거 (내부 서버용)
            'content-length': undefined,    // 재계산되므로 제거
          },
        })
        .toPromise();

      // 내부 서버 응답을 클라이언트에 그대로 전달
      res.status(status).send(data);
    } catch (err) {
      // 내부 서버 오류가 발생한 경우 에러 상태 및 메시지 반환
      res.status(err.response?.status || 500).json(
        err.response?.data || { message: 'Proxy error' }
      );
    }
  }
}
