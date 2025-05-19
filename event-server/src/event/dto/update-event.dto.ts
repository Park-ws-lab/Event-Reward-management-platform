// dto/update-event.dto.ts

import { IsOptional, IsString, IsBoolean, IsDateString, IsIn } from 'class-validator';

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(['FIRST_LOGIN', 'INVITE_THREE', 'LOGIN_THREE', 'LOGIN_SEVEN_RECENT'])
  condition?: 'FIRST_LOGIN' | 'INVITE_THREE' | 'LOGIN_THREE' | 'LOGIN_SEVEN_RECENT';

  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
