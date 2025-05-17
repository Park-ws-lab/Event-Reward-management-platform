// RewardController 단위 테스트 코드

import { Test, TestingModule } from '@nestjs/testing';
import { RewardController } from './reward.controller';
import { RewardService } from './reward.service';
import { CreateRewardDto } from './dto/create-reward.dto';

describe('RewardController', () => {
  let controller: RewardController;
  let mockRewardService: Partial<Record<keyof RewardService, jest.Mock>>;

  beforeEach(async () => {
    mockRewardService = {
      createReward: jest.fn(),
      getAllRewards: jest.fn(),
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
});
