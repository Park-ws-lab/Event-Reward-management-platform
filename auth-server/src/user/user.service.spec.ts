// user 서비스 테스트 코드 

import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from './schemas/user.schema';
import { LoginLog } from './schemas/login-log.schema';
import { UnauthorizedException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let mockUserModel: any;
  let mockLoginLogModel: any;
  let mockJwtService: any;

  // 각 의존성 모듈들을 mocking하여 테스트 환경 구성
  beforeEach(async () => {
    mockUserModel = {
      findOne: jest.fn(),
      create: jest.fn(),
      updateOne: jest.fn(),
    };

    mockLoginLogModel = {
      create: jest.fn(),
    };

    mockJwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getModelToken(User.name), useValue: mockUserModel },
        { provide: getModelToken(LoginLog.name), useValue: mockLoginLogModel },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  // 회원가입 기능 테스트
  describe('register', () => {
    it('해싱된 비밀번호로 사용자 생성', async () => {
      const hashedPassword = 'hashed-password';
      const mockUser = {
        username: 'test',
        password: hashedPassword,
        role: 'USER',
      };

      // 비밀번호 해싱 mock
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);
      // 유저 생성 mock
      mockUserModel.create.mockResolvedValue(mockUser);

      const result = await service.register('test', '1234');

      // 해싱 및 유저 저장이 정상 호출되었는지 검증
      expect(bcrypt.hash).toHaveBeenCalledWith('1234', 10);
      expect(mockUserModel.create).toHaveBeenCalledWith({
        username: 'test',
        password: hashedPassword,
        role: 'USER',
      });
      expect(result).toEqual(mockUser);
    });
  });

  // 로그인 기능 테스트
  describe('login', () => {
    it('존재하지 않는 유저면 UnauthorizedException 발생', async () => {
      // 사용자 미존재 시 findOne이 null 반환
      mockUserModel.findOne.mockResolvedValue(null);

      // 예외 발생 검증
      await expect(service.login('nouser', '1234')).rejects.toThrow(UnauthorizedException);
    });

    it('비밀번호 불일치 시 UnauthorizedException 발생', async () => {
      const user = { username: 'test', password: 'hashed', role: 'USER' };

      // 사용자 정보는 존재하지만
      mockUserModel.findOne.mockResolvedValue(user);
      // 비밀번호 비교 결과 false
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      // 예외 발생 검증
      await expect(service.login('test', 'wrongpass')).rejects.toThrow(UnauthorizedException);
    });

    it('로그인 성공 시 토큰과 유저 정보 반환', async () => {
      const user = {
        _id: 'abc123',
        username: 'test',
        password: 'hashed',
        role: 'USER',
      };

      // 로그인 과정 mock
      mockUserModel.findOne.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      mockJwtService.sign
        .mockReturnValueOnce('fake-jwt-token') // accessToken
        .mockReturnValueOnce('fake-jwt-token'); // refreshToken
      mockLoginLogModel.create.mockResolvedValue({ username: 'test' });

      const result = await service.login('test', '1234');

      // 유저 조회, 비번 비교, 토큰 생성, 로그인 로그 기록 호출 검증
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ username: 'test' });
      expect(bcrypt.compare).toHaveBeenCalledWith('1234', 'hashed');

      // JWT 토큰 생성 확인 (2회 호출됨)
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        { sub: 'abc123', username: 'test', role: 'USER' },
        { expiresIn: '15m' },
      );
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        { sub: 'abc123', username: 'test', role: 'USER' },
        { expiresIn: '7d' },
      );

      // 로그인 로그 생성 확인
      expect(mockLoginLogModel.create).toHaveBeenCalledWith({ username: 'test' });

      // 반환값 검증 (토큰 + 유저 정보 포함)
      expect(result).toEqual({
        accessToken: 'fake-jwt-token',
        refreshToken: 'fake-jwt-token',
        user,
      });
    });
  });
});
