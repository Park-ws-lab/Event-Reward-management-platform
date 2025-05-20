import { Test, TestingModule } from '@nestjs/testing';
import { RewardService } from './reward.service';
import { getModelToken } from '@nestjs/mongoose';
import { Reward } from './schemas/reward.schema';
import { Event } from '../event/schemas/event.schema';
import { Types } from 'mongoose';

describe('RewardService', () => {
  let service: RewardService;

  // 이벤트 모델 mock (findById만 사용)
  const mockEventModel = {
    findById: jest.fn(),
  };

  // find().populate().exec() 체이닝을 위한 mock 구성
  const mockExec = jest.fn();
  const mockPopulate = jest.fn().mockReturnValue({ exec: mockExec });
  const mockFind = jest.fn().mockReturnValue({ populate: mockPopulate });

  // 생성자용 mock: new this.rewardModel(...) 시 동작
  const MockRewardConstructor = jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({
      _id: 'mockId',
      ...data,
    }),
  }));

  // 생성자 + 정적 메서드를 하나로 합침
  const mockRewardModel: any = Object.assign(MockRewardConstructor, {
    find: mockFind,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RewardService,
        {
          provide: getModelToken(Reward.name),
          useValue: mockRewardModel, // reward model mock 주입
        },
        {
          provide: getModelToken(Event.name),
          useValue: mockEventModel, // event model mock 주입
        },
      ],
    }).compile();

    service = module.get<RewardService>(RewardService);
  });

  // 서비스가 제대로 생성되었는지 확인
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // 보상 생성 테스트
  describe('createReward()', () => {
    it('이벤트가 존재하면 보상을 생성해야 한다', async () => {
      const dto = {
        eventId: new Types.ObjectId().toHexString(), // 유효한 ObjectId 문자열
        value: '쿠폰 5000원',
        quantity: 100,
      };

      // 이벤트가 존재한다고 가정
      mockEventModel.findById.mockResolvedValue({ _id: dto.eventId });

      const result = await service.createReward(dto as any); // 타입 생략 허용

      // 이벤트 존재 여부 확인 호출
      expect(mockEventModel.findById).toHaveBeenCalledWith(dto.eventId);

      // 반환 결과 확인
      expect(result).toMatchObject({
        event: expect.any(Types.ObjectId), // 이벤트는 ObjectId 타입
        value: '쿠폰 5000원',
        quantity: 100,
      });
    });
  });

  // 전체 보상 목록 조회 테스트
  describe('getAllRewards()', () => {
    it('전체 보상을 이벤트와 함께 반환해야 함', async () => {
      const mockRewards = [
        { name: '상품권', event: { title: '이벤트1' } },
        { name: '쿠폰', event: { title: '이벤트2' } },
      ];

      // 최종 exec()이 mockRewards 반환
      mockExec.mockResolvedValue(mockRewards);

      const result = await service.getAllRewards();

      // find, populate, exec 순서대로 호출되었는지 확인
      expect(mockFind).toHaveBeenCalled();
      expect(mockPopulate).toHaveBeenCalledWith('event');

      // 반환값 검증
      expect(result).toEqual(mockRewards);
    });
  });
});
