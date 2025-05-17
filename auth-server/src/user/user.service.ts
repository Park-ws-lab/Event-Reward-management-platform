// user 관련 로직을 처리하는 서비스 클래스

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
    constructor(
        // MongoDB의 User 모델 주입
        @InjectModel(User.name)
        private userModel: Model<UserDocument>,

        // JWT 토큰 생성을 위한 서비스 주입
        private jwtService: JwtService,
    ) {}

    // 회원가입: bcrypt를 이용해 비밀번호를 암호화한 후 MongoDB에 사용자 정보 저장
    async register(username: string, password: string, role: string = "USER") {
        const hashedPassword = await bcrypt.hash(password, 10); // 비밀번호 해싱

        const user = new this.userModel({
            username,
            password: hashedPassword,
            role,
        });

        return user.save(); // MongoDB에 사용자 저장
    }

    // 로그인: 사용자 조회 + 비밀번호 비교 + JWT 토큰 발급
    async login(username: string, password: string) {
        const user = await this.userModel.findOne({ username });
        if (!user) return null;

        const isMatch = await bcrypt.compare(password, user.password); // 비밀번호 일치 확인
        if (!isMatch) return null;

        const payload = {
            sub: user._id,         // 사용자 고유 ID
            username: user.username,
            role: user.role,
        };

        const token = this.jwtService.sign(payload); // JWT 토큰 생성

        return { access_token: token }; // 토큰 반환
    }
}
