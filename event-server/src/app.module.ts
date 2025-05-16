import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { EventModule } from './event/event.module'
import { RewardModule } from './reward/reward.module'
import { RewardRequestModule } from './reward-request/reward-request.module'
import { EventController } from './event/event.controller';
import { InviteModule } from './event/invite.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }),
  MongooseModule.forRoot(process.env.MONGO_URL),
    EventModule,
    RewardModule,
    RewardRequestModule,
    InviteModule
  ],
  controllers: [AppController, EventController, EventController],
  providers: [AppService],
})
export class AppModule { }
