// RewardService 단위 테스트 코드

import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { RewardService } from './reward.service';
import { Reward } from './schemas/reward.schema';
import { Types } from 'mongoose';
import { CreateRewardDto } from './dto/create-reward.dto';

describe('RewardService', () => {
  let service: RewardService;
  let mockRewardModel: any;

  // 각 테스트 실행 전 mock 모델 초기화
  beforeEach(async () => {
    mockRewardModel = {
      find: jest.fn(), // 전체 보상 조회용 메서드 mock
      prototype: { save: jest.fn() }, // save()는 실제로 생성자 인스턴스에서 호출되므로 별도로 선언
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RewardService,
        { provide: getModelToken(Reward.name), useValue: mockRewardModel },
      ],
    }).compile();

    service = module.get<RewardService>(RewardService);
  });

  // 보상 생성 테스트
  describe('createReward()', () => {
    it('보상을 생성하고 저장해야 함', async () => {
      const validEventId = new Types.ObjectId().toHexString();
      const dto: CreateRewardDto = {
        eventId: validEventId, // 문자열로 전달되는 이벤트 ID
        type: 'COUPON',
        value: '테스트 쿠폰',
        quantity: 100,
      };

      const mockSavedReward = {
        _id: 'reward123id',
        event: new Types.ObjectId(dto.eventId),
        type: dto.type,
        value: dto.value,
        quantity: dto.quantity,
      };

      const mockSave = jest.fn().mockResolvedValue(mockSavedReward); // 저장 결과 mock

      // rewardModel을 생성자처럼 동작하도록 mock 처리
      const serviceWithMock = new RewardService(mockRewardModel);
      (serviceWithMock as any).rewardModel = function (data: any) {
        return { save: mockSave }; // 생성자 호출 시 save 메서드 포함된 객체 반환
      };

      const result = await serviceWithMock.createReward(dto);

      // save() 메서드가 호출되었는지 확인
      expect(mockSave).toHaveBeenCalled();

      // 결과가 예상한 mockSavedReward와 일치하는지 확인
      expect(result).toEqual(mockSavedReward);
    });
  });

  // 전체 보상 조회 테스트
  describe('getAllRewards()', () => {
    it('전체 보상을 이벤트와 함께 반환해야 함', async () => {
      const mockRewards = [
        { name: '상품권', event: { title: '이벤트1' } },
        { name: '쿠폰', event: { title: '이벤트2' } },
      ];

      // exec() 결과 mock
      const mockExec = jest.fn().mockResolvedValue(mockRewards);
      // populate('event') 결과로 exec() 메서드를 포함하는 객체 반환
      const mockPopulate = jest.fn().mockReturnValue({ exec: mockExec });

      // find() 호출 시 populate 체인 리턴
      mockRewardModel.find.mockReturnValue({ populate: mockPopulate });

      const result = await service.getAllRewards();

      // find(), populate(), exec() 호출 확인
      expect(mockRewardModel.find).toHaveBeenCalled();
      expect(mockPopulate).toHaveBeenCalledWith('event');

      // 반환된 보상 목록이 mock과 일치하는지 확인
      expect(result).toEqual(mockRewards);
    });
  });
});
