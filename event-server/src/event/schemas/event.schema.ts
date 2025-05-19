// Event 스키마 정의

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { EventCondition, EVENT_CONDITIONS } from '../../common/enums/event-condition.enum';

// Event 모델에 Mongo 문서 관련 기능을 합친 타입
export type EventDocument = Event & Document;

@Schema({
  timestamps: true,             // 생성일(createdAt)과 수정일(updatedAt) 자동 생성
  toJSON: { virtuals: true },   // JSON 응답 시 virtual 필드 포함
  toObject: { virtuals: true }, // 객체 변환 시 virtual 필드 포함
})
export class Event {
  // 이벤트 제목
  @Prop({ required: true })
  title: string;

  // 이벤트 설명
  @Prop({ required: true })
  description: string;

  // 이벤트 조건 (FIRST_LOGIN, )
  @Prop({ required: true, enum: EVENT_CONDITIONS })
  condition: EventCondition;

  // 이벤트 시작 날짜
  @Prop({ required: true })
  startDate: Date;

  // 이벤트 종료 날짜
  @Prop({ required: true })
  endDate: Date;

  // 이벤트 활성화 여부 (기본값: true)
  @Prop({ default: true })
  isActive: boolean;

  // 보상 정보 (Reward 스키마와 virtual로 연결됨)
  rewards?: any[];
}

// 클래스 기반으로 스키마 생성
export const EventSchema = SchemaFactory.createForClass(Event);

// Reward 스키마와의 가상 관계 설정
EventSchema.virtual('rewards', {
  ref: 'Reward',          // 연결할 대상 모델명
  localField: '_id',      // 현재 Event 스키마의 키
  foreignField: 'event',  // Reward 스키마에서 참조하는 필드명
});
