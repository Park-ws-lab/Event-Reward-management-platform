// InviteService 단위 테스트 코드

import { Test, TestingModule } from '@nestjs/testing';
import { InviteService } from './invite.service';
import { getModelToken } from '@nestjs/mongoose';
import { Invite } from './schemas/invite.schema';
import { Types } from 'mongoose';
import { BadRequestException } from '@nestjs/common';

describe('InviteService', () => {
  let service: InviteService;
  let mockInviteModel: any;
  const user1Id = new Types.ObjectId().toHexString();
  const user2Id = new Types.ObjectId().toHexString();

  beforeEach(async () => {
    mockInviteModel = {
      findOne: jest.fn(),
      countDocuments: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InviteService,
        { provide: getModelToken(Invite.name), useValue: mockInviteModel },
      ],
    }).compile();

    service = module.get<InviteService>(InviteService);
  });

  describe('checkDuplicate()', () => {
    it('초대 기록이 있으면 true 반환', async () => {
      mockInviteModel.findOne.mockResolvedValue({});

      const result = await service.checkDuplicate(user1Id, user2Id);

      expect(mockInviteModel.findOne).toHaveBeenCalledWith({
        inviter: new Types.ObjectId(user1Id),
        invited: new Types.ObjectId(user2Id),
      });
      expect(result).toBe(true);
    });

    it('초대 기록이 없으면 false 반환', async () => {
      mockInviteModel.findOne.mockResolvedValue(null);

      const result = await service.checkDuplicate(user1Id, user2Id);

      expect(result).toBe(false);
    });
  });

  describe('create()', () => {
    it('초대 정보를 저장해야 함', async () => {
      const mockResult = {
        inviter: user1Id,
        invited: user2Id,
      };

      mockInviteModel.create.mockResolvedValue(mockResult as any);

      const result = await service.create(user1Id, user2Id);

      expect(mockInviteModel.create).toHaveBeenCalledWith({
        inviter: new Types.ObjectId(user1Id),
        invited: new Types.ObjectId(user2Id),
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe('countInvites()', () => {
    it('초대한 유저 수를 반환해야 함', async () => {
      mockInviteModel.countDocuments.mockResolvedValue(5);

      const result = await service.countInvites(user1Id);

      expect(mockInviteModel.countDocuments).toHaveBeenCalledWith({
        inviter: new Types.ObjectId(user1Id),
      });
      expect(result).toBe(5);
    });
  });

  describe('handleInvite()', () => {
    it('인원 부족 시 예외 발생', async () => {
      await expect(service.handleInvite('', '')).rejects.toThrow('인원 부족');
    });

    it('자기 자신을 초대하면 예외 발생', async () => {
      await expect(service.handleInvite(user1Id, user1Id)).rejects.toThrow('같이 사람 불가');
    });

    it('중복 초대 시 예외 발생', async () => {
      jest.spyOn(service, 'checkDuplicate').mockResolvedValue(true);

      await expect(service.handleInvite(user1Id, user2Id)).rejects.toThrow('이미 초대된 유저');
    });

    it('유효한 요청이면 create 호출', async () => {
      const mockResult = { inviter: user1Id, invited: user2Id };
      jest.spyOn(service, 'checkDuplicate').mockResolvedValue(false);
      jest.spyOn(service, 'create').mockResolvedValue(mockResult as any);

      const result = await service.handleInvite(user1Id, user2Id);

      expect(service.create).toHaveBeenCalledWith(user1Id, user2Id);
      expect(result).toEqual(mockResult);
    });
  });
});
