import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';
import { Event } from '../event/event.schema';

export type RewardDocument = Reward & Document;

@Schema({ timestamps: true })
export class Reward {
    @Prop({ type: Types.ObjectId, ref: Event.name, required: true }) // 이벤트
    event: Types.ObjectId;

    @Prop({ required: true }) //포인트, 아이템, 쿠폰... 등의 타입
    type: string;

    @Prop({ required: true }) // 500, 장비 상자, ... 등의 세부 내용
    value: string;

    @Prop({ default: 1 }) // 수량
    quantity: number;
}

export const RewardSchema = SchemaFactory.createForClass(Reward);
