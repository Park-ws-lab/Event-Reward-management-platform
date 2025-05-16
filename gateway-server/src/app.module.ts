import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './auth/jwt.strategy';
import { HttpModule } from '@nestjs/axios';
import { EventsProxyModule } from './events-proxy/events-proxy.module';
import { AuthProxyModule } from './auth-proxy/auth-proxy.module';
import { RewardsProxyController } from './rewards-proxy/rewards-proxy.controller';
import { RewardsProxyModule } from './rewards-proxy/rewards-proxy.module';
import { RewardRequestProxyModule } from './reward-request-proxy/reward-request-proxy.module';
import { InviteProxyModule } from './invite-proxy/invite-proxy.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HttpModule,
    EventsProxyModule,
    AuthProxyModule,
    RewardsProxyModule,
    RewardRequestProxyModule,
    InviteProxyModule
  ],
  controllers: [AppController, RewardsProxyController
  ],
  providers: [
    JwtStrategy,
    AppService
  ],
})
export class AppModule { }
