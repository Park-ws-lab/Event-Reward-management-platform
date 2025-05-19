// EventService 단위 테스트 코드

import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { EventService } from './event.service';
import { Event } from './schemas/event.schema';
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
      const dto = {
        title: '출석 이벤트',
        description: '3회 출석 시 보상',
        condition: 'LOGIN_THREE',
        startDate:new Date('2025-05-01T00:00:00.000Z'),
        endDate:new Date('2025-05-31T23:59:59.999Z'),
        isActive: true,
      };

      const mockSave = jest.fn().mockResolvedValue({ ...dto, _id: 'abc123' });

      const mockEventModelFactory: any = jest.fn().mockImplementation(() => ({
        save: mockSave,
      }));

      // 생성자 + save() 갖춘 mock을 강제로 삽입
      (service as any).eventModel = mockEventModelFactory;

      const result = await service.createEvent(dto);

      expect(result._id).toBe('abc123');
      expect(result.title).toBe(dto.title);
      expect(mockSave).toHaveBeenCalled();
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
