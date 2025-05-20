// RewardRequestController 단위 테스트 코드

import { Test, TestingModule } from '@nestjs/testing';
import { RewardRequestController } from './reward-request.controller';
import { RewardRequestService } from './reward-request.service';
import { CreateRewardRequestDto } from './dto/create-reward-request.dto';
import { Types } from 'mongoose';

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
        {
          _id: new Types.ObjectId(),
          userId: new Types.ObjectId(),
          event: new Types.ObjectId(),
          status: 'SUCCESS',
        },
        {
          _id: new Types.ObjectId(),
          userId: new Types.ObjectId(),
          event: new Types.ObjectId(),
          status: 'FAILED',
        },
      ];

      mockRewardRequestService.getAllRequests.mockResolvedValue(mockRequests);

      const result = await controller.findAllWithFilter(undefined, undefined);

      expect(mockRewardRequestService.getAllRequests).toHaveBeenCalledWith({});
      expect(result).toEqual({
        count: mockRequests.length,
        requests: mockRequests,
      });
    });

    it('eventId만 전달했을 때 필터링된 결과 반환', async () => {
      const eventId = new Types.ObjectId();

      const mockRequests = [
        {
          _id: new Types.ObjectId(),
          userId: new Types.ObjectId(),
          event: eventId,
          status: 'SUCCESS',
        },
      ];

      mockRewardRequestService.getAllRequests.mockResolvedValue(mockRequests);

      const result = await controller.findAllWithFilter(eventId.toString(), undefined);

      expect(mockRewardRequestService.getAllRequests).toHaveBeenCalledWith({ eventId: eventId.toString() });
      expect(result.requests[0].event).toEqual(expect.any(Types.ObjectId));
    });

    it('status만 전달했을 때 필터링된 결과 반환', async () => {
      const status = 'SUCCESS';

      const mockRequests = [
        {
          _id: new Types.ObjectId(),
          userId: new Types.ObjectId(),
          event: new Types.ObjectId(),
          status,
        },
      ];

      mockRewardRequestService.getAllRequests.mockResolvedValue(mockRequests);

      const result = await controller.findAllWithFilter(undefined, status);

      expect(mockRewardRequestService.getAllRequests).toHaveBeenCalledWith({ status });
      expect(result.requests[0].status).toBe(status);
    });

    it('eventId와 status 모두 전달했을 때 필터링된 결과 반환', async () => {
      const eventId = new Types.ObjectId();
      const status = 'FAILED';
      const filters = { eventId: eventId.toString(), status };

      const mockRequests = [
        {
          _id: new Types.ObjectId(),
          userId: new Types.ObjectId(),
          event: eventId,
          status,
        },
      ];

      mockRewardRequestService.getAllRequests.mockResolvedValue(mockRequests);

      const result = await controller.findAllWithFilter(filters.eventId, filters.status);
      expect(mockRewardRequestService.getAllRequests).toHaveBeenCalledWith(filters);
      expect(result.requests[0].event).toEqual(expect.any(Types.ObjectId));
      expect(result.requests[0].status).toBe(filters.status);
    });
  });

  // 특정 유저의 요청 조회 API 테스트
  describe('findByUser()', () => {
    it('특정 유저의 보상 요청 목록을 반환해야 함', async () => {
      const userId = 'user1';
      const mockUserRequests = [
        {
          _id: new Types.ObjectId(),
          userId,
          event: new Types.ObjectId(),
          status: 'SUCCESS',
        },
        {
          _id: new Types.ObjectId(),
          userId,
          event: new Types.ObjectId(),
          status: 'FAILED',
        },
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
