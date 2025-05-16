// src/event/event.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Event, EventSchema } from './event.schema';
import { Reward, RewardSchema } from '../reward/reward.schema';
import { EventService } from './event.service';
import { EventController } from './event.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }, { name: Reward.name, schema: RewardSchema },]),
  ],
  providers: [EventService],
  controllers: [EventController],
  exports: [EventService, MongooseModule]
})
export class EventModule { }
