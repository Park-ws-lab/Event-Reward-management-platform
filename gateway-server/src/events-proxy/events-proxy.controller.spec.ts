import { Test, TestingModule } from '@nestjs/testing';
import { EventsProxyController } from './events-proxy.controller';

describe('EventsProxyController', () => {
  let controller: EventsProxyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsProxyController],
    }).compile();

    controller = module.get<EventsProxyController>(EventsProxyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
