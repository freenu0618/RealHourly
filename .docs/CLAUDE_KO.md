# CLAUDE.md — RealHourly (한국어 버전)

> AI 기반 프리랜서 수익성 분석 대시보드
> "시급 $75라고 생각했는데 실제론 $23? 프리랜서의 숨겨진 손실을 AI가 찾아줍니다"

## 프로젝트 개요

**제품명**: RealHourly (realhourly.ai)
**문제**: 프리랜서 대다수가 플랫폼 수수료(Fiverr 20%, Upwork 0~15%), 세금, 툴 구독료, 비청구 시간(미팅/이메일/수정) 등을 반영한 실질 시급을 모름.
**솔루션**: 자연어 타임로그 → 숨은 비용 분석 → 진짜 시급 계산 → 스코프 크립 감지 → 추가 청구 메시지 자동 생성
**타겟**: 글로벌 프리랜서 (Upwork, Fiverr, 크몽, 숨고 + 독립 프리랜서)

**3대 핵심 기능**:
1. **자연어 타임로그** — 자연어 입력 → AI 파싱 → HITL 확인 → 저장
2. **진짜 시급 계산기** — 비용 차감 시급 + "팩트 폭격" 시각화
3. **스코프 크립 경고** — 규칙 기반 감지 + LLM 청구 메시지 생성 (3가지 톤)

**단계**: P0 해커톤 MVP (데모 가능 수준, 핵심 3화면)

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 15 (App Router) + TypeScript strict |
| 스타일링 | Tailwind CSS + shadcn/ui |
| 다국어 | next-intl (`/[locale]/[feature]` URL prefix, 브라우저 언어 자동 감지) |
| DB | Supabase (PostgreSQL + Auth + RLS) |
| ORM | Drizzle ORM (DB snake_case ↔ API camelCase DTO 변환) |
| 검증 | Zod (폼 + API + LLM 스키마 단일 진실 소스) |
| 폼 | React Hook Form + Zod (shadcn 공식) |
| 차트 | Recharts |
| 상태관리 | zustand (HITL 파싱 드래프트 전용 — 범위 한정) |
| 아이콘 | lucide-react |
| 토스트 | sonner |
| 날짜 | date-fns (`lib/date/index.ts` 래퍼로 통일) |
| 클립보드 | navigator.clipboard 래퍼 (`lib/utils/clipboard.ts`) |
| 임시 ID | nanoid (HITL 드래프트 아이템용) |
| 배포 | Vercel |
| 패키지 매니저 | pnpm |

### LLM 전략 (OpenAI, 티어드)

| 용도 | 모델 | 환경변수 | 상태 |
|------|------|----------|------|
| 타임로그 파싱 (Primary) | gpt-5-mini | `LLM_MODEL_PARSE` | ✅ 정상 동작 |
| 타임로그 파싱 (Fallback) | gpt-5-mini | `LLM_MODEL_PARSE_FALLBACK` | ✅ 정상 동작 |
| 메시지 생성 (기본) | gpt-5-mini | `LLM_MODEL_GENERATE` | ✅ 정상 동작 |
| 메시지 생성 (프리미엄) | gpt-5.2 | `LLM_MODEL_GENERATE_PREMIUM` | 🔲 미사용 (P0) |

> ⚠️ 초기 계획의 `gpt-5-nano`는 Structured Outputs 호환 이슈로 `gpt-5-mini`로 통일.

- 모든 LLM 호출은 **OpenAI Structured Outputs** (`json_schema`, `strict: true`) 사용
- LLM 역할 최소화: 텍스트 구조화만 담당. 검증/매칭/날짜 계산은 서버가 처리.

#### gpt-5 계열 모델 주의사항

| 파라미터 | gpt-4o 계열 | gpt-5 계열 |
|----------|-------------|------------|
| 토큰 제한 | `max_tokens` | `max_completion_tokens` (필수) |
| 온도 | `temperature: 0~2` | 기본값(1)만 지원, 커스텀 불가 |

⚠️ `max_tokens` 사용 시 `400 Unsupported parameter` 에러 발생. 반드시 `max_completion_tokens` 사용.

#### Structured Outputs strict 모드 필수 규칙
- Nullable 필드: `"type": ["string", "null"]` 배열 형식 사용 (OpenAI 공식 권장)
- `additionalProperties: false`: 모든 object에 필수
- 모든 필드는 `required` 배열에 포함 필수 (nullable이어도)
- enum 필드: `"type": "string"` + `"enum": [...]` 형태

## 디렉토리 구조

```
src/
├─ app/
│  ├─ (auth)/
│  ├─ (dashboard)/
│  │  ├─ projects/
│  │  │  ├─ page.tsx                        # 프로젝트 목록
│  │  │  └─ [projectId]/page.tsx            # 프로젝트 상세 (지표 + 차트 + 경고 모달)
│  │  ├─ time-log/page.tsx                  # 자연어 타임로그 입력
│  │  └─ layout.tsx
│  ├─ api/
│  │  ├─ health/route.ts
│  │  ├─ clients/route.ts
│  │  ├─ clients/[clientId]/route.ts
│  │  ├─ projects/route.ts
│  │  ├─ projects/[projectId]/route.ts
│  │  ├─ projects/[projectId]/metrics/route.ts
│  │  ├─ projects/[projectId]/cost-entries/route.ts
│  │  ├─ cost-entries/[costEntryId]/route.ts
│  │  ├─ time/parse/route.ts               # 자연어 파싱 (LLM)
│  │  ├─ time/save/route.ts                # 타임로그 저장 (배치)
│  │  ├─ alerts/[alertId]/dismiss/route.ts
│  │  ├─ messages/generate/route.ts         # 청구 메시지 생성 (LLM)
│  │  └─ messages/[messageId]/copied/route.ts
│  ├─ globals.css
│  └─ middleware.ts                         # next-intl 로케일 라우팅
├─ components/
│  ├─ ui/                                   # shadcn/ui 생성 컴포넌트
│  ├─ time-log/                             # 도메인: NLP 입력 + HITL 카드
│  ├─ projects/                             # 도메인: 프로젝트 카드, 폼
│  ├─ alerts/                               # 도메인: 스코프 경고 모달
│  └─ charts/                               # 도메인: 바 + 파이 차트
├─ lib/
│  ├─ ai/
│  │  ├─ time-log-schema.ts                 # LLM 파싱 스키마 (Zod → JSON Schema)
│  │  └─ message-schema.ts                  # LLM 메시지 생성 스키마
│  ├─ metrics/
│  │  ├─ get-project-metrics.ts             # 진짜 시급 계산
│  │  └─ scope-rules.ts                     # 스코프 크립 규칙 3개
│  ├─ money/
│  │  ├─ currency.ts                        # 로케일별 통화 포매터
│  │  └─ format.ts                          # "팩트 폭격" 포맷 ($50 → $18)
│  ├─ date/index.ts                         # date-fns 래퍼 (단일 진입점)
│  ├─ auth/server.ts                        # getUser(), requireUser()
│  ├─ supabase/
│  │  ├─ server.ts
│  │  └─ client.ts
│  ├─ validators/                           # API 요청 Zod 스키마
│  │  ├─ projects.ts
│  │  ├─ time.ts
│  │  ├─ messages.ts
│  │  ├─ costs.ts
│  │  └─ clients.ts
│  └─ utils/
│     ├─ cn.ts                              # clsx + tailwind-merge
│     ├─ nanoid.ts
│     └─ clipboard.ts
├─ db/
│  ├─ schema/                               # Drizzle 테이블/enum 정의
│  ├─ queries/                              # DB 접근 함수 (도메인별 1파일)
│  └─ index.ts                              # Drizzle 클라이언트 초기화
├─ store/
│  └─ use-draft-store.ts                    # zustand (HITL 전용)
├─ types/index.ts                           # 공유 타입 (최소)
└─ env.ts                                   # 환경변수 검증 (Zod)
```

## 코딩 컨벤션

### 네이밍
- React 컴포넌트: **PascalCase** (`TimeLogInterface.tsx`)
- 훅/스토어: **useXxx** (`useDraftStore.ts`)
- 서버 로직/유틸: **kebab-case** (`get-project-metrics.ts`)
- Zod 스키마: **SomethingSchema** (`CreateProjectSchema`)
- enum 값: **소문자** (`done`, `planned`, `polite`)
- 통화: **대문자 ISO** (`USD`, `KRW`) — 유일한 예외

### Import 별칭
- `@/*` = `src/*`
- 예: `@/lib/metrics/get-project-metrics`, `@/components/ui/button`

### API 스타일
- RESTful CRUD + 액션 엔드포인트 (예: `/api/time/parse`)
- Request/Response JSON: **camelCase**
- DB 컬럼: **snake_case** (Drizzle 스키마)
- DTO 변환 레이어: API 레이어에서 명시적 매핑
- P0: Route Handlers만 사용 (Server Actions 미사용)

### 검증 패턴
```typescript
// 모든 route handler에서:
export async function POST(req: Request) {
  const user = await requireUser();                    // 미인증 시 401
  const body = CreateProjectSchema.parse(await req.json());  // 검증 실패 시 422
  const result = await createProject(user.id, body);
  return NextResponse.json({ data: result }, { status: 201 });
}
```

### 에러 응답 형태
```json
{ "error": { "code": "SOME_CODE", "message": "사람이 읽을 수 있는 메시지", "details": {} } }
```

### 핵심 규칙
1. **Zod = 단일 진실 소스** — 폼, API, LLM 스키마 모두 Zod 기반
2. **서버 전용** — `lib/metrics`, `lib/ai`는 서버 전용. 클라이언트에서 import 금지.
3. **소프트 삭제** — 모든 조회 쿼리 `WHERE deleted_at IS NULL`. `db/queries/*`에서만 SQL 접근.
4. **날짜 래퍼** — 모든 날짜 연산은 `lib/date/index.ts` 경유. 직접 format() 호출 금지.
5. **클립보드 래퍼** — 모든 복사 연산은 `lib/utils/clipboard.ts` 경유.

## DB 스키마 (7개 테이블)

모든 테이블: UUID PK, `created_at`, `updated_at`, `deleted_at` (소프트 삭제).
RLS: 모든 테이블 `auth.uid()` 기준 접근 제한.

### Enum 정의
- `project_currency`: USD, KRW, EUR, GBP, JPY
- `time_category`: planning, design, development, meeting, revision, admin, email, research, other
- `time_intent`: done, planned
- `cost_type`: platform_fee, tax, tool, contractor, misc
- `alert_type`: scope_rule1, scope_rule2, scope_rule3
- `message_tone`: polite, neutral, firm

### 테이블 요약
1. **profiles** — `id` (= auth.users.id), `default_currency`, `timezone` (기본 'Asia/Seoul'), `locale`
2. **clients** — `user_id`, `name`. 유니크: `(user_id, name)`
3. **projects** — `user_id`, `client_id?`, `name`, `aliases[]`, `start_date?`, `expected_hours`, `expected_fee`, `currency`, `platform_fee_rate` (0~1), `tax_rate` (0~1), `progress_percent` (0~100), `is_active`
4. **time_entries** — `project_id`, `date` (DATE), `minutes` (1~1440), `category`, `intent` (기본 done), `task_description`, `source_text?`, `issues[]`
5. **cost_entries** — `project_id`, `date?`, `amount` (≥0), `cost_type`, `notes?`
6. **alerts** — `project_id`, `alert_type`, `triggered_at`, `dismissed_at?`, `metadata` (jsonb). 부분 유니크: `(project_id, alert_type)` WHERE `dismissed_at IS NULL AND deleted_at IS NULL`
7. **generated_messages** — `alert_id`, `tone`, `subject`, `body`, `copied_at?`

## 핵심 로직 참조

### 진짜 시급 계산
```
gross = expected_fee
platform_fee_amount = gross × platform_fee_rate
tax_amount = gross × tax_rate
direct_cost = sum(cost_entries) + platform_fee_amount + tax_amount
net = gross - direct_cost
total_hours = sum(time_entries.minutes WHERE intent='done') / 60
real_hourly = total_hours > 0 ? net / total_hours : null
nominal_hourly = expected_hours > 0 ? gross / expected_hours : null
```

### 스코프 크립 규칙 (getProjectMetrics 내에서 체크)
- **규칙 1**: `(total_hours / expected_hours) >= 0.8 AND progress_percent < 50`
- **규칙 2**: revision 카테고리 시간 >= 전체 시간의 40%
- **규칙 3**: revision time_entries 개수 >= 5개

### UX 핵심 원칙
> 사용자가 반드시 입력해야 하는 건 **시간(minutes)**만. 나머지는 AI가 채우고, 못 채우면 그때만 개입.
> Save 차단 = 프로젝트 미매칭/모호 또는 시간 누락 (60분 프리필 후 사용자 확인).
> 경고만 (저장 허용) = 날짜 모호, 시간 모호, 카테고리 모호, 미래 의도(planned).

## 환경변수
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
OPENAI_API_KEY=
LLM_MODEL_PARSE=gpt-5-mini
LLM_MODEL_PARSE_FALLBACK=gpt-5-mini
LLM_MODEL_GENERATE=gpt-5-mini
LLM_MODEL_GENERATE_PREMIUM=gpt-5.2
```

## 지원 언어
- UI: 한국어 / English (next-intl, 브라우저 자동 감지)
- 자연어 입력: 한국어 / English (LLM 양쪽 처리)
- 통화: KRW, USD, EUR, GBP, JPY (사용자 프로필 설정)
