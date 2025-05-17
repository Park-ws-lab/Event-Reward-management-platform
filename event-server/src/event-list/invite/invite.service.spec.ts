// InviteService 단위 테스트 코드

import { Test, TestingModule } from '@nestjs/testing';
import { InviteService } from './invite.service';
import { getModelToken } from '@nestjs/mongoose';
import { Invite } from './invite.schema';
import { Types } from 'mongoose';

describe('InviteService', () => {
  let service: InviteService;
  let mockInviteModel: any;

  beforeEach(async () => {
    mockInviteModel = {
      findOne: jest.fn(),
      countDocuments: jest.fn(),
      prototype: { save: jest.fn() },
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
      mockInviteModel.findOne.mockResolvedValue({ inviter: 'user1', invited: 'user2' });

      const result = await service.checkDuplicate('user1id', 'user2id');

      expect(mockInviteModel.findOne).toHaveBeenCalledWith({
        inviter: new Types.ObjectId('user1id'),
        invited: new Types.ObjectId('user2id'),
      });
      expect(result).toBe(true);
    });

    it('초대 기록이 없으면 false 반환', async () => {
      mockInviteModel.findOne.mockResolvedValue(null);

      const result = await service.checkDuplicate('user1id', 'user2id');

      expect(result).toBe(false);
    });
  });

  describe('create()', () => {
    it('초대 정보를 생성하고 저장해야 함', async () => {
      const mockSave = jest.fn().mockResolvedValue({
        inviter: 'user1id',
        invited: 'user2id',
      });

      // 생성자처럼 동작하는 mock (new this.inviteModel({...}))
      mockInviteModel.mockImplementation = jest.fn(() => ({
        save: mockSave,
      }));

      // 수동으로 인스턴스 생성 및 save 호출
      const serviceWithMockedNew = new InviteService(mockInviteModel);
      (serviceWithMockedNew as any).inviteModel = function (data: any) {
        return {
          save: mockSave,
        };
      };

      const result = await serviceWithMockedNew.create('user1id', 'user2id');

      expect(mockSave).toHaveBeenCalled();
      expect(result).toEqual({
        inviter: 'user1id',
        invited: 'user2id',
      });
    });
  });

  describe('countInvites()', () => {
    it('해당 유저가 초대한 인원 수를 반환해야 함', async () => {
      mockInviteModel.countDocuments.mockResolvedValue(3);

      const result = await service.countInvites('user1id');

      expect(mockInviteModel.countDocuments).toHaveBeenCalledWith({
        inviter: new Types.ObjectId('user1id'),
      });
      expect(result).toBe(3);
    });
  });
});
