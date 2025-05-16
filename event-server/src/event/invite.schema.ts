import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Invite extends Document {
  @Prop({ type: Types.ObjectId, required: true })
  inviter: Types.ObjectId; // 초대한 사람의 userId

  @Prop({ type: Types.ObjectId, required: true })
  invited: Types.ObjectId; // 초대된 사람의 userId
}

export const InviteSchema = SchemaFactory.createForClass(Invite);
