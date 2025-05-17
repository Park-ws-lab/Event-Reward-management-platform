//'invite' 경로에 대한 친구초대 이벤트 관련 API 제공

import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { InviteService } from './invite.service';
// '/invites' 경로를 처리하는 컨트롤러 클래스
@Controller('invites')
export class InviteController {
  constructor(private readonly inviteService: InviteService) {}

  // [POST] /invites - 친구 초대 요청 처리
  @Post()
  async createInvite(@Body() body: { inviter: string; invited: string }) {
    const { inviter, invited } = body;

    // inviter 또는 invited가 없을 경우 예외 처리
    if (!inviter || !invited) {
      throw new BadRequestException('인원 부족');
    }

    // 자기 자신을 초대할 수 없음
    if (inviter === invited) {
      throw new BadRequestException('같이 사람 불가');
    }

    // 이미 초대한 관계인지 중복 확인
    const alreadyInvited = await this.inviteService.checkDuplicate(inviter, invited);
    if (alreadyInvited) {
      throw new BadRequestException('이미 초대된 유저');
    }

    // 초대 정보 저장 및 결과 반환
    return this.inviteService.create(inviter, invited);
  }
}
