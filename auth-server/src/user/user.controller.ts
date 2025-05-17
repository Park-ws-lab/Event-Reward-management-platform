// 'user' 경로에 대한 회원가입 및 로그인 API 제공
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './user.schema';
import { LoginLog, LoginLogDocument } from './login-log.schema';
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
  ) {}

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

  // [GET] /user/internal/login-count/:userId
  @Get('/internal/login-count/:userId')
  async getLoginCount(@Param('userId') userId: string) {
    // 유저 조회
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('유저를 찾을 수 없습니다');

    // 해당 유저의 로그인 로그 조회
    const logs = await this.loginlogModel
      .find({ username: user.username })
      .select('createdAt'); // 로그인 날짜만 조회

    // 전체 기간의 고유한 로그인 날짜 수 계산
    const allDays = new Set(
      logs.map(log => log.createdAt.toISOString().split('T')[0]),
    );

    // 최근 7일 이내 고유 날짜 수 계산
    const recent7Days = new Set(
      logs
        .filter(
          log =>
            log.createdAt >=
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        )
        .map(log => log.createdAt.toISOString().split('T')[0]),
    );

    // 날짜 수 반환
    return {
      totalUniqueDays: allDays.size,
      recent7DaysUnique: recent7Days.size,
    };
  }
}
