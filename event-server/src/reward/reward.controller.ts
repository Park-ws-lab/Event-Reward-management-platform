//'rewards' 경로에 대한 보상 생성 및 조회회 API 제공

import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { RewardService } from './reward.service';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';

// '/rewards' 경로를 처리하는 컨트롤러 클래스
@Controller('rewards')
export class RewardController {
  constructor(private readonly rewardService: RewardService) { }

  // [POST] /rewards - 보상 등록
  @Post()
  async create(@Body() body: CreateRewardDto) {
    const reward = await this.rewardService.createReward(body);
    return { message: '보상이 등록되었습니다', reward };
  }

  // [GET] /rewards - 전체 보상 목록 조회 (개수 포함)
  @Get()
  async findAll() {
    const rewards = await this.rewardService.getAllRewards();
    return { count: rewards.length, rewards };
  }

  // [PATCH] /rewards/:id - 보상 수정
  @Patch(':id')
  async update(@Param('id') rewardId: string, @Body() dto: UpdateRewardDto) {
    return this.rewardService.updateRewardOrFail(rewardId, dto);
  }

  // [DELETE] /rewards/:id - 보상 삭제
  @Delete(':id')
  async delete(@Param('id') rewardId: string) {
    return this.rewardService.deleteRewardOrFail(rewardId);
  }
}
