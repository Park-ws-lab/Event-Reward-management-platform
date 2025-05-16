import { Test, TestingModule } from '@nestjs/testing';
import { RewardRequestProxyController } from './reward-request-proxy.controller';

describe('RewardRequestProxyController', () => {
  let controller: RewardRequestProxyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RewardRequestProxyController],
    }).compile();

    controller = module.get<RewardRequestProxyController>(RewardRequestProxyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
