# Changelog

## [0.1.0] - 2026-02-24

### 초기 프로젝트 구조

- TikTok Research API 클라이언트 (댓글 조회, OAuth 토큰 갱신, Rate Limit 관리)
- Adaptive Comment Poller (영상 나이별 2분/5분/30분 자동 조절)
- AI 파이프라인 (감성분석 + 다국어 대댓글 생성, Claude Sonnet)
- Discord 알림 서비스 (새 댓글 Embed + 일일 요약 통계)
- SQLite 스키마 (comments, replies, seller_config, watched_videos)
- Fastify HTTP 서버 + Health check API
- Vitest 테스트 (3 tests passed: health, notify×2)

### 개발 환경

- 3-Layer 멀티에이전트 아키텍처로 개발
- CLAUDE.md 에이전트 가이드 작성
- 프로젝트 문서 7종 (PRD, 시장분석, 사업전략, 아키텍처, 상세설계, 개발자설정, 개발계획)
