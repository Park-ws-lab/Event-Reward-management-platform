// dto/update-reward.dto.ts

import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { REWARD_CONDITIONS, RewardCondition } from '../../common/enums/reward-condition.enum';

export class UpdateRewardDto {
  @IsOptional()
  @IsEnum(REWARD_CONDITIONS)
  type?: RewardCondition;

  @IsOptional()
  @IsString()
  value?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsString()
  description?: string;
}
