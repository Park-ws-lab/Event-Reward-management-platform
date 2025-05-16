import { Test, TestingModule } from '@nestjs/testing';
import { RewardRequestService } from './reward-request.service';

describe('RewardRequestService', () => {
  let service: RewardRequestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RewardRequestService],
    }).compile();

    service = module.get<RewardRequestService>(RewardRequestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
