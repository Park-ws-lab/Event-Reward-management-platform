import { Test, TestingModule } from '@nestjs/testing';
import { AuthProxyController } from './auth-proxy.controller';

describe('AuthProxyController', () => {
  let controller: AuthProxyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthProxyController],
    }).compile();

    controller = module.get<AuthProxyController>(AuthProxyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
