//'user' 경로에 대한 회원가입 및 로그인 API 제공

import { Controller,Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';

// '/user' 경로를 처리하는 컨트롤러 클래스
@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService //UserService 주입
    ){}

    // [POST] /user/register - 사용자 회원가입 API
    @Post('register')
    async register(
        @Body() body: CreateUserDto // username, password, role 정보를 받는 DTO
    ){
        // 사용자 정보 생성 및 저장
        const user = await this.userService.register(
            body.username,
            body.password,
            body.role,
        );

        // 회원가입 성공 시 유저 정보 반환
        return{
            message: '회원가입 성공',
            user,
        }
    }

    // [POST] /user/login - 사용자 로그인 API
    @Post('login')
    async login(
        @Body() body: {username: string; password: string}
    ){
        // 로그인 요청
        const result = await this.userService.login(
            body.username,
            body.password
        );

        // 로그인 실패 시 메시지 반환
        if(!result){
            return {message:"로그인 실패: 아이디 또는 비밀번호 불일치"}
        }

        // 로그인 성공 시 토큰 등 로그인 정보 반환
        return{
            message: '로그인 성공',
            ...result,
        };
    }
    
}
