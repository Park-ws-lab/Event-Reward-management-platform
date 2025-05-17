// 보상 요청 생성 시 사용하는 DTO

export class CreateRewardRequestDto {
  // 요청 대상 이벤트 ID
  eventId: string;

  // 보상을 요청한 사용자 ID
  userId: string;
}
