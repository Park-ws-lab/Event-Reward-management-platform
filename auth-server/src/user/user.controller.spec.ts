// user 컨트롤러 테스트 코드 

import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { LoginLog } from './schemas/login-log.schema';
import { NotFoundException } from '@nestjs/common';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UserDocument } from './schemas/user.schema';

describe('UserController', () => {
  let controller: UserController; // 테스트 대상 컨트롤러
  let mockUserService: jest.Mocked<Partial<UserService>>;; // 가짜 유저 서비스
  let mockUserModel: any; // 가짜 유저 모델
  let mockLoginLogModel: any; // 가짜 로그인로그 모델

  // 각 테스트 전에 실행되는 부분
  beforeEach(async () => {
    // 유저 서비스 함수 mock 정의
    mockUserService = {
      register: jest.fn(),
      login: jest.fn(),
      getLoginCount: jest.fn(),
      updateUserRole: jest.fn(),
      deleteUser: jest.fn(),
      getUserById: jest.fn(),
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

  // 로그인 횟수 조회 API에 대한 컨트롤러 단위 테스트
  describe('getLoginCount()', () => {

    it('로깅 카운팅 검증', async () => {
      // 서비스가 반환할 mock 결과값 설정
      const mockResult = {
        totalUniqueDays: 3,        // 전체 고유 로그인 일 수
        recent7DaysUnique: 2,      // 최근 7일 내 고유 로그인 일 수
      };

      mockUserService.getLoginCount = jest.fn().mockResolvedValue(mockResult);

      const result = await controller.getLoginCount('1');

      expect(result).toEqual(mockResult);
      expect(mockUserService.getLoginCount).toHaveBeenCalledWith('1');
    });

    it('유저가 없을 시 NotFoundException 반환', async () => {
      // 서비스에서 NotFoundException을 던지도록 mock 설정 (예외 케이스)
      mockUserService.getLoginCount = jest.fn().mockImplementation(() => {
        throw new NotFoundException('User not found');
      });

      await expect(controller.getLoginCount('999')).rejects.toThrow(NotFoundException);
    });
  });

  // 역할 수정 성공 시 응답이 올바른지 확인
  it('정상적으로 역할을 수정하고 응답을 반환해야 함', async () => {
    const userId = '123';
    const dto: UpdateRoleDto = { role: 'ADMIN' };

    // 서비스가 반환할 mock 결과
    const mockResponse = {
      message: '역할이 성공적으로 변경되었습니다.',
      user: {
        id: userId,
        username: 'testuser',
        role: 'ADMIN',
      },
    } as const;

    mockUserService.updateUserRole!.mockResolvedValue(mockResponse);

    const result = await controller.updateUserRole(userId, dto);

    expect(result).toEqual(mockResponse);
    expect(mockUserService.updateUserRole).toHaveBeenCalledWith(userId, dto.role);
  });

  // UserService가 NotFoundException을 던질 경우 예외를 그대로 전달하는지 확인
  it('UserService가 NotFoundException을 던지면 그대로 전달해야 함', async () => {
    const userId = 'notfound';
    const dto: UpdateRoleDto = { role: 'USER' };

    mockUserService.updateUserRole!.mockImplementation(() => {
      throw new NotFoundException('User not found');
    });

    await expect(controller.updateUserRole(userId, dto)).rejects.toThrow(NotFoundException);
  });

  // 유저 삭제 성공 시 올바른 메시지를 반환하는지 확인
  it('정상적으로 유저 삭제 성공 시 메시지를 반환해야 함', async () => {
    // mock 함수가 true 반환하도록 설정 (삭제 성공)
    (mockUserService.deleteUser as jest.Mock).mockResolvedValue(true);

    const result = await controller.deleteUser('123');

    expect(result).toEqual({ message: '유저가 성공적으로 삭제되었습니다.' });
    expect(mockUserService.deleteUser).toHaveBeenCalledWith('123');
  });

  // 삭제 실패 시 NotFoundException이 던져지는지 확인
  it('삭제 대상 유저가 없을 경우 NotFoundException을 던져야 함', async () => {
    // mock 함수가 false 반환하도록 설정 (삭제 실패)
    (mockUserService.deleteUser as jest.Mock).mockResolvedValue(false);

    await expect(controller.deleteUser('999')).rejects.toThrow(NotFoundException);
  });

});
