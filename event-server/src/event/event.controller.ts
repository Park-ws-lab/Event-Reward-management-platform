// 이벤트 등록 및 조회 관련 API를 제공하는 컨트롤러

import {
    Controller,
    Post,
    Get,
    Body,
    Patch,
    Param,
    Delete,
    NotFoundException,
} from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

// '/events' 경로를 처리하는 컨트롤러 클래스
@Controller('events')
export class EventController {
    constructor(private readonly eventService: EventService) { }

    // [POST] /events - 새로운 이벤트 등록
    @Post()
    async create(@Body() body: CreateEventDto) {
        // 이벤트 등록록
        const event = await this.eventService.createEvent(body);
        return { message: '이벤트가 등록되었습니다', event };
    }

    // [GET] /events - 모든 이벤트 목록 조회
    @Get()
    async findAll() {
        // 모든 이벤트 조회
        const events = await this.eventService.getAllEvents();
        return { count: events.length, events };
    }

    // [GET] /events/titles - 이벤트 제목만 조회
    @Get('titles')
    async findAllTitles() {
        // 이벤트 목록 조회
        const events = await this.eventService.getAllTitles();
        return events;
    }

    // [PATCH] /events/:id - 이벤트 수정
    @Patch(':id')
    async update(@Param('id') id: string, @Body() body: UpdateEventDto) {
        return this.eventService.updateEventOrFail(id, body);
    }

    // [DELETE] /events/:id - 이벤트 삭제
    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.eventService.deleteEventOrFail(id);
    }

}
