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

@Controller('events')
@UseGuards(JwtAuthGuard,RolesGuard)
export class EventsProxyController {
  @Post()
  @Roles('OPERATOR', 'ADMIN')
  async postEvent(@Req() req: ExpressRequest, @Res() res: ExpressResponse) {
    return this.proxy(req, res);
  }

  @Get()
  @Roles('OPERATOR', 'ADMIN')
  async getEvents(@Req() req: ExpressRequest, @Res() res: ExpressResponse) {
    return this.proxy(req, res);
  }

  @Get('titles')
  @Roles('OPERATOR', 'ADMIN')
  async getTitles(@Req() req: ExpressRequest, @Res() res: ExpressResponse) {
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
      res
        .status(err.response?.status || 500)
        .json(err.response?.data || { message: 'Proxy error' });
    }
  }
}