import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { InviteService } from './invite.service';

@Controller('invites')
export class InviteController {
  constructor(private readonly inviteService: InviteService) {}

  @Post()
  async createInvite(@Body() body: { inviter: string; invited: string }) {
    const { inviter, invited } = body;

    if (!inviter || !invited) {
      throw new BadRequestException('인원 부족');
    }

    if (inviter === invited) {
      throw new BadRequestException('같이 사람 불가');
    }

    const alreadyInvited = await this.inviteService.checkDuplicate(inviter, invited);
    if (alreadyInvited) {
      throw new BadRequestException('이미 초대된 유저');
    }

    return this.inviteService.create(inviter, invited);
  }
}
