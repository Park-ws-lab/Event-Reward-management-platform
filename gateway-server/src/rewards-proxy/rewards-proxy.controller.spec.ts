import { Test, TestingModule } from '@nestjs/testing';
import { RewardsProxyController } from './rewards-proxy.controller';

describe('RewardsProxyController', () => {
  let controller: RewardsProxyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RewardsProxyController],
    }).compile();

    controller = module.get<RewardsProxyController>(RewardsProxyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
