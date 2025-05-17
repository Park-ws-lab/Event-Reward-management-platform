// 보상 요청 관련 API를 내부 이벤트 서버로 프록시하며 JWT 인증 및 역할 검사를 수행하는 컨트롤러

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

// 프론트에서 요청 시 /reward-request 경로로 진입
@Controller('reward-requests')
@UseGuards(JwtAuthGuard, RolesGuard) // 인증 및 역할 기반 가드 적용
export class RewardRequestProxyController {
  // [POST] /reward-request - 보상 요청 생성
  @Post()
  @Roles('USER', 'ADMIN') // 일반 사용자와 관리자만 보상 요청 가능
  async requestReward(@Req() req: ExpressRequest, @Res() res: ExpressResponse) {
    return this.proxy(req, res);
  }

  // [GET] /reward-request - 전체 보상 요청 조회
  @Get()
  @Roles('OPERATOR', 'AUDITOR', 'ADMIN') // 운영자, 감사자, 관리자만 전체 요청 조회 가능
  async getAllRequests(@Req() req: ExpressRequest, @Res() res: ExpressResponse) {
    return this.proxy(req, res);
  }

  // [GET] /reward-request/user/:userId - 특정 유저의 요청 조회
  @Get('user/:userId')
  @Roles('USER', 'ADMIN') // 일반 사용자와 관리자만 자신의 요청 내역 조회 가능
  async getUserRequests(@Req() req: ExpressRequest, @Res() res: ExpressResponse) {
    return this.proxy(req, res);
  }

  // 공통 프록시 처리 함수: 요청을 내부 서버로 전달하고 응답 반환
  private async proxy(req: ExpressRequest, res: ExpressResponse) {
    const targetUrl = `http://localhost:3002${req.originalUrl}`; // 내부 이벤트 서버 주소
    const axios = await import('axios');

    try {
      const response = await axios.default({
        method: req.method,  // 요청 메서드 그대로 전달
        url: targetUrl,      // 내부 서버 주소로 라우팅
        data: req.body,      // 요청 본문 포함
        headers: {
          ...req.headers,
          host: undefined,                // 내부 통신이므로 원본 host 제거
          'content-length': undefined,    // 재계산되므로 제거
        },
      });
      res.status(response.status).json(response.data); // 응답 그대로 반환
    } catch (err) {
      res
        .status(err.response?.status || 500)
        .json(err.response?.data || { message: 'Proxy error' });
    }
  }
}
