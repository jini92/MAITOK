# MAITOK (Tikly) 🎵

TikTok 댓글 AI 분석 + 자동 대댓글 생성 서비스

## 개요

| 항목 | 내용 |
|------|------|
| **브랜드명** | Tikly |
| **프로젝트** | MAITOK |
| **핵심 기능** | TikTok 댓글 감성분석, AI 대댓글 초안 생성, Discord 알림 |
| **타겟** | TikTok Shop 셀러 (한국/베트남) |

## 아키텍처

```
TikTok Research API → Comment Poller (adaptive interval)
                          ↓
                      SQLite DB ← 댓글 저장
                          ↓
                    AI Pipeline (Claude Sonnet)
                    ├── 감성분석 (positive/negative/neutral/question)
                    ├── 카테고리 분류 (purchase_intent/complaint/...)
                    └── 대댓글 초안 생성 (다국어: ko/vi/en)
                          ↓
                    Discord 알림 → 셀러 승인 → 게시
```

## Tech Stack

| 영역 | 선택 |
|------|------|
| Runtime | Node.js 22+ (TypeScript, ESM) |
| DB | SQLite (better-sqlite3) |
| LLM | Claude Sonnet via Anthropic SDK |
| HTTP | Fastify 5 |
| Scheduler | Adaptive interval polling |
| Notify | Discord Webhook |
| Test | Vitest 3 |

## 프로젝트 구조

```
MAITOK/
├── docs/                          # 프로젝트 문서
│   ├── A001-PRD.md               # 제품 요구사항
│   ├── A002-market-analysis.md   # 시장 분석
│   ├── A003-business-strategy.md # 사업 전략
│   ├── D001-architecture.md      # 시스템 아키텍처
│   ├── D002-detailed-design.md   # 상세 설계
│   ├── I001-tiktok-developer-setup.md  # TikTok 개발자 설정
│   └── I002-development-plan.md  # 개발 계획
├── src/
│   ├── index.ts                  # 엔트리포인트 (Fastify 서버)
│   ├── app.ts                    # Fastify 앱 팩토리
│   ├── tiktok/
│   │   ├── client.ts             # TikTok Research API 클라이언트
│   │   └── types.ts              # TikTok API 타입 정의
│   ├── poller/
│   │   ├── scheduler.ts          # Adaptive polling 스케줄러
│   │   └── types.ts              # Poller 타입 정의
│   ├── ai/
│   │   ├── pipeline.ts           # 감성분석 + 대댓글 생성
│   │   └── types.ts              # AI 파이프라인 타입
│   ├── notify/
│   │   ├── discord.ts            # Discord Webhook 알림
│   │   └── types.ts              # 알림 타입 정의
│   └── db/
│       ├── index.ts              # SQLite 초기화
│       └── schema.sql            # DB 스키마
├── tests/
│   ├── setup.ts                  # 테스트 환경 설정
│   ├── health.test.ts            # Health check API 테스트
│   └── notify.test.ts            # Discord 알림 테스트
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── CLAUDE.md                     # AI 에이전트 가이드
└── .env.example                  # 환경변수 템플릿
```

## 주요 모듈

### TikTok Client (`src/tiktok/client.ts`)
- TikTok Research API v2 댓글 조회
- OAuth 2.0 토큰 자동 갱신
- 일일 1,000건 Rate Limit 관리 (PST 기준 리셋)
- cursor 기반 증분 페이지네이션

### Comment Poller (`src/poller/scheduler.ts`)
- Adaptive polling — 영상 나이에 따라 간격 조절:
  - 신규 (24h 이내): **2분**
  - 기본: **5분**
  - 오래된 (7일+): **30분**
- 활성 영상 목록 자동 갱신 (5분 주기)
- Transaction 기반 배치 댓글 저장

### AI Pipeline (`src/ai/pipeline.ts`)
- **감성분석**: 댓글 → sentiment/category/language/priority JSON
- **대댓글 생성**: 브랜드 톤에 맞는 150자 이내 다국어 응답
- Anthropic SDK 직접 사용 (Claude Sonnet 4.6)

### Discord Notify (`src/notify/discord.ts`)
- 새 댓글 알림: 감성 이모지 + 카테고리 + 우선순위 색상 Embed
- 일일 요약: 통계 대시보드 Embed

### DB Schema (`src/db/schema.sql`)
- `comments` — 수집된 댓글 + 분석 결과
- `replies` — AI 생성 대댓글 초안
- `seller_config` — 셀러 계정 + 설정
- `watched_videos` — 모니터링 대상 영상

## 시작하기

```bash
# 의존성 설치
pnpm install

# 환경변수 설정
cp .env.example .env
# .env 파일에 API 키 입력

# 개발 서버
pnpm dev

# 테스트
pnpm test

# 빌드
pnpm build
```

### 필수 환경변수

| 변수 | 설명 |
|------|------|
| `TIKTOK_CLIENT_ID` | TikTok Developer App Client ID |
| `TIKTOK_CLIENT_SECRET` | TikTok Developer App Secret |
| `ANTHROPIC_API_KEY` | Anthropic API 키 |
| `DISCORD_WEBHOOK_URL` | Discord Webhook URL |
| `LLM_MODEL` | LLM 모델 (기본: claude-sonnet-4-6) |

## Phase 로드맵

| Phase | 기능 | 상태 |
|-------|------|------|
| **1 (MVP)** | 댓글 분석 + 대댓글 초안 → Discord 알림 | 🟡 구현 중 |
| **2** | Browser Automation 자동 게시 | ⬜ 예정 |
| **3** | 대시보드 UI, 멀티 셀러, 분석 리포트 | ⬜ 예정 |

## 개발 방식

3-Layer 멀티에이전트 아키텍처로 개발:
- **Layer 1**: MAIBOT (Opus, 오케스트레이터) — 설계/검증/문서화
- **Layer 2**: Claude Code CLI (Sonnet) — 구현/테스트 코드 생성
- **Layer 3**: Claude Code CLI (Opus) — 복잡한 설계/리팩토링

## License

Private — MAI Universe Project
