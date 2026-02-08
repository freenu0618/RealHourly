# RealHourly 배포 화면 상세 가이드

> 최종 업데이트: 2026-02-08
> 버전: P0 Hackathon MVP

---

## 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [구현 완료된 화면](#2-구현-완료된-화면)
3. [화면별 상세 가이드](#3-화면별-상세-가이드)
4. [API 엔드포인트 목록](#4-api-엔드포인트-목록)
5. [AI 연동 현황](#5-ai-연동-현황)
6. [미구현 / Stub 기능](#6-미구현--stub-기능)
7. [최근 수정 이력](#7-최근-수정-이력)

---

## 1. 프로젝트 개요

**RealHourly**는 프리랜서의 실질 시급을 계산해주는 AI 기반 수익성 대시보드입니다.

| 항목 | 내용 |
|------|------|
| 제품명 | RealHourly (realhourly.ai) |
| 핵심 가치 | "계약서엔 시급 7.5만원, 통장엔 2.3만원 — 당신의 진짜 시급을 찾아보세요" |
| 대상 사용자 | 글로벌 프리랜서 (Upwork, Fiverr, 크몽, 숨고 + 독립 프리랜서) |
| 기술 스택 | Next.js 16 + TypeScript + Tailwind + shadcn/ui + Supabase + OpenAI |
| 지원 언어 | 한국어 / 영어 (브라우저 자동 감지) |
| 지원 통화 | KRW, USD, EUR, GBP, JPY |

### 3대 핵심 기능

| # | 기능 | 설명 | 구현 상태 |
|---|------|------|-----------|
| 1 | NLP 타임로그 | 자연어 입력 → AI 파싱 → HITL 확인 → 저장 | 완료 |
| 2 | 실질 시급 계산기 | 숨은 비용 반영 후 실제 시급 시각화 | 완료 |
| 3 | 스코프 크립 알림 | 규칙 기반 감지 + LLM 청구 메시지 생성 (3가지 톤) | 완료 |

---

## 2. 구현 완료된 화면

### 화면 목록 (총 7개 페이지)

| 경로 | 화면명 | 구현 상태 | 설명 |
|------|--------|-----------|------|
| `/login` | 로그인 | 완료 | Supabase 매직링크 인증 |
| `/dashboard` | 대시보드 | 완료 | KPI 요약 + 활성 프로젝트 목록 |
| `/projects` | 프로젝트 목록 | 완료 | 프로젝트 그리드 + 생성 모달 |
| `/projects/[id]` | 프로젝트 상세 | 완료 | 메트릭스 + 차트 + 스코프 알림 |
| `/time-log` | 타임 로그 | 완료 | NLP 입력 + HITL 카드 + 저장 |
| `/clients` | 클라이언트 관리 | Stub | 제목만 표시 |
| `/settings` | 설정 | Stub | 제목만 표시 |

---

## 3. 화면별 상세 가이드

### 3.1 로그인 화면 (`/login`)

**파일**: `src/app/[locale]/(auth)/login/page.tsx`

**사용자 경험**:
1. 이메일 입력 필드가 있는 깔끔한 로그인 카드
2. 이메일 입력 후 "매직 링크 전송" 버튼 클릭
3. "이메일을 확인해주세요" 확인 메시지 표시
4. 이메일의 링크 클릭 시 자동 인증 후 대시보드로 이동

**기능 상세**:
- Supabase OTP(매직링크) 방식 인증
- 로딩 상태 표시 (전송 중 스피너)
- i18n 지원 (한/영 자동 전환)
- 인증된 사용자는 자동으로 대시보드 리다이렉트

---

### 3.2 대시보드 (`/dashboard`)

**파일**: `src/app/[locale]/(dashboard)/dashboard/page.tsx`
**컴포넌트**: `DashboardClient`

**사용자 경험**:
1. 상단 4개 KPI 카드 표시:
   - **총 수익**: 전체 프로젝트 예상 수익 합계
   - **활성 프로젝트 수**: 현재 진행 중인 프로젝트 개수
   - **총 작업 시간**: (추후 구현 예정, 현재 "—" 표시)
   - **평균 시급**: (추후 구현 예정, 현재 "—" 표시)
2. 하단에 활성 프로젝트 카드 그리드
   - 각 카드: 프로젝트명, 클라이언트명, 진행률 프로그레스 바, 예상 수익
   - 카드 클릭 시 프로젝트 상세 페이지로 이동
3. 프로젝트가 없을 경우 빈 상태 CTA ("첫 프로젝트를 만들어보세요")

**UI 상태**:
- 로딩: Skeleton 카드 표시
- 에러: 재시도 버튼 포함 에러 메시지
- 빈 상태: 프로젝트 생성 유도 CTA

---

### 3.3 프로젝트 목록 (`/projects`)

**파일**: `src/app/[locale]/(dashboard)/projects/page.tsx`
**컴포넌트**: `ProjectsListClient`, `ProjectCard`, `CreateProjectDialog`

**사용자 경험**:
1. 상단에 "새 프로젝트" 버튼
2. 프로젝트 카드 그리드 (반응형 레이아웃)
3. 각 프로젝트 카드에 이름, 진행률, 예상 수익 표시
4. 카드 클릭 시 상세 페이지로 이동

**프로젝트 생성 모달 (CreateProjectDialog)**:
- **기본 정보**: 프로젝트명, 예상 수익(금액), 예상 작업시간, 통화 선택
- **플랫폼 수수료 프리셋**: None / Upwork (10%) / Fiverr (20%) / 크몽 (20%) / 커스텀
- **세금 설정**: 세금 적용 여부 토글 + 세율 입력 (기본 3.3%)
- **고정 비용**: 월 고정 비용 금액 + 비용 유형 선택

---

### 3.4 프로젝트 상세 (`/projects/[projectId]`)

**파일**: `src/app/[locale]/(dashboard)/projects/[projectId]/page.tsx`
**컴포넌트**: `ProjectDetailClient`, `HourlyRateBar`, `CostBreakdownPie`, `ScopeAlertModal`

이 화면이 **RealHourly의 핵심 가치**를 보여주는 메인 화면입니다.

**사용자 경험**:

#### A. 상단 KPI 카드 (4개)
| 카드 | 내용 | 설명 |
|------|------|------|
| 계약 시급 (Nominal) | 예: ₩75,000/h | 계약서 기준 시급 = 예상수익 / 예상시간 |
| 실질 시급 (Real) | 예: ₩23,400/h | 모든 비용 차감 후 실제 시급 |
| 총 작업시간 | 예: 42.5h | intent='done'인 시간 합계 |
| 순수익 | 예: ₩995,000 | 총수익 - 플랫폼수수료 - 세금 - 고정비용 |

- 숫자가 카운트업 애니메이션으로 표시 (부드러운 전환 효과)

#### B. 진행률 프로그레스 바
- 전체 진행률 퍼센트 표시
- 색상으로 상태 구분

#### C. 차트 영역 (2개)
1. **수평 막대 차트 (HourlyRateBar)**
   - 계약 시급 vs 실질 시급 비교
   - 시각적 "팩트 폭탄": 차이가 클수록 인상적인 시각화
   - 카운트업 애니메이션 적용

2. **파이 차트 (CostBreakdownPie)**
   - 비용 구성 시각화: 플랫폼 수수료 / 세금 / 고정 비용 / 순수익
   - 각 항목별 금액과 비율 표시
   - Recharts 기반 인터랙티브 차트

#### D. 스코프 크립 알림 시스템
- **알림 배너**: 스코프 크립이 감지되면 화면 상단에 경고 배너 표시
- **알림 모달 (ScopeAlertModal)**: 3단계 플로우
  1. **알림 단계**: 어떤 규칙이 발동했는지 설명 + "메시지 생성" 버튼
  2. **로딩 단계**: AI가 메시지를 생성하는 동안 로딩 표시
  3. **메시지 단계**: 3가지 톤의 청구 메시지 표시
     - **공손한 톤 (Polite)**: 부드러운 상담 요청
     - **중립적 톤 (Neutral)**: 사실 중심 현황 공유
     - **단호한 톤 (Firm)**: 명확한 비용 청구 안내
  - 각 메시지에 "복사" 버튼 → 클립보드 복사 후 토스트 알림
  - "알림 닫기" 버튼 → 해당 알림 비활성화

**스코프 크립 감지 규칙 (3가지)**:
| 규칙 | 조건 | 의미 |
|------|------|------|
| Rule 1 | 작업시간이 예상의 80% 이상 소진 + 진행률 50% 미만 | 시간 대비 진행이 느림 |
| Rule 2 | 수정(revision) 카테고리 시간이 전체의 40% 이상 | 수정 작업 비중이 과도함 |
| Rule 3 | 수정(revision) 시간 기록이 5건 이상 | 잦은 수정 요청 |

---

### 3.5 타임 로그 (`/time-log`)

**파일**: `src/app/[locale]/(dashboard)/time-log/page.tsx`
**컴포넌트**: `TimeLogInterface`, `ChatTextarea`, `QuickChips`, `MagicParseButton`, `DraftCardList`, `DraftCard`, `SaveAllButton`, `ManualEntryForm`

이 화면이 **RealHourly의 핵심 UX**를 구현하는 메인 입력 화면입니다.

**사용자 경험**:

#### A. 자연어 입력 영역
1. **채팅형 텍스트 입력**: 넓은 textarea에 자유롭게 입력
   ```
   예시: "어제 ABC 리브랜딩 기획 2시간, 팀 미팅 30분"
   예시: "Today 2h on XYZ app design revision, emails 20min"
   ```
2. **퀵 칩 (QuickChips)**: 자주 쓰는 단어를 원클릭 삽입
   - 오늘 / 어제 / 미팅 / 개발 / 디자인 / 기획 / 이메일 / 수정
3. **예시 채우기 버튼**: 클릭 시 샘플 텍스트로 자동 채움
4. **AI 파싱 버튼 (MagicParseButton)**: 클릭 시 OpenAI API 호출

#### B. AI 파싱 → HITL 확인 카드
파싱 결과가 편집 가능한 카드 리스트로 표시됩니다:

각 카드에 포함된 필드:
| 필드 | 설명 | 편집 가능 |
|------|------|-----------|
| 프로젝트 | 매칭된 프로젝트 (드롭다운) | O |
| 작업 설명 | AI가 추출한 작업 내용 | O |
| 날짜 | 캘린더 날짜 선택기 | O |
| 소요 시간 | 분 단위 입력 | O |
| 카테고리 | 9가지 중 선택 | O |
| 의도 | 완료(done) / 예정(planned) | O |

#### C. 유효성 검증 배지 시스템
각 카드에 이슈가 있으면 배지로 표시됩니다:

| 배지 색상 | 유형 | 이슈 | 저장 가능? |
|-----------|------|------|------------|
| 빨간색 | 차단(Blocking) | 프로젝트 매칭 실패 | 불가 |
| 빨간색 | 차단(Blocking) | 프로젝트 모호 (2개 이상 매칭) | 불가 |
| 빨간색 | 차단(Blocking) | 소요시간 누락 | 불가 |
| 노란색 | 경고(Warning) | 날짜 모호 | 가능 |
| 노란색 | 경고(Warning) | 소요시간 모호 | 가능 |
| 노란색 | 경고(Warning) | 카테고리 모호 | 가능 |
| 보라색 | 정보(Info) | 미래 의도 (planned) | 가능 |

#### D. 일괄 저장
- **SaveAllButton**: 모든 차단 이슈가 해결되면 활성화
- 차단 이슈 개수 표시 (예: "2개 항목을 수정해주세요")
- 저장 성공 시 토스트 알림 + 카드 초기화

#### E. 수동 입력 폴백
- AI 파싱이 실패하거나 사용자가 원할 경우 폼 기반 수동 입력 가능

---

### 3.6 사이드바 네비게이션

**파일**: `src/components/layout/app-sidebar.tsx`

**구성**:
- 로고 + 앱 이름
- 네비게이션 메뉴:
  - 대시보드 (`/dashboard`)
  - 타임 로그 (`/time-log`)
  - 프로젝트 (`/projects`)
  - 클라이언트 (`/clients`)
  - 설정 (`/settings`)
- 다크 모드 토글 버튼
- 로그아웃 버튼
- 반응형: 모바일에서 시트(Sheet) 형태로 전환

---

## 4. API 엔드포인트 목록

### 프로젝트 관련 (7개)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/projects` | 프로젝트 목록 조회 (?active=true 필터) |
| POST | `/api/projects` | 새 프로젝트 생성 |
| GET | `/api/projects/[id]` | 프로젝트 단건 조회 |
| PUT | `/api/projects/[id]` | 프로젝트 수정 |
| DELETE | `/api/projects/[id]` | 프로젝트 소프트 삭제 |
| GET | `/api/projects/[id]/metrics` | 메트릭스 계산 + 알림 확인 |
| POST | `/api/projects/[id]/cost-entries` | 비용 항목 추가 |

### 타임 트래킹 (2개)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/time/parse` | 자연어 → AI 파싱 (OpenAI Structured Outputs) |
| POST | `/api/time/save` | 파싱된 시간 기록 일괄 저장 |

### 클라이언트 (2개)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/clients` | 클라이언트 목록 조회 |
| POST | `/api/clients` | 새 클라이언트 생성 |

### 알림 & 메시지 (3개)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/alerts/[id]/dismiss` | 스코프 크립 알림 닫기 |
| POST | `/api/messages/generate` | AI 청구 메시지 3종 생성 |
| POST | `/api/messages/[id]/copied` | 메시지 복사 기록 추적 |

### 비용 & 기타 (2개)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| DELETE | `/api/cost-entries/[id]` | 비용 항목 삭제 |
| GET | `/api/health` | 서버 상태 확인 |

---

## 5. AI 연동 현황

### 사용 모델

| 용도 | 모델 | 환경변수 | 상태 |
|------|------|----------|------|
| 타임로그 파싱 (Primary) | gpt-5-mini | `LLM_MODEL_PARSE` | 정상 동작 |
| 타임로그 파싱 (Fallback) | gpt-5-mini | `LLM_MODEL_PARSE_FALLBACK` | 정상 동작 |
| 메시지 생성 | gpt-5-mini | `LLM_MODEL_GENERATE` | 정상 동작 |
| 메시지 생성 (프리미엄) | gpt-5.2 | `LLM_MODEL_GENERATE_PREMIUM` | 미사용 (P0) |

### gpt-5 계열 모델 주의사항

gpt-5 계열 모델은 이전 gpt-4o 계열과 API 파라미터가 다릅니다:

| 파라미터 | gpt-4o 계열 | gpt-5 계열 |
|----------|-------------|------------|
| 토큰 제한 | `max_tokens` | `max_completion_tokens` (필수) |
| 온도 | `temperature: 0~2` | 기본값(1)만 지원, 커스텀 불가 |

### Structured Outputs JSON Schema

타임로그 파싱에 사용되는 스키마:
```json
{
  "name": "time_log_parse",
  "strict": true,
  "schema": {
    "type": "object",
    "properties": {
      "entries": {
        "type": "array",
        "items": {
          "properties": {
            "project_name_raw": { "type": "string" },
            "task_description": { "type": "string" },
            "date": { "type": ["string", "null"] },
            "duration_minutes": { "type": ["integer", "null"] },
            "duration_source": { "enum": ["explicit", "ambiguous", "missing"] },
            "category": { "enum": ["planning", "design", "development", ...] },
            "intent": { "enum": ["done", "planned"] }
          }
        }
      }
    }
  }
}
```

- Nullable 필드는 `type: ["string", "null"]` 배열 형식 사용 (OpenAI 공식 권장 방식)
- `additionalProperties: false` 필수 (strict 모드 요구사항)
- 모든 필드는 `required`에 포함 필수

### 폴백 전략

| 기능 | 폴백 방식 |
|------|-----------|
| 타임로그 파싱 | Primary 모델 실패 → Fallback 모델 재시도 → 에러 전파 (프론트에서 수동 입력 폼 표시) |
| 메시지 생성 | LLM 실패 → 템플릿 기반 정적 메시지 반환 (한국어/영어 자동 감지) |

---

## 6. 미구현 / Stub 기능

### 현재 미구현 항목

| 기능 | 현재 상태 | 우선순위 |
|------|-----------|----------|
| 클라이언트 관리 페이지 | Stub (제목만 표시) | P1 |
| 설정 페이지 | Stub (제목만 표시) | P1 |
| 대시보드 총 작업시간 | "—" 표시 (집계 쿼리 미구현) | P1 |
| 대시보드 평균 시급 | "—" 표시 (집계 쿼리 미구현) | P1 |
| 프로젝트 수정 UI | 수정 다이얼로그 없음 (API는 존재) | P1 |
| 저장된 시간 기록 조회/편집 | UI 없음 (DB에만 저장) | P1 |
| 비용 항목 CRUD UI | 생성 시에만 추가, 이후 관리 불가 | P2 |
| 프로필 설정 | 통화/타임존/언어 변경 불가 | P2 |
| 클라이언트 ↔ 프로젝트 연결 | UI에서 설정 불가 | P2 |

---

## 7. 최근 수정 이력

### 2026-02-08: OpenAI API 호환성 수정

**문제**: `POST /api/time/parse`가 500 Internal Server Error 반환

**근본 원인**: `gpt-5-mini` 모델이 기존 gpt-4o 계열과 다른 API 파라미터를 요구

**수정 내용**:

| 파일 | 변경 사항 |
|------|-----------|
| `src/lib/ai/parse-time-log.ts` | `max_tokens` → `max_completion_tokens`, `temperature: 0.1` 제거, fallback 모델 재시도 로직 추가 |
| `src/lib/ai/generate-messages.ts` | `max_tokens` → `max_completion_tokens`, `temperature: 0.7` 제거 |
| `src/app/api/time/parse/route.ts` | 상세 에러 로깅 추가 (error message, stack trace) |
| `CLAUDE.md` | LLM 모델 정보 및 제약사항 업데이트 |

**검증 결과**:
```json
{
  "entries": [{
    "project_name_raw": "프로젝트A",
    "task_description": "개발",
    "date": "2026-02-08",
    "duration_minutes": 120,
    "duration_source": "explicit",
    "category": "development",
    "intent": "done"
  }]
}
```

---

## 부록: 컴포넌트 구조 요약

### 도메인 컴포넌트 (18개)

```
src/components/
├─ time-log/              # 타임 로그 도메인
│  ├─ TimeLogInterface    # 메인 오케스트레이터
│  ├─ ChatTextarea        # 자연어 입력 영역
│  ├─ QuickChips          # 빠른 삽입 칩
│  ├─ MagicParseButton    # AI 파싱 트리거
│  ├─ DraftCardList       # 파싱 결과 카드 리스트
│  ├─ DraftCard           # 개별 HITL 확인 카드
│  ├─ DatePickerField     # 날짜 선택기
│  ├─ SaveAllButton       # 일괄 저장 버튼
│  └─ ManualEntryForm     # 수동 입력 폴백 폼
├─ projects/              # 프로젝트 도메인
│  ├─ ProjectsListClient  # 프로젝트 목록 페이지
│  ├─ ProjectCard         # 프로젝트 카드
│  ├─ CreateProjectDialog # 프로젝트 생성 모달
│  └─ ProjectDetailClient # 프로젝트 상세 페이지
├─ charts/                # 차트 도메인
│  ├─ HourlyRateBar       # 시급 비교 막대 차트
│  └─ CostBreakdownPie    # 비용 구성 파이 차트
├─ alerts/                # 알림 도메인
│  └─ ScopeAlertModal     # 스코프 크립 알림 모달
├─ dashboard/             # 대시보드 도메인
│  └─ DashboardClient     # 대시보드 메인
└─ layout/                # 레이아웃
   └─ AppSidebar          # 네비게이션 사이드바
```

### shadcn/ui 컴포넌트 (19개)

Badge, Button, Calendar, Card, Dialog, Dropdown Menu, Form, Input, Label, Popover, Select, Separator, Sheet, Sidebar, Skeleton, Sonner, Tabs, Textarea, Tooltip

---

## 부록: DB 스키마 요약

### 7개 테이블

```
profiles ─────── 사용자 설정 (통화, 타임존, 언어)
clients ──────── 클라이언트 관리
projects ─────── 프로젝트 (수수료율, 세율, 진행률)
time_entries ──── 시간 기록 (날짜, 분, 카테고리, 의도)
cost_entries ──── 비용 기록 (플랫폼수수료, 세금, 도구)
alerts ────────── 스코프 크립 알림 (3가지 규칙)
generated_messages ── AI 생성 청구 메시지 (3가지 톤)
```

모든 테이블 공통: UUID PK, `created_at`, `updated_at`, `deleted_at` (소프트 삭제), RLS 적용
