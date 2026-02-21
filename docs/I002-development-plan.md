---
id: I002
title: "Tikly MVP 상세 개발 계획서"
category: Implementation
status: active
created: 2026-02-18
author: MAIBOT
project: MAITOK (Tikly)
tags: [development-plan, mvp, sprint, wbs, milestone]
---

# I002 — Tikly MVP 상세 개발 계획서

## 1. MVP 범위 정의

### 1.1 In-Scope (MVP v1)

| 기능 | 설명 |
|------|------|
| TikTok OAuth 연동 | Login Kit 기반 셀러 계정 연결 |
| 댓글 수집 파이프라인 | Content Posting API polling → SQLite 저장 |
| AI 감성분석 | 긍정/부정/중립/질문/구매의도 5단 분류 |
| 대댓글 초안 생성 | LLM 기반 맥락 인식 답변 초안 |
| Discord 알림 | 구매의도/부정 댓글 실시간 알림 + 초안 전달 |
| 일일 리포트 | Discord DM으로 일일 요약 발송 |
| 셀러 설정 관리 | 모니터링 영상, 응답 톤, 모드 설정 |
| 단일 언어 | 한국어 우선 (영어 fallback) |

### 1.2 Out-of-Scope (v2 이후)

| 기능 | 사유 |
|------|------|
| 댓글 자동 게시 | TikTok 댓글 쓰기 API 미지원 |
| Browser Automation 게시 | Phase 2에서 Playwright로 구현 |
| 완전자동 모드 | MVP는 반자동(승인) 모드만 |
| 웹 대시보드 | v2에서 구현 |
| 다국어 (베트남어) | v2에서 추가 |
| Telegram 알림 | v2에서 추가 |
| 다계정 관리 | v2에서 추가 |
| 결제/구독 시스템 | Phase 3에서 구현 |

### 1.3 핵심 제약

> ⚠️ **TikTok은 공식 댓글 작성/대댓글 API를 제공하지 않음.**
> MVP는 **읽기 + 분석 + 초안 생성**에 집중하고, 셀러가 Discord에서 초안을 확인 → TikTok에 수동 붙여넣기하는 워크플로로 운영.

---

## 2. 스프린트 계획 (2주 단위, 총 8주)

### Sprint 1: 프로젝트 셋업 + TikTok API 연동 (Week 1-2)

**목표:** 개발 환경 구축 및 TikTok OAuth/댓글 조회 동작 확인

| # | 태스크 | 예상(h) | 담당 | 완료 기준 |
|---|--------|---------|------|-----------|
| 1 | 프로젝트 초기화 (package.json, tsconfig, ESLint) | 2 | MAIBOT | `pnpm build` 성공 |
| 2 | src/ 디렉토리 구조 생성 | 1 | MAIBOT | 모든 모듈 파일 생성 |
| 3 | SQLite DB 스키마 + 마이그레이션 | 3 | MAIBOT | 4개 테이블 생성 확인 |
| 4 | .env.example + 환경변수 로더 | 1 | MAIBOT | dotenv 로딩 동작 |
| 5 | TikTok OAuth 클라이언트 구현 | 6 | MAIBOT | 인증 URL 생성 + 토큰 교환 |
| 6 | OAuth 콜백 서버 (Express) | 4 | MAIBOT | localhost:3000/auth/callback 동작 |
| 7 | 토큰 저장/갱신 로직 | 4 | MAIBOT | refresh_token 자동 갱신 |
| 8 | TikTok 영상 목록 조회 API | 3 | MAIBOT | video list JSON 반환 |
| 9 | TikTok 댓글 조회 API | 4 | MAIBOT | comment list + cursor 페이징 |
| 10 | Sandbox 테스트 + 검증 | 4 | MAIBOT | OAuth~댓글조회 E2E 동작 |
| | **소계** | **32h** | | |

**Sprint 1 완료 기준:** TikTok 계정 연동 → 영상 선택 → 댓글 목록 조회까지 E2E 동작

---

### Sprint 2: AI 댓글 분석 파이프라인 (Week 3-4)

**목표:** 수집된 댓글에 대한 감성분석 + 카테고리 분류 자동화

| # | 태스크 | 예상(h) | 담당 | 완료 기준 |
|---|--------|---------|------|-----------|
| 11 | Comment Poller 스케줄러 구현 | 6 | MAIBOT | 5분 주기 polling, 신규 댓글만 수집 |
| 12 | cursor 기반 증분 조회 로직 | 3 | MAIBOT | 중복 댓글 0건 |
| 13 | 댓글 전처리 모듈 (이모지 보존, 멘션 제거, 스팸 필터) | 4 | MAIBOT | 전처리 단위 테스트 통과 |
| 14 | 감성분석 프롬프트 설계 + LLM 호출 | 6 | MAIBOT | 5단 분류 JSON 반환 |
| 15 | 배치 분석 (여러 댓글 한번에) | 4 | MAIBOT | 10개 댓글 1회 호출로 분석 |
| 16 | 분석 결과 DB 저장 | 2 | MAIBOT | comments 테이블 sentiment/category 업데이트 |
| 17 | 분석 정확도 검증 (수동 50건) | 4 | MAIBOT | 정확도 80%+ |
| 18 | Rate limit 핸들링 + 재시도 | 3 | MAIBOT | 429 에러 시 exponential backoff |
| 19 | 에러 핸들링 + 로깅 | 2 | MAIBOT | 구조화된 로그 출력 |
| | **소계** | **34h** | | |

**Sprint 2 완료 기준:** 폴링 → 수집 → 분석 → DB 저장 파이프라인 자동 동작

---

### Sprint 3: 대댓글 생성 + 알림 시스템 (Week 5-6)

**목표:** AI 대댓글 초안 생성 및 Discord 알림/승인 워크플로 완성

| # | 태스크 | 예상(h) | 담당 | 완료 기준 |
|---|--------|---------|------|-----------|
| 20 | 대댓글 생성 프롬프트 설계 | 4 | MAIBOT | 톤/길이/이모지 가이드 반영 |
| 21 | 대댓글 생성 모듈 (needs_reply 댓글 대상) | 5 | MAIBOT | reply_text 생성 + replies 테이블 저장 |
| 22 | 브랜드 톤 설정 반영 | 3 | MAIBOT | friendly/professional/casual 톤 전환 |
| 23 | Discord 알림 봇 구현 | 5 | MAIBOT | DM으로 댓글+초안 전송 |
| 24 | 구매의도 댓글 즉시 알림 | 3 | MAIBOT | purchase_intent 감지 → 2분 내 알림 |
| 25 | 부정 댓글 경고 알림 | 2 | MAIBOT | complaint 감지 → 경고 배지 포함 알림 |
| 26 | Discord 버튼: 승인/수정/스킵 | 6 | MAIBOT | 버튼 클릭 → replies.status 업데이트 |
| 27 | 일일 리포트 생성 모듈 | 5 | MAIBOT | 감성 분포, 구매의도 수, 핫키워드 포함 |
| 28 | 일일 리포트 Discord DM 발송 | 2 | MAIBOT | 매일 오전 9시 자동 발송 |
| 29 | 리포트 포맷 (Embed) 디자인 | 2 | MAIBOT | 보기 좋은 Embed 메시지 |
| | **소계** | **37h** | | |

**Sprint 3 완료 기준:** 댓글 감지 → AI 초안 → Discord 알림 → 셀러 승인/수정 E2E 동작

---

### Sprint 4: 통합 테스트 + 베타 준비 (Week 7-8)

**목표:** 전체 파이프라인 안정화, 문서화, 베타 유저 온보딩 준비

| # | 태스크 | 예상(h) | 담당 | 완료 기준 |
|---|--------|---------|------|-----------|
| 30 | 전체 파이프라인 E2E 테스트 | 6 | MAIBOT | 수집→분석→초안→알림 무중단 24h 동작 |
| 31 | 에러 시나리오 테스트 (토큰 만료, API 다운 등) | 4 | MAIBOT | 모든 실패 시나리오 graceful 처리 |
| 32 | CLI 명령어 구현 (/tikly connect, watch, status 등) | 6 | MAIBOT | 모든 명령어 동작 |
| 33 | 셀러 온보딩 플로우 | 4 | MAIBOT | 5분 내 연동 완료 가능 |
| 34 | 성능 최적화 (DB 인덱스, 쿼리 튜닝) | 3 | MAIBOT | 1000건 댓글 조회 < 100ms |
| 35 | 배포 스크립트 + PM2 설정 | 3 | MAIBOT | pm2 start로 데몬 실행 |
| 36 | README + 사용자 가이드 작성 | 4 | MAIBOT | 설치~사용까지 문서 완성 |
| 37 | .env.example 최종 정리 | 1 | MAIBOT | 모든 필수/선택 변수 문서화 |
| 38 | 베타 유저 초대 준비 (Discord 서버) | 2 | MAIBOT | 피드백 채널 구성 |
| 39 | 모니터링 + 헬스체크 | 3 | MAIBOT | /tikly health 엔드포인트 |
| 40 | 베타 런칭 체크리스트 검증 | 2 | MAIBOT | 전 항목 통과 |
| | **소계** | **38h** | | |

**Sprint 4 완료 기준:** MAIBEAUTY 셀러 10~20명 베타 온보딩 가능 상태

---

## 3. 태스크 분해 (WBS)

### Epic 1: 프로젝트 인프라 (E1)

#### Story 1.1: 개발 환경 구축

| Task ID | Task | 시간(h) | 우선순위 | 의존성 | Sprint |
|---------|------|---------|----------|--------|--------|
| T-001 | package.json 생성 + 초기 의존성 설치 | 1 | P0 | — | S1 |
| T-002 | tsconfig.json + ESLint + Prettier 설정 | 1 | P0 | T-001 | S1 |
| T-003 | src/ 디렉토리 구조 생성 | 1 | P0 | T-002 | S1 |
| T-004 | .env.example + dotenv 설정 | 1 | P0 | T-001 | S1 |
| T-005 | Git 초기화 + .gitignore | 0.5 | P0 | — | S1 |

#### Story 1.2: 데이터베이스 설계

| Task ID | Task | 시간(h) | 우선순위 | 의존성 | Sprint |
|---------|------|---------|----------|--------|--------|
| T-006 | SQLite 연결 모듈 (better-sqlite3) | 1 | P0 | T-001 | S1 |
| T-007 | comments 테이블 스키마 + 생성 | 0.5 | P0 | T-006 | S1 |
| T-008 | replies 테이블 스키마 + 생성 | 0.5 | P0 | T-006 | S1 |
| T-009 | seller_config 테이블 스키마 + 생성 | 0.5 | P0 | T-006 | S1 |
| T-010 | watched_videos 테이블 스키마 + 생성 | 0.5 | P0 | T-006 | S1 |
| T-011 | DB 마이그레이션 스크립트 | 1 | P1 | T-007~T-010 | S1 |

---

### Epic 2: TikTok API 연동 (E2)

#### Story 2.1: OAuth 인증

| Task ID | Task | 시간(h) | 우선순위 | 의존성 | Sprint |
|---------|------|---------|----------|--------|--------|
| T-012 | OAuth 인증 URL 생성 함수 | 2 | P0 | T-004 | S1 |
| T-013 | 콜백 서버 (Express /auth/callback) | 4 | P0 | T-012 | S1 |
| T-014 | Authorization Code → Access Token 교환 | 2 | P0 | T-013 | S1 |
| T-015 | Token 암호화 저장 (seller_config) | 2 | P0 | T-014, T-009 | S1 |
| T-016 | Refresh Token 자동 갱신 로직 | 2 | P0 | T-015 | S1 |
| T-017 | Token 만료 감지 + 재인증 요청 | 2 | P1 | T-016 | S1 |

#### Story 2.2: 댓글 조회 API

| Task ID | Task | 시간(h) | 우선순위 | 의존성 | Sprint |
|---------|------|---------|----------|--------|--------|
| T-018 | TikTok API HTTP 클라이언트 래퍼 | 2 | P0 | T-016 | S1 |
| T-019 | 영상 목록 조회 (video.list) | 2 | P0 | T-018 | S1 |
| T-020 | 댓글 목록 조회 (comment.list) | 2 | P0 | T-018 | S1 |
| T-021 | cursor 기반 페이징 처리 | 2 | P0 | T-020 | S1 |
| T-022 | Rate limit 감지 + 429 재시도 | 2 | P1 | T-018 | S2 |
| T-023 | Sandbox 환경 E2E 테스트 | 4 | P0 | T-019~T-021 | S1 |

---

### Epic 3: 댓글 수집 파이프라인 (E3)

#### Story 3.1: 폴링 스케줄러

| Task ID | Task | 시간(h) | 우선순위 | 의존성 | Sprint |
|---------|------|---------|----------|--------|--------|
| T-024 | Comment Poller 클래스 구현 | 4 | P0 | T-020 | S2 |
| T-025 | 영상별 polling 주기 관리 (신규/오래된) | 2 | P1 | T-024 | S2 |
| T-026 | cursor 저장 + 증분 조회 (중복 방지) | 3 | P0 | T-024, T-010 | S2 |
| T-027 | 일일 쿼터 관리 (1,000 req/day) | 2 | P1 | T-024 | S2 |

#### Story 3.2: 댓글 전처리

| Task ID | Task | 시간(h) | 우선순위 | 의존성 | Sprint |
|---------|------|---------|----------|--------|--------|
| T-028 | 이모지 보존 + 멘션(@) 제거 | 1.5 | P0 | — | S2 |
| T-029 | 스팸 필터링 (URL, 반복 문자) | 1.5 | P1 | — | S2 |
| T-030 | 언어 감지 (langdetect / LLM) | 2 | P1 | — | S2 |
| T-031 | 전처리 단위 테스트 (10+ 케이스) | 2 | P0 | T-028~T-030 | S2 |

---

### Epic 4: AI 분석 엔진 (E4)

#### Story 4.1: 감성분석

| Task ID | Task | 시간(h) | 우선순위 | 의존성 | Sprint |
|---------|------|---------|----------|--------|--------|
| T-032 | 감성분석 프롬프트 설계 | 3 | P0 | — | S2 |
| T-033 | LLM 호출 모듈 (Claude Sonnet) | 3 | P0 | T-004 | S2 |
| T-034 | 배치 분석 (N개 댓글 1회 호출) | 3 | P1 | T-033 | S2 |
| T-035 | 분석 결과 파싱 + DB 저장 | 2 | P0 | T-033, T-007 | S2 |
| T-036 | 분석 정확도 검증 (수동 50건) | 4 | P0 | T-035 | S2 |

#### Story 4.2: 대댓글 생성

| Task ID | Task | 시간(h) | 우선순위 | 의존성 | Sprint |
|---------|------|---------|----------|--------|--------|
| T-037 | 대댓글 생성 프롬프트 설계 | 3 | P0 | T-032 | S3 |
| T-038 | 대댓글 생성 모듈 (needs_reply 필터) | 4 | P0 | T-037, T-033 | S3 |
| T-039 | 브랜드 톤 설정 반영 로직 | 2 | P1 | T-038 | S3 |
| T-040 | 대댓글 품질 검증 (150자 제한, 이모지 등) | 2 | P1 | T-038 | S3 |
| T-041 | replies 테이블 저장 | 1 | P0 | T-038, T-008 | S3 |

---

### Epic 5: 알림 시스템 (E5)

#### Story 5.1: Discord 알림

| Task ID | Task | 시간(h) | 우선순위 | 의존성 | Sprint |
|---------|------|---------|----------|--------|--------|
| T-042 | Discord 봇 초기화 + DM 전송 | 3 | P0 | T-004 | S3 |
| T-043 | 구매의도 댓글 즉시 알림 | 3 | P0 | T-042, T-035 | S3 |
| T-044 | 부정 댓글 경고 알림 | 2 | P0 | T-042, T-035 | S3 |
| T-045 | 알림 Embed 디자인 (댓글원문 + AI초안) | 2 | P1 | T-042 | S3 |
| T-046 | Discord 버튼: 승인/수정/스킵 인터랙션 | 5 | P0 | T-045 | S3 |
| T-047 | 승인 시 reply status 업데이트 + 복사 안내 | 2 | P0 | T-046, T-041 | S3 |

#### Story 5.2: 일일 리포트

| Task ID | Task | 시간(h) | 우선순위 | 의존성 | Sprint |
|---------|------|---------|----------|--------|--------|
| T-048 | 일일 통계 집계 쿼리 | 3 | P0 | T-035 | S3 |
| T-049 | 리포트 Embed 메시지 포맷 | 2 | P1 | T-048 | S3 |
| T-050 | 크론 스케줄러 (매일 09:00 KST) | 2 | P0 | T-049 | S3 |
| T-051 | Discord DM 자동 발송 | 1 | P0 | T-050, T-042 | S3 |

---

### Epic 6: 통합 + 베타 준비 (E6)

#### Story 6.1: CLI 명령어

| Task ID | Task | 시간(h) | 우선순위 | 의존성 | Sprint |
|---------|------|---------|----------|--------|--------|
| T-052 | /tikly connect (OAuth 시작) | 2 | P0 | T-012 | S4 |
| T-053 | /tikly watch / unwatch (영상 모니터링) | 2 | P0 | T-024 | S4 |
| T-054 | /tikly status (현황 조회) | 1 | P1 | T-024 | S4 |
| T-055 | /tikly stats (분석 통계) | 2 | P2 | T-048 | S4 |

#### Story 6.2: 안정화 + 배포

| Task ID | Task | 시간(h) | 우선순위 | 의존성 | Sprint |
|---------|------|---------|----------|--------|--------|
| T-056 | 전체 파이프라인 E2E 테스트 (24h) | 6 | P0 | 전체 | S4 |
| T-057 | 에러 시나리오 테스트 | 4 | P0 | T-056 | S4 |
| T-058 | DB 인덱스 + 성능 최적화 | 3 | P1 | T-056 | S4 |
| T-059 | PM2 배포 설정 + 헬스체크 | 3 | P1 | T-056 | S4 |
| T-060 | README + 사용자 가이드 | 4 | P0 | T-056 | S4 |
| T-061 | 베타 유저 Discord 서버 + 초대 | 2 | P1 | — | S4 |
| T-062 | 베타 런칭 체크리스트 최종 검증 | 2 | P0 | 전체 | S4 |

---

### WBS 요약

| Epic | Story 수 | Task 수 | 총 시간(h) |
|------|----------|---------|-----------|
| E1: 프로젝트 인프라 | 2 | 11 | 8.5 |
| E2: TikTok API 연동 | 2 | 12 | 24 |
| E3: 댓글 수집 파이프라인 | 2 | 8 | 16 |
| E4: AI 분석 엔진 | 2 | 10 | 22 |
| E5: 알림 시스템 | 2 | 10 | 23 |
| E6: 통합 + 베타 준비 | 2 | 11 | 29 |
| **합계** | **12** | **62** | **122.5h** |

---

## 4. 기술 마일스톤

| 마일스톤 | 설명 | 완료 기준 | 목표 시점 |
|----------|------|-----------|-----------|
| **M1** | TikTok OAuth 연동 완료 | 토큰 발급/갱신 + 영상 목록 조회 동작 | Week 2 |
| **M2** | 댓글 수집 + 저장 파이프라인 | 5분 주기 polling → SQLite 저장, 중복 0건 | Week 3 |
| **M3** | AI 감성분석 동작 | 5단 분류 정확도 80%+, 배치 처리 동작 | Week 4 |
| **M4** | 대댓글 초안 생성 + Discord 알림 | AI 초안 → Discord DM → 승인 버튼 E2E 동작 | Week 6 |
| **M5** | MVP 완성 (셀러 베타 테스트 가능) | 전 기능 통합, 24h 무중단, 베타 10명 온보딩 | Week 8 |

### 마일스톤 의존성 그래프

```
M1 (OAuth) ──→ M2 (수집) ──→ M3 (분석) ──→ M4 (초안+알림) ──→ M5 (MVP)
                                                                    ↑
                                                              CLI + 리포트 + 안정화
```

---

## 5. 리스크 & 의존성

### 5.1 리스크 매트릭스

| # | 리스크 | 확률 | 영향 | 완화 전략 |
|---|--------|------|------|-----------|
| R1 | TikTok Developer 심사 대기 (1-4주) | 높음 | 높음 | Sandbox로 개발 진행, 심사 병행. AI 파이프라인/Discord 알림은 심사와 무관하게 개발 가능 |
| R2 | API Rate Limit (일 1,000건) | 중간 | 중간 | 영상 수 제한 (MVP 최대 10개), 적응형 polling 주기, 일일 쿼터 모니터링 |
| R3 | 댓글 쓰기 API 미지원 지속 | 높음 | 중간 | MVP는 초안 생성에 집중. Phase 2에서 Browser Automation 대안 |
| R4 | Research API 승인 거절 | 중간 | 낮음 | Content Posting API의 comment.list로 대체 (자기 영상만) |
| R5 | AI 감성분석 정확도 미달 | 낮음 | 중간 | 프롬프트 반복 최적화, Few-shot 예시 추가, 셀러 피드백 루프 |
| R6 | TikTok API 정책 변경 | 낮음 | 높음 | 추상화 레이어로 API 교체 용이하게 설계, 크롤링 폴백 준비 |
| R7 | 셀러 수동 붙여넣기 이탈 | 중간 | 중간 | UX 최적화 (원클릭 복사), Phase 2 자동 게시로 전환 |

### 5.2 심사 대기 중 병행 가능 작업

TikTok Developer 심사(R1) 대기 중에도 진행 가능한 태스크:

| 카테고리 | 태스크 | 비고 |
|----------|--------|------|
| 인프라 | T-001~T-011 (프로젝트 셋업, DB) | 심사 무관 |
| AI | T-028~T-040 (전처리, 감성분석, 대댓글 생성) | 샘플 데이터로 테스트 |
| 알림 | T-042~T-051 (Discord 봇, 리포트) | 심사 무관 |
| 문서 | T-060 (README, 가이드) | 심사 무관 |

> 💡 전체 62개 태스크 중 **~40개(65%)** 가 심사와 무관하게 진행 가능.

### 5.3 외부 의존성

| 의존성 | 담당 | 상태 | 대기 영향 |
|--------|------|------|-----------|
| TikTok Developer 앱 심사 | TikTok | 미제출 | M1 달성 지연 가능 (Sandbox로 우회) |
| TikTok Business 계정 (테스트용) | 지니님 | 준비 필요 | Sandbox 테스트에 필요 |
| Discord 봇 토큰 | 지니님 | 기존 MAIBOT 활용 가능 | 없음 |
| OpenAI/Claude API 키 | 지니님 | 기존 키 활용 가능 | 없음 |

---

## 6. 개발 환경 셋업 가이드

### 6.1 프로젝트 구조

```
C:\TEST\MAITOK\
├── docs/                        # 프로젝트 문서
│   ├── README.md
│   ├── A001-PRD.md
│   ├── A002-market-analysis.md
│   ├── A003-business-strategy.md
│   ├── D001-architecture.md
│   ├── I001-tiktok-developer-setup.md
│   └── I002-development-plan.md  # 본 문서
├── src/
│   ├── index.ts                 # 엔트리포인트
│   ├── config.ts                # 환경변수 + 설정 로더
│   ├── db/
│   │   ├── index.ts             # SQLite 연결
│   │   ├── schema.ts            # 테이블 생성 DDL
│   │   └── queries.ts           # CRUD 쿼리 함수
│   ├── tiktok/
│   │   ├── client.ts            # TikTok API HTTP 래퍼
│   │   ├── oauth.ts             # OAuth 인증 플로우
│   │   ├── comments.ts          # 댓글 조회 API
│   │   └── types.ts             # TikTok API 타입
│   ├── poller/
│   │   ├── comment-poller.ts    # 폴링 스케줄러
│   │   └── quota-manager.ts     # 일일 쿼터 관리
│   ├── ai/
│   │   ├── pipeline.ts          # 분석 파이프라인 오케스트레이터
│   │   ├── preprocessor.ts      # 댓글 전처리
│   │   ├── sentiment.ts         # 감성분석 프롬프트 + 호출
│   │   ├── reply-generator.ts   # 대댓글 생성
│   │   └── prompts.ts           # 프롬프트 템플릿
│   ├── notify/
│   │   ├── discord.ts           # Discord 봇 + 알림
│   │   ├── embeds.ts            # Embed 메시지 빌더
│   │   └── report.ts            # 일일 리포트 생성
│   ├── commands/
│   │   ├── connect.ts           # /tikly connect
│   │   ├── watch.ts             # /tikly watch/unwatch
│   │   ├── status.ts            # /tikly status
│   │   └── stats.ts             # /tikly stats
│   └── utils/
│       ├── logger.ts            # 구조화 로깅
│       ├── crypto.ts            # 토큰 암호화
│       └── scheduler.ts         # cron 스케줄러
├── tests/
│   ├── ai/
│   │   ├── preprocessor.test.ts
│   │   └── sentiment.test.ts
│   └── tiktok/
│       └── client.test.ts
├── data/                        # SQLite DB 파일 (git 무시)
├── package.json
├── tsconfig.json
├── .env                         # 환경변수 (git 무시)
├── .env.example                 # 환경변수 템플릿
├── .gitignore
└── README.md
```

### 6.2 package.json 초기 의존성

```json
{
  "name": "tikly",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "vitest run",
    "db:migrate": "tsx src/db/schema.ts"
  },
  "dependencies": {
    "better-sqlite3": "^11.0.0",
    "discord.js": "^14.16.0",
    "dotenv": "^16.4.0",
    "express": "^4.21.0",
    "node-cron": "^3.0.0",
    "openai": "^4.70.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@types/better-sqlite3": "^7.6.0",
    "@types/express": "^5.0.0",
    "@types/node": "^22.0.0",
    "@types/node-cron": "^3.0.0",
    "tsx": "^4.19.0",
    "typescript": "^5.7.0",
    "vitest": "^2.1.0"
  }
}
```

### 6.3 환경변수 (.env.example)

```bash
# === TikTok API ===
TIKTOK_CLIENT_KEY=your_client_key_here
TIKTOK_CLIENT_SECRET=your_client_secret_here
TIKTOK_REDIRECT_URI=http://localhost:3000/auth/callback

# === AI (LLM) ===
# OpenAI 또는 Anthropic 중 택1
OPENAI_API_KEY=sk-...
# ANTHROPIC_API_KEY=sk-ant-...
LLM_MODEL=gpt-4o-mini          # gpt-4o / gpt-4o-mini / claude-3-5-sonnet

# === Discord ===
DISCORD_BOT_TOKEN=your_discord_bot_token
DISCORD_SELLER_USER_ID=your_discord_user_id

# === Database ===
DB_PATH=./data/tikly.db

# === Server ===
PORT=3000
NODE_ENV=development

# === Polling ===
POLL_INTERVAL_SEC=300           # 기본 5분
POLL_INTERVAL_NEW_SEC=120      # 신규 영상 2분
POLL_INTERVAL_OLD_SEC=1800     # 오래된 영상 30분

# === Reply Settings ===
REPLY_TONE=friendly             # friendly / professional / casual
MAX_DAILY_REPLIES=100

# === Encryption ===
TOKEN_ENCRYPTION_KEY=random_32_char_key_here
```

### 6.4 로컬 개발 실행 방법

```bash
# 1. 프로젝트 클론
cd C:\TEST\MAITOK

# 2. 의존성 설치
pnpm install

# 3. 환경변수 설정
cp .env.example .env
# .env 파일 편집: API 키 입력

# 4. DB 초기화
pnpm db:migrate

# 5. 개발 서버 시작
pnpm dev

# 6. TikTok OAuth 테스트
# 브라우저에서 http://localhost:3000/auth/login 접속

# 7. 테스트 실행
pnpm test
```

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2026-02-18 | 초기 MVP 개발 계획서 작성 |
