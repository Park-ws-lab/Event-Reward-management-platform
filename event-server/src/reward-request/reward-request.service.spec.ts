// RewardRequestService 단위 테스트 코드

import { Test, TestingModule } from '@nestjs/testing';
import { RewardRequestService } from './reward-request.service';
import { getModelToken } from '@nestjs/mongoose';
import { RewardRequest } from './reward-request.schema';
import { Event } from '../event/event.schema';
import { Reward } from '../reward/reward.schema';
import { InviteService } from '../event-list/invite/invite.service';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { Types } from 'mongoose';
import { BadRequestException } from '@nestjs/common';

describe('RewardRequestService', () => {
  let service: RewardRequestService;

  // Mock 모델 및 서비스 정의
  const mockRequestModel = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    sort: jest.fn(),
    exec: jest.fn(),
    prototype: { save: jest.fn() },
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

  // 테스트 환경 구성
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RewardRequestService,
        { provide: getModelToken(RewardRequest.name), useValue: mockRequestModel },
        { provide: getModelToken(Event.name), useValue: mockEventModel },
        { provide: getModelToken(Reward.name), useValue: mockRewardModel },
        { provide: InviteService, useValue: mockInviteService },
        { provide: HttpService, useValue: mockHttpService },
      ],
    }).compile();

    service = module.get<RewardRequestService>(RewardRequestService);
  });

  // 보상 조건 검증 로직 테스트
  describe('validateCondition()', () => {
    it('FIRST_LOGIN 조건은 무조건 true 반환', async () => {
      const result = await service.validateCondition('user1', 'FIRST_LOGIN');
      expect(result).toBe(true);
    });

    it('INVITE_THREE 조건: 초대한 친구 수가 3 이상이면 true', async () => {
      mockInviteService.countInvites.mockResolvedValue(3);
      const result = await service.validateCondition('user1', 'INVITE_THREE');
      expect(result).toBe(true);
    });

    it('LOGIN_THREE 조건: 고유 로그인 일수가 3 이상이면 true', async () => {
      mockHttpService.get.mockReturnValue(of({ data: { totalUniqueDays: 3 } }));
      const result = await service.validateCondition('user1', 'LOGIN_THREE');
      expect(result).toBe(true);
    });

    it('LOGIN_SEVEN_RECENT 조건: recent7DaysUnique가 7일 때 true', async () => {
      mockHttpService.get.mockReturnValue(of({ data: { recent7DaysUnique: 7 } }));
      const result = await service.validateCondition('user1', 'LOGIN_SEVEN_RECENT');
      expect(result).toBe(true);
    });

    it('등록되지 않은 조건은 false 반환', async () => {
      const result = await service.validateCondition('user1', 'INVALID_CONDITION');
      expect(result).toBe(false);
    });
  });

  // 보상 요청 생성 로직 테스트
  describe('createRequest()', () => {
    it('이미 보상이 지급된 이벤트인 경우 예외 발생', async () => {
      mockRequestModel.findOne.mockResolvedValue({ _id: '123', status: 'SUCCESS' });

      await expect(service.createRequest('user1', 'event1')).rejects.toThrow(BadRequestException);
    });

    it('보상이 등록되지 않은 이벤트인 경우 예외 발생', async () => {
      mockRequestModel.findOne.mockResolvedValue(null);
      mockRewardModel.find.mockResolvedValue([]);

      await expect(service.createRequest('user1', 'event1')).rejects.toThrow('이벤트에 등록된 보상이 없습니다.');
    });

    it('이벤트가 없거나 비활성화된 경우 예외 발생', async () => {
      mockRequestModel.findOne.mockResolvedValue(null);
      mockRewardModel.find.mockResolvedValue([{}]);
      mockEventModel.findById.mockResolvedValue({ isActive: false });

      await expect(service.createRequest('user1', 'event1')).rejects.toThrow('존재하지 않거나 비활성화된 이벤트입니다.');
    });

    it('조건을 만족하지 못하면 FAILED 상태로 저장', async () => {
      mockRequestModel.findOne.mockResolvedValue(null);
      mockRewardModel.find.mockResolvedValue([{}]);
      mockEventModel.findById.mockResolvedValue({ isActive: true, condition: 'LOGIN_THREE' });
      mockHttpService.get.mockReturnValue(of({ data: { totalUniqueDays: 0 } })); // 조건 미충족

      const saveMock = jest.fn();
      (service as any).requestModel = function () {
        return { save: saveMock };
      };

      await service.createRequest('user1', 'event1');
      expect(saveMock).toHaveBeenCalled(); // 저장 시도 확인
    });

    it('조건을 만족하면 SUCCESS 상태로 저장', async () => {
      mockRequestModel.findOne.mockResolvedValue(null);
      mockRewardModel.find.mockResolvedValue([{}]);
      mockEventModel.findById.mockResolvedValue({ isActive: true, condition: 'FIRST_LOGIN' });

      const saveMock = jest.fn();
      (service as any).requestModel = function () {
        return { save: saveMock };
      };

      const result = await service.createRequest('user1', 'event1');
      expect(result.status).toBe('SUCCESS'); // 성공 상태 확인
    });
  });

});
