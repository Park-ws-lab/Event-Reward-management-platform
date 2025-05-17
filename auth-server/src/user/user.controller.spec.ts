// user 컨트롤러 테스트 코드 

import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './user.schema';
import { LoginLog } from './login-log.schema';
import { NotFoundException } from '@nestjs/common';

describe('UserController', () => {
  let controller: UserController; // 테스트 대상 컨트롤러
  let mockUserService: Partial<UserService>; // 가짜 유저 서비스
  let mockUserModel: any; // 가짜 유저 모델
  let mockLoginLogModel: any; // 가짜 로그인로그 모델

  // 각 테스트 전에 실행되는 부분
  beforeEach(async () => {
    // 유저 서비스 함수 mock 정의
    mockUserService = {
      register: jest.fn(),
      login: jest.fn(),
    };

    // 유저 모델과 로그인로그 모델의 findById, find 같은 함수도 mock 처리
    mockUserModel = {
      findById: jest.fn(),
    };

    mockLoginLogModel = {
      find: jest.fn(),
    };

    // NestJS 테스트 모듈 생성
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController], // 테스트 대상 컨트롤러
      providers: [
        // 서비스와 모델에 대해 주입할 값을 우리가 직접 지정 (가짜 객체들)
        { provide: UserService, useValue: mockUserService },
        { provide: getModelToken(User.name), useValue: mockUserModel },
        { provide: getModelToken(LoginLog.name), useValue: mockLoginLogModel },
      ],
    }).compile();

    // 모듈에서 컨트롤러 인스턴스를 가져옴
    controller = module.get<UserController>(UserController);
  });

  // 기본 테스트: 컨트롤러가 잘 정의되었는지 확인
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // 회원가입 테스트
  describe('register()', () => {
    it('회원가입 성공 시', async () => {
      const dto = { username: 'test', password: '1234', role: 'USER' }; // 입력 데이터
      const mockUser = { _id: '1', ...dto }; // 서비스가 리턴할 가짜 유저

      // register 함수가 mockUser를 리턴하도록 설정
      (mockUserService.register as jest.Mock).mockResolvedValue(mockUser);

      const result = await controller.register(dto); // 회원가입 실행

      // 응답이 기대한 결과와 같은지 확인
      expect(result).toEqual({ message: '회원가입 성공', user: mockUser });
      // 서비스가 올바르게 호출되었는지 확인
      expect(mockUserService.register).toHaveBeenCalledWith('test', '1234', 'USER');
    });
  });

  // 로그인 테스트
  describe('login()', () => {
    it('로그인 성공 시', async () => {
      const dto = { username: 'test', password: '1234' };
      const mockResult = { token: 'abc123' }; // 로그인 성공 시 기대하는 결과

      // 서비스가 성공 응답을 주도록 설정
      (mockUserService.login as jest.Mock).mockResolvedValue(mockResult);

      const result = await controller.login(dto);

      expect(result).toEqual({ message: '로그인 성공', ...mockResult });
    });

    it('로그인 실패 시', async () => {
      // 로그인 실패 상황: null을 반환하도록 설정
      (mockUserService.login as jest.Mock).mockResolvedValue(null);

      const result = await controller.login({ username: 'no', password: 'fail' });

      expect(result).toEqual({ message: '로그인 실패: 아이디 또는 비밀번호 불일치' });
    });
  });

  // 특정 유저 조회 테스트
  describe('getUserById()', () => {
    it('유저 정보 확인', async () => {
      // 가짜 유저 객체 정의
      const mockUser = { _id: '1', username: 'test' };

      // findById().select() 호출을 mock 처리
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await controller.getUserById('1');

      expect(result).toEqual(mockUser); // 기대한 유저 객체가 반환되는지 확인
    });

    it('유저가 없을 시', async () => {
      // 없는 유저 상황: null 반환
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      // NotFoundException 에러가 던져지는지 확인
      await expect(controller.getUserById('999')).rejects.toThrow(NotFoundException);
    });
  });

  // 로그인 카운트 테스트
  describe('getLoginCount()', () => {
    it('로깅 카운팅 검증', async () => {
      // 유저 정보와 로그인 기록 mock 설정
      const mockUser = { username: 'test' };
      const mockLogs = [
        { createdAt: new Date() }, // 오늘
        { createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }, // 3일 전
        { createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) }, // 10일 전
      ];

      // 유저 찾기 mock
      mockUserModel.findById.mockResolvedValue(mockUser);
      // 로그인 로그 찾기 mock
      mockLoginLogModel.find.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockLogs),
      });

      const result = await controller.getLoginCount('1');

      // 전체 로그인 일 수, 최근 7일 일 수가 계산됐는지 확인
      expect(result.totalUniqueDays).toBeGreaterThan(0);
      expect(result.recent7DaysUnique).toBeGreaterThanOrEqual(0);
    });

    it('유저가 없을 시', async () => {
      // 유저 없음
      mockUserModel.findById.mockResolvedValue(null);

      // NotFoundException 던져지는지 확인
      await expect(controller.getLoginCount('999')).rejects.toThrow(NotFoundException);
    });
  });
});
