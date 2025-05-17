// 보상 생성 요청 시 사용되는 DTO

export class CreateRewardDto {
  // 보상이 연결될 이벤트 ID
  eventId: string;

  // 보상 타입 (예: 'COUPON', 'POINT' 등)
  type: string;

  // 보상 내용 또는 값 (예: 포인트 금액 등)
  value: string;

  // 보상 수량
  quantity: number;
}
