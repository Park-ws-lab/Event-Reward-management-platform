// 로그인 및 회원가입 요청을 내부 인증 서버로 프록시하는 컨트롤러

import { HttpService } from '@nestjs/axios';
import {
  Controller,
  Req,
  Res,
  HttpStatus,
  Post,
  Get,
  Patch,
} from '@nestjs/common';
import { Request, Response } from 'express';

// 프론트에서 요청 시 /user 경로로 진입
@Controller('user')
export class AuthProxyController {
  constructor(private readonly httpService: HttpService) { }

  // [POST] /user/login - 로그인 요청을 내부 인증 서버로 전달
  @Post('login')
  async login(@Req() req: Request, @Res() res: Response) {
    return this.proxy(req, res);
  }

  // [POST] /user/register - 회원가입 요청을 내부 인증 서버로 전달
  @Post('register')
  async register(@Req() req: Request, @Res() res: Response) {
    return this.proxy(req, res);
  }

  // 프록시 처리 함수: 요청을 내부 API 서버로 전달하고 응답을 그대로 클라이언트에 반환
  async proxy(req: Request, res: Response) {
    const targetUrl = 'http://localhost:3001' + req.url;

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

      // 내부 서버의 응답을 클라이언트에 그대로 반환
      res.status(status).send(data);
    } catch (error) {
      // 내부 서버에서 오류 발생 시 에러 메시지 또는 기본 에러 반환
      res
        .status(error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR)
        .send(error.response?.data || { message: 'Proxy Error' });
    }
  }
}
