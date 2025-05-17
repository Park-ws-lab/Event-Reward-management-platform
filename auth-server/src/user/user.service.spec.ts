// UserService 단위 테스트 코드

import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from './user.schema';
import { LoginLog } from './login-log.schema';

describe('UserService', () => {
  let service: UserService;
  let mockUserModel: any;
  let mockLoginLogModel: any;
  let mockJwtService: any;

  // 테스트 실행 전 각종 의존성(Mock) 설정
  beforeEach(async () => {
    mockUserModel = {
      findOne: jest.fn(),
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

  // 회원가입 테스트
  describe('register', () => {
    it('비밀번호 해싱 후 사용자 저장', async () => {
      const hashedPassword = 'hashed-password';
      const mockCreatedUser = { username: 'test', password: hashedPassword, role: 'USER' };

      // bcrypt.hash 함수 mock 처리
      jest.spyOn(bcrypt as any, 'hash').mockResolvedValue(hashedPassword);
      // userModel.create mock 처리
      mockUserModel.create = jest.fn().mockResolvedValue(mockCreatedUser);

      const result = await service.register('test', '1234');

      // 비밀번호 해싱 및 사용자 생성이 호출되었는지 검증
      expect(bcrypt.hash).toHaveBeenCalledWith('1234', 10);
      expect(mockUserModel.create).toHaveBeenCalledWith({
        username: 'test',
        password: hashedPassword,
        role: 'USER',
      });
      expect(result).toEqual(mockCreatedUser);
    });
  });

  // 로그인 테스트
  describe('login', () => {
    it('존재하지 않는 유저면 null 반환', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      const result = await service.login('test', '1234');
      expect(result).toBeNull();
    });

    it('비밀번호 불일치 시 null 반환', async () => {
      const user = { username: 'test', password: 'hashed', role: 'USER' };
      mockUserModel.findOne.mockResolvedValue(user);
      jest.spyOn(bcrypt as any, 'compare').mockResolvedValue(false);

      const result = await service.login('test', 'wrongpass');
      expect(result).toBeNull();
    });

    it('로그인 성공 시 JWT 토큰 반환', async () => {
      const user = { _id: 'abc123', username: 'test', password: 'hashed', role: 'USER' };
      mockUserModel.findOne.mockResolvedValue(user);
      jest.spyOn(bcrypt as any, 'compare').mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('fake-jwt-token');
      mockLoginLogModel.create.mockResolvedValue({ username: 'test' });

      const result = await service.login('test', '1234');

      // 각 단계가 정상적으로 호출되었는지 검증
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ username: 'test' });
      expect(bcrypt.compare).toHaveBeenCalledWith('1234', 'hashed');
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: 'abc123',
        username: 'test',
        role: 'USER',
      });
      expect(mockLoginLogModel.create).toHaveBeenCalledWith({ username: 'test' });
      expect(result).toEqual({ access_token: 'fake-jwt-token' });
    });
  });
});
