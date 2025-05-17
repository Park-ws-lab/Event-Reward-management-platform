//user e2e 테스트 코드

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { disconnect } from 'mongoose';

describe('UserController (e2e)', () => {
    let app: INestApplication; // 테스트용 Nest 애플리케이션 인스턴스

    // 모든 테스트 전에 실행)
    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule], // 실제 앱과 동일한 모듈 구조로 테스트 환경 구성
        }).compile();

        app = moduleFixture.createNestApplication(); // 애플리케이션 인스턴스 생성
        await app.init(); // Nest 애플리케이션 초기화
    });

    // 모든 테스트가 끝난 후 실행
    afterAll(async () => {
        await app.close(); // Nest 애플리케이션 종료
        await disconnect(); // MongoDB 연결 종료
    });

    // 회원가입 API 테스트
    describe('POST /user/register', () => {
        it('회원가입 성공', async () => {
            const response = await request(app.getHttpServer())
                .post('/user/register') // [POST] /user/register 엔드포인트 호출
                .send({
                    username: 'e2e_testuser',
                    password: '1234',
                    role: 'USER',
                })
                .expect(201); // HTTP 201 Created 기대

            // 응답 메시지와 사용자 정보 확인
            expect(response.body).toHaveProperty('message', '회원가입 성공');
            expect(response.body.user).toHaveProperty('username', 'e2e_testuser');
        });
    });

    // 로그인 API 테스트
    describe('POST /user/login', () => {
        it('로그인 성공', async () => {
            const response = await request(app.getHttpServer())
                .post('/user/login') // [POST] /user/login 엔드포인트 호출
                .send({
                    username: 'e2e_testuser',
                    password: '1234',
                })
                .expect(201); // 로그인 성공 시 201 기대

            // 성공 메시지 및 JWT 토큰 확인
            expect(response.body).toHaveProperty('message', '로그인 성공');
            expect(response.body).toHaveProperty('access_token');
        });

        it('로그인 실패 (비밀번호 틀림)', async () => {
            const response = await request(app.getHttpServer())
                .post('/user/login') // [POST] /user/login 엔드포인트 호출
                .send({
                    username: 'e2e_testuser',
                    password: 'wrongpassword', // 틀린 비밀번호 입력
                })
                .expect(201); // 실제 앱에서 실패도 201 응답 처리 시 그대로 기대값 설정

            // 실패 메시지 확인
            expect(response.body).toHaveProperty('message', '로그인 실패: 아이디 또는 비밀번호 불일치');
        });
    });
});
