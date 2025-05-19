import { IsOptional, IsString, IsBoolean, IsDateString, IsIn } from 'class-validator';
import { EVENT_CONDITIONS, EventCondition } from '../../common/enums/event-condition.enum';

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(EVENT_CONDITIONS)
  condition?: EventCondition;

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
