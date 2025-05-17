// EventController 단위 테스트 코드

import { Test, TestingModule } from '@nestjs/testing';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';

describe('EventController', () => {
  let controller: EventController;
  let mockEventService: Partial<Record<keyof EventService, jest.Mock>>;

  beforeEach(async () => {
    // EventService 메서드들을 Jest mock으로 정의
    mockEventService = {
      createEvent: jest.fn(),
      getAllEvents: jest.fn(),
      getAllTitles: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventController],
      providers: [
        { provide: EventService, useValue: mockEventService },
      ],
    }).compile();

    controller = module.get<EventController>(EventController);
  });

  // 이벤트 등록 테스트
  describe('create()', () => {
    it('이벤트를 등록하고 응답 메시지를 반환해야 함', async () => {
      const dto: CreateEventDto = {
        title: 'Test Event',
        description: 'Sample description',
        isActive: true,
        condition: 'LOGIN_THREE',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
      };

      const mockEvent = { ...dto, _id: '123abc' };

      mockEventService.createEvent.mockResolvedValue(mockEvent);

      const result = await controller.create(dto);

      expect(mockEventService.createEvent).toHaveBeenCalledWith(dto);
      expect(result).toEqual({
        message: '이벤트가 등록되었습니다',
        event: mockEvent,
      });
    });
  });


  // 전체 이벤트 조회 테스트
  describe('findAll()', () => {
    it('전체 이벤트 목록과 개수를 반환해야 함', async () => {
      const events = [
        { title: 'Event 1' },
        { title: 'Event 2' },
      ];

      mockEventService.getAllEvents.mockResolvedValue(events);

      const result = await controller.findAll();

      expect(mockEventService.getAllEvents).toHaveBeenCalled();
      expect(result).toEqual({
        count: events.length,
        events,
      });
    });
  });

  // 제목 목록 조회 테스트
  describe('findAllTitles()', () => {
    it('이벤트 제목 목록을 반환해야 함', async () => {
      const titles = ['Event 1', 'Event 2'];

      mockEventService.getAllTitles.mockResolvedValue(titles);

      const result = await controller.findAllTitles();

      expect(mockEventService.getAllTitles).toHaveBeenCalled();
      expect(result).toEqual(titles);
    });
  });
});
