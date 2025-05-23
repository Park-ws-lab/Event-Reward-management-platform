# 🎁 Event Server

이벤트 생성, 조건 설정, 보상 등록 및 유저의 보상 요청을 처리하는 핵심 서비스입니다.  
조건 검증을 통해 자동으로 보상 지급 여부를 판단하며, 모든 보상 요청 이력을 저장합니다.

---

## 📦 역할

- 이벤트 등록/조회
- 보상 등록/조회
- 유저의 보상 요청 처리
- 조건 충족 여부 검증 (유저 행동 기반)
- 보상 중복 요청 방지


## 🧾 .env 예시

```env
MONGO_URL=mongodb://mongodb:27017/event-db
PORT=3002
AUTH_PORT=3001
```


## 📌 주요 API

| 메서드  | 경로              | 설명            |
| ---- | --------------- | ------------- |
| POST | /event          | 이벤트 등록        |
| GET  | /event          | 전체 이벤트 조회     |
| POST | /reward         | 보상 등록         |
| POST | /reward-request | 유저가 보상을 직접 요청 |
| GET  | /reward-request | 요청 이력 조회      |


## 🧩 참고 사항

- 내부적으로 auth-server, invite-service와 통신합니다.

- 역할 기반 접근 제어(@Roles) 적용되어 있어 운영자/감사자 기능 분리되어 있습니다.