// login-log.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LoginLogDocument = LoginLog & Document;

@Schema({ timestamps: true }) // createdAt, updatedAt 자동 생성
export class LoginLog {
  @Prop({ required: true })
  username: string; // 실제 로그인한 계정명

  @Prop()
  createdAt?: Date; // ✅ timestamps: true 설정 시 자동 생성됨

  @Prop()
  updatedAt?: Date;
}


export const LoginLogSchema = SchemaFactory.createForClass(LoginLog);
