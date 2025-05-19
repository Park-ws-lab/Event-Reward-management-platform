// 'user' 경로에 대한 회원가입 및 로그인 API 제공

import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  NotFoundException,
  Req,
  Patch,
  Delete
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { LoginLog, LoginLogDocument } from './schemas/login-log.schema';
import { Model } from 'mongoose';

@Controller('user') // '/user' 경로 처리 컨트롤러
export class UserController {
  constructor(
    private readonly userService: UserService, // UserService 주입

    // 직접 모델을 주입받아 내부 API에서 로그인 기록 확인
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,

    @InjectModel(LoginLog.name)
    private readonly loginlogModel: Model<LoginLogDocument>,
  ) { }

  // [POST] /user/register - 사용자 회원가입 API
  @Post('register')
  async register(
    @Body() body: CreateUserDto, // username, password, role 정보를 받는 DTO
  ) {
    // 사용자 정보 생성 및 저장
    const user = await this.userService.register(
      body.username,
      body.password,
      body.role,
    );

    // 회원가입 성공 시 유저 정보 반환
    return {
      message: '회원가입 성공',
      user,
    };
  }

  // [POST] /user/login - 사용자 로그인 API
  @Post('login')
  async login(
    @Body() body: { username: string; password: string },
  ) {
    // 로그인 요청 처리
    const result = await this.userService.login(
      body.username,
      body.password,
    );

    // 로그인 실패 시 메시지 반환
    if (!result) {
      return { message: '로그인 실패: 아이디 또는 비밀번호 불일치' };
    }

    // 로그인 성공 시 토큰 반환
    return {
      message: '로그인 성공',
      ...result,
    };
  }

  // [POST] /user/logout - 사용자 로그인 API
  @Post('logout')
  async logout(@Body() body: { userId: string }) {
    return this.userService.logout(body.userId); // 명시적 파라미터 사용
  }


  // [PATCH] /user/updateUserRole/:id - 사용자 권한 수정
  @Patch('updateUserRole/:id')
  async updateUserRole(
    @Param('id') userId: string,
    @Body() dto: UpdateRoleDto,
  ) {
    // 관리자 검증은 RolesGuard가 처리함
    return this.userService.updateUserRole(userId, dto.role);
  }

  // [DELETE] /user/:id - 특정 유저 삭제
  @Delete(':id')
  async deleteUser(@Param('id') userId: string) {
    const deleted = await this.userService.deleteUser(userId);
    if (!deleted) {
      throw new NotFoundException('User not found or already deleted');
    }

    return { message: '유저가 성공적으로 삭제되었습니다.' };
  }


  // 여기부터는 내부 API
  // [GET] /user/login-count/:userId - 특정 유저 전체 및 최근 7일 이내 로그인 횟수 조회 API
  @Get('/login-count/:userId')
  async getLoginCount(@Param('userId') userId: string) {
    return this.userService.getLoginCount(userId);
  }

  // [GET] /:userId - 전체 보상 요청 목록 조회 시 유저 정보 포함을 위한 유저 정보 제공 API
  @Get(':userId')
  async getUserById(@Param('userId') userId: string) {
    return this.userService.getUserById(userId);
  }

  // [POST] /user/refresh - 리프레시 토큰으로 액세스 토큰 재발급 요청
  @Post('refresh')
  async refreshToken(@Body() body: { refreshToken: string }) {
    return this.userService.refreshAccessToken(body.refreshToken);
  }

}
