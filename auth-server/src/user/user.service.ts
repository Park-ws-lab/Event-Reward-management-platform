// user 관련 로직을 처리하는 서비스 클래스

import { Injectable, NotFoundException, UnauthorizedException, BadRequestException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { LoginLog, LoginLogDocument } from './schemas/login-log.schema'
import * as bcrypt from 'bcrypt';


@Injectable()
export class UserService {
    constructor(
        // MongoDB의 User 모델 주입
        @InjectModel(User.name)
        private userModel: Model<UserDocument>,

        // MongoDB의 User 모델 주입
        @InjectModel(LoginLog.name)
        private loginlogModel: Model<LoginLogDocument>,

        // JWT 토큰 생성을 위한 서비스 주입
        private jwtService: JwtService,
    ) { }

    // 회원가입: bcrypt를 이용해 비밀번호를 암호화한 후 MongoDB에 사용자 정보 저장
    async register(username: string, password: string, role: string = 'USER') {
        const hashedPassword = await bcrypt.hash(password, 10); // 비밀번호 해싱

        try {
            // 사용자 생성 시도
            return await this.userModel.create({
                username,
                password: hashedPassword,
                role,
            });
        } catch (error: any) {
            // MongoDB 중복 키 에러 처리
            if (error.code === 11000 && error.keyPattern?.username) {
                throw new ConflictException('이미 존재하는 사용자입니다.');
            }
            // 기타 예외 처리
            throw new BadRequestException('회원가입 중 오류가 발생했습니다.');
        }
    }

    // 로그인: 사용자 조회 + 비밀번호 비교 + JWT 토큰 발급
    async login(username: string, password: string) {
        const user = await this.userModel.findOne({ username });
        if (!user) {
            throw new UnauthorizedException('존재하지 않는 사용자입니다.');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
        }

        const payload = {
            sub: user._id,         // 사용자 고유 ID
            username: user.username,
            role: user.role,
        };

        //accessToken 발급
        const accessToken = this.jwtService.sign(payload, {
            expiresIn: '15m', // 짧게
        });

        //refreshToken 발급
        const refreshToken = this.jwtService.sign(payload, {
            expiresIn: '7d', // 길게
        });

        // 로그인 로그 기록
        await this.loginlogModel.create({ username });

        // refreshToken DB에 저장
        await this.userModel.updateOne({ _id: user._id }, { refreshToken });

        return {
            accessToken,
            refreshToken,
            user
        };
    }

    // 로그아웃: refreshToken 삭제
    async logout(userId: string) {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new NotFoundException('유저를 찾을 수 없습니다');
        }

        user.refreshToken = undefined; // 또는 null
        await user.save();

        return { message: '성공적으로 로그아웃되었습니다.' };
    }

    // 로그인 로그 카운트 반환
    async getLoginCount(userId: string) {
        // 유저 조회
        const user = await this.userModel.findById(userId);
        if (!user) throw new NotFoundException('유저를 찾을 수 없습니다');

        // 해당 유저의 로그인 로그 조회
        const logs = await this.loginlogModel
            .find({ username: user.username })
            .select('createdAt');

        // 전체 고유 로그인 날짜 수 계산
        const allDays = new Set(
            logs.map(log => log.createdAt.toISOString().split('T')[0]),
        );

        // 최근 7일 고유 로그인 날짜 수 계산
        const recent7Days = new Set(
            logs
                .filter(log => log.createdAt >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
                .map(log => log.createdAt.toISOString().split('T')[0]),
        );

        // 날짜 수 반환
        return {
            totalUniqueDays: allDays.size,
            recent7DaysUnique: recent7Days.size,
        };
    }

    // [GET] 특정 유저 조회 (비밀번호 제외)
    async getUserById(userId: string) {
        // ID로 유저 조회 (비밀번호 필드 제외)
        const user = await this.userModel.findById(userId).select('-password');

        // 유저가 존재하지 않으면 예외 발생
        if (!user) throw new NotFoundException('유저를 찾을 수 없습니다');

        return user;
    }

    // [PATCH] 사용자 역할(권한) 변경
    async updateUserRole(userId: string, newRole: any) {
        // ObjectId 형식인지 검증
        if (!Types.ObjectId.isValid(userId)) {
            throw new BadRequestException('유효하지 않은 유저 ID입니다.');
        }
        // 유저 조회
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new NotFoundException('유저를 찾을 수 없습니다');
        }

        // 역할 업데이트 및 저장
        user.role = newRole;
        await user.save();

        return {
            message: '역할이 성공적으로 변경되었습니다.',
            user: {
                id: user._id,
                username: user.username,
                role: user.role,
            },
        };
    }

    // [DELETE] 유저 삭제
    async deleteUser(userId: string): Promise<boolean> {
        // 해당 유저를 DB에서 삭제
        const result = await this.userModel.deleteOne({ _id: userId });

        // 삭제 성공 여부 반환
        return result.deletedCount > 0;
    }

    // [POST] 리프레시 토큰으로 액세스 토큰 재발급
    async refreshAccessToken(refreshToken: string) {
        try {
            // 리프레시 토큰 유효성 검증 및 payload 추출
            const decoded = this.jwtService.verify(refreshToken);

            // 사용자 조회
            const user = await this.userModel.findById(decoded.sub);

            // 유저가 없거나 저장된 토큰과 다르면 예외
            if (!user || user.refreshToken !== refreshToken) {
                throw new UnauthorizedException('Refresh token mismatch');
            }

            // 새로운 액세스 토큰 발급
            const newAccessToken = this.jwtService.sign(
                { sub: user._id, username: user.username, role: user.role },
                { expiresIn: '15m' },
            );

            return { accessToken: newAccessToken };
        } catch (err) {
            // 만료, 위조 등의 문제 발생 시 예외 처리
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

}
