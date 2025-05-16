import {
  Controller,
  Req,
  Res,
  Post,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/auth.guard';

@Controller('reward-request')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RewardRequestProxyController {
  @Post()
  @Roles('USER', 'ADMIN')
  async requestReward(@Req() req: ExpressRequest, @Res() res: ExpressResponse) {
    return this.proxy(req, res);
  }

  @Get()
  @Roles('OPERATOR', 'AUDITOR', 'ADMIN')
  async getAllRequests(@Req() req: ExpressRequest, @Res() res: ExpressResponse) {
    return this.proxy(req, res);
  }

  @Get('user/:userId')
  @Roles('USER', 'ADMIN')
  async getUserRequests(@Req() req: ExpressRequest, @Res() res: ExpressResponse) {
    return this.proxy(req, res);
  }

  private async proxy(req: ExpressRequest, res: ExpressResponse) {
    const targetUrl = `http://localhost:3002${req.originalUrl}`;
    const axios = await import('axios');
    try {
      const response = await axios.default({
        method: req.method,
        url: targetUrl,
        data: req.body,
        headers: {
          ...req.headers,
          host: undefined,
          'content-length': undefined,
        },
      });
      res.status(response.status).json(response.data);
    } catch (err) {
      res.status(err.response?.status || 500).json(err.response?.data || { message: 'Proxy error' });
    }
  }
}
