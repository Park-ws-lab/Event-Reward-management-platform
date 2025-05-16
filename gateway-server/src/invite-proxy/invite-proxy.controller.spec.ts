import { Test, TestingModule } from '@nestjs/testing';
import { InviteProxyController } from './invite-proxy.controller';

describe('InviteProxyController', () => {
  let controller: InviteProxyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InviteProxyController],
    }).compile();

    controller = module.get<InviteProxyController>(InviteProxyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
