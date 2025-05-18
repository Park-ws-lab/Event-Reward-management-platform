import { Test, TestingModule } from '@nestjs/testing';
import { RewardRequestService } from './reward-request.service';
import { getModelToken } from '@nestjs/mongoose';
import { HttpService } from '@nestjs/axios';
import { InviteService } from '../event-list/invite/invite.service';
import { of } from 'rxjs';
import { Types } from 'mongoose';

describe('RewardRequestService', () => {
  let service: RewardRequestService;
  const userId = new Types.ObjectId().toHexString();
  const eventId = new Types.ObjectId().toHexString();

  // 각종 의존성 Mock 객체 정의
  const mockRequestModel = {
    findOne: jest.fn(),
    find: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    exec: jest.fn(),
    create: jest.fn(),
  };

  const mockEventModel = {
    findById: jest.fn(),
  };

  const mockRewardModel = {
    find: jest.fn(),
  };

  const mockInviteService = {
    countInvites: jest.fn(),
  };

  const mockHttpService = {
    get: jest.fn(),
  };

  // 테스트 모듈 설정
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RewardRequestService,
        { provide: getModelToken('RewardRequest'), useValue: mockRequestModel },
        { provide: getModelToken('Event'), useValue: mockEventModel },
        { provide: getModelToken('Reward'), useValue: mockRewardModel },
        { provide: InviteService, useValue: mockInviteService },
        { provide: HttpService, useValue: mockHttpService },
      ],
    }).compile();

    service = module.get<RewardRequestService>(RewardRequestService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateCondition', () => {
    it('조건이 FIRST_LOGIN이면 true 반환', async () => {
      const result = await service.validateCondition(userId, 'FIRST_LOGIN');
      expect(result).toBe(true);
    });

    it('3명 이상 초대한 경우 true 반환', async () => {
      mockInviteService.countInvites.mockResolvedValue(3);
      const result = await service.validateCondition(userId, 'INVITE_THREE');
      expect(result).toBe(true);
    });

    it('LOGIN_THREE 조건 만족 시 true 반환', async () => {
      mockHttpService.get.mockReturnValue(
        of({ data: { totalUniqueDays: 4 } })
      );
      const result = await service.validateCondition(userId, 'LOGIN_THREE');
      expect(result).toBe(true);
    });

    it('LOGIN_SEVEN_RECENT 조건 만족하지 않으면 false 반환', async () => {
      mockHttpService.get.mockReturnValue(
        of({ data: { recent7DaysUnique: 6 } })
      );
      const result = await service.validateCondition(userId, 'LOGIN_SEVEN_RECENT');
      expect(result).toBe(false);
    });

    it('정의되지 않은 조건이면 false 반환', async () => {
      const result = await service.validateCondition(userId, 'UNKNOWN');
      expect(result).toBe(false);
    });
  });

  describe('createRequest', () => {
    it('이미 SUCCESS 요청이 존재하면 예외 발생', async () => {
      mockRequestModel.findOne.mockResolvedValue(true);
      await expect(
        service.createRequest(userId, eventId)
      ).rejects.toThrow('이미 보상을 지급받은 이벤트입니다.');
    });

    it('등록된 보상이 없으면 예외 발생', async () => {
      mockRequestModel.findOne.mockResolvedValue(null);
      mockRewardModel.find.mockResolvedValue([]);
      await expect(
        service.createRequest(userId, eventId)
      ).rejects.toThrow('이벤트에 등록된 보상이 없습니다.');
    });

    it('이벤트가 없거나 비활성화면 예외 발생', async () => {
      mockRequestModel.findOne.mockResolvedValue(null);
      mockRewardModel.find.mockResolvedValue([{}]);
      mockEventModel.findById.mockResolvedValue(null);
      await expect(
        service.createRequest(userId, eventId)
      ).rejects.toThrow('존재하지 않거나 비활성화된 이벤트입니다.');
    });

    it('조건을 만족하면 SUCCESS 상태로 저장', async () => {
      mockRequestModel.findOne.mockResolvedValue(null);
      mockRewardModel.find.mockResolvedValue([{}]);
      mockEventModel.findById.mockResolvedValue({
        isActive: true,
        condition: 'FIRST_LOGIN',
      });

      const saveMock = jest.fn();

      // 동적으로 가짜 모델 인스턴스 생성
      const mockModelFactory: any = Object.assign(
        jest.fn().mockImplementation(() => ({ save: saveMock })),
        {
          findOne: jest.fn().mockResolvedValue(null),
          find: jest.fn().mockReturnThis(),
          populate: jest.fn().mockReturnThis(),
          sort: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue([]),
        }
      );

      (service as any).requestModel = mockModelFactory;

      const result = await service.createRequest(userId, eventId);

      expect(result.status).toBe('SUCCESS');
      expect(result.message).toBe('보상이 지급되었습니다.');
      expect(saveMock).toHaveBeenCalled();
    });

    it('조건을 만족하지 않으면 FAILED 상태로 저장', async () => {
      mockRequestModel.findOne.mockResolvedValue(null);
      mockRewardModel.find.mockResolvedValue([{}]);
      mockEventModel.findById.mockResolvedValue({
        isActive: true,
        condition: 'UNKNOWN',
      });

      const saveMock = jest.fn();

      const mockModelFactory: any = Object.assign(
        jest.fn().mockImplementation(() => ({ save: saveMock })),
        {
          findOne: jest.fn().mockResolvedValue(null),
          find: jest.fn().mockReturnThis(),
          populate: jest.fn().mockReturnThis(),
          sort: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue([]),
        }
      );

      (service as any).requestModel = mockModelFactory;

      const result = await service.createRequest(userId, eventId);
      expect(result.status).toBe('FAILED');
      expect(saveMock).toHaveBeenCalled();
    });
  });

  describe('getAllRequests', () => {
    it('전체 요청 목록 조회 시 유저 정보 포함 반환', async () => {
      const dummyReq = {
        toObject: () => ({ _id: 'abc', userId: userId }),
      };
      mockRequestModel.find().populate().sort().exec.mockResolvedValue([dummyReq]);
      mockHttpService.get.mockReturnValue(of({ data: { username: 'testuser' } }));

      const result = await service.getAllRequests();
      expect(result[0].user.username).toBe('testuser');
    });
  });

  describe('getRequestsByUser', () => {
    it('특정 유저의 요청 목록만 반환', async () => {
      const userId = new Types.ObjectId().toHexString();
      const mockData = [{ _id: 'req1' }, { _id: 'req2' }];
      mockRequestModel.find().populate().sort().exec.mockResolvedValue(mockData);

      const result = await service.getRequestsByUser(userId);
      expect(result).toHaveLength(2);
    });
  });
});
