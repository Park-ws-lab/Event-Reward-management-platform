// 이벤트 생성 요청 시 사용되는 DTO

import { IsString, IsDateString, IsBoolean, IsOptional, IsIn } from 'class-validator';
import { EVENT_CONDITIONS, EventCondition } from '../../common/enums/event-condition.enum';


export class CreateEventDto {
  // 이벤트 제목
  @IsString()
  title: string;

  // 이벤트 설명
  @IsString()
  description: string;

  // 이벤트 참여 조건 (예: "3명 이상 초대" 등)
  @IsIn(EVENT_CONDITIONS)
  condition: EventCondition;

  // 이벤트 시작 일시
  @IsDateString()
  startDate: Date;

  // 이벤트 종료 일시
  @IsDateString()
  endDate: Date;

  // 이벤트 활성화 여부
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
