import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { RewardService } from './reward.service';
import { CreateRewardDto } from './dto/create-reward.dto';

@Controller('rewards')
export class RewardController {
  constructor(private readonly rewardService: RewardService) { }

  @Post()
  async create(@Body() body: CreateRewardDto) {
    const reward = await this.rewardService.createReward(body);
    return { message: '보상이 등록되었습니다', reward };
  }

  //보상 총 개수와 내용 반환
  @Get()
  async findAll() {
    const rewards = await this.rewardService.getAllRewards();
    return { count: rewards.length, rewards };
  }
}
