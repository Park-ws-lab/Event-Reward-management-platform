# 🎮 이벤트 / 보상 관리 플랫폼

NestJS 기반 MSA 아키텍처로 구현된 이벤트 보상 자동화 플랫폼입니다.
사용자는 조건 충족 시 보상을 요청할 수 있고, 운영자는 조건과 보상을 설정하며,
감사자는 지급 내역만 조회할 수 있도록 구성되어 있습니다.

---

## 🚀 실행 방법 (Docker Compose)

```bash
# 1. 저장소 클론
git clone https://github.com/yourname/event-reward-platform.git
cd event-reward-platform

# 2. 각 서버(auth-server, event-server, gateway-server)에 .env 파일 생성
# 아래 `.env 설정` 참고

# 3. Docker Compose 실행
docker-compose up --build
```


## ⚙️ 개발 환경

- Node.js 18

- NestJS (monorepo, microservice structure)

- MongoDB

- Docker & Docker Compose

- TypeScript

- Jest (단위 테스트 일부 포함)


## 🗃️ 폴더 구조
```bash
.
├── auth-server/         # 사용자 등록, 로그인, JWT 발급
├── event-server/        # 이벤트 생성, 조건 검증, 보상 관리
├── gateway-server/      # 인증 및 역할 기반 라우팅
├── docker-compose.yml   # 전체 서비스 실행 설정
└── README.md            # 설명 문서
```


## 🔐 사용자 역할

| 역할       | 설명                   |
| -------- | -------------------- |
| USER     | 이벤트 조건 만족 시 보상 요청 가능 |
| OPERATOR | 이벤트 및 보상 등록 가능       |
| AUDITOR  | 모든 보상 요청 이력 조회만 가능   |
| ADMIN    | 전체 권한 보유             |


## 🧾 .env 설정 예시

.env는 각 서버 폴더(auth-server, event-server, gateway-server) 안에 생성해주세요.

# 📁 auth-server/.env
```env
MONGO_URL=mongodb://mongodb:27017/user-db
PORT=3001
JWT_SECRET=758b41bd2bb892fb55ffb206fa126c25a4c28ffbe24d76ac0f529974a1111095
```

# 📁 event-server/.env
```env
MONGO_URL=mongodb://mongodb:27017/event-db
PORT=3002
```

# 📁 gateway-server/.env
```env
JWT_SECRET=758b41bd2bb892fb55ffb206fa126c25a4c28ffbe24d76ac0f529974a1111095
AUTH_PORT=3001
EVENT-PORT=3002
```


## 📌 이벤트 설계

| 이벤트 코드               | 설명               |
| -------------------- | ---------------- |
| FIRST\_LOGIN         | 첫 로그인 시 보상       |
| INVITE\_THREE        | 친구 3명 초대 시 보상    |
| LOGIN\_THREE         | 3일 이상 로그인 시 보상   |
| LOGIN\_THREE\_RECENT | 최근 7일 중 3일 로그인 시 |


## ✅ 조건 검증 방식

- INVITE_THREE: 초대한 유저 수를 InviteService를 통해 확인

- LOGIN_THREE, LOGIN_THREE_RECENT: Auth 서버의 login-log API 호출을 통해 총 로그인 날짜 수 및 최근 7일 로그인을 집계

- FIRST_LOGIN: 해당 유저의 첫 로그인 여부를 내부 기록으로 확인

- 조건 로직은 이벤트마다 switch 분기로 구성되어 있어 유연한 확장 가능


## 📐 API 설계 및 구조 선택 이유

- Gateway Server가 진입점이 되어 모든 요청에 대해 인증 및 역할 검증을 수행

- 서비스 간 분리(MSA) 구조로 각 역할에 맞는 책임을 부여

- MongoDB 스키마 설계에서 Ref를 활용해 관계형 데이터를 표현

- 조건 검증 로직을 서비스 내에 일반화 가능하도록 설계해 확장성 고려


## 🧪 테스트 시나리오 예시

- 유저가 로그인 3회를 달성한 후 보상을 요청하면 성공해야 한다.

- 중복 보상 요청은 실패해야 한다.

- 조건을 만족하지 않은 유저의 요청은 실패해야 한다.

- 감사자는 모든 유저의 보상 요청 이력을 조회할 수 있어야 한다.

일부 단위 테스트는 auth-server/test, event-server/test에 포함


## 💡 구현 중 고민 및 해결

- 조건 검증 로직 일반화: 조건을 코드(enum)로 구분하고, 내부 서비스에서 각 조건별 처리 메서드를 분기 처리함으로써 확장 가능한 구조로 설계

- MSA 간 통신 설계: HTTP 기반 내부 호출에서 실패 시 예외 처리 및 로깅을 명확하게 구성

- 보상 중복 요청 방지: 보상 요청 기록에서 userId + eventId 조합을 기준으로 중복 여부를 사전에 체크

- 역할 기반 보안 처리: JwtAuthGuard + RolesGuard 조합으로 인증/인가를 미들웨어 수준에서 처리하여 모든 API 접근을 제어