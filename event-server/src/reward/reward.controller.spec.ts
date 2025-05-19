// RewardController 단위 테스트 코드

import { Test, TestingModule } from '@nestjs/testing';
import { RewardController } from './reward.controller';
import { RewardService } from './reward.service';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';
import { NotFoundException } from '@nestjs/common';

describe('RewardController', () => {
  let controller: RewardController;
  let mockRewardService: Partial<Record<keyof RewardService, jest.Mock>>;

  beforeEach(async () => {
    mockRewardService = {
      createReward: jest.fn(),
      getAllRewards: jest.fn(),
      updateRewardOrFail: jest.fn(),
      deleteRewardOrFail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RewardController],
      providers: [{ provide: RewardService, useValue: mockRewardService }],
    }).compile();

    controller = module.get<RewardController>(RewardController);
  });

  // 보상 생성 API 테스트
  describe('create()', () => {
    it('보상을 등록하고 메시지를 반환해야 함', async () => {
      const dto: CreateRewardDto = {
        eventId: 'event123',
        type: 'COUPON',
        value: "테스트 쿠폰",
        quantity: 100,
      };

      const mockReward = { ...dto, _id: 'reward123' };

      mockRewardService.createReward.mockResolvedValue(mockReward);

      const result = await controller.create(dto);

      expect(mockRewardService.createReward).toHaveBeenCalledWith(dto);
      expect(result).toEqual({
        message: '보상이 등록되었습니다',
        reward: mockReward,
      });
    });
  });

  // 전체 보상 조회 API 테스트
  describe('findAll()', () => {
    it('전체 보상 목록과 개수를 반환해야 함', async () => {
      const mockRewards = [
        { name: '쿠폰 10%' },
        { name: '상품권 5천원' },
      ];

      mockRewardService.getAllRewards.mockResolvedValue(mockRewards);

      const result = await controller.findAll();

      expect(mockRewardService.getAllRewards).toHaveBeenCalled();
      expect(result).toEqual({
        count: mockRewards.length,
        rewards: mockRewards,
      });
    });
  });

  // 수정 테스트
  describe('update()', () => {
    it('보상 수정 성공 시 응답 메시지를 반환해야 함', async () => {
      const rewardId = '123';
      const dto: UpdateRewardDto = { quantity: 10 };
      const updatedReward = { _id: rewardId, quantity: 10 };

      mockRewardService.updateRewardOrFail.mockResolvedValue({
        message: '보상이 수정되었습니다.',
        reward: updatedReward,
      });

      const result = await controller.update(rewardId, dto);

      expect(result).toEqual({
        message: '보상이 수정되었습니다.',
        reward: updatedReward,
      });
      expect(mockRewardService.updateRewardOrFail).toHaveBeenCalledWith(rewardId, dto);
    });

    it('보상이 존재하지 않으면 NotFoundException을 던져야 함', async () => {
      mockRewardService.updateRewardOrFail.mockImplementation(() => {
        throw new NotFoundException('보상을 찾을 수 없습니다.');
      });

      await expect(
        controller.update('notfound', { quantity: 3 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // 삭제 테스트
  describe('delete()', () => {
    it('보상 삭제 성공 시 메시지를 반환해야 함', async () => {
      mockRewardService.deleteRewardOrFail.mockResolvedValue({
        message: '보상이 삭제되었습니다.',
      });

      const result = await controller.delete('123');

      expect(result).toEqual({ message: '보상이 삭제되었습니다.' });
      expect(mockRewardService.deleteRewardOrFail).toHaveBeenCalledWith('123');
    });

    it('보상이 없거나 삭제 실패 시 NotFoundException을 던져야 함', async () => {
      mockRewardService.deleteRewardOrFail.mockImplementation(() => {
        throw new NotFoundException('삭제 실패');
      });

      await expect(controller.delete('notfound')).rejects.toThrow(NotFoundException);
    });
  });

});
