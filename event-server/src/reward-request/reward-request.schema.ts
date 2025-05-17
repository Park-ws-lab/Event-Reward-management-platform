// RewardRequest 스키마 정의

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';
import { Event } from '../event/event.schema';

// RewardRequest 모델에 Mongo 문서 관련 기능을 합친 타입
export type RewardRequestDocument = RewardRequest & Document;

@Schema({ timestamps: true }) // createdAt, updatedAt 필드 자동 생성
export class RewardRequest {
  // 보상을 요청한 유저의 ID (User 컬렉션 참조)
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  // 보상을 요청한 이벤트의 ID (Event 컬렉션 참조)
  @Prop({ type: Types.ObjectId, ref: Event.name, required: true })
  event: Types.ObjectId;

  // 요청 상태 ('PENDING' | 'SUCCESS' | 'FAILED'), 기본값은 PENDING
  @Prop({ default: 'PENDING' })
  status: 'PENDING' | 'SUCCESS' | 'FAILED';

  // 실패 사유 등의 설명 (선택 필드)
  @Prop()
  reason?: string;
}

// RewardRequest 클래스를 기반으로 스키마 생성
export const RewardRequestSchema = SchemaFactory.createForClass(RewardRequest);
