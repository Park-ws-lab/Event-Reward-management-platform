//'invite' 경로에 대한 친구초대 이벤트 관련 API 제공

import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { InviteService } from './invite.service';

// '/invites' 경로를 처리하는 컨트롤러 클래스
@Controller('invites')
export class InviteController {
  constructor(private readonly inviteService: InviteService) { }

  // [POST] /invites - 친구 초대 요청 처리
  @Post()
  async createInvite(@Body() body: { inviterId: string; inviteeId: string }) {
    return this.inviteService.handleInvite(body.inviterId, body.inviteeId);
  }
}
