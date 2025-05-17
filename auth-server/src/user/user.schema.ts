// User 스키마 정의

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// User 모델에 Mongo 문서 관련 기능을 합친 타입
export type UserDocument = User & Document;

@Schema()
export class User {
  // 사용자명: 필수, 중복 불가
  @Prop({ required: true, unique: true })
  username: string;

  // 비밀번호: 필수
  @Prop({ required: true })
  password: string;

  // 사용자 역할: 기본값은 'USER', 고정된 4가지 역할 중 하나
  @Prop({ required: true })
  role: 'USER' | 'ADMIN' | 'OPERATOR' | 'AUDITOR';
}

// 클래스를 기반으로 Mongoose 스키마 생성
export const UserSchema = SchemaFactory.createForClass(User);
