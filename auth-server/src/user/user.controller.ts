import { Controller,Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService
    ){}

    @Post('register')
    async register(
        @Body() body: CreateUserDto
    ){
        const user = await this.userService.register(
            body.username,
            body.password,
            body.role,
        );

        return{
            message: '회원가입 성공',
            user,
        }
    }

    @Post('login')
    async login(
        @Body() body: {username: string; password: string}
    ){
        const result = await this.userService.login(
            body.username,
            body.password
        );

        if(!result){
            return {message:"로그인 실패: 아이디 또는 비밀번호 불일치"}
        }
        return{
            message: '로그인 성공',
            ...result,
        };
    }
    
}
