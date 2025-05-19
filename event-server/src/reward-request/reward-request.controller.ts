//'reward-requests' 경로에 대한 보상 요청 생성 및 조회 API 제공

import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common';
import { RewardRequestService } from './reward-request.service';
import { CreateRewardRequestDto } from './dto/create-reward-request.dto';

// '/reward-requests' 경로를 처리하는 컨트롤러 클래스
@Controller('reward-requests')
export class RewardRequestController {
    constructor(private readonly rewardRequestService: RewardRequestService) { }

    // [POST] /reward-requests - 보상 요청 생성
    @Post()
    async requestReward(@Body() body: CreateRewardRequestDto) {
        const { userId, eventId } = body;
        const request = await this.rewardRequestService.createRequest(userId, eventId);
        return { message: '보상 요청 처리 결과', request };
    }

    // [GET] /reward-requests?eventId=xxx&status=SUCCESS - 모든 보상 요청 조회 및 보상 조회 필터링
    @Get()
    async findAllWithFilter(
        @Query('eventId') eventId?: string,
        @Query('status') status?: string,
    ) {
        // 유효한 status 문자열만 허용 ('PENDING' | 'SUCCESS' | 'FAILED')
        const validStatuses = ['PENDING', 'SUCCESS', 'FAILED'] as const;
        const castedStatus = validStatuses.includes(status as any)
            ? (status as typeof validStatuses[number])
            : undefined;

        const requests = await this.rewardRequestService.getAllRequests({
            eventId,
            status: castedStatus,
        });
        return { count: requests.length, requests };
    }

    // [GET] /reward-requests/user/:userId - 특정 유저의 요청 내역 조회
    @Get('user/:userId')
    async findByUser(@Param('userId') userId: string) {
        const requests = await this.rewardRequestService.getRequestsByUser(userId);
        return { count: requests.length, requests };
    }

}
