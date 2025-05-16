import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Reward, RewardSchema } from './reward.schema';
import { RewardService } from './reward.service';
import { RewardController } from './reward.controller';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Reward.name, schema: RewardSchema }]),
    ],
    providers: [RewardService],
    controllers: [RewardController],
    exports:[
        MongooseModule,
    ]
})
export class RewardModule { }
