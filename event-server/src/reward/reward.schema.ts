// Reward 스키마 정의의

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';
import { Event } from '../event/event.schema';

// Reward 모델에 Mongo 문서 관련 기능을 합친 타입
export type RewardDocument = Reward & Document;

@Schema({ timestamps: true }) // createdAt, updatedAt 자동 생성
export class Reward {
    // 연결된 이벤트의 ID (참조: Event 컬렉션)
    @Prop({ type: Types.ObjectId, ref: Event.name, required: true })
    event: Types.ObjectId;

    // 보상 유형 ('ITEM', 'POINT', 'COUPON', 'CURRENCY')
    @Prop({ required: true, enum: ['ITEM', 'POINT', 'COUPON', 'CURRENCY'] })
    type: 'ITEM' | 'POINT' | 'COUPON' | 'CURRENCY';

    // 보상 내용 (예: 포인트나 재화의 양 등)
    @Prop({ required: true })
    value?: string;

    // 보상 수량 (기본값: 1)
    @Prop({ default: 1 })
    quantity: number;

    // 보상 설명 ex: “게임 내에서 사용할 수 있는 특별한 검입니다.”
    @Prop()
    description?: string;
}

// Reward 클래스를 기반으로 스키마 생성
export const RewardSchema = SchemaFactory.createForClass(Reward);
