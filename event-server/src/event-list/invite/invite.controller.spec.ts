// InviteController 단위 테스트 코드

import { Test, TestingModule } from '@nestjs/testing';
import { InviteController } from './invite.controller';
import { InviteService } from './invite.service';

describe('InviteController', () => {
  let controller: InviteController;
  let mockInviteService: Partial<Record<keyof InviteService, jest.Mock>>;

  beforeEach(async () => {
    mockInviteService = {
      handleInvite: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [InviteController],
      providers: [
        { provide: InviteService, useValue: mockInviteService },
      ],
    }).compile();

    controller = module.get<InviteController>(InviteController);
  });

  // 친구 초대 요청 처리 테스트
  describe('createInvite()', () => {
    it('handleInvite가 호출되고 결과를 반환해야 함', async () => {
      const body = { inviterId: 'user1', inviteeId: 'user2' };
      const mockResult = { _id: 'invite123', ...body };

      mockInviteService.handleInvite.mockResolvedValue(mockResult);

      const result = await controller.createInvite(body);

      expect(mockInviteService.handleInvite).toHaveBeenCalledWith('user1', 'user2');
      expect(result).toEqual(mockResult);
    });
  });
});
