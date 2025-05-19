// 보상 생성 요청 시 사용되는 DTO

import { IsString, IsNumber, IsIn } from 'class-validator';
import { REWARD_CONDITIONS, RewardCondition } from '../../common/enums/reward-condition.enum';

export class CreateRewardDto {
  // 보상이 연결될 이벤트 ID
  @IsString()
  eventId: string;

  // 보상 타입 (예: 'COUPON', 'POINT' 등)
  @IsIn(REWARD_CONDITIONS)
  type: RewardCondition;

  // 보상 내용 또는 값 (예: 포인트 금액 등)
  @IsString()
  value: string;

  // 보상 수량
  @IsNumber()
  quantity: number;
}
