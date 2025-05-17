// 이벤트 생성 요청 시 사용되는 DTO

export class CreateEventDto {
  // 이벤트 제목
  title: string;

  // 이벤트 설명
  description: string;

  // 이벤트 참여 조건 (예: "3명 이상 초대" 등)
  condition: string;

  // 이벤트 시작 일시
  startDate: Date;

  // 이벤트 종료 일시
  endDate: Date;

  // 이벤트 활성화 여부
  isActive?: boolean;
}
