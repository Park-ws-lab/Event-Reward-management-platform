// src/event/event.controller.ts
import {
    Controller,
    Post,
    Get,
    Body,
    Param,
    UseGuards,
    Request,
} from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';

@Controller('events')
export class EventController {
    constructor(private readonly eventService: EventService) { }

    @Post()
    async create(@Body() body: CreateEventDto) {
        const event = await this.eventService.createEvent(body);
        return { message: '이벤트가 등록되었습니다', event };
    }
    @Get()
    async findAll() {
        const events = await this.eventService.getAllEvents();
        return { count: events.length, events };
    }
    @Get('titles')
    async findAllTitles() {
        const events = await this.eventService.getAllTitles();
        return events;
    }
}
