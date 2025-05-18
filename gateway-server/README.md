# 🌐 Gateway Server

모든 요청의 진입점 역할을 하는 API Gateway입니다.  
JWT 기반 인증, 역할(Role) 기반 권한 검사 후 요청을 해당 서비스로 프록시합니다.

---

## 📦 역할

- 모든 요청의 진입점 (Port 3000)
- JWT 인증 (`Authorization: Bearer <token>`)
- 역할 기반 인가 검사 (`@Roles`)
- `auth-server`, `event-server`로 요청 프록시


## 🧾 .env 예시

```env
JWT_SECRET=758b41bd2bb892fb55ffb206fa126c25a4c28ffbe24d76ac0f529974a1111095
AUTH_PORT=3001
EVENT-PORT=3002
```


## 🔐 인증/인가 구조

- JwtAuthGuard: JWT 유효성 검증

- RolesGuard: 사용자 역할 검사 (USER, OPERATOR, AUDITOR, ADMIN)

- 인증/인가 통과 후만 실제 서비스로 요청 전달


## 📌 주요 프록시 API 예시

| 메서드  | 경로              | 프록시 대상       | 설명              |
| ---- | --------------- | ------------ | --------------- |
| POST | /user/register  | auth-server  | 회원가입            |
| POST | /user/login     | auth-server  | 로그인 + JWT 발급    |
| POST | /event          | event-server | 이벤트 등록 (운영자 권한) |
| POST | /reward-request | event-server | 유저 보상 요청        |


## 🧩 참고 사항

- NestJS @All('*') + @Req, @Res 조합으로 라우팅 유연하게 처리

- 보안 로직은 controller 레벨에서 모두 통과시켜야 정상 프록시됨

- NestJS 미들웨어가 아니라 Controller에서 프록시 방식 채택