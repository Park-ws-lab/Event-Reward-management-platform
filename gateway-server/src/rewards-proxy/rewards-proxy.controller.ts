// 보상 생성 및 조회 요청을 내부 이벤트 서버로 프록시하며, 인증 및 역할 기반 권한 검사를 수행하는 컨트롤러

import {
  Controller,
  Req,
  Res,
  Post,
  Get,
  UseGuards,
} from '@nestjs/common';
import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/auth.guard';

// 프론트에서 요청 시 /reward 경로로 진입
@Controller('reward')
@UseGuards(JwtAuthGuard, RolesGuard) // JWT 인증 + 역할(Role) 권한 검사 적용
export class RewardsProxyController {
  // [POST] /reward - 보상 등록 요청을 프록시
  @Post()
  @Roles('OPERATOR', 'ADMIN') // 운영자 또는 관리자만 접근 가능
  async createReward(@Req() req: ExpressRequest, @Res() res: ExpressResponse) {
    return this.proxy(req, res);
  }

  // [GET] /reward - 보상 목록 조회 요청을 프록시
  @Get()
  @Roles('OPERATOR', 'ADMIN') // 운영자 또는 관리자만 접근 가능
  async getRewards(@Req() req: ExpressRequest, @Res() res: ExpressResponse) {
    return this.proxy(req, res);
  }

  // 공통 프록시 처리 함수: 요청을 내부 서버로 전달하고 응답을 반환
  private async proxy(req: ExpressRequest, res: ExpressResponse) {
    const targetUrl = `http://localhost:3002${req.originalUrl}`;
    const axios = await import('axios'); // axios 동적 import

    try {
      const response = await axios.default({
        method: req.method,
        url: targetUrl,
        data: req.body,
        headers: {
          ...req.headers,
          host: undefined,              // 내부 통신을 위해 제거
          'content-length': undefined,  // 재계산되므로 제거
        },
      });

      // 내부 서버의 응답을 그대로 클라이언트에 전달
      res.status(response.status).json(response.data);
    } catch (err) {
      // 내부 서버 오류 발생 시 예외 처리
      res.status(err.response?.status || 500).json(
        err.response?.data || { message: 'Proxy error' }
      );
    }
  }
}
