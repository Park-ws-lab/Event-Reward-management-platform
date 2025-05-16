// src/event/event.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Event, EventDocument } from './event.schema';
import { Model } from 'mongoose';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventService {
    constructor(
        @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    ) { }

    async createEvent(dto: CreateEventDto) {
        const event = new this.eventModel(dto);
        return event.save();
    }

    async getAllEvents(): Promise<Event[]> {
        return this.eventModel
            .find()
            .populate({ path: 'rewards' })
            .exec();
    }

    async getAllTitles(): Promise<Event[]> {
        return this.eventModel
            .find({}, { title: 1 })
            .sort({ createdAt: -1 })
            .exec();
    }
}
