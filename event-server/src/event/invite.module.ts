// src/invites/invite.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Invite, InviteSchema } from './invite.schema';
import { InviteService } from './invite.service';
import { InviteController } from './invite.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Invite.name, schema: InviteSchema }]),
  ],
  providers: [InviteService],
  controllers: [InviteController],
  exports: [InviteService,MongooseModule],
})
export class InviteModule {}
