// 이벤트 관련 요청을 내부 이벤트 서버로 프록시하며, JWT 인증과 역할 검사를 적용하는 컨트롤러

import {
  Controller,
  Req,
  Res,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/auth.guard';

// 프론트에서 요청 시 /events 경로로 진입
@Controller('events')
@UseGuards(JwtAuthGuard, RolesGuard) // 모든 핸들러에 인증/권한 가드 적용
export class EventsProxyController {
  
  // [POST] /events - 이벤트 생성 요청 프록시
  @Post()
  @Roles('OPERATOR', 'ADMIN') // 관리자 또는 운영자만 접근 가능
  async postEvent(@Req() req: ExpressRequest, @Res() res: ExpressResponse) {
    return this.proxy(req, res);
  }

  // [GET] /events - 전체 이벤트 목록 요청 프록시
  @Get()
  @Roles('OPERATOR', 'ADMIN')
  async getEvents(@Req() req: ExpressRequest, @Res() res: ExpressResponse) {
    return this.proxy(req, res);
  }

  // [GET] /events/titles - 이벤트 제목 목록 요청 프록시
  @Get('titles')
  @Roles('OPERATOR', 'ADMIN')
  async getTitles(@Req() req: ExpressRequest, @Res() res: ExpressResponse) {
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
          host: undefined,                // 내부 요청이므로 원본 host 제거
          'content-length': undefined,    // 재계산되므로 제거
        },
      });

      // 내부 서버 응답을 그대로 클라이언트에 전달
      res.status(response.status).json(response.data);
    } catch (err) {
      // 내부 서버 에러 응답 처리
      res
        .status(err.response?.status || 500)
        .json(err.response?.data || { message: 'Proxy error' });
    }
  }
}
