// InviteController 단위 테스트 코드

import { Test, TestingModule } from '@nestjs/testing';
import { InviteController } from './invite.controller';
import { InviteService } from './invite.service';
import { BadRequestException } from '@nestjs/common';

describe('InviteController', () => {
  let controller: InviteController;
  let mockInviteService: Partial<Record<keyof InviteService, jest.Mock>>;

  beforeEach(async () => {
    mockInviteService = {
      checkDuplicate: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [InviteController],
      providers: [
        { provide: InviteService, useValue: mockInviteService },
      ],
    }).compile();

    controller = module.get<InviteController>(InviteController);
  });

  // 친구 초대 API 테스트
  describe('createInvite()', () => {
    it('inviter나 invited가 없으면 예외 발생', async () => {
      await expect(
        controller.createInvite({ inviter: '', invited: '' })
      ).rejects.toThrow(BadRequestException);

      await expect(
        controller.createInvite({ inviter: 'user1', invited: '' })
      ).rejects.toThrow('인원 부족');
    });

    it('자기 자신을 초대할 경우 예외 발생', async () => {
      await expect(
        controller.createInvite({ inviter: 'user1', invited: 'user1' })
      ).rejects.toThrow('같이 사람 불가');
    });

    it('이미 초대한 사용자면 예외 발생', async () => {
      mockInviteService.checkDuplicate.mockResolvedValue(true);

      await expect(
        controller.createInvite({ inviter: 'user1', invited: 'user2' })
      ).rejects.toThrow('이미 초대된 유저');

      expect(mockInviteService.checkDuplicate).toHaveBeenCalledWith('user1', 'user2');
    });

    it('유효한 요청이면 초대 정보를 반환해야 함', async () => {
      const mockResult = { inviter: 'user1', invited: 'user2' };
      mockInviteService.checkDuplicate.mockResolvedValue(false);
      mockInviteService.create.mockResolvedValue(mockResult);

      const result = await controller.createInvite({ inviter: 'user1', invited: 'user2' });

      expect(mockInviteService.checkDuplicate).toHaveBeenCalledWith('user1', 'user2');
      expect(mockInviteService.create).toHaveBeenCalledWith('user1', 'user2');
      expect(result).toEqual(mockResult);
    });
  });
});
