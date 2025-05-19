// dto/update-reward.dto.ts

import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';

export class UpdateRewardDto {
  @IsOptional()
  @IsEnum(['ITEM', 'POINT', 'COUPON', 'CURRENCY'])
  type?: 'ITEM' | 'POINT' | 'COUPON' | 'CURRENCY';

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
