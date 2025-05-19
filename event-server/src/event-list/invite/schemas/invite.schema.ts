// Invite 스키마 정의

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true }) // 생성일(createdAt), 수정일(updatedAt) 자동 관리
export class Invite extends Document {
  // 초대한 사용자 ID (User 컬렉션의 ObjectId 참조)
  @Prop({ type: Types.ObjectId, required: true })
  inviter: Types.ObjectId;

  // 초대된 사용자 ID (User 컬렉션의 ObjectId 참조)
  @Prop({ type: Types.ObjectId, required: true })
  invited: Types.ObjectId;
}

// Invite 클래스 기반으로 Mongoose 스키마 생성
export const InviteSchema = SchemaFactory.createForClass(Invite);
