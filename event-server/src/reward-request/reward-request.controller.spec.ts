// RewardRequestController 단위 테스트 코드

import { Test, TestingModule } from '@nestjs/testing';
import { RewardRequestController } from './reward-request.controller';
import { RewardRequestService } from './reward-request.service';
import { CreateRewardRequestDto } from './dto/create-reward-request.dto';

describe('RewardRequestController', () => {
  let controller: RewardRequestController;
  let mockRewardRequestService: Partial<Record<keyof RewardRequestService, jest.Mock>>;

  beforeEach(async () => {
    // RewardRequestService의 메서드들을 mock으로 정의
    mockRewardRequestService = {
      createRequest: jest.fn(),
      getAllRequests: jest.fn(),
      getRequestsByUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RewardRequestController],
      providers: [
        { provide: RewardRequestService, useValue: mockRewardRequestService },
      ],
    }).compile();

    controller = module.get<RewardRequestController>(RewardRequestController);
  });

  // 보상 요청 생성 API 테스트
  describe('requestReward()', () => {
    it('보상 요청을 생성하고 메시지를 반환해야 함', async () => {
      const dto: CreateRewardRequestDto = {
        userId: 'user1',
        eventId: 'event1',
      };

      const mockResult = { id: 'req123', ...dto, status: 'PENDING' };

      mockRewardRequestService.createRequest.mockResolvedValue(mockResult);

      const result = await controller.requestReward(dto);

      expect(mockRewardRequestService.createRequest).toHaveBeenCalledWith('user1', 'event1');
      expect(result).toEqual({
        message: '보상 요청 처리 결과',
        request: mockResult,
      });
    });
  });

  // 전체 보상 요청 조회 API 테스트
  describe('findAll()', () => {
    it('모든 보상 요청 목록과 개수를 반환해야 함', async () => {
      const mockRequests = [
        { userId: 'user1', eventId: 'event1' },
        { userId: 'user2', eventId: 'event2' },
      ];

      mockRewardRequestService.getAllRequests.mockResolvedValue(mockRequests);

      const result = await controller.findAll();

      expect(mockRewardRequestService.getAllRequests).toHaveBeenCalled();
      expect(result).toEqual({
        count: mockRequests.length,
        requests: mockRequests,
      });
    });
  });

  // 특정 유저의 요청 조회 API 테스트
  describe('findByUser()', () => {
    it('특정 유저의 보상 요청 목록을 반환해야 함', async () => {
      const userId = 'user1';
      const mockUserRequests = [
        { userId, eventId: 'event1' },
        { userId, eventId: 'event3' },
      ];

      mockRewardRequestService.getRequestsByUser.mockResolvedValue(mockUserRequests);

      const result = await controller.findByUser(userId);

      expect(mockRewardRequestService.getRequestsByUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual({
        count: mockUserRequests.length,
        requests: mockUserRequests,
      });
    });
  });
});
