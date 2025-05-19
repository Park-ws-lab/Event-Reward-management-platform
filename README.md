# 🎮 이벤트 / 보상 관리 플랫폼

NestJS 기반 MSA 아키텍처로 구현된 이벤트 보상 자동화 플랫폼입니다.<br>
사용자는 조건 충족 시 보상을 요청할 수 있고, 운영자는 조건과 보상을 설정하며,<br>
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
<br>

## ⚙️ 개발 환경

- Node.js 18

- NestJS (monorepo, microservice structure)

- MongoDB

- Docker & Docker Compose

- TypeScript

- Jest (단위 테스트 일부 포함)

<br>

## 🗃️ 폴더 구조

```bash
.
├── auth-server/         # 사용자 등록, 로그인, JWT 발급
├── event-server/        # 이벤트 생성, 조건 검증, 보상 관리
├── gateway-server/      # 인증 및 역할 기반 라우팅
├── docker-compose.yml   # 전체 서비스 실행 설정
└── README.md            # 설명 문서
```
<br>

## 🔐 사용자 역할

| 역할       | 설명                   |
| -------- | -------------------- |
| USER     | 이벤트 조건 만족 시 보상 요청 가능 |
| OPERATOR | 이벤트 및 보상 등록 가능       |
| AUDITOR  | 모든 보상 요청 이력 조회만 가능   |
| ADMIN    | 전체 권한 보유             |

<br>

## 🧾 .env 설정 예시

.env는 각 서버 폴더(auth-server, event-server, gateway-server) 안에 생성해주세요.

### 📁 auth-server/.env
```env
MONGO_URL=mongodb://mongodb:27017/user-db
PORT=3001
JWT_SECRET=758b41bd2bb892fb55ffb206fa126c25a4c28ffbe24d76ac0f529974a1111095
```

### 📁 event-server/.env
```env
MONGO_URL=mongodb://mongodb:27017/event-db
PORT=3002
```

### 📁 gateway-server/.env
```env
JWT_SECRET=758b41bd2bb892fb55ffb206fa126c25a4c28ffbe24d76ac0f529974a1111095
AUTH_PORT=3001
EVENT-PORT=3002
```
<br>

## 📌 이벤트 설계

| 이벤트 코드               | 설명               |
| -------------------- | ---------------- |
| FIRST\_LOGIN         | 첫 로그인 시 보상       |
| INVITE\_THREE        | 친구 3명 초대 시 보상    |
| LOGIN\_THREE         | 3일 이상 로그인 시 보상   |
| LOGIN\_THREE\_RECENT | 최근 7일 중 3일 로그인 시 |

<br>

## ✅ 조건 검증 방식

- INVITE_THREE: 초대한 유저 수를 InviteService를 통해 확인

- LOGIN_THREE, LOGIN_THREE_RECENT: Auth 서버의 login-log API 호출을 통해 총 로그인 날짜 수 및 최근 7일 로그인을 집계

- FIRST_LOGIN: 해당 유저의 첫 로그인 여부를 내부 기록으로 확인

- 조건 로직은 이벤트마다 switch 분기로 구성되어 있어 유연한 확장 가능

<br>

## 📐 API 설계 및 구조 선택 이유

- Gateway Server가 진입점이 되어 모든 요청에 대해 인증 및 역할 검증을 수행

- 서비스 간 분리(MSA) 구조로 각 역할에 맞는 책임을 부여

- MongoDB 스키마 설계에서 Ref를 활용해 관계형 데이터를 표현

- 조건 검증 로직을 서비스 내에 일반화 가능하도록 설계해 확장성 고려

<br>

## 🧪 테스트 시나리오 예시

<br>

## 📮 User API 테스트 시나리오

NestJS 기반 Auth Server를 대상으로 한 Postman 테스트 시나리오입니다. 각 요청은 JWT 토큰이 필요한 경우 Header에 명시해야 합니다.

### ✅ 1. 회원가입

- **Method:** `POST`  
- **URL:** `http://localhost:3000/user/register`

**Body (JSON):**
```json
{
  "username": "testuser",
  "password": "1234",
  "role": "USER"
}
```

**응답 코드:**
- `201 Created` – 회원가입 성공
- `400 Bad Request` – 필드 누락, 형식 오류, 중복 사용자

---

### ✅ 2. 로그인

- **Method:** `POST`  
- **URL:** `http://localhost:3000/user/login`

**Body (JSON):**
```json
{
  "username": "testuser",
  "password": "1234"
}
```

**응답 코드:**
- `200 OK` – 로그인 성공, accessToken/refreshToken 포함
- `401 Unauthorized` – 비밀번호 불일치 또는 사용자 없음

---

### ✅ 3. 로그아웃

- **Method:** `POST`  
- **URL:** `http://localhost:3000/user/logout`

**Headers:**
Authorization: Bearer <JWT>

**Body (JSON):**
```json
{
  "userId": "<유저ID>"
}
```

**응답 코드:**
- `200 OK` – 로그아웃 성공
- `404 Not Found` – 존재하지 않는 userId

---

### ✅ 4. 유저 권한 수정

- **Method:** `PATCH`  
- **URL:** `http://localhost:3000/user/updateUserRole/<유저ID>`

**Headers:**
Authorization: Bearer <ADMIN JWT>

**Body (JSON):**
```json
{
  "role": "OPERATOR"
}
```

**응답 코드:**
- `200 OK` – 권한 수정 성공
- `400 Bad Request` – 유효하지 않은 role 값
- `403 Forbidden` – 관리자 권한 없음
- `404 Not Found` – 유저 없음

---


## 📮 Event API 테스트 시나리오

게이트웨이 서버의 `@Roles` 설정에 따라 각 API는 특정 역할만 접근할 수 있습니다.

---

### ✅ 1. 이벤트 등록

- **Method:** `POST`  
- **URL:** `http://localhost:3000/events`

**Headers:**
Authorization: Bearer <OPERATOR 또는 ADMIN JWT>

**Body (JSON):**
```json
{
  "title": "친구 초대 이벤트",
  "description": "친구 3명을 초대하면 보상이 지급됩니다.",
  "condition": "INVITE_THREE",
  "startDate": "2024-05-01T00:00:00.000Z",
  "endDate": "2024-06-01T00:00:00.000Z",
  "isActive": true
}
```

**응답 코드:**
- ✅ 201 Created – 등록 성공
- ❌ 400 Bad Request – 필드 누락 또는 유효성 오류
- ❌ 403 Forbidden – USER, AUDITOR 접근 시

---

### ✅ 2. 이벤트 전체 조회

- **Method:** `GET`  
- **URL:** `http://localhost:3000/events`

**Headers:**
Authorization: Bearer <OPERATOR 또는 ADMIN JWT>

**응답 코드:**
- ✅ 200 OK – 이벤트 목록 반환
- ❌ 403 Forbidden – USER, AUDITOR 접근 시

---

### ✅ 3. 이벤트 제목 목록 조회

- **Method:** `GET`  
- **URL:** `http://localhost:3000/events/titles`

**Headers:**
Authorization: Bearer <OPERATOR 또는 ADMIN JWT>

**응답 코드:**
- ✅ 200 OK – 이벤트 제목 배열 반환
- ❌ 403 Forbidden – USER, AUDITOR 접근 시

---

### ✅ 4. 이벤트 수정

- **Method:** `PATCH`  
- **URL:** `http://localhost:3000/events/<이벤트ID>`

**Headers:**
Authorization: Bearer <ADMIN JWT>

**Body (JSON):**
```json
{
  "description": "이벤트 내용이 변경되었습니다.",
  "isActive": false
}
```

**응답 코드:**
- ✅ 200 OK – 수정 성공
- ❌ 403 Forbidden – OPERATOR, USER, AUDITOR 접근 시
- ❌ 404 Not Found – 존재하지 않는 이벤트 ID

---

### ✅ 5. 이벤트 삭제

- **Method:** `DELETE`  
- **URL:** `http://localhost:3000/events/<이벤트ID>`

**Headers:**
Authorization: Bearer <ADMIN JWT>

**응답 코드:**
- ✅ 200 OK – 삭제 성공
- ❌ 403 Forbidden – OPERATOR, USER, AUDITOR 접근 시
- ❌ 404 Not Found – 존재하지 않는 이벤트 ID

---

## 📮 Reward API 테스트 시나리오

### ✅ 1. 보상 등록

- **Method:** `POST`  
- **URL:** `http://localhost:3000/rewards`

**Headers:**
Authorization: Bearer <OPERATOR 또는 ADMIN JWT>

**Body (JSON):**
```json
{
  "eventId": "<이벤트ID>",
  "type": "COUPON",
  "value": "5000원 할인 쿠폰",
  "quantity": 100
}
```

**응답 코드:**
- ✅ 201 Created – 등록 성공
- ❌ 400 Bad Request – 잘못된 필드
- ❌ 403 Forbidden – USER, AUDITOR 접근 시

---

### ✅ 2. 전체 보상 조회

- **Method:** `GET`  
- **URL:** `http://localhost:3000/rewards`

**Headers:**
Authorization: Bearer <OPERATOR 또는 ADMIN JWT>

**응답 코드:**
- ✅ 200 OK – 보상 목록 반환
- ❌ 403 Forbidden – USER, AUDITOR 접근 시

---

### ✅ 3. 보상 수정

- **Method:** `PATCH`  
- **URL:** `http://localhost:3000/rewards/<보상ID>`

**Headers:**
Authorization: Bearer <ADMIN JWT>

**Body (JSON):**
```json
{
  "quantity": 200
}
```

**응답 코드:**
- ✅ 200 OK – 수정 성공
- ❌ 403 Forbidden – OPERATOR, USER, AUDITOR 접근 시
- ❌ 404 Not Found – 존재하지 않는 보상 ID

---

### ✅ 4. 보상 삭제

- **Method:** `DELETE`  
- **URL:** `http://localhost:3000/rewards/<보상ID>`

**Headers:**
Authorization: Bearer <ADMIN JWT>

**응답 코드:**
- ✅ 200 OK – 삭제 성공
- ❌ 403 Forbidden – OPERATOR, USER, AUDITOR 접근 시
- ❌ 404 Not Found – 존재하지 않는 보상 ID

---


## 📮 Reward Request API 테스트 시나리오 (게이트웨이 기준 권한 적용)

### ✅ 1. 보상 요청 생성

- **Method:** `POST`  
- **URL:** `http://localhost:3000/reward-requests`

**Headers:**
Authorization: Bearer <USER 또는 ADMIN JWT>

**Body (JSON):**
```json
{
  "userId": "<유저ID>",
  "eventId": "<이벤트ID>"
}
```

**응답 코드:**
- ✅ 201 Created – 조건 만족 시 보상 지급
- ❌ 400 Bad Request – 조건 미달 / 보상 없음
- ❌ 403 Forbidden – OPERATOR, AUDITOR 접근 시

---

### ✅ 2. 전체 보상 요청 목록 조회 (필터 포함)

- **Method:** `GET`  
- **URL:** `http://localhost:3000/reward-requests?eventId=<이벤트ID>&status=SUCCESS`

**Headers:**
Authorization: Bearer <OPERATOR, AUDITOR, ADMIN JWT>

**응답 코드:**
- ✅ 200 OK – 필터된 요청 목록 반환
- ❌ 403 Forbidden – USER 접근 시

---

### ✅ 3. 특정 유저의 요청 이력 조회

- **Method:** `GET`  
- **URL:** `http://localhost:3000/reward-requests/user/<유저ID>`

**Headers:**
Authorization: Bearer <ADMIN JWT>

**응답 코드:**
- ✅ 200 OK – 유저 요청 목록 반환
- ❌ 403 Forbidden – OPERATOR, AUDITOR 접근 시

---


## 📮 Invite API

### ✅ 친구 초대 요청

- **Method:** `POST`  
- **URL:** `http://localhost:3000/invites`

**Headers:**
Authorization: Bearer <USER 또는 ADMIN JWT>

**Body (JSON):**
```json
{
  "inviterId": "<초대한 유저 ID>",
  "inviteeId": "<초대받은 유저 ID>"
}
```

**응답 코드:**
- ✅ 201 Created – 초대 성공
- ❌ 400 Bad Request – 잘못된 요청 형식, 중복 초대 등
- ❌ 403 Forbidden – OPERATOR, AUDITOR 접근 시

<br>

## 💡 구현 중 고민 및 해결

- 조건 검증 로직 일반화: 조건을 코드(enum)로 구분하고, 내부 서비스에서 각 조건별 처리 메서드를 분기 처리함으로써 확장 가능한 구조로 설계

- MSA 간 통신 설계: HTTP 기반 내부 호출에서 실패 시 예외 처리 및 로깅을 명확하게 구성

- 보상 중복 요청 방지: 보상 요청 기록에서 userId + eventId 조합을 기준으로 중복 여부를 사전에 체크

- 역할 기반 보안 처리: JwtAuthGuard + RolesGuard 조합으로 인증/인가를 미들웨어 수준에서 처리하여 모든 API 접근을 제어