# 🔐 Auth Server

NestJS 기반 사용자 인증/인가 서비스입니다.  
회원가입, 로그인, JWT 발급 및 로그인 로그 저장 기능을 제공합니다.

---

## 🧾 .env 예시

```env
MONGO_URL=mongodb://mongodb:27017/user-db
PORT=3001
JWT_SECRET=758b41bd2bb892fb55ffb206fa126c25a4c28ffbe24d76ac0f529974a1111095
```


## 📌 주요 API

| 메서드  | 경로                         | 설명           |
| ---- | -------------------------- | ------------ |
| POST | /user/register             | 회원가입         |
| POST | /user/login                | 로그인 + JWT 발급 |
| GET  | /login-count/\:id | 로그인 날짜 수 조회  |


## 🧩 주요 특징

- 역할(Role)에 따른 권한 부여 (USER, OPERATOR, AUDITOR, ADMIN)

- 로그인 시 내부적으로 login-log 생성

- 다른 서버가 login-log를 기준으로 조건 검증 시 호출됨