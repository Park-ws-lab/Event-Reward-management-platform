import { IsString, IsIn, MinLength, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString()
  username: string;

  @IsString()
  @MinLength(4)
  password: string;

  @IsOptional()
  @IsIn(['USER', 'ADMIN', 'OPERATOR', 'AUDITOR'])
  role?: string;
}
