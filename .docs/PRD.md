# RealHourly — Product Requirements Document (PRD)

> Version: P1 MVP Complete + Timesheet Workflow + Pre-signup Guide
> Last Updated: 2026-02-18
> Phase: P0 Hackathon MVP (Done) → P1 Production-Ready (Current)

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Tech Stack](#2-tech-stack)
3. [Feature 1: NLP Time Log](#3-feature-1-nlp-time-log)
4. [Feature 2: Real Hourly Rate Calculator](#4-feature-2-real-hourly-rate-calculator)
5. [Feature 3: Scope Creep Detection + Billing Messages](#5-feature-3-scope-creep-detection--billing-messages)
6. [Extended Features (F4~F18)](#6-extended-features-f4f18)
7. [Database Schema](#7-database-schema)
8. [API Endpoints](#8-api-endpoints)
9. [Coding Conventions](#9-coding-conventions)
10. [Directory Structure](#10-directory-structure)
11. [Architecture Summary](#11-architecture-summary)
12. [Demo Scenario](#12-demo-scenario)
13. [Seed Data](#13-seed-data)

---

## 1. Product Overview

### 1.1 Problem

전 세계 자영·독립 노동자 15억+ 규모 중 프리랜서 플랫폼 활성 이용자 수천만 명. 대다수가 플랫폼 수수료(Fiverr 20%, Upwork 0~15%), 세금, 툴 구독료, 비청구 시간(미팅/이메일/무한 수정)을 반영한 실질 시급을 파악하지 못함. 기존 도구(Toggl, Harvest 등)는 시간 추적·청구·리포트만 제공하며, 숨은 비용 자동 반영과 스코프 크립 감지, 행동 유도까지 연결하는 솔루션 부재.

### 1.2 Solution

AI 기반 프리랜서 수익성 대시보드:
- 자연어 타임로그 → 숨겨진 비용 반영 → 진짜 시급 계산 → 스코프 크립 감지 → 추가 청구 메시지 자동 생성

### 1.3 Taglines

- **EN**: "Your contract says $75/hr. Your bank account says $23. Find your real rate."
- **KO**: "시급 $75라고 생각했는데 실제론 $23? 프리랜서의 숨겨진 손실을 AI가 찾아줍니다"

### 1.4 Key Differentiators

1. 자연어 → 구조화 입력 (NLP)
2. 숨은 비용·비청구 시간 자동 반영
3. 스코프 크립 실시간 경고 (규칙 기반)
4. 추가 청구 메시지 자동 생성 (LLM)
5. **ROI 증명**: "이 도구로 $500 추가 청구"

### 1.5 Target Users

- 글로벌 프리랜서 (Upwork, Fiverr, 크몽, 숨고 등 플랫폼 + 독립 프리랜서)
- UI: 한국어/English (브라우저 Accept-Language 자동 감지, 수동 전환 가능)
- 통화: KRW, USD, EUR, GBP, JPY (사용자 프로필 설정)

### 1.6 UX Core Principle

> **사용자가 반드시 입력해야 하는 건 minutes만. 나머지는 AI가 채우고, 못 채우면 그때만 개입.**

---

## 2. Tech Stack

### 2.1 Core Stack

| Layer | Tech | Version | Notes |
|-------|------|---------|-------|
| Framework | Next.js (App Router) | 16.1.6 | TypeScript 5.9 strict mode |
| Styling | Tailwind CSS + shadcn/ui | 4.x | Radix 기반, cn() 유틸 자동 포함 |
| i18n | next-intl | 4.8.2 | `/[locale]/[feature]` URL prefix, 브라우저 자동 감지 |
| DB | Supabase | — | PostgreSQL + Auth + RLS |
| ORM | Drizzle ORM | 0.45.1 | snake_case DB ↔ camelCase DTO 변환 |
| Validation | Zod | 4.3.6 | import from `"zod/v4"`. 폼 + API + LLM 스키마 통일 |
| Forms | React Hook Form + Zod | — | shadcn 공식 지원 |
| Charts | Recharts | — | Bar + Pie + Scatter + Donut + Stacked |
| PDF | @react-pdf/renderer | — | Invoice/Estimate generation |
| State | zustand | — | HITL 파싱 드래프트 전용 (범위 한정) |
| Icons | lucide-react | — | shadcn 기본 |
| Toast | sonner | — | shadcn 공식 권장 |
| Date | date-fns | 4.x | `lib/date/index.ts` 래퍼 통일 |
| Clipboard | navigator.clipboard 래퍼 | — | `lib/utils/clipboard.ts` |
| Temp IDs | nanoid | — | HITL 드래프트 아이템용 |
| Animation | framer-motion | 12.x | Viewport-triggered FadeIn, Stagger |
| Deploy | Vercel | — | Next.js 최적화 |
| Package | pnpm | — | 속도 + 디스크 효율 |

### 2.2 LLM Strategy (OpenAI, Tiered)

| 용도 | 모델 | 환경변수 | 상태 |
|------|------|----------|------|
| 타임로그 파싱 (Primary) | gpt-5-mini | `LLM_MODEL_PARSE` | ✅ 정상 동작 |
| 타임로그 파싱 (Fallback) | gpt-5-mini | `LLM_MODEL_PARSE_FALLBACK` | ✅ 정상 동작 |
| 청구 메시지 생성 (기본) | gpt-5-mini | `LLM_MODEL_GENERATE` | ✅ 정상 동작 |
| 청구 메시지 생성 (프리미엄) | gpt-5.2 | `LLM_MODEL_GENERATE_PREMIUM` | 🔲 미사용 |
| 주간 리포트 인사이트 | gpt-5-mini | `LLM_MODEL_GENERATE` | ✅ 정상 동작 |
| 인보이스 라인아이템 생성 | gpt-5-mini | `LLM_MODEL_GENERATE` | ✅ 정상 동작 |
| AI 채팅 어시스턴트 | gpt-5-mini | `LLM_MODEL_GENERATE` | ✅ 정상 동작 |
| AI 컨설턴트 (5가지 역할) | gpt-5-mini | `LLM_MODEL_GENERATE` | ✅ 정상 동작 |
| 일일 브리핑 | gpt-5-mini | `LLM_MODEL_GENERATE` | ✅ 정상 동작 |
| 음성 입력 (Whisper) | whisper-1 | — | ✅ 정상 동작 |

> ⚠️ 초기 계획의 `gpt-5-nano`는 Structured Outputs 호환 이슈로 `gpt-5-mini`로 통일.

**호출 방식**: OpenAI Structured Outputs (`json_schema`, `strict: true`)
**LLM 역할 한정**: 텍스트에서 구조화만 수행. 매칭/검증/날짜 계산은 서버가 담당.

#### gpt-5 계열 모델 주의사항

gpt-5 계열 모델은 이전 gpt-4o 계열과 API 파라미터가 다릅니다:

| 파라미터 | gpt-4o 계열 | gpt-5 계열 |
|----------|-------------|------------|
| 토큰 제한 | `max_tokens` | `max_completion_tokens` (필수) |
| 온도 | `temperature: 0~2` | 기본값(1)만 지원, 커스텀 불가 |

⚠️ `max_tokens`를 사용하면 `400 Unsupported parameter` 에러 발생. 반드시 `max_completion_tokens` 사용.

#### Structured Outputs strict 모드 필수 규칙

- **Nullable 필드**: `"type": ["string", "null"]` 배열 형식 사용 (OpenAI 공식 권장)
- **`additionalProperties: false`**: strict 모드에서 필수 — 모든 object에 명시
- **`required`**: 모든 필드를 required에 포함 필수 (nullable이어도 required에 포함)
- **enum 필드**: `"type": "string"` + `"enum": [...]` 형태로 명시

### 2.3 Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
OPENAI_API_KEY=
NEXT_PUBLIC_SITE_URL=https://real-hourly.com
LLM_MODEL_PARSE=gpt-5-mini
LLM_MODEL_PARSE_FALLBACK=gpt-5-mini
LLM_MODEL_GENERATE=gpt-5-mini
LLM_MODEL_GENERATE_PREMIUM=gpt-5.2
```

---

## 3. Feature 1: NLP Time Log

> **Status: Done** — 15 components, 11 AI modules, zustand store

### 3.1 Implementation Status

| Sub-feature | Status | Notes |
|-------------|--------|-------|
| Chat-style text input | Done | Multi-line, bilingual (EN/KO) |
| AI parsing (OpenAI Structured Outputs) | Done | gpt-5-mini with fallback |
| HITL draft card system | Done | Editable fields: project, date, duration, category, intent |
| Blocking vs warning issue system | Done | 3 blocking, 4 warning issue types |
| Fuzzy project matching | Done | Levenshtein distance + alias matching |
| Manual entry form | Done | Fallback for when AI fails |
| Quick chips (shortcuts) | Done | Category/duration presets |
| Voice input (Whisper) | Done | Audio recording + transcription + parse |
| Batch save | Done | Save all valid drafts at once |
| Progress hint detection | Done | Auto-detects "50% done" in input |
| Step-by-step AI loading UI | Done | Shows parsing progress visually |
| ThinkingLog (AI reasoning display) | Done | Real-time LLM thought process |
| Category emoji consistency | Done | Shared `category-emoji.ts` utility |

**Files**: `components/time-log/` (15 files), `lib/ai/` (11 files), `store/use-draft-store.ts`

### 3.2 Input UI Layout (top → bottom)

**A) Preferred Project (옵션)**
- 라벨: "(선택) 주로 작업한 프로젝트"
- 역할: LLM에게 힌트로만 전달 (`preferred_project_id`)
- 선택해도 entry별 프로젝트는 따로 매칭됨 (멀티 프로젝트 입력 유지)

**B) Chat-style Textarea**
- placeholder (KO): "예: 어제 ABC 리브랜딩 기획 2시간, 미팅 30분, 이메일 20분"
- placeholder (EN): "e.g., Yesterday ABC rebrand planning 2h, meeting 30m, emails 20m"
- Enter = 줄바꿈, Ctrl/Cmd + Enter = Parse 실행

**C) Quick Chips (텍스트 삽입 버튼)**
- 오늘, 어제, 미팅, 이메일, 수정, 리서치
- 클릭 시 커서 위치에 토큰 삽입

**D) Primary CTA: Magic Parse**
- 버튼 텍스트: "Magic Parse"
- 아이콘: Sparkles (lucide)
- 로딩: Textarea/버튼 disabled + Skeleton + "AI가 타임로그를 분석 중…"

**E) "예시 채우기" 버튼 2개**
- 클릭하면 Textarea에 샘플 문장 삽입 (데모 안정)

**F) HITL Draft Cards → Save All**

### 3.3 Categories (9개)

`planning`, `design`, `development`, `meeting`, `revision`, `admin`, `email`, `research`, `other`

### 3.4 LLM Output Schema (A-1: Raw)

```typescript
interface LLMParseResponse {
  entries: LLMEntry[];
}

interface LLMEntry {
  project_name_raw: string;                    // 사용자가 쓴 표현 그대로
  task_description: string;                    // "기획서 작성", "로고 피드백"
  date: string | null;                         // "YYYY-MM-DD" | null
  duration_minutes: number | null;             // 1~1440 | null
  duration_source: "explicit" | "ambiguous" | "missing"; // 서버 판별용 메타
  category: Category;                          // 9개 enum
  intent: "done" | "planned";                  // 기본 done, 미래만 planned
}
```

#### OpenAI Structured Outputs JSON Schema

실제 OpenAI API에 전달하는 `response_format` 스키마:

```json
{
  "name": "time_log_parse",
  "strict": true,
  "schema": {
    "type": "object",
    "required": ["entries"],
    "additionalProperties": false,
    "properties": {
      "entries": {
        "type": "array",
        "items": {
          "type": "object",
          "required": ["project_name_raw", "task_description", "date", "duration_minutes", "duration_source", "category", "intent"],
          "additionalProperties": false,
          "properties": {
            "project_name_raw": { "type": "string" },
            "task_description": { "type": "string" },
            "date": { "type": ["string", "null"] },
            "duration_minutes": { "type": ["integer", "null"] },
            "duration_source": { "type": "string", "enum": ["explicit", "ambiguous", "missing"] },
            "category": { "type": "string", "enum": ["planning", "design", "development", "meeting", "revision", "admin", "email", "research", "other"] },
            "intent": { "type": "string", "enum": ["done", "planned"] }
          }
        }
      }
    }
  }
}
```

**LLM date 규칙**:
- 명확하면 "YYYY-MM-DD"
- 상대 표현(오늘/어제/today/yesterday) 허용
- 애매하면 `null`
- 미래 표현(내일/tomorrow) → date 채우되 `intent=planned`

### 3.5 Server Normalization (A-2: HITL에 전달)

```typescript
interface ParsedResponse {
  entries: ParsedEntry[];
  parse_summary: { total: number; blocking: number; };
}

interface ParsedEntry {
  id: string;                                  // nanoid
  project_name_raw: string;                    // LLM 원본
  matched_project_id: string | null;           // 서버 fuzzy match
  match_source: "alias" | "name" | "client" | "none";
  task_description: string;
  date: string;                                // YYYY-MM-DD (null → 오늘)
  duration_minutes: number | null;             // null이면 DURATION_MISSING
  category: Category;
  intent: "done" | "planned";
  issues: IssueCode[];
  needs_user_action: boolean;                  // blocking issue >= 1
  clarification_question: string | null;       // UI 고정 문구
}

type MatchSource = "alias" | "name" | "client" | "none";
```

### 3.6 Issue Codes

**Blocking (빨간 강조, Save 비활성)**:

| Code | Condition | HITL Action |
|------|-----------|-------------|
| `PROJECT_UNMATCHED` | 매칭 프로젝트 없음 | 프로젝트 드롭다운 선택 필수 |
| `PROJECT_AMBIGUOUS` | 후보 2개 이상 | 올바른 프로젝트 선택 필수 |
| `DURATION_MISSING` | `duration_source=missing` | 60분 프리필 + 사용자 확인/수정 필수 |

**Warning (경고 배지만, 저장 가능)**:

| Code | Condition | HITL Display |
|------|-----------|-------------|
| `DATE_AMBIGUOUS` | date가 null이었음 → 오늘로 채움 | "날짜 추정됨: 오늘" 배지 + DatePicker 제공 |
| `DURATION_AMBIGUOUS` | `duration_source=ambiguous` → 60분 채움 | "시간 추정됨: 60분" 배지 |
| `CATEGORY_AMBIGUOUS` | LLM 카테고리 불확실 | 배지만, LLM 선택 유지 |
| `FUTURE_INTENT` | `intent=planned` | "예정" 배지 + "완료로 전환" 버튼 |

### 3.7 Server Normalization Rules

| Field | LLM Output | Server Processing |
|-------|-----------|-------------------|
| `date` | `null` | → 오늘(유저 TZ) + `DATE_AMBIGUOUS` |
| `date` | valid YYYY-MM-DD | → 그대로 사용 |
| `duration_minutes` | `null` + source=missing | → 60 프리필 + `DURATION_MISSING` (blocking) |
| `duration_minutes` | value + source=ambiguous | → 60 기본값 + `DURATION_AMBIGUOUS` (warning) |
| `intent` | `"planned"` | → `FUTURE_INTENT` 추가 |
| `project_name_raw` | text | → active projects fuzzy match → `matched_project_id` |
| match fail | — | → `PROJECT_UNMATCHED` (blocking) |
| match 2+ candidates | — | → `PROJECT_AMBIGUOUS` + clarification_question |

**Date handling**:
- 저장 단위: 로컬 날짜 `YYYY-MM-DD` (DATE 타입)
- 타임존: 유저 프로필 `timezone` 기준 (기본: `Asia/Seoul`)
- 지원: 오늘/어제/그제, today/yesterday, YYYY-MM-DD, MM/DD
- 미지원: "지난주 내내", "주말에" → `DATE_AMBIGUOUS`

**Project matching**:
- LLM 컨텍스트에 active projects 제공 (30개 초과 시 최근 사용 상위 20개 + preferred project 힌트)
- Aliases: 프로젝트 생성 시 사용자 직접 입력 (쉼표 구분)

### 3.8 HITL UI Behavior

**Card states**:
- 🟢 정상: issues 없음, 모든 필드 pre-filled
- 🔴 Blocking: 빨간 테두리, clarification_question 표시, 필수 입력
- 🟡 Warning: 노란 배지, 수정 가능하지만 필수 아님
- 🟣 Planned: "예정" 배지 + "완료로 전환" 버튼

**Editable fields per card**:

| Field | Component | Default |
|-------|-----------|---------|
| 프로젝트 | Select (active projects) | matched or empty |
| 태스크 | Text input | LLM value |
| 날짜 | DatePicker | normalized date |
| 시간(분) | Number input (1~1440) | LLM value or 60 |
| 카테고리 | Select (9개) | LLM value |
| intent | 완료/예정 토글 | LLM value |

**Save All condition**:
```typescript
const canSaveAll = entries.every(entry => {
  const hasProject = entry.matched_project_id !== null;
  const hasDuration = entry.duration_minutes !== null
                      && entry.duration_minutes >= 1
                      && entry.duration_minutes <= 1440;
  return hasProject && hasDuration;
});
```

### 3.9 Fallback

- LLM 파싱 실패 시: 즉시 수동 입력 폼으로 전환 (재시도 없음)
- 수동 폼: 프로젝트 선택 + 날짜 + 시간 + 카테고리 + 태스크 설명

---

## 4. Feature 2: Real Hourly Rate Calculator

> **Status: Done** — Metrics engine, charts, currency formatting

### 4.1 Calculation Logic

```typescript
function getProjectMetrics(project, sumMinutesDone, sumFixedCosts) {
  const gross = project.expected_fee;
  const platform_fee_amount = gross * project.platform_fee_rate;
  const tax_amount = gross * project.tax_rate;
  const direct_cost_fixed = sumFixedCosts;
  const direct_cost = direct_cost_fixed + platform_fee_amount + tax_amount;
  const net = gross - direct_cost;
  const total_hours = sumMinutesDone / 60;

  const nominal_hourly = project.expected_hours > 0
    ? gross / project.expected_hours
    : null;
  const real_hourly = total_hours > 0
    ? net / total_hours
    : null;

  const cost_breakdown = [
    { type: 'platform_fee', amount: platform_fee_amount },
    { type: 'tax', amount: tax_amount },
    { type: 'fixed', amount: direct_cost_fixed },
  ];

  return { gross, net, total_hours, nominal_hourly, real_hourly, cost_breakdown };
}
```

### 4.2 Cost Input UX

**Project creation (Preset)**:
- Platform fee: Select → None(0%) | Upwork(10%) | Fiverr(20%) | 크몽(20%) | Custom(% input)
- Tax: Toggle + % input (기본 3.3%)
- Fixed cost (옵션): amount input 1개 → cost_entries에 1 row 생성

**Project detail (Edit)**:
- `platform_fee_rate`, `tax_rate` 인라인 수정
- cost_entries CRUD: add/edit/delete (tool/contractor/misc + notes)
- 수정 직후 metrics 재계산 (이벤트 기반)

**Percent costs storage**:
- `projects.platform_fee_rate` (0~1), `projects.tax_rate` (0~1)
- 퍼센트 비용은 cost_entries로 저장하지 않음 (계산 시 동적 반영)

### 4.3 Visualization

**A) Bar Chart**: 명목 시급 vs 실제 시급
- 색상: 명목(blue), 실제(red) — 팩트 폭격 대비
- "팩트 폭격 문구": 통화별 포매터 + 정수/소수1자리 반올림 → "$50 → $18" / "₩70,000 → ₩23,000"

**B) Pie Chart**: 비용 분해
- platform_fee_amount, tax_amount, fixed_cost
- "왜 낮은지" 설명용

### 4.4 Edge Cases

| Case | Handling |
|------|----------|
| `total_hours == 0` | `real_hourly = null`, UI: "시간 로그가 없어서 계산할 수 없음" + CTA "타임로그 입력하기" |
| `expected_hours == 0` | `nominal_hourly = null` |
| `net < 0` | 음수 시급 표시 (적자 프로젝트) → "⚠️ 적자" 배지 |

---

## 5. Feature 3: Scope Creep Detection + Billing Messages

> **Status: Done** — 3 detection rules, 3-tone LLM messages, alert lifecycle

### 5.1 Detection Rules (checked in `getProjectMetrics`)

| Rule | Condition | Meaning |
|------|-----------|---------|
| `scope_rule1` | `(total_hours / expected_hours) >= 0.8 AND progress_percent < 50` | 시간 소진 대비 진척 부족 |
| `scope_rule2` | revision category time >= 40% of total time | 수정 작업 과다 |
| `scope_rule3` | revision time_entries count >= 5 | 수정 이벤트 빈발 |

### 5.2 Alert Lifecycle

```
getProjectMetrics 실행
  → 규칙 체크
  → 새 규칙 위반 감지 (기존 미해결 alert 없는 경우만)
  → alerts 테이블 INSERT (metadata에 근거 수치 스냅샷)
  → metrics 응답에 pendingAlert 포함

프로젝트 상세 진입
  → GET /api/projects/:id/metrics
  → pendingAlert 존재 → 모달 자동 표시
  → 모달: 위험 이유 + 근거 수치 + "청구 메시지 생성" 버튼

"청구 메시지 생성" 클릭
  → POST /api/messages/generate
  → LLM 1회 호출 → 3개 톤 생성 (polite/neutral/firm)
  → 같은 모달 내 탭 전환
  → 각 탭: subject + body + 복사 버튼

복사
  → clipboard wrapper
  → POST /api/messages/:id/copied (copied_at 기록)
  → success toast

모달 닫기
  → POST /api/alerts/:id/dismiss (dismissed_at 기록)
  → 다시 안 뜸
```

### 5.3 Message Generation (LLM)

**Input context**:
```json
{
  "client_name": "...",
  "project_name": "...",
  "expected_fee": 2000,
  "expected_hours": 40,
  "total_hours": 85,
  "progress_percent": 40,
  "triggered_rules": ["scope_rule1"],
  "suggested_options": ["추가 비용", "일정 연장", "범위 조정"]
}
```

**Output schema (JSON strict)**:
```json
{
  "messages": [
    { "tone": "polite", "subject": "...", "body": "..." },
    { "tone": "neutral", "subject": "...", "body": "..." },
    { "tone": "firm", "subject": "...", "body": "..." }
  ]
}
```

**Storage**: generated_messages 테이블에 3 rows 저장 (alert_id로 연결)

---

## 6. Extended Features (F4~F18)

### F4. Dashboard — Done (MagicUI Enhanced)

Overview of all freelancer activity.

| Sub-feature | Status | Notes |
|-------------|--------|-------|
| KPI cards (revenue, hours, rate, projects) | Done | NumberTicker + MagicCard hover + click drill-down |
| Weekly hours bar chart | Done | Today's bar highlighted |
| Recent time entries | Done | Last 5 entries with details + FadeIn |
| Active alert banners | Done | Direct navigation to project |
| Time-of-day greeting | Done | Morning/afternoon/evening/night |
| Empty state | Done | Onboarding guidance |
| Daily briefing card | Done | BorderBeam border + ShimmerButton CTA |
| Profitability card | Done | Real vs nominal rate visualization |

**Files**: `components/dashboard/` (7 files), `db/queries/dashboard.ts`

### F5. Project Management — Done

CRUD + lifecycle management for projects.

| Sub-feature | Status | Notes |
|-------------|--------|-------|
| Create project (name, fee, hours, currency) | Done | With platform fee preset |
| Client name (auto-resolve) | Done | Find existing or create new |
| Project aliases (AI matching) | Done | Comma-separated input |
| Edit project dialog | Done | All fields editable |
| Delete project (soft delete) | Done | Confirmation dialog |
| Status management | Done | Active/completed/paused/cancelled |
| Status dropdown | Done | DropdownMenu component |
| Status banner (top of detail) | Done | Color-coded by status |
| Complete project flow | Done | Summary dialog → set completed |
| Progress tracking (slider) | Done | 0-100% with step 5 |
| Progress update after save | Done | Modal after time log save |
| Project list tab filter | Done | All/active/completed/paused |
| Cost entries CRUD | Done | Add/edit/delete on detail page |
| Invoice/estimate PDF generation | Done | AI-generated line items + PDF |

**Files**: `components/projects/` (14 files), `lib/pdf/`

### F6. Time Log History — Done

Calendar and list view of past entries.

| Sub-feature | Status | Notes |
|-------------|--------|-------|
| Calendar heatmap view | Done | Monthly grid with minute counts |
| Today highlight badge | Done | Primary color pill |
| List view (grouped by date) | Done | With total hours per day |
| Inline edit | Done | Task, duration, category |
| Delete with confirmation | Done | Browser confirm dialog |
| Filter by project | Done | Dropdown filter |
| Filter by category | Done | Dropdown filter |
| Summary statistics | Done | Total entries, hours, avg/day |

**Files**: `components/time-log/HistoryClient.tsx`, `components/time-log/CalendarView.tsx`, `components/time-log/HistoryList.tsx`

### F7. Analytics — Done

Multi-project comparison and insights.

| Sub-feature | Status | Notes |
|-------------|--------|-------|
| Hourly rate ranking chart | Done | Bar chart comparing projects |
| Category stacked bar | Done | Time distribution per project |
| Revenue vs time scatter plot | Done | With project name labels |
| Client summary cards | Done | KPI per client |
| AI insight cards | Done | Best rate, worst rate, etc. |

**Files**: `components/analytics/` (6 files), `db/queries/analytics.ts`

### F8. Weekly Reports — Done

Auto-generated weekly summaries.

| Sub-feature | Status | Notes |
|-------------|--------|-------|
| Report list (8 weeks + show more) | Done | Expandable to 20 weeks |
| Generate report on demand | Done | Collects weekly data |
| Daily hours bar chart | Done | Per-day breakdown |
| Project time donut chart | Done | 10 distinct colors |
| Category breakdown bar | Done | Hours by category |
| AI-generated insights | Done | LLM weekly analysis |
| Report detail page | Done | Full weekly summary view |

**Files**: `components/reports/` (5 files), `lib/reports/`, `lib/ai/generate-weekly-insight.ts`

### F9. Authentication — Done

Supabase-based auth with Google OAuth.

| Sub-feature | Status | Notes |
|-------------|--------|-------|
| Email/password signup | Done | With validation |
| Email/password login | Done | Error handling |
| Google OAuth | Done | One-click sign in |
| Password reset flow | Done | Email → reset page |
| Email verification | Done | Verification page |
| Auto profile creation | Done | On first login |
| Protected route middleware | Done | Redirect to login |
| Logout | Done | POST route handler |

**Files**: `app/[locale]/(auth)/`, `lib/auth/`, `middleware.ts`

### F10. Settings — Done

User preferences and account management.

| Sub-feature | Status | Notes |
|-------------|--------|-------|
| Profile section (name, email) | Done | Display name editable |
| Preferences (currency, timezone, locale) | Done | All configurable |
| Account section (password, logout) | Done | Password change form |
| Data export (CSV) | Done | All time entries |
| OG image generation | Done | Dynamic social previews |

**Files**: `components/settings/` (5 files), `api/settings/`

### F11. Marketing Landing — Done (MagicUI Redesign)

Public-facing landing page redesigned with MagicUI components.

| Sub-feature | Status | Notes |
|-------------|--------|-------|
| Hero section | Done | NumberTicker stats + ShimmerButton CTA |
| Feature showcase | Done | BentoGrid + MagicCard hover spotlight |
| Product demo | Done | Safari mockup, locale+theme-aware screenshots |
| Social proof | Done | Marquee infinite scroll testimonials |
| Empathy/pain-point section | Done | Loss framing with warning icons |
| How-it-works steps | Done | 5-step visual guide |
| Before/after comparison | Done | BorderBeam animated border |
| Use case section | Done | Different freelancer types |
| Stats counter (animated) | Done | NumberTicker count-up |
| Interactive calculator | Done | Real-time hourly rate calculator |
| Pricing section | Done | ShimmerButton + Polar checkout |
| FAQ accordion | Done | Expandable questions |
| CTA section | Done | PulsatingButton call-to-action |
| Navigation bar (lang toggle) | Done | With login button |
| Footer | Done | Links + branding |

**MagicUI Components Used**: NumberTicker, BorderBeam, ShimmerButton, PulsatingButton, Marquee, DotPattern, Safari, MagicCard, BentoGrid, AnimatedShinyText

**Files**: `components/landing/` (15 files), `app/[locale]/(marketing)/`

### F12. i18n — Done

Bilingual support throughout.

| Sub-feature | Status | Notes |
|-------------|--------|-------|
| Korean translations | Done | ~400+ keys |
| English translations | Done | ~400+ keys |
| Browser auto-detect | Done | Via next-intl middleware |
| Locale URL prefix (/ko, /en) | Done | |
| NLP input (both languages) | Done | LLM handles both |
| Generated messages (user lang) | Done | Language selection |

**Files**: `messages/ko.json`, `messages/en.json`, `i18n/`

### F13. Design System — Done

Consistent visual language.

| Sub-feature | Status | Notes |
|-------------|--------|-------|
| Ghibli-Warm theme | Done | CSS custom properties |
| Dark mode support | Done | System preference aware |
| shadcn/ui components (24) | Done | Button, Card, Dialog, etc. |
| Collapsible sidebar | Done | shadcn Sidebar component |
| Loading skeletons | Done | Throughout app |
| Toast notifications (sonner) | Done | Success/error feedback |
| Responsive layout | Done | Mobile-friendly |

### F14. AI Chat Assistant — Done

Conversational AI assistant available across all dashboard pages.

| Sub-feature | Status | Notes |
|-------------|--------|-------|
| Floating chat button (bottom-right) | Done | Fixed position, z-40 |
| Slide-in chat panel (400px desktop, full mobile) | Done | Custom fixed panel with animation |
| Full user context injection | Done | Projects, metrics, alerts, recent entries via Promise.all |
| LLM conversational response | Done | Free-text, 3-5 sentences, Korean/English |
| Quick action chips | Done | 5 presets: week summary, profit compare, scope risks, next action, billing msg |
| Conversation history (session-only) | Done | Last 10 pairs, no DB persistence |
| Rate limiting (15/min) | Done | In-memory sliding window |
| Typing indicator | Done | Animated dots during API call |
| Keyboard support | Done | Enter to send, Escape to close |
| Mobile responsive | Done | Full-width panel on mobile |

**API**: `POST /api/ai/chat`
**Components**: `src/components/chat/` (5 files)
**Backend**: `src/lib/ai/chat-context.ts`, `chat-prompt.ts`, `generate-chat-response.ts`

### F15. AI Consultant Page — Done

Dedicated full-page AI chat with 5 specialist roles.

| Sub-feature | Status | Notes |
|-------------|--------|-------|
| Role selection (5 specialists) | Done | Data analyst, business advisor, career guide, time coach, financial consultant |
| Full-page chat interface | Done | `/chat` route in dashboard |
| localStorage conversation persistence | Done | Auto-save across sessions |
| Conversation sidebar (recent 20) | Done | Switch between conversations |
| Markdown rendering | Done | Formatted AI responses |
| Code block copy button | Done | Clipboard integration |
| Quick action presets | Done | Role-specific suggestions |

**Files**: `src/components/chat/AIChatInterface.tsx`, `src/app/[locale]/(dashboard)/chat/page.tsx`

### F16. Payment & Subscription — Done

Polar-based payment integration with Free/Pro plans.

| Sub-feature | Status | Notes |
|-------------|--------|-------|
| Polar checkout integration | Done | Redirect to Polar checkout |
| Webhook handler (subscription lifecycle) | Done | Create/update/cancel events |
| Free plan limits enforced | Done | All 10 API endpoints gated |
| Pro plan ($9/mo, $7/mo yearly) | Done | Unlimited everything |
| Monthly usage tracking | Done | usage_counts table with UPSERT |
| Feature gate helpers | Done | requireFeature, checkQuota, trackUsage |
| Subscription status page | Done | `/api/subscription` endpoint |
| Pricing landing section | Done | ShimmerButton checkout CTA |

**Feature Limits (Free)**:
- 2 projects, 20 NLP parse/mo, 10 AI chat/mo, 1 scope alert project
- No PDF invoice, share links, weekly insight, daily briefing, CSV export, voice input

**Files**: `src/lib/polar/`, `src/app/api/polar/`, `src/app/api/subscription/`, `src/db/schema/usage-counts.ts`

### F17. Timesheet Approval Workflow — Done

업계 표준 타임시트 승인 워크플로우. 프리랜서가 주간 타임시트를 생성/제출하면, 클라이언트가 매직 링크로 리뷰하고 승인/거절.

| Sub-feature | Status | Notes |
|-------------|--------|-------|
| Timesheet CRUD (create/list/detail) | Done | 주간 단위 (월~일), 프로젝트별 |
| Draft → Submitted workflow | Done | 매직 링크 토큰 자동 생성 |
| Client review page (PUBLIC) | Done | `/timesheet-review/[token]` 인증 불필요 |
| Approve/Reject + note | Done | 토큰 기반, 상태 전이 + 코멘트 |
| Entry locking on approval | Done | 승인 시 `locked_at` 설정, 편집/삭제 차단 (403) |
| Audit trail (time_entry_versions) | Done | create/update/delete 자동 기록 |
| Anomaly flags (entry_flags) | Done | weekend, long_session, backdated, round_number |
| Flag display in review | Done | 클라이언트에게 플래그 표시 |
| Flag dismiss | Done | 프리랜서가 해제 가능 |
| Sidebar navigation | Done | ClipboardCheck 아이콘 |
| i18n (ko/en) | Done | ~40 키 |

**워크플로우**:
```
프리랜서: 시간 기록 → 주간 타임시트 생성 → 제출 (매직 링크 생성)
클라이언트: 매직 링크 → 타임시트 리뷰 (플래그 표시) → 승인/거절 + 코멘트
승인 시: entries locked_at 설정 → 편집/삭제 불가
거절 시: 프리랜서 알림, entries 수정 가능 유지
```

**비정상 패턴 플래그 (차단 아님, 리뷰 시 표시)**:
- `weekend_work` — 토/일 기록 (info)
- `long_session` — 480분(8시간) 이상 단일 항목 (warning)
- `backdated` — 7일 이상 과거 날짜 기록 (warning)
- `round_number` — 연속 5개 이상 정확히 60분/120분 (info)

**Files**: `src/components/timesheets/` (5 files), `src/db/queries/timesheets.ts`, `src/db/queries/time-entry-versions.ts`, `src/db/queries/entry-flags.ts`, `src/lib/metrics/entry-flags.ts`, `src/lib/validators/timesheet-schema.ts`, `src/app/api/timesheets/`, `src/app/timesheet-review/`

### F18. Pre-signup Guide & Calculator — Done

회원가입 전 방문자에게 서비스 가치를 체험시키는 PLG(Product-Led Growth) 전략 페이지. 인증 없이 접근 가능.

| Sub-feature | Status | Notes |
|-------------|--------|-------|
| Public feature guide page (`/features`) | Done | 7개 기능 딥다이브, GuideSection/GuideNav 재사용 |
| Public rate calculator (`/calculator`) | Done | 비청구 시간 포함 확장 계산기, 비용 분석 시각화 |
| Middleware PUBLIC_PATHS 추가 | Done | `/features`, `/calculator` 인증 우회 |
| LandingNav 가이드/계산기 링크 | Done | 데스크톱 + 모바일 메뉴 |
| LandingFooter 가이드/계산기 링크 | Done | "제품" 섹션에 추가 |
| FeatureSection 카드 클릭 링크 | Done | 각 카드 → `/features#section-id` |
| i18n (ko/en) | Done | `featuresPage.*`, `calculatorPage.*`, nav/footer 키 |

**구현 의도**:
- 기존 `/guide` 페이지는 인증 필요 (대시보드 내). 잠재 고객은 기능을 미리 볼 수 없었음.
- `/features` 페이지: 기존 GuideSection/GuideNav 컴포넌트 재사용, CTA만 `/login`으로 변경
- `/calculator` 페이지: 랜딩 InteractiveCalcSection 확장. 비청구 시간(미팅, 이메일, 수정 작업) 입력 추가로 "숨은 비용" 임팩트 강조
- FeatureSection 카드 → `/features#section-id` 딥링크로 전환 퍼널 강화

**Files**: `src/app/[locale]/(marketing)/features/page.tsx`, `src/app/[locale]/(marketing)/calculator/page.tsx`, `src/components/landing/PublicGuideContent.tsx`, `src/components/landing/FullCalculator.tsx`, `src/components/landing/LandingNav.tsx`, `src/components/landing/LandingFooter.tsx`, `src/components/landing/FeatureSection.tsx`

---

## 7. Database Schema

### 7.1 Common Conventions

- **PK**: UUID (`gen_random_uuid()`)
- **Timestamps**: `created_at timestamptz DEFAULT now()`, `updated_at timestamptz DEFAULT now()`
- **Soft delete**: `deleted_at timestamptz` (all tables)
- **RLS**: All tables scoped to `auth.uid()`
- **Enum values**: lowercase (exception: currency = UPPERCASE ISO)

### 7.2 Enums (8개)

```sql
CREATE TYPE project_currency AS ENUM ('USD', 'KRW', 'EUR', 'GBP', 'JPY');
CREATE TYPE project_status AS ENUM ('active', 'completed', 'paused', 'cancelled');
CREATE TYPE time_category AS ENUM ('planning', 'design', 'development', 'meeting', 'revision', 'admin', 'email', 'research', 'other');
CREATE TYPE time_intent AS ENUM ('done', 'planned');
CREATE TYPE cost_type AS ENUM ('platform_fee', 'tax', 'tool', 'contractor', 'misc');
CREATE TYPE alert_type AS ENUM ('scope_rule1', 'scope_rule2', 'scope_rule3', 'scope_rule4');
CREATE TYPE message_tone AS ENUM ('polite', 'neutral', 'firm');
CREATE TYPE timesheet_status AS ENUM ('draft', 'submitted', 'approved', 'rejected');
```

### 7.3 Tables (14개)

#### profiles
```sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  display_name text,
  default_currency project_currency NOT NULL DEFAULT 'USD',
  timezone text NOT NULL DEFAULT 'Asia/Seoul',
  locale text NOT NULL DEFAULT 'en',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
-- RLS: id = auth.uid()
```

#### clients
```sql
CREATE TABLE clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE UNIQUE INDEX idx_clients_user_name ON clients(user_id, name) WHERE deleted_at IS NULL;
-- RLS: user_id = auth.uid()
```

#### projects
```sql
CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  client_id uuid REFERENCES clients(id),
  name text NOT NULL,
  aliases text[] NOT NULL DEFAULT '{}',
  start_date date,
  expected_hours numeric NOT NULL DEFAULT 0,
  expected_fee numeric NOT NULL DEFAULT 0,
  currency project_currency NOT NULL DEFAULT 'USD',
  platform_fee_rate numeric NOT NULL DEFAULT 0 CHECK (platform_fee_rate BETWEEN 0 AND 1),
  tax_rate numeric NOT NULL DEFAULT 0 CHECK (tax_rate BETWEEN 0 AND 1),
  progress_percent int NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  is_active boolean NOT NULL DEFAULT true,
  status project_status NOT NULL DEFAULT 'active',
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX idx_projects_user_active ON projects(user_id, is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_projects_user_status ON projects(user_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_projects_client ON projects(client_id) WHERE deleted_at IS NULL;
-- RLS: user_id = auth.uid()
```

#### time_entries
```sql
CREATE TABLE time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id),
  date date NOT NULL,
  minutes int NOT NULL CHECK (minutes BETWEEN 1 AND 1440),
  category time_category NOT NULL,
  intent time_intent NOT NULL DEFAULT 'done',
  task_description text NOT NULL DEFAULT '',
  source_text text,
  issues text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX idx_time_project_date ON time_entries(project_id, date) WHERE deleted_at IS NULL;
CREATE INDEX idx_time_project_intent ON time_entries(project_id, intent) WHERE deleted_at IS NULL;
CREATE INDEX idx_time_project_category ON time_entries(project_id, category) WHERE deleted_at IS NULL;
-- RLS: via project.user_id = auth.uid()
```

#### cost_entries
```sql
CREATE TABLE cost_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id),
  date date,
  amount numeric NOT NULL CHECK (amount >= 0),
  cost_type cost_type NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX idx_cost_project ON cost_entries(project_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_cost_project_type ON cost_entries(project_id, cost_type) WHERE deleted_at IS NULL;
-- RLS: via project.user_id = auth.uid()
```

#### alerts
```sql
CREATE TABLE alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id),
  alert_type alert_type NOT NULL,
  triggered_at timestamptz NOT NULL DEFAULT now(),
  dismissed_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX idx_alerts_project ON alerts(project_id, alert_type, dismissed_at) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX idx_alerts_active ON alerts(project_id, alert_type) WHERE dismissed_at IS NULL AND deleted_at IS NULL;
-- RLS: via project.user_id = auth.uid()
```

#### generated_messages
```sql
CREATE TABLE generated_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id uuid NOT NULL REFERENCES alerts(id),
  tone message_tone NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  copied_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX idx_messages_alert ON generated_messages(alert_id, tone) WHERE deleted_at IS NULL;
-- RLS: via alert → project.user_id = auth.uid()
```

#### weekly_reports
```sql
CREATE TABLE weekly_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  week_start date NOT NULL,
  week_end date NOT NULL,
  total_minutes int NOT NULL DEFAULT 0,
  total_projects int NOT NULL DEFAULT 0,
  project_breakdown jsonb NOT NULL DEFAULT '[]'::jsonb,
  category_breakdown jsonb NOT NULL DEFAULT '{}'::jsonb,
  daily_breakdown jsonb NOT NULL DEFAULT '[]'::jsonb,
  ai_insight text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE UNIQUE INDEX idx_weekly_reports_user_week ON weekly_reports(user_id, week_start) WHERE deleted_at IS NULL;
-- RLS: user_id = auth.uid()
```

#### project_shares
```sql
-- (기존 정의 유지)
```

#### usage_counts
```sql
CREATE TABLE usage_counts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  feature text NOT NULL,              -- 'nlp_parse' | 'ai_chat'
  period text NOT NULL,               -- 'YYYY-MM'
  count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE UNIQUE INDEX idx_usage_counts_unique ON usage_counts(user_id, feature, period) WHERE deleted_at IS NULL;
-- RLS: user_id = auth.uid()
```

#### timesheets
```sql
CREATE TABLE timesheets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id),
  user_id uuid NOT NULL REFERENCES profiles(id),
  week_start date NOT NULL,
  week_end date NOT NULL,
  status timesheet_status NOT NULL DEFAULT 'draft',
  submitted_at timestamptz,
  approved_at timestamptz,
  rejected_at timestamptz,
  reviewer_note text,
  total_minutes int DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE UNIQUE INDEX idx_timesheets_project_week ON timesheets(project_id, week_start) WHERE deleted_at IS NULL;
-- RLS: user_id = auth.uid()
```

#### timesheet_approvals
```sql
CREATE TABLE timesheet_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timesheet_id uuid NOT NULL REFERENCES timesheets(id),
  action text NOT NULL,               -- 'submitted' | 'approved' | 'rejected'
  reviewer_email text,
  reviewer_token uuid NOT NULL DEFAULT gen_random_uuid(),
  note text,
  acted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
-- RLS: via timesheet.user_id = auth.uid() (or public via token)
```

#### time_entry_versions
```sql
CREATE TABLE time_entry_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  time_entry_id uuid NOT NULL REFERENCES time_entries(id),
  changed_by uuid NOT NULL REFERENCES profiles(id),
  changed_at timestamptz DEFAULT now(),
  change_type text NOT NULL,          -- 'create' | 'update' | 'delete'
  old_values jsonb,
  new_values jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
-- RLS: changed_by = auth.uid()
```

#### entry_flags
```sql
CREATE TABLE entry_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  time_entry_id uuid NOT NULL REFERENCES time_entries(id),
  flag_type text NOT NULL,            -- 'weekend_work' | 'late_night' | 'long_session' | 'backdated' | 'round_number'
  severity text NOT NULL DEFAULT 'info',
  metadata jsonb,
  dismissed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
-- RLS: via time_entry → project.user_id = auth.uid()
```

#### time_entries 추가 컬럼
```sql
ALTER TABLE time_entries ADD COLUMN timesheet_id uuid REFERENCES timesheets(id);
ALTER TABLE time_entries ADD COLUMN locked_at timestamptz;
```

### 7.4 Migration Checklist

1. `CREATE EXTENSION IF NOT EXISTS pgcrypto;`
2. Enum 생성 (7개 — project_status 포함)
3. profiles 테이블 (FK to auth.users)
4. clients, projects 테이블
5. time_entries, cost_entries 테이블
6. alerts, generated_messages 테이블
7. weekly_reports 테이블
8. 인덱스 + CHECK 제약
9. alerts partial unique index
10. RLS 정책 설정

---

## 8. API Endpoints

### 8.1 Common

- **Auth**: Supabase session 필수 (미인증 → 401)
- **Content-Type**: JSON only
- **Soft delete**: 기본 조회 `deleted_at IS NULL`
- **API versioning**: 없음
- **Request/Response**: camelCase
- **Error shape**: `{ "error": { "code": "SOME_CODE", "message": "...", "details": {} } }`

### 8.2 Route Handler Pattern

```typescript
export async function POST(req: Request) {
  const user = await requireUser();                    // 401 if unauthenticated
  const body = SomeSchema.parse(await req.json());     // 422 if invalid
  const result = await someServiceFn(user.id, body);   // business logic
  return NextResponse.json({ data: result }, { status: 201 });
}
```

### 8.3 Endpoints (26 routes)

#### Health
| Method | Path | Response |
|--------|------|----------|
| GET | `/api/health` | `{ data: { ok: true } }` |

#### Auth
| Method | Path | Response |
|--------|------|----------|
| GET | `/api/auth/callback` | OAuth callback → redirect |
| POST | `/api/auth/logout` | Session destroy → redirect |

#### Clients (CRUD)
| Method | Path | Body | Response |
|--------|------|------|----------|
| GET | `/api/clients` | — | `{ data: Client[] }` |
| POST | `/api/clients` | `{ name }` | 201 `{ data: Client }` |
| PATCH | `/api/clients/:clientId` | `{ name? }` | `{ data: Client }` |
| DELETE | `/api/clients/:clientId` | — | 204 |

#### Projects (CRUD + Status)
| Method | Path | Body | Response |
|--------|------|------|----------|
| GET | `/api/projects?status=active` | — | `{ data: Project[] }` (with metrics) |
| POST | `/api/projects` | `{ name, clientName?, aliases?, expectedFee, expectedHours, currency, platformFeePreset, platformFeeRate?, taxEnabled, taxRate?, fixedCostAmount? }` | 201 `{ data: Project }` |
| GET | `/api/projects/:projectId` | — | `{ data: Project }` |
| PATCH | `/api/projects/:projectId` | `{ name?, aliases?, expectedFee?, expectedHours?, currency?, platformFeeRate?, taxRate?, progressPercent?, status? }` | `{ data: Project }` |
| DELETE | `/api/projects/:projectId` | — | 204 |

#### Metrics
| Method | Path | Response |
|--------|------|----------|
| GET | `/api/projects/:projectId/metrics` | `{ data: { metrics, pendingAlert } }` |

#### Costs (CRUD)
| Method | Path | Body | Response |
|--------|------|------|----------|
| GET | `/api/projects/:projectId/cost-entries` | — | `{ data: CostEntry[] }` |
| POST | `/api/projects/:projectId/cost-entries` | `{ amount, costType, date?, notes? }` | 201 `{ data: CostEntry }` |
| PATCH | `/api/cost-entries/:costEntryId` | `{ amount?, costType?, date?, notes? }` | `{ data: CostEntry }` |
| DELETE | `/api/cost-entries/:costEntryId` | — | 204 |

#### Time (Actions)
| Method | Path | Body | Response |
|--------|------|------|----------|
| POST | `/api/time/parse` | `{ input, userTimezone?, preferredProjectId? }` | `{ data: ParsedResponse }` |
| POST | `/api/time/save` | `{ entries: ParsedEntry[] }` | `{ data: { inserted: number } }` |
| PATCH | `/api/time/:entryId` | `{ taskDescription?, minutes?, category? }` | `{ data: TimeEntry }` |
| DELETE | `/api/time/:entryId` | — | 204 |

#### Voice
| Method | Path | Body | Response |
|--------|------|------|----------|
| POST | `/api/voice/transcribe` | FormData (audio) | `{ data: { text } }` |

#### Alerts + Messages
| Method | Path | Body | Response |
|--------|------|------|----------|
| POST | `/api/alerts/:alertId/dismiss` | — | `{ data: { dismissedAt } }` |
| POST | `/api/messages/generate` | `{ projectId, alertId, tones }` | `{ data: { messages } }` |
| POST | `/api/messages/:messageId/copied` | — | `{ data: { copiedAt } }` |

#### Dashboard + Analytics + History + Reports
| Method | Path | Response |
|--------|------|----------|
| GET | `/api/dashboard` | `{ data: { kpi, weeklyChart, recentEntries, activeAlerts } }` |
| GET | `/api/analytics` | `{ data: { hourlyRanking, categoryBreakdown, ... } }` |
| GET | `/api/time/history?projectId=&category=` | `{ data: TimeEntry[] }` |
| GET | `/api/reports/weekly` | `{ data: WeeklyReport[] }` |
| POST | `/api/reports/weekly/generate` | — | `{ data: WeeklyReport }` |
| GET | `/api/reports/weekly/:reportId` | `{ data: WeeklyReport }` |

#### AI Chat
| Method | Path | Body | Response |
|--------|------|------|----------|
| POST | `/api/ai/chat` | `{ message, conversationHistory? }` | `{ data: { reply } }` |

#### Settings
| Method | Path | Body | Response |
|--------|------|------|----------|
| PATCH | `/api/settings/profile` | `{ displayName? }` | `{ data: Profile }` |
| PATCH | `/api/settings/preferences` | `{ currency?, timezone?, locale? }` | `{ data: Profile }` |
| GET | `/api/settings/export` | — | CSV file download |

#### Invoice
| Method | Path | Body | Response |
|--------|------|------|----------|
| POST | `/api/projects/:projectId/invoice/generate-items` | `{ type }` | `{ data: { lineItems } }` |

#### Timesheets
| Method | Path | Body | Response |
|--------|------|------|----------|
| POST | `/api/timesheets` | `{ projectId, weekStart }` | 201 `{ data: Timesheet }` |
| GET | `/api/timesheets?projectId=&status=` | — | `{ data: Timesheet[] }` |
| GET | `/api/timesheets/:id` | — | `{ data: Timesheet + entries }` |
| POST | `/api/timesheets/:id/submit` | — | `{ data: { ...Timesheet, reviewToken } }` |
| GET | `/api/timesheets/review/:token` | — | PUBLIC `{ data: TimesheetReview }` |
| POST | `/api/timesheets/review/:token` | `{ action, note?, reviewerEmail? }` | PUBLIC `{ data: Timesheet }` |

#### Entry Flags
| Method | Path | Body | Response |
|--------|------|------|----------|
| GET | `/api/time/flags?projectId=` | — | `{ data: Flag[] }` |
| POST | `/api/time/flags/:flagId/dismiss` | — | `{ data: { dismissedAt } }` |

#### Audit Trail
| Method | Path | Response |
|--------|------|----------|
| GET | `/api/time/:entryId/history` | `{ data: Version[] }` |

### 8.4 Validation Schema Location

| Domain | File |
|--------|------|
| Projects | `lib/validators/projects.ts` — `CreateProjectSchema`, `UpdateProjectSchema` |
| Time | `lib/validators/time.ts` — `ParseTimeSchema`, `SaveTimeSchema` |
| Messages | `lib/validators/messages.ts` — `GenerateMessagesSchema`, `MarkCopiedSchema` |
| Costs | `lib/validators/costs.ts` |
| Clients | `lib/validators/clients.ts` |
| LLM Parse | `lib/ai/time-log-schema.ts` |
| LLM Message | `lib/ai/message-schema.ts` |
| Chat | `lib/validators/chat.ts` — `ChatMessageSchema` |
| Timesheets | `lib/validators/timesheet-schema.ts` — `CreateTimesheetSchema`, `SubmitTimesheetSchema`, `ReviewTimesheetSchema`, `TimesheetListQuerySchema` |

---

## 9. Coding Conventions

### 9.1 Naming

| Type | Convention | Example |
|------|-----------|---------|
| React component | PascalCase | `TimeLogInterface.tsx` |
| Hook/store | useXxx | `useDraftStore.ts` |
| Server logic/util | kebab-case | `get-project-metrics.ts` |
| Zod schema | SomethingSchema | `CreateProjectSchema` |
| Enum values | lowercase | `done`, `planned`, `polite` |
| Currency | UPPERCASE ISO | `USD`, `KRW` (only exception) |

### 9.2 Import Alias

`@/*` = `src/*`

```typescript
import { getProjectMetrics } from '@/lib/metrics/get-project-metrics';
import { Button } from '@/components/ui/button';
import { projects } from '@/db/schema/projects';
```

### 9.3 Key Rules

1. **Zod = Single Source of Truth** — 폼, API, LLM 스키마 모두 Zod 기반
2. **Route Handler 진입 검증** — Schema.parse() 후에만 로직 실행
3. **server-only** — `lib/metrics`, `lib/ai`는 서버 전용. 클라이언트 import 금지.
4. **Soft delete** — 모든 조회 `WHERE deleted_at IS NULL`. `db/queries/*`에서만 SQL 접근.
5. **Date wrapper** — 모든 날짜 연산은 `lib/date/index.ts` 경유. 직접 format() 금지.
6. **Clipboard wrapper** — 모든 복사 연산은 `lib/utils/clipboard.ts` 경유.
7. **Route Handlers only** — Server Actions 미사용 (디버깅 용이)
8. **camelCase API ↔ snake_case DB** — DTO 변환 함수로 명시적 매핑
9. **Zod 4** — `import { z } from "zod/v4"` 사용. `z.string().url()` (not `z.url()`)

---

## 10. Directory Structure

```
src/
├─ app/
│  ├─ [locale]/
│  │  ├─ (auth)/
│  │  │  ├─ login/page.tsx
│  │  │  ├─ signup/page.tsx
│  │  │  ├─ reset-password/page.tsx
│  │  │  └─ verify/page.tsx
│  │  ├─ (dashboard)/
│  │  │  ├─ page.tsx                            # Dashboard home
│  │  │  ├─ projects/
│  │  │  │  ├─ page.tsx                          # Projects list
│  │  │  │  └─ [projectId]/page.tsx              # Project Detail
│  │  │  ├─ time-log/page.tsx                    # NLP input
│  │  │  ├─ history/page.tsx                     # Calendar + list
│  │  │  ├─ analytics/page.tsx                   # Multi-project
│  │  │  ├─ reports/
│  │  │  │  ├─ page.tsx                          # Weekly list
│  │  │  │  └─ [reportId]/page.tsx               # Report detail
│  │  │  ├─ clients/page.tsx                     # Client list
│  │  │  ├─ timesheets/page.tsx                  # Timesheet management
│  │  │  ├─ settings/page.tsx                    # User settings
│  │  │  └─ layout.tsx                           # Sidebar layout
│  │  └─ (marketing)/
│  │     ├─ page.tsx                             # Landing page
│  │     └─ layout.tsx
│  ├─ api/                                       # 35 route handlers
│  │  ├─ auth/callback/route.ts
│  │  ├─ auth/logout/route.ts
│  │  ├─ health/route.ts
│  │  ├─ dashboard/route.ts
│  │  ├─ analytics/route.ts
│  │  ├─ clients/route.ts
│  │  ├─ clients/[clientId]/route.ts
│  │  ├─ projects/route.ts
│  │  ├─ projects/[projectId]/route.ts
│  │  ├─ projects/[projectId]/metrics/route.ts
│  │  ├─ projects/[projectId]/cost-entries/route.ts
│  │  ├─ projects/[projectId]/invoice/generate-items/route.ts
│  │  ├─ cost-entries/[costEntryId]/route.ts
│  │  ├─ time/parse/route.ts
│  │  ├─ time/save/route.ts
│  │  ├─ time/[entryId]/route.ts
│  │  ├─ time/history/route.ts
│  │  ├─ voice/transcribe/route.ts
│  │  ├─ alerts/[alertId]/dismiss/route.ts
│  │  ├─ messages/generate/route.ts
│  │  ├─ messages/[messageId]/copied/route.ts
│  │  ├─ reports/weekly/route.ts
│  │  ├─ reports/weekly/generate/route.ts
│  │  ├─ reports/weekly/[reportId]/route.ts
│  │  ├─ settings/profile/route.ts
│  │  ├─ settings/preferences/route.ts
│  │  ├─ timesheets/route.ts                     # Timesheet CRUD
│  │  ├─ timesheets/[id]/route.ts                # Timesheet detail
│  │  ├─ timesheets/[id]/submit/route.ts         # Submit timesheet
│  │  ├─ timesheets/review/[token]/route.ts      # PUBLIC client review
│  │  ├─ time/[entryId]/history/route.ts         # Audit trail
│  │  ├─ time/flags/route.ts                     # Entry flags
│  │  ├─ time/flags/[flagId]/dismiss/route.ts    # Dismiss flag
│  │  ├─ settings/export/route.ts
│  │  └─ og/route.tsx
│  ├─ globals.css
│  ├─ timesheet-review/[token]/page.tsx          # PUBLIC review page (no locale)
│  └─ middleware.ts                              # next-intl locale routing
├─ components/                                   # 90+ components
│  ├─ ui/                                        # shadcn/ui (24 components)
│  ├─ time-log/                                  # NLP input + HITL + history (15 files)
│  ├─ projects/                                  # Project cards, forms, lifecycle (14 files)
│  ├─ dashboard/                                 # KPI, charts (3 files)
│  ├─ analytics/                                 # Multi-project charts (6 files)
│  ├─ reports/                                   # Weekly reports (5 files)
│  ├─ settings/                                  # User settings (5 files)
│  ├─ timesheets/                                # Timesheet list, detail, submit, review, badge (5 files)
│  ├─ alerts/                                    # Scope alert modal (2 files)
│  ├─ charts/                                    # Shared chart components (3 files)
│  ├─ landing/                                   # Marketing page (15 files)
│  └─ layout/                                    # Sidebar, app shell (3 files)
├─ lib/                                          # 45 modules
│  ├─ ai/                                        # LLM schemas + prompts (11 files)
│  ├─ metrics/                                   # Rate calc + scope rules
│  ├─ money/                                     # Currency + format
│  ├─ pdf/                                       # Invoice template + utils
│  ├─ reports/                                   # Weekly report logic
│  ├─ date/index.ts                              # date-fns wrapper
│  ├─ auth/server.ts                             # getUser(), requireUser()
│  ├─ api/handler.ts                             # Error handler util
│  ├─ supabase/                                  # Client + server helpers
│  ├─ validators/                                # Zod schemas (11 files)
│  └─ utils/                                     # cn, nanoid, clipboard, category-emoji
├─ db/
│  ├─ schema/                                    # Drizzle table/enum definitions (16 files, 14 tables)
│  ├─ queries/                                   # DB access functions (14 modules)
│  └─ index.ts                                   # Drizzle client init
├─ store/
│  └─ use-draft-store.ts                         # zustand (HITL draft ONLY)
├─ hooks/                                        # Custom React hooks
├─ i18n/                                         # next-intl config
├─ types/index.ts                                # shared types
└─ env.ts                                        # env validation (Zod)

messages/
├─ ko.json                                       # ~400+ keys
└─ en.json                                       # ~400+ keys

drizzle/                                         # migrations output
scripts/
├─ seed.ts                                       # Demo seed data
└─ test-logic.ts                                 # 68 unit test cases
```

---

## 11. Architecture Summary

| Metric | Count |
|--------|-------|
| Pages | 19 |
| API Routes | 35 |
| Components | 90+ |
| Lib Modules | 50+ |
| DB Tables | 14 |
| DB Enums | 8 |
| DB Queries | 14 modules |
| i18n Keys | ~450+ per language |
| Unit Tests | 88 cases |
| Build Output | 58 pages, 0 errors |

---

## 12. Demo Scenario (2 minutes)

### Flow

**[0:00] 문제 제기**
> "프리랜서 대다수가 진짜 시급을 모릅니다"

**[0:20] 자연어 입력** (Feature 1)
- "예시 채우기" 버튼 클릭 or 직접 입력
- "어제 ABC 리브랜딩 디자인 3시간, 미팅 1시간, 이메일 20분"
- Magic Parse → AI 파싱 → HITL 카드 확인 → Save All

**[0:50] 팩트 폭격** (Feature 2)
- Project Detail 진입
- 바 차트: "명목 시급 $50 → 실제 $15.88" (빨간 바)
- 파이 차트: 수수료 $400 + 세금 $200 + 툴비 $50
- "적자까지는 아니지만, 생각보다 훨씬 낮죠?"

**[1:20] 스코프 경고** (Feature 3)
- 모달 자동 표시: "예상 시간의 80% 소진, 진척도 40%"
- "청구 메시지 생성" 클릭

**[1:40] 청구 메시지**
- 3개 톤 탭 전환 (polite → neutral → firm)
- 복사 버튼 클릭 → "클립보드에 복사됨"
- "$500 추가 청구 가능"

**[2:00] 마무리**
> "RealHourly — 프리랜서의 돈을 지켜줍니다"
> ROI: "이 도구 하나로 $500 더 벌었다"

---

## 13. Seed Data

### Demo Project

```json
{
  "project": {
    "name": "ABC 리브랜딩",
    "client": "ABC Corp",
    "expected_fee": 2000,
    "expected_hours": 40,
    "currency": "USD",
    "platform_fee_rate": 0.20,
    "tax_rate": 0.10,
    "progress_percent": 40,
    "start_date": "2026-01-15"
  },
  "cost_entries": [
    { "cost_type": "tool", "amount": 50, "notes": "Figma Pro" }
  ],
  "time_entries": [
    { "date": "2026-01-15", "minutes": 180, "category": "planning", "task_description": "프로젝트 킥오프 미팅 + 브리프 정리" },
    { "date": "2026-01-16", "minutes": 240, "category": "design", "task_description": "로고 컨셉 A/B/C 작업" },
    { "date": "2026-01-17", "minutes": 120, "category": "meeting", "task_description": "클라이언트 피드백 미팅" },
    { "date": "2026-01-17", "minutes": 60, "category": "email", "task_description": "피드백 정리 메일" },
    { "date": "2026-01-20", "minutes": 300, "category": "design", "task_description": "로고 B안 디테일 작업" },
    { "date": "2026-01-21", "minutes": 180, "category": "revision", "task_description": "1차 수정: 컬러 변경 요청" },
    { "date": "2026-01-22", "minutes": 240, "category": "revision", "task_description": "2차 수정: 폰트 + 레이아웃" },
    { "date": "2026-01-23", "minutes": 120, "category": "meeting", "task_description": "수정사항 확인 미팅" },
    { "date": "2026-01-23", "minutes": 60, "category": "admin", "task_description": "인보이스 작성" },
    { "date": "2026-01-24", "minutes": 180, "category": "revision", "task_description": "3차 수정: 최종 컬러 조정" },
    { "date": "2026-01-27", "minutes": 240, "category": "design", "task_description": "브랜드 가이드 문서 작성" },
    { "date": "2026-01-28", "minutes": 180, "category": "revision", "task_description": "4차 수정: 가이드 피드백 반영" },
    { "date": "2026-01-29", "minutes": 120, "category": "revision", "task_description": "5차 수정: 최종 승인전 미세 조정" },
    { "date": "2026-01-30", "minutes": 60, "category": "meeting", "task_description": "최종 리뷰 미팅" },
    { "date": "2026-01-30", "minutes": 60, "category": "email", "task_description": "최종 파일 전달 + 감사 메일" },
    { "date": "2026-02-03", "minutes": 180, "category": "revision", "task_description": "추가 수정: 명함 디자인 요청 (scope creep)" },
    { "date": "2026-02-04", "minutes": 120, "category": "design", "task_description": "명함 디자인 작업" },
    { "date": "2026-02-05", "minutes": 60, "category": "revision", "task_description": "명함 수정" },
    { "date": "2026-02-05", "minutes": 120, "category": "research", "task_description": "경쟁사 브랜드 리서치" }
  ]
}
```

### Expected Calculation Result

```
총 투입 시간: 3,120분 = 52시간
(revision만: 1,080분 = 18시간, 34.6% — Rule 2 근접)
(revision 이벤트: 7건 — Rule 3 트리거!)

gross = $2,000
platform_fee = $2,000 x 0.20 = $400
tax = $2,000 x 0.10 = $200
fixed_cost = $50
direct_cost = $400 + $200 + $50 = $650
net = $2,000 - $650 = $1,350
total_hours = 52
nominal_hourly = $2,000 / 40 = $50.00
real_hourly = $1,350 / 52 = $25.96

시간 소진율: 52/40 = 130% → Rule 1 (>= 0.8 AND progress 40% < 50%) ✅
revision 비율: 34.6% → Rule 2 (< 40%) ❌ (근접하지만 미트리거)
revision 이벤트: 7건 → Rule 3 (>= 5) ✅

팩트 폭격: "$50 → $25.96" (48% 감소!)
```

---

## Appendix: Judge Q&A Prep

| Question | Answer |
|----------|--------|
| Toggl과 차이? | 시간 추적만 vs 수익성 분석 + 행동 유도 (청구 메시지까지) |
| ChatGPT로 직접? | 개인 데이터 누적 분석 + 실시간 스코프 감지 불가 |
| 수익 모델? | 월 $19~$39 구독, 500명 시 $10K MRR |
| 시장 규모? | 자영·독립 노동자 15억+, 연 15% 성장 |
| 기술 차별점? | NLP 입력 + LLM 메시지 + 규칙 감지 조합 |
| 경쟁 우위? | ROI 증명 — "이 도구로 $500 더 벌었다" |
