// 회원가입 요청 시 입력 데이터를 검증하는 DTO

import { IsString, IsIn, MinLength, IsOptional } from 'class-validator';

export class CreateUserDto {
  // 문자열 타입의 username 필드 (필수)
  @IsString()
  username: string;

  // 최소 4자 이상의 문자열 password 필드 (필수)
  @IsString()
  @MinLength(4)
  password: string;

  // 선택하여 입력하는 role 필드
  // 'USER' | 'ADMIN' | 'OPERATOR' | 'AUDITOR' 중 하나여야 함
  @IsOptional()
  @IsIn(['USER', 'ADMIN', 'OPERATOR', 'AUDITOR'])
  role?: string;
}
