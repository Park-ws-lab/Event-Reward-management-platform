import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EventDocument = Event & Document;

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Event {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    description: string;

    @Prop({ required: true })
    condition: string;

    @Prop({ required: true })
    startDate: Date;

    @Prop({ required: true })
    endDate: Date;

    @Prop({ default: true })
    isActive: boolean;

    rewards?: any[];
}

export const EventSchema = SchemaFactory.createForClass(Event);

EventSchema.virtual('rewards', {
  ref: 'Reward',               // 참조할 모델 이름
  localField: '_id',           // 현재 Event의 필드
  foreignField: 'event',       // Reward에서 참조하는 필드
});