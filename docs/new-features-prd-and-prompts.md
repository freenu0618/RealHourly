# RealHourly — 신규 기능 PRD + 구현 프롬프트

> F14: 수익성 프리뷰 카드 (Profitability Preview)
> F15: 클라이언트 워크 리포트 (Client Work Report)
> Last Updated: 2026-02-10

---

## 목차

1. [배경 & 문제 인식](#1-배경--문제-인식)
2. [F14: 수익성 프리뷰 카드](#2-f14-수익성-프리뷰-카드)
3. [F15: 클라이언트 워크 리포트](#3-f15-클라이언트-워크-리포트)
4. [DB 스키마 확장](#4-db-스키마-확장)
5. [API 확장](#5-api-확장)
6. [i18n 키 추가](#6-i18n-키-추가)
7. [CLAUDE.md 업데이트 내용](#7-claudemd-업데이트-내용)
8. [TODO.md 업데이트 내용](#8-todomd-업데이트-내용)
9. [SuperClaude 구현 프롬프트](#9-superclaude-구현-프롬프트)

---

## 1. 배경 & 문제 인식

### 프리랜서 급여/대금의 7대 고통 포인트

| # | 고통 | RealHourly 현재 | 신규 기능 대응 |
|---|------|----------------|---------------|
| 1 | 지급 지연 (날짜 불명확, 검수 지연) | ❌ 없음 | F15: 작업 투명성 → 검수/지급 촉진 |
| 2 | 수수료/세금으로 실수령 감소 | ✅ 핵심 기능 | F14: 생성 시점에 프리뷰 |
| 3 | 스코프 크립 / 범위 애매 | ✅ 핵심 기능 | F14: 체크리스트 환기 |
| 4 | 미지급/먹튀 리스크 | ❌ 없음 | F15: 자동 증빙 축적 |
| 5 | 세금 부담 예측 어려움 | ⚠️ 부분 | F14: 실수령 즉시 계산 |
| 6 | 소득 증빙 (대출/전세) | ❌ 없음 | F15: 리포트 내보내기 |
| 7 | 독촉/협상 스트레스 | ✅ 청구 메시지 | F15: 객관적 근거 제공 |

### 해커톤 커뮤니티 피드백

> "돈이 오가는 계약관계에서 증빙자료는 중요합니다. 자동화 한다는 점에서 좋은것 같습니다. 
> 지불하는 입장에서 어떤 업무를 했는지도 알수 있게되면 좋겠네요."

**핵심 인사이트**: RealHourly가 프리랜서 전용 도구에서 **프리랜서-클라이언트 양방향 신뢰 플랫폼**으로 포지셔닝 확장 가능.

---

## 2. F14: 수익성 프리뷰 카드

> **Status: Planned** — 기존 계산 로직 재활용, 프론트엔드 추가

### 2.1 목적

프로젝트 생성 시점에 "계약 금액 ≠ 실수령액"을 즉시 시각화하여, 프리랜서가 불리한 조건을 인지하고 계약 전 방어할 수 있게 한다.

### 2.2 UX 흐름

```
CreateProjectDialog 기존 필드 입력
  (이름, 금액, 시간, 통화, 수수료 프리셋, 세율)
    ↓
  모든 금액 필드 입력 완료 시 (expectedFee > 0 AND expectedHours > 0)
    ↓
  ┌─ 수익성 프리뷰 카드 자동 노출 (Dialog 하단, 생성 버튼 위) ─┐
  │                                                          │
  │  💡 수익성 프리뷰                                          │
  │                                                          │
  │  계약 금액:        $2,000                                 │
  │  - 플랫폼 수수료:  - $400 (20%)                           │
  │  - 세금:          - $200 (10%)                            │
  │  ──────────────────────────                               │
  │  예상 실수령:      $1,400                                  │
  │  예상 시급:        $35.00/h (40h 기준)                     │
  │                                                          │
  │  ────── 프로젝트 시작 전 체크리스트 ──────                   │
  │  □ 수정 횟수/범위를 합의했나요?                              │
  │  □ 마일스톤별 분할 지급을 협의했나요?                         │
  │  □ 지급일이 계약서에 명시되어 있나요?                         │
  │                                                          │
  └──────────────────────────────────────────────────────────┘
    ↓
  [프로젝트 생성] 버튼 (체크리스트 미체크여도 생성 가능 — 강제 아님)
```

### 2.3 계산 로직 (클라이언트 사이드)

기존 `getProjectMetrics` 서버 로직을 클라이언트용으로 경량화:

```typescript
interface ProfitabilityPreview {
  grossFee: number;
  platformFeeAmount: number;
  taxAmount: number;
  estimatedFixedCost: number;       // fixedCostAmount (생성 시 입력한 값)
  estimatedNet: number;
  estimatedHourlyRate: number | null;
  rateDropPercent: number | null;   // 명목 대비 하락률
}

function calculatePreview(input: {
  expectedFee: number;
  expectedHours: number;
  platformFeeRate: number;
  taxRate: number;
  fixedCostAmount?: number;
}): ProfitabilityPreview {
  const gross = input.expectedFee;
  const platformFeeAmount = gross * input.platformFeeRate;
  const taxAmount = gross * input.taxRate;
  const fixedCost = input.fixedCostAmount ?? 0;
  const net = gross - platformFeeAmount - taxAmount - fixedCost;
  
  const nominalHourly = input.expectedHours > 0 
    ? gross / input.expectedHours 
    : null;
  const realHourly = input.expectedHours > 0 
    ? net / input.expectedHours 
    : null;
  const dropPercent = nominalHourly && realHourly 
    ? Math.round((1 - realHourly / nominalHourly) * 100)
    : null;
    
  return {
    grossFee: gross,
    platformFeeAmount,
    taxAmount,
    estimatedFixedCost: fixedCost,
    estimatedNet: net,
    estimatedHourlyRate: realHourly,
    rateDropPercent: dropPercent,
  };
}
```

### 2.4 UI 컴포넌트

| 컴포넌트 | 파일 | 설명 |
|---------|------|------|
| `ProfitabilityPreview` | `components/projects/ProfitabilityPreview.tsx` | 프리뷰 카드 전체 |
| `PreviewBreakdown` | 위 파일 내 서브 컴포넌트 | 금액 분해 표시 |
| `ProjectChecklist` | 위 파일 내 서브 컴포넌트 | 체크리스트 3개 |

### 2.5 디자인 상세

**카드 스타일**:
- 배경: `bg-amber-50 dark:bg-amber-950/20` (주의 환기, 경고 아님)
- 테두리: `border-amber-200 dark:border-amber-800`
- 아이콘: `Lightbulb` (lucide-react)
- 실수령액 강조: `text-2xl font-bold` + 통화 포맷
- 하락률이 30% 이상이면: `text-red-600` + "⚠️ 30% 이상 감소" 배지

**체크리스트 스타일**:
- 인터랙티브 체크박스 (체크 상태 로컬 only — DB 저장 안함)
- 체크하면 선 그어짐 (line-through) + opacity 감소
- 프로젝트 생성과 무관 (UX 마찰 최소화)

**반응 조건**:
- `expectedFee` AND `expectedHours` 둘 다 > 0일 때만 카드 노출
- 입력 변경 시 실시간 재계산 (debounce 불필요 — 단순 산술)
- 둘 중 하나라도 0이면 카드 숨김

### 2.6 Edge Cases

| Case | Handling |
|------|---------|
| 수수료 0% + 세금 0% | 카드 표시하되 "실수령 = 계약금액" + "추가 비용 없음" |
| 실수령 < 0 (적자) | `text-red-600` + "⚠️ 적자 프로젝트" 경고 |
| 매우 작은 시급 ($1 미만) | 정상 표시 (사용자가 판단) |
| 통화별 포맷 | 기존 `lib/money/` 포맷터 재사용 |

---

## 3. F15: 클라이언트 워크 리포트

> **Status: Planned** — 새 모듈 (DB 1테이블, API 4개, 페이지 1개)

### 3.1 목적

프리랜서가 클라이언트에게 **로그인 없이 조회 가능한 작업 리포트 링크**를 공유하여:
- 작업 증빙을 자동으로 축적/제공
- 검수/승인/지급을 촉진
- 독촉 없이도 투명성으로 신뢰 구축

### 3.2 핵심 흐름

```
[프리랜서] 프로젝트 상세 페이지
  ↓
  "클라이언트 리포트 공유" 버튼 클릭
  ↓
  공유 설정 Dialog
  ├── 라벨: "ABC Corp 공유용" (옵션)
  ├── 만료일: DatePicker (옵션, null = 무기한)
  ├── 공개 항목 토글:
  │   ├── ✅ 작업 내용 (task descriptions)
  │   ├── ✅ 투입 시간 (hours per entry)
  │   ├── ✅ 카테고리 분포 (category breakdown)
  │   ├── ✅ 진행률 (progress)
  │   └── ❌ 인보이스 다운로드 (기본 off)
  └── [링크 생성] 버튼
  ↓
  공유 URL 생성: realhourly.ai/report/{shareToken}
  ↓
  복사 버튼 + Toast "클립보드에 복사됨"
  
[클라이언트] 브라우저에서 링크 열기 (로그인 불필요)
  ↓
  퍼블릭 리포트 페이지 렌더링
```

### 3.3 클라이언트 리포트 페이지 (퍼블릭)

**URL**: `/report/{shareToken}` (locale prefix 없음 — 클라이언트 브라우저 언어 감지)

**페이지 구성**:

```
┌─────────────────────────────────────────────────────┐
│  RealHourly 로고 (작게)                               │
│                                                     │
│  ══════════════════════════════════════════════════  │
│  📋 ABC 리브랜딩 — 작업 리포트                         │
│  프리랜서: 홍길동                                      │
│  기간: 2026.01.15 ~ 진행중                            │
│  최종 업데이트: 2026-02-10                             │
│  ══════════════════════════════════════════════════  │
│                                                     │
│  ┌─ 프로젝트 요약 ─────────────────────────────┐     │
│  │ 진행률     ████████░░ 80%                   │     │
│  │ 총 투입    52시간 (19 작업)                  │     │
│  │ 카테고리   디자인 40% | 수정 25% | 미팅 15%  │     │
│  └────────────────────────────────────────────┘     │
│                                                     │
│  ┌─ 작업 타임라인 ─────────────────────────────┐     │
│  │                                             │     │
│  │  📅 2026-01-15 (수)                         │     │
│  │  ├ 🎯 기획  3h  프로젝트 킥오프 + 브리프 정리  │     │
│  │                                             │     │
│  │  📅 2026-01-16 (목)                         │     │
│  │  ├ 🎨 디자인 4h  로고 컨셉 A/B/C 작업        │     │
│  │                                             │     │
│  │  📅 2026-01-17 (금)                         │     │
│  │  ├ 🤝 미팅  2h  클라이언트 피드백 미팅         │     │
│  │  ├ 📧 이메일 1h  피드백 정리 메일             │     │
│  │                                             │     │
│  │  ... (날짜별 그룹, 최신순)                    │     │
│  └────────────────────────────────────────────┘     │
│                                                     │
│  ┌─ 카테고리별 시간 분포 (Bar Chart) ──────────┐     │
│  │  디자인   ████████████  20h                 │     │
│  │  수정     ████████      13h                 │     │
│  │  미팅     █████         8h                  │     │
│  │  이메일   ███           5h                  │     │
│  │  기획     ███           3h                  │     │
│  │  기타     ██            3h                  │     │
│  └────────────────────────────────────────────┘     │
│                                                     │
│  ┌─ 인보이스 (프리랜서가 허용한 경우만) ────────┐     │
│  │  [📄 인보이스 PDF 다운로드]                  │     │
│  └────────────────────────────────────────────┘     │
│                                                     │
│  ─────────────────────────────────────────────────  │
│  Powered by RealHourly — realhourly.ai              │
│  "프리랜서의 진짜 시급을 찾아드립니다"                  │
└─────────────────────────────────────────────────────┘
```

### 3.4 공개/비공개 데이터 정책

| 데이터 | 기본값 | 프리랜서 제어 | 이유 |
|--------|--------|-------------|------|
| 프로젝트 이름 | ✅ 공개 | 불가 (항상 공개) | 리포트 식별 필수 |
| 프리랜서 이름 | ✅ 공개 | 불가 (항상 공개) | 누가 작업했는지 |
| 진행률 (%) | ✅ 공개 | 토글 가능 | 현황 공유 |
| 작업 내용 (task_description) | ✅ 공개 | 토글 가능 | 핵심 증빙 |
| 투입 시간 (minutes) | ✅ 공개 | 토글 가능 | 작업량 증명 |
| 카테고리 분포 | ✅ 공개 | 토글 가능 | 시간 배분 투명성 |
| 인보이스 PDF 다운로드 | ❌ 비공개 | 토글 가능 | 민감할 수 있음 |
| **비용 내역 (cost_entries)** | ❌ 비공개 | **불가 (항상 비공개)** | 프리랜서 내부 정보 |
| **실제 시급 (real_hourly)** | ❌ 비공개 | **불가 (항상 비공개)** | 절대 노출 금지 |
| **명목 시급 (nominal_hourly)** | ❌ 비공개 | **불가 (항상 비공개)** | 협상 카드 |
| **스코프 크립 알림** | ❌ 비공개 | **불가 (항상 비공개)** | 프리랜서 전략 정보 |
| **AI 인사이트** | ❌ 비공개 | **불가 (항상 비공개)** | 프리랜서 전용 분석 |

### 3.5 공유 관리 UI (프리랜서 측)

프로젝트 상세 페이지에 "공유" 섹션 추가:

```
┌─ 클라이언트 리포트 공유 ─────────────────────────┐
│                                                  │
│  [+ 새 공유 링크 생성]                             │
│                                                  │
│  활성 링크:                                       │
│  ┌────────────────────────────────────────────┐  │
│  │ 🔗 ABC Corp 공유용                         │  │
│  │    realhourly.ai/report/abc123...          │  │
│  │    생성: 2026-02-10 | 만료: 없음            │  │
│  │    마지막 조회: 2026-02-10 (3회)            │  │
│  │    [📋 복사] [⚙️ 설정] [🗑️ 철회]           │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  철회된 링크:                                     │
│  ┌────────────────────────────────────────────┐  │
│  │ 🚫 이전 공유 (철회됨)                       │  │
│  │    철회일: 2026-02-08                       │  │
│  └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

### 3.6 보안 고려사항

| 위협 | 대응 |
|------|------|
| 토큰 추측 (brute force) | UUID v4 (122비트 엔트로피) — 사실상 추측 불가 |
| 만료된 링크 접근 | `expires_at` 체크 → 404 + "이 리포트는 만료되었습니다" |
| 철회된 링크 접근 | `is_revoked` 체크 → 404 + "이 리포트는 비활성화되었습니다" |
| 민감 데이터 노출 | 서버 사이드에서 공개 설정에 따라 데이터 필터링 후 전송 |
| 크롤러/SEO 노출 | `<meta name="robots" content="noindex, nofollow">` |
| 대량 조회 공격 | 퍼블릭 엔드포인트에 IP 기반 rate limiting (60 req/min) |

### 3.7 Edge Cases

| Case | Handling |
|------|---------|
| 타임 엔트리 0개 | 리포트 표시하되 "아직 작업 기록이 없습니다" 빈 상태 |
| 삭제된 프로젝트의 공유 링크 | 404 처리 (soft delete 포함) |
| 한 프로젝트에 복수 공유 링크 | 허용 (클라이언트별 다른 만료/설정 가능) |
| 매우 긴 리포트 (100+ entries) | 최근 50개 표시 + "더 보기" 버튼 (페이지네이션) |
| 프리랜서가 타임 엔트리 수정/삭제 | 리포트는 항상 최신 데이터 반영 (실시간) |
| 공유 후 프로젝트명 변경 | 리포트에 변경된 이름 반영 |

---

## 4. DB 스키마 확장

### 4.1 새 테이블: project_shares

```sql
CREATE TABLE project_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id),
  share_token uuid NOT NULL DEFAULT gen_random_uuid(),
  label text,                                    -- "ABC Corp 공유용"
  expires_at timestamptz,                        -- null = 무기한
  show_time_details boolean NOT NULL DEFAULT true,
  show_category_breakdown boolean NOT NULL DEFAULT true,
  show_progress boolean NOT NULL DEFAULT true,
  show_invoice_download boolean NOT NULL DEFAULT false,
  is_revoked boolean NOT NULL DEFAULT false,
  last_accessed_at timestamptz,
  access_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

-- 토큰으로 빠른 조회 (퍼블릭 엔드포인트 성능)
CREATE UNIQUE INDEX idx_shares_token 
  ON project_shares(share_token) 
  WHERE deleted_at IS NULL AND is_revoked = false;

-- 프로젝트별 공유 링크 목록
CREATE INDEX idx_shares_project 
  ON project_shares(project_id) 
  WHERE deleted_at IS NULL;
```

### 4.2 Drizzle 스키마

```typescript
// db/schema/project-shares.ts
import { pgTable, uuid, text, boolean, integer, timestamp } from 'drizzle-orm/pg-core';
import { projects } from './projects';

export const projectShares = pgTable('project_shares', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id),
  shareToken: uuid('share_token').notNull().defaultRandom(),
  label: text('label'),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  showTimeDetails: boolean('show_time_details').notNull().default(true),
  showCategoryBreakdown: boolean('show_category_breakdown').notNull().default(true),
  showProgress: boolean('show_progress').notNull().default(true),
  showInvoiceDownload: boolean('show_invoice_download').notNull().default(false),
  isRevoked: boolean('is_revoked').notNull().default(false),
  lastAccessedAt: timestamp('last_accessed_at', { withTimezone: true }),
  accessCount: integer('access_count').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});
```

### 4.3 RLS 정책

```sql
-- 프리랜서만 자기 프로젝트의 공유 링크 관리 가능
CREATE POLICY shares_owner ON project_shares
  FOR ALL
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid() AND deleted_at IS NULL
    )
  );

-- 퍼블릭 리포트 조회는 API 서버에서 service_role_key로 처리 (RLS bypass)
```

---

## 5. API 확장

### 5.1 Shares (인증 필요)

| Method | Path | Body | Response |
|--------|------|------|----------|
| POST | `/api/projects/:projectId/shares` | `{ label?, expiresAt?, showTimeDetails?, showCategoryBreakdown?, showProgress?, showInvoiceDownload? }` | 201 `{ data: ProjectShare }` |
| GET | `/api/projects/:projectId/shares` | — | `{ data: ProjectShare[] }` |
| PATCH | `/api/shares/:shareId` | `{ label?, expiresAt?, showTimeDetails?, showCategoryBreakdown?, showProgress?, showInvoiceDownload? }` | `{ data: ProjectShare }` |
| DELETE | `/api/shares/:shareId` | — | `{ data: { revokedAt } }` (soft revoke, 204 아님) |

### 5.2 Public Report (인증 불필요)

| Method | Path | Body | Response |
|--------|------|------|----------|
| GET | `/api/report/:shareToken` | — | `{ data: ClientReport }` |

### 5.3 Response 스키마

```typescript
// POST /api/projects/:projectId/shares → 201
interface ProjectShare {
  id: string;
  projectId: string;
  shareToken: string;
  shareUrl: string;               // 절대 URL: https://realhourly.ai/report/{token}
  label: string | null;
  expiresAt: string | null;
  showTimeDetails: boolean;
  showCategoryBreakdown: boolean;
  showProgress: boolean;
  showInvoiceDownload: boolean;
  isRevoked: boolean;
  lastAccessedAt: string | null;
  accessCount: number;
  createdAt: string;
}

// GET /api/report/:shareToken → 200
interface ClientReport {
  project: {
    name: string;
    freelancerName: string;       // profiles.display_name
    startDate: string | null;
    currency: string;
    progressPercent: number | null;  // showProgress=false면 null
    status: string;
  };
  summary: {
    totalHours: number;
    totalEntries: number;
    dateRange: { from: string; to: string };
  };
  timeline: TimelineEntry[] | null;  // showTimeDetails=false면 null
  categoryBreakdown: CategoryBreakdown[] | null;  // showCategoryBreakdown=false면 null
  invoiceAvailable: boolean;      // showInvoiceDownload=true AND 인보이스 생성 가능
  generatedAt: string;            // 리포트 생성 시각
}

interface TimelineEntry {
  date: string;
  entries: {
    category: string;
    categoryEmoji: string;
    minutes: number;
    taskDescription: string;
  }[];
  dayTotalMinutes: number;
}

interface CategoryBreakdown {
  category: string;
  categoryEmoji: string;
  totalMinutes: number;
  percentage: number;
}
```

### 5.4 에러 응답 (퍼블릭 엔드포인트)

| HTTP | Code | 상황 |
|------|------|------|
| 404 | `SHARE_NOT_FOUND` | 토큰 없음, 삭제됨, 프로젝트 삭제됨 |
| 410 | `SHARE_EXPIRED` | 만료일 지남 |
| 410 | `SHARE_REVOKED` | 프리랜서가 철회함 |
| 429 | `RATE_LIMITED` | IP 기반 rate limit 초과 |

### 5.5 Validation 스키마

```typescript
// lib/validators/shares.ts
import { z } from 'zod/v4';

export const CreateShareSchema = z.object({
  label: z.string().max(100).optional(),
  expiresAt: z.string().datetime().optional(),
  showTimeDetails: z.boolean().optional().default(true),
  showCategoryBreakdown: z.boolean().optional().default(true),
  showProgress: z.boolean().optional().default(true),
  showInvoiceDownload: z.boolean().optional().default(false),
});

export const UpdateShareSchema = z.object({
  label: z.string().max(100).optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  showTimeDetails: z.boolean().optional(),
  showCategoryBreakdown: z.boolean().optional(),
  showProgress: z.boolean().optional(),
  showInvoiceDownload: z.boolean().optional(),
});
```

### 5.6 퍼블릭 엔드포인트 라우트 핸들러 패턴

```typescript
// app/api/report/[shareToken]/route.ts
// ⚠️ requireUser() 호출 없음 — 퍼블릭 엔드포인트
export async function GET(
  req: Request,
  { params }: { params: { shareToken: string } }
) {
  // 1. service_role_key로 share 조회 (RLS bypass)
  // 2. 유효성 체크 (존재, 미만료, 미철회, 프로젝트 미삭제)
  // 3. access_count 증가 + last_accessed_at 업데이트
  // 4. 공개 설정에 따라 데이터 필터링
  // 5. ClientReport 응답 반환
}
```

---

## 6. i18n 키 추가

### 6.1 F14: 수익성 프리뷰

```json
{
  "profitabilityPreview": {
    "title": "수익성 프리뷰",
    "grossFee": "계약 금액",
    "platformFee": "플랫폼 수수료",
    "tax": "세금",
    "fixedCost": "고정 비용",
    "estimatedNet": "예상 실수령",
    "estimatedRate": "예상 시급",
    "basedOnHours": "{hours}시간 기준",
    "rateDropPercent": "{percent}% 감소",
    "rateDropWarning": "30% 이상 감소",
    "noCosts": "추가 비용 없음",
    "deficit": "적자 프로젝트",
    "checklistTitle": "프로젝트 시작 전 체크리스트",
    "checkRevisionScope": "수정 횟수/범위를 합의했나요?",
    "checkMilestonePayment": "마일스톤별 분할 지급을 협의했나요?",
    "checkPaymentDate": "지급일이 계약서에 명시되어 있나요?"
  }
}
```

### 6.2 F15: 클라이언트 리포트

```json
{
  "clientReport": {
    "shareButton": "클라이언트 리포트 공유",
    "createLink": "새 공유 링크 생성",
    "activeLinks": "활성 링크",
    "revokedLinks": "철회된 링크",
    "labelPlaceholder": "공유 라벨 (예: ABC Corp용)",
    "expiresAt": "만료일",
    "noExpiry": "무기한",
    "showTimeDetails": "작업 내용 및 시간 공개",
    "showCategoryBreakdown": "카테고리 분포 공개",
    "showProgress": "진행률 공개",
    "showInvoiceDownload": "인보이스 다운로드 허용",
    "generateLink": "링크 생성",
    "copyLink": "링크 복사",
    "revokeLink": "철회",
    "revokeConfirm": "이 공유 링크를 철회하시겠습니까? 클라이언트는 더 이상 리포트를 볼 수 없습니다.",
    "editSettings": "설정 변경",
    "lastAccessed": "마지막 조회",
    "accessCount": "{count}회 조회",
    "created": "생성",
    "expires": "만료",
    "linkCopied": "클립보드에 복사됨",
    "revoked": "철회됨"
  },
  "publicReport": {
    "title": "작업 리포트",
    "freelancer": "프리랜서",
    "period": "기간",
    "lastUpdated": "최종 업데이트",
    "projectSummary": "프로젝트 요약",
    "progress": "진행률",
    "totalHours": "총 투입",
    "totalEntries": "작업 수",
    "timeline": "작업 타임라인",
    "categoryBreakdown": "카테고리별 시간 분포",
    "downloadInvoice": "인보이스 PDF 다운로드",
    "noEntries": "아직 작업 기록이 없습니다",
    "showMore": "더 보기",
    "expired": "이 리포트는 만료되었습니다",
    "revoked": "이 리포트는 비활성화되었습니다",
    "notFound": "리포트를 찾을 수 없습니다",
    "poweredBy": "프리랜서의 진짜 시급을 찾아드립니다"
  }
}
```

---

## 7. CLAUDE.md 업데이트 내용

기존 CLAUDE.md에 추가할 섹션:

```markdown
### Core Features (3) → (5)
...기존 3개...
4. **Profitability Preview** — 프로젝트 생성 시 실수령액 즉시 계산 + 체크리스트
5. **Client Work Report** — 공유 가능한 퍼블릭 작업 리포트 (인증 불필요)

### Extended Features 추가
14. **Profitability Preview** — CreateProjectDialog 내 실시간 수익성 프리뷰 카드
15. **Client Work Report** — 공유 토큰 기반 퍼블릭 작업 리포트

### DB Schema (8 Tables) → (9 Tables)
9. **project_shares** — `project_id`, `share_token`, `label?`, `expires_at?`, 
   `show_time_details`, `show_category_breakdown`, `show_progress`, 
   `show_invoice_download`, `is_revoked`, `access_count`, `last_accessed_at`

### API Style 추가 참고
- `/api/report/:shareToken` — 유일한 퍼블릭(인증 불필요) 엔드포인트. service_role_key 사용.

### Key Rules 추가
7. **민감 데이터 퍼블릭 노출 금지** — real_hourly, nominal_hourly, cost_entries, 
   scope alerts, AI insights는 퍼블릭 리포트에 절대 포함하지 않는다.
```

---

## 8. TODO.md 업데이트 내용

### Completed Milestones에 추가 (완료 후)

```markdown
- [x] F14: Profitability Preview — 프로젝트 생성 시 실수령 프리뷰 + 체크리스트
- [x] F15: Client Work Report — 퍼블릭 공유 리포트 (토큰 기반, 인증 불필요)
```

### Priority: Medium에 추가 (후속 개선)

```markdown
### Client Report 확장
- [ ] **리포트 PDF 내보내기** — 퍼블릭 리포트를 PDF로 다운로드
- [ ] **리포트 브랜딩** — 프리랜서 로고/색상 커스터마이징
- [ ] **리포트 코멘트** — 클라이언트가 코멘트 남기기 (양방향 소통)
- [ ] **리포트 승인 버튼** — 클라이언트가 "확인/승인" 표시 (지급 촉진)
- [ ] **마일스톤 트래킹** — 중간 마일스톤 설정 + 완료 표시
- [ ] **연간 세금 예측** — 전체 프로젝트 합산 예상 세금 대시보드
- [ ] **소득 증빙 리포트** — 금융기관 제출용 소득 증명 내보내기
- [ ] **지급일 트래킹** — 프로젝트별 지급 예정일 + 독촉 리마인더
```

---
