import { IsIn, IsOptional, IsString } from 'class-validator';

// 허용 가능한 역할 타입 정의
export type UserRole = 'USER' | 'ADMIN' | 'OPERATOR' | 'AUDITOR';

export class UpdateRoleDto {
  @IsOptional()
  @IsIn(['USER', 'ADMIN', 'OPERATOR', 'AUDITOR'])
  role?: string;
}