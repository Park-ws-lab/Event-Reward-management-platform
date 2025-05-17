// EventService 단위 테스트 코드

import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { EventService } from './event.service';
import { Event } from './event.schema';
import { CreateEventDto } from './dto/create-event.dto';

describe('EventService', () => {
  let service: EventService;
  let mockEventModel: any;

  beforeEach(async () => {
    // Mongoose 모델 메서드들을 mocking
    mockEventModel = {
      // 생성자처럼 사용할 수 있도록 함수로 선언
      prototype: { save: jest.fn() },
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        { provide: getModelToken(Event.name), useValue: mockEventModel },
      ],
    }).compile();

    service = module.get<EventService>(EventService);
  });

  // 이벤트 생성 테스트
  describe('createEvent()', () => {
    it('이벤트를 생성하고 저장해야 함', async () => {
      const dto: CreateEventDto = {
        title: '테스트 이벤트',
        description: '이벤트 설명',
        isActive: true,
        condition: 'LOGIN_THREE',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
      };

      // 가짜 event 인스턴스와 save mocking
      const mockSave = jest.fn().mockResolvedValue({ ...dto, _id: 'abc123' });
      mockEventModel.mockImplementation(() => ({ save: mockSave }));

      const result = await service.createEvent(dto);

      expect(mockSave).toHaveBeenCalled();
      expect(result).toEqual({ ...dto, _id: 'abc123' });
    });
  });

  // 전체 이벤트 조회 테스트
  describe('getAllEvents()', () => {
    it('모든 이벤트를 보상 정보와 함께 반환해야 함', async () => {
      const mockExec = jest.fn().mockResolvedValue([
        { title: 'Event 1', rewards: [] },
        { title: 'Event 2', rewards: [] },
      ]);
      const mockPopulate = jest.fn().mockReturnValue({ exec: mockExec });
      mockEventModel.find.mockReturnValue({ populate: mockPopulate });

      const result = await service.getAllEvents();

      expect(mockEventModel.find).toHaveBeenCalled();
      expect(mockPopulate).toHaveBeenCalledWith({ path: 'rewards' });
      expect(result).toEqual([
        { title: 'Event 1', rewards: [] },
        { title: 'Event 2', rewards: [] },
      ]);
    });
  });

  // 제목 목록 조회 테스트
  describe('getAllTitles()', () => {
    it('이벤트 제목 목록을 최신순으로 반환해야 함', async () => {
      const mockExec = jest.fn().mockResolvedValue([
        { title: 'Event A' },
        { title: 'Event B' },
      ]);
      const mockSort = jest.fn().mockReturnValue({ exec: mockExec });
      mockEventModel.find.mockReturnValue({ sort: mockSort });

      const result = await service.getAllTitles();

      expect(mockEventModel.find).toHaveBeenCalledWith({}, { title: 1 });
      expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(result).toEqual([
        { title: 'Event A' },
        { title: 'Event B' },
      ]);
    });
  });
});
