---
title: TikTok Developer 계정 생성 및 앱 등록 매뉴얼
category: Implementation
doc_id: I001
project: MAITOK
created: 2026-02-18
tags: [tiktok, developer, api, setup, 매뉴얼]
---

# I001 - TikTok Developer 계정 생성 매뉴얼

Tikly (MAITOK) 서비스 구축을 위한 TikTok Developer 계정 생성부터 API 접근까지의 단계별 가이드.

---

## 📋 전체 프로세스 요약

```
Step 1: Developer 계정 생성 (5분)
    ↓
Step 2: Organization 생성 (5분)
    ↓
Step 3: 앱 등록 (10분)
    ↓
Step 4: API 제품 추가 (10분)
    ↓
Step 5: Sandbox 테스트 (1~2시간)
    ↓
Step 6: 앱 심사 제출 (대기 1~4주)
    ↓
Step 7: Production 배포
```

**총 예상 소요:** 초기 설정 30분 + 심사 대기 1~4주

---

## Step 1: TikTok Developer 계정 생성

### 1.1 회원가입

1. **[TikTok Developer 포털](https://developers.tiktok.com/signup)** 접속
2. **이메일로 회원가입** (TikTok 앱 계정과 별도)
   - 이메일 주소 입력
   - 비밀번호 설정
   - 이메일 인증 코드 확인
3. 가입 완료 후 **[로그인](https://developers.tiktok.com/login/)**

### 1.2 프로필 설정

1. 우측 상단 프로필 아이콘 클릭
2. **Account Settings** 진입
3. 기본 정보 입력:
   - Display name: `Tikly` (또는 사업자명)
   - Country/Region: `South Korea` 또는 `Vietnam`

> ⚠️ **중요:** Developer 계정은 개인 TikTok 계정과 별개입니다. 별도 이메일 사용을 권장합니다.

---

## Step 2: Organization 생성

Organization은 앱 소유 주체를 나타냅니다. 개인 계정으로도 앱 등록이 가능하지만, **실제 서비스 운영 시 Organization 필수**.

1. [Developer 포털](https://developers.tiktok.com/) 로그인
2. 프로필 → **Organizations** 클릭
3. **Create Organization** 클릭
4. 정보 입력:

| 항목 | 입력값 |
|------|--------|
| Organization Name | `Tikly` (또는 사업자명) |
| Type | `Company` 또는 `Individual Developer` |
| Website | 서비스 URL (없으면 GitHub 페이지) |
| Industry | `Technology` > `Software` |
| Description | TikTok comment analysis and auto-reply service for sellers |

5. **Submit** → 승인 대기 (보통 1~3일)

---

## Step 3: 앱 등록

### 3.1 앱 생성

1. 프로필 → **[Manage Apps](https://developers.tiktok.com/apps)** 클릭
2. **Connect an app** 버튼 클릭
3. App owner 선택: Step 2에서 만든 Organization 선택
4. **Confirm** 클릭

### 3.2 App Details 설정

#### Credentials (자동 생성)
- **Client Key**: 앱 식별자 (공개 가능)
- **Client Secret**: 인증 비밀키 (**절대 공유 금지**)

> 🔐 Client Key와 Secret을 안전한 곳에 저장하세요. 나중에 OpenClaw 스킬 설정에 사용합니다.

#### Basic Information

| 항목 | 입력값 |
|------|--------|
| App icon | 1024x1024px, JPG/PNG, 5MB 이하 |
| App name | `Tikly` |
| Category | `Business Services` |
| Description | AI-powered TikTok comment analysis and smart reply service for TikTok Shop sellers |

#### Platforms

| 플랫폼 | 설정 |
|--------|------|
| Web | ✅ 활성화 |
| Website URL | 서비스 도메인 (MVP: localhost 가능) |
| Redirect URI | `https://localhost:3000/auth/callback` (개발용) |
| Android / iOS | 🔲 비활성화 (MVP 불필요) |

---

## Step 4: API 제품 추가

Tikly에 필요한 API 제품 2개를 추가합니다.

### 4.1 필요 제품 목록

| 제품 | 용도 | 필수 여부 |
|------|------|-----------|
| **Login Kit** | 셀러 TikTok 계정 연동 (OAuth) | ✅ 필수 |
| **Content Posting API** | 영상 정보 조회 + 댓글 관련 | ✅ 필수 |
| **Research API** | 공개 댓글 데이터 조회 | 🔶 선택 (별도 신청) |

### 4.2 Login Kit 추가

1. 앱 페이지 → **Products** 섹션
2. **Add products** 클릭
3. **Login Kit** 선택 → **Add** 클릭
4. 설정:
   - Redirect URI 확인 (Step 3에서 입력한 것)
   - Scopes 추가:
     - `user.info.basic` — 기본 프로필 정보
     - `user.info.profile` — 프로필 상세

### 4.3 Content Posting API 추가

1. **Add products** → **Content Posting API** 선택
2. **Direct Post** 설정 활성화
3. Scopes 추가:
   - `video.list` — 사용자 영상 목록 조회
   - `video.publish` — 영상 게시 (향후 확장용)
   - `comment.list` — 댓글 목록 조회 (**핵심**)
   - `comment.list.manage` — 댓글 관리

> ⚠️ **댓글 작성(reply) API는 현재 공식 미지원.** MVP에서는 댓글 읽기 + AI 분석에 집중합니다.

### 4.4 Research API (선택, 별도 신청)

Research API는 일반 앱 등록과 **별도 프로세스**입니다.

1. **[Research API 신청 페이지](https://developers.tiktok.com/products/research-api/)** 접속
2. **Apply for access** 클릭
3. 신청서 작성:

| 항목 | 입력 가이드 |
|------|------------|
| Research purpose | Commercial — TikTok Shop seller analytics and comment management |
| Organization | Step 2에서 만든 Organization |
| Use case description | "Building an AI-powered comment analysis tool for TikTok Shop sellers to monitor customer sentiment, identify purchase intent, and improve engagement" |
| Data needs | Video comments, user interactions, sentiment patterns |
| Expected data volume | ~1,000 queries/day initially |

4. **Submit** → 승인 대기 **약 4주**

> 💡 Research API는 MVP에 필수가 아닙니다. Login Kit + Content Posting API로 먼저 시작하세요.

---

## Step 5: Sandbox 테스트

**심사 전에 Sandbox에서 먼저 테스트합니다.**

### 5.1 Sandbox 모드 전환

1. 앱 페이지 상단에서 **Sandbox mode** 토글
2. Sandbox에서는 심사 없이 바로 API 테스트 가능
3. 제한: 본인 계정만, 비공개 모드로만 동작

### 5.2 OAuth 테스트

```bash
# 1. 인증 URL 생성
# 브라우저에서 아래 URL 접속 (client_key 교체)
https://www.tiktok.com/v2/auth/authorize/?client_key=YOUR_CLIENT_KEY&scope=user.info.basic,video.list,comment.list&response_type=code&redirect_uri=https://localhost:3000/auth/callback&state=random123

# 2. 사용자 승인 후 redirect_uri로 code 수신
# https://localhost:3000/auth/callback?code=AUTHORIZATION_CODE&state=random123

# 3. Access Token 교환
curl --location 'https://open.tiktokapis.com/v2/oauth/token/' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'client_key=YOUR_CLIENT_KEY' \
  --data-urlencode 'client_secret=YOUR_CLIENT_SECRET' \
  --data-urlencode 'code=AUTHORIZATION_CODE' \
  --data-urlencode 'grant_type=authorization_code' \
  --data-urlencode 'redirect_uri=https://localhost:3000/auth/callback'
```

### 5.3 댓글 조회 테스트

```bash
# 사용자 영상 목록 조회
curl --location 'https://open.tiktokapis.com/v2/video/list/?fields=id,title,create_time,comment_count' \
  --header 'Authorization: Bearer ACCESS_TOKEN'

# 영상 댓글 조회
curl --location 'https://open.tiktokapis.com/v2/comment/list/?fields=id,text,create_time,like_count' \
  --header 'Authorization: Bearer ACCESS_TOKEN' \
  --header 'Content-Type: application/json' \
  --data '{
    "video_id": "VIDEO_ID",
    "max_count": 50,
    "cursor": 0
  }'
```

### 5.4 테스트 체크리스트

- [ ] OAuth 로그인 플로우 정상 동작
- [ ] Access Token 발급 확인
- [ ] 영상 목록 조회 성공
- [ ] 댓글 목록 조회 성공
- [ ] Token 갱신 (refresh) 동작 확인

---

## Step 6: 앱 심사 제출

Sandbox 테스트 완료 후 Production 심사를 제출합니다.

### 6.1 심사 전 체크리스트

- [ ] App icon, name, description 입력 완료
- [ ] 필요한 Products 모두 추가
- [ ] Scopes 최소한으로 설정 (필요한 것만)
- [ ] Redirect URI 올바르게 설정
- [ ] Sandbox 테스트 정상 완료

### 6.2 제출

1. 앱 페이지 → **Production mode** 전환
2. 모든 필수 항목 입력 확인
3. **Submit for review** 클릭

### 6.3 심사 기준

TikTok 심사에서 확인하는 항목:

| 항목 | 설명 |
|------|------|
| 데이터 사용 목적 | 요청한 scope에 맞는 합리적 사용 |
| 사용자 경험 | 명확한 동의 화면, 투명한 데이터 처리 |
| 보안 | HTTPS 사용, 토큰 안전 관리 |
| 정책 준수 | TikTok Developer Terms of Service 준수 |
| 스팸 방지 | 자동화된 대량 행위 금지 |

### 6.4 심사 결과

- **승인:** Production 모드 즉시 활성화
- **반려:** Review comments에서 사유 확인 → 수정 후 재제출
- **소요 시간:** 일반적으로 **1~4주**

> 💡 **심사 팁:** Description에 "seller tool", "commerce", "analytics" 키워드를 포함하면 비즈니스 도구로 인식되어 심사가 수월합니다.

---

## Step 7: Production 배포 후 설정

### 7.1 OpenClaw 스킬에 자격증명 등록

심사 승인 후, OpenClaw 설정에 등록:

```
Client Key: (앱 페이지에서 복사)
Client Secret: (앱 페이지에서 복사)
Redirect URI: (실제 서비스 URL)
```

### 7.2 Rate Limits 확인

| API | Rate Limit |
|-----|-----------|
| OAuth Token | 600/min |
| Video List | 일 ~1,000회 |
| Comment List | 일 ~1,000회 |
| Research API | 일 1,000회 (별도 할당) |

### 7.3 Production 체크리스트

- [ ] Client Key/Secret 안전 저장 (환경변수 또는 시크릿 매니저)
- [ ] Access Token 갱신 로직 구현
- [ ] Rate limit 초과 대비 재시도 로직
- [ ] 에러 핸들링 (401, 429, 500)
- [ ] 사용자 동의 화면 UI 구현

---

## 🔗 참고 링크

| 리소스 | URL |
|--------|-----|
| TikTok Developer 포털 | https://developers.tiktok.com/ |
| 회원가입 | https://developers.tiktok.com/signup |
| 앱 관리 | https://developers.tiktok.com/apps |
| API 문서 | https://developers.tiktok.com/doc/overview |
| Research API 신청 | https://developers.tiktok.com/products/research-api/ |
| Content Posting API 가이드 | https://developers.tiktok.com/doc/content-posting-api-get-started |
| OAuth 토큰 관리 | https://developers.tiktok.com/doc/login-kit-manage-user-access-tokens |
| Scopes 개요 | https://developers.tiktok.com/doc/scopes-overview |
| Developer Terms of Service | https://www.tiktok.com/legal/tik-tok-developer-terms-of-service |

---

## ❓ FAQ

### Q: 개인 계정으로도 앱을 만들 수 있나요?
A: 가능하지만 권장하지 않습니다. Organization으로 등록해야 Production 심사가 수월합니다.

### Q: TikTok 앱 계정이 필요한가요?
A: Developer 계정은 이메일로 별도 생성합니다. 하지만 Sandbox 테스트 시 TikTok 앱 계정이 필요합니다.

### Q: 심사에서 반려되면 어떻게 하나요?
A: 반려 사유를 확인하고 수정 후 재제출합니다. 보통 scope 과다 요청이나 사용 목적 불명확이 주요 반려 사유입니다.

### Q: 댓글 작성(reply) API는 정말 없나요?
A: 현재(2026.02) 공식 댓글 작성 API는 미제공입니다. 읽기만 가능하며, 쓰기는 향후 API 업데이트를 모니터링해야 합니다.

### Q: 비용이 발생하나요?
A: TikTok Developer API는 현재 **무료**입니다. Rate limit 내에서 자유롭게 사용 가능합니다.

---

*Created by MAIBOT on 2026-02-18*
