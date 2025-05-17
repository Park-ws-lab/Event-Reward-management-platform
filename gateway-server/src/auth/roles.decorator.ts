// 사용자 역할(Role) 기반 접근 제어를 위한 커스텀 데코레이터

import { SetMetadata } from '@nestjs/common';

// 역할 정보를 설정하는 데코레이터
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
