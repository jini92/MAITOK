# MAITOK (Tikly) — TikTok AI 댓글 분석 서비스

## 프로젝트 개요

TikTok 셀러를 위한 AI 댓글 분석 + 자동 대댓글 서비스.

- **브랜드명:** Tikly (TikTok + Reply)
- **타겟:** TikTok Shop 셀러 (한국/베트남, 뷰티 우선)
- **핵심 기능:** 댓글 감성분석, AI 대댓글 초안, 일일 요약 리포트

## 멀티에이전트 코딩

MAIBOT(오케스트레이터) → Claude Code CLI(전문 에이전트) 구조.

- 복잡한 작업: `claude -p --model opus --agent system-architect`
- 구현 작업: `claude -p --model sonnet --agent {전문에이전트}`
- 단순 작업: MAIBOT 직접 처리

## 기술 스택

- **Runtime:** Node.js 22+ (TypeScript)
- **Framework:** Fastify (API 서버)
- **Database:** SQLite (better-sqlite3)
- **AI:** Anthropic Claude API (감성분석 + 대댓글 생성)
- **External API:** TikTok Research API v2
- **알림:** Discord Webhook
- **테스트:** Vitest
- **패키지 매니저:** pnpm

## 프로젝트 구조

```
MAITOK/
├── src/
│   ├── api/            # Fastify API 라우트
│   ├── tiktok/         # TikTok API 클라이언트
│   ├── ai/             # AI 파이프라인 (감성분석, 대댓글)
│   ├── db/             # SQLite 스키마 + 쿼리
│   ├── poller/         # 댓글 폴링 스케줄러
│   └── notify/         # Discord 알림
├── tests/              # Vitest 테스트
├── docs/               # 프로젝트 문서
├── .mcp.json           # MCP 서버 설정
└── CLAUDE.md           # 이 파일
```

## 핵심 규칙

1. **TikTok 댓글 쓰기 API 없음** — 읽기 전용 (Research API)
2. MVP: 댓글 분석 + AI 초안 → Discord 알림 → 셀러 수동 붙여넣기
3. 테스트 커버리지 70% 이상 유지
4. 한국어/베트남어/영어 다국어 지원 필수
5. Rate limit: Research API 1,000 req/day → 폴링 주기 관리
6. 모든 API 키/토큰은 .env에 저장 (git 무시)

## 관련 문서

- `docs/A001-PRD.md` — 제품 요구사항
- `docs/D001-architecture.md` — 시스템 아키텍처
- `docs/D002-detailed-design.md` — 상세 설계
- `docs/I002-development-plan.md` — 개발 계획
