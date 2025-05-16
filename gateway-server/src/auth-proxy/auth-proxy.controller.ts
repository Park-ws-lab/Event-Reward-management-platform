import { HttpService } from '@nestjs/axios';
import {
    Controller,
    Req,
    Res,
    HttpStatus,
    Post,
    Get,
    Patch
} from '@nestjs/common';
import { Request, Response } from 'express';
import { lastValueFrom } from 'rxjs';

@Controller('user')
export class AuthProxyController {
    constructor(private readonly httpService: HttpService) { }

    @Post('login')
    async login(@Req() req: Request, @Res() res: Response) {
        return this.proxy(req, res);
    }

    @Post('register')
    async register(@Req() req: Request, @Res() res: Response) {
        return this.proxy(req, res);
    }

    async proxy(req: Request, res: Response) {
        const targetUrl = 'http://localhost:3001' + req.url;
    try {
      const { data, status } = await this.httpService.request({
        method: req.method,
        url: targetUrl,
        data: req.body,
        headers: {
          ...req.headers,
          host: undefined, //내부 서버 api 요청이므로 header 제거
          'content-length': undefined,
        },
      }).toPromise();

      res.status(status).send(data);
    } catch (error) {
      res
        .status(error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR)
        .send(error.response?.data || { message: 'Proxy Error' });
    }
    }
}

