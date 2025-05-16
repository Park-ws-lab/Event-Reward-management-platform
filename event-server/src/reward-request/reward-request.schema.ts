import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';
import { Event } from '../event/event.schema';

export type RewardRequestDocument = RewardRequest & Document;

@Schema({ timestamps: true })
export class RewardRequest {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: Event.name, required: true })
    event: Types.ObjectId;

    @Prop({ default: 'PENDING' })
    status: 'PENDING' | 'SUCCESS' | 'FAILED';

    @Prop()
    reason?: string;
}

export const RewardRequestSchema =
    SchemaFactory.createForClass(RewardRequest);
