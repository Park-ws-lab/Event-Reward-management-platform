import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common';
import { RewardRequestService } from './reward-request.service';
import { CreateRewardRequestDto } from './dto/create-reward-request.dto';

@Controller('reward-requests')
export class RewardRequestController {
    constructor(private readonly rewardRequestService: RewardRequestService) { }

    @Post()
    async requestReward(@Body() body: CreateRewardRequestDto) {
        const { userId, eventId } = body;
        const request = await this.rewardRequestService.createRequest(userId, eventId);
        return { message: '보상 요청 처리 결과', request };
    }

    @Get()
    async findAll() {
        const requests = await this.rewardRequestService.getAllRequests();
        return { count: requests.length, requests };
    }

    @Get('user/:userId')
    async findByUser(
        @Param('userId') userId: string,
    ) {
        const requests = await this.rewardRequestService.getRequestsByUser(userId);
        return { count: requests.length, requests };
    }
}
