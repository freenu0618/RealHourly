# CLAUDE.md — RealHourly

> AI-powered freelancer profitability dashboard.
> "Your contract says $75/hr. Your bank account says $23. Find your real rate."

## Project Overview

**Product**: RealHourly (real-hourly.com)
**Problem**: Freelancers don't know their real hourly rate after hidden costs (platform fees, taxes, tool subscriptions, unbilled time like meetings/emails/revisions).
**Solution**: NLP time logging → hidden cost analysis → real hourly rate calculation → scope creep detection → auto-generated billing messages.
**Target**: Global freelancers (Upwork, Fiverr, 크몽, 숨고 + independent)

**Phase**: P1 — MVP Complete, Production-Ready + Monetization Active

### Core Features (5)
1. **NLP Time Log** — Natural language + voice input → AI parsing → HITL confirmation → save
2. **Real Rate Calculator** — Cost-adjusted hourly rate with "fact bomb" visualization
3. **Scope Creep Alert** — Rule-based detection + LLM-generated billing messages (3 tones)
4. **Profitability Preview** — Real-time profitability preview during project creation with checklist
5. **Client Work Report** — Shareable public work report via token-based links (no auth required)

### Extended Features
6. **Dashboard** — KPI cards (NumberTicker, MagicCard, drill-down), weekly chart, briefing card (BorderBeam), recent entries
7. **Analytics** — Multi-project comparison, category breakdown, hourly ranking, scatter plot, date presets
8. **Weekly Reports** — Auto-generated weekly summaries with AI insights
9. **Voice Input** — Audio recording → Whisper transcription → NLP parsing
10. **PDF Invoice/Estimate** — AI-generated line items, professional PDF output
11. **Project Lifecycle** — Status management (active/completed/paused/cancelled), progress tracking
12. **Settings** — Profile, preferences (currency/timezone/locale), data export
13. **Marketing Landing** — MagicUI redesign (NumberTicker, ShimmerButton, PulsatingButton, BorderBeam, MagicCard, BentoGrid, Marquee, Safari mockup)
14. **AI Chat Assistant** — Floating chat panel with full user context, conversational Q&A, localStorage persistence, markdown rendering
15. **AI Consultant Page** — Dedicated full-page chat with 5 specialist roles (data analyst, business advisor, career guide, time coach, financial consultant)
16. **Payment & Subscription** — Polar integration, Free/Pro plans ($9/mo, $7/mo yearly), feature gates, monthly usage tracking
17. **Timesheet Approval Workflow** — Weekly timesheet (draft→submitted→approved/rejected), magic link client review, entry locking, audit trail, anomaly flags
18. **Pre-signup Guide & Calculator** — Public `/features` page (7 feature deep-dives reusing GuideSection) + public `/calculator` page (unbilled time-aware rate calculator with cost breakdown). No auth required. PLG conversion strategy.

## Tech Stack

| Layer | Tech | Version |
|-------|------|---------|
| Framework | Next.js (App Router) + TypeScript strict | 16.1.6 / 5.9 |
| Styling | Tailwind CSS + shadcn/ui | 4 |
| i18n | next-intl (`/[locale]/...` URL prefix, browser auto-detect) | 4.8.2 |
| DB | Supabase (PostgreSQL + Auth + RLS) | |
| ORM | Drizzle ORM (snake_case DB ↔ camelCase DTO) | 0.45.1 |
| Validation | Zod (single source of truth for forms + API + LLM schemas) | 4.3.6 |
| Forms | React Hook Form + Zod | 7.71.1 |
| Charts | Recharts | 3.7.0 |
| State | zustand (HITL draft store ONLY — minimal scope) | 5.0.11 |
| Icons | lucide-react | |
| Toast | sonner | 2.0.7 |
| Date | date-fns (ALL date ops via `lib/date/index.ts` wrapper) | 4.1.0 |
| PDF | @react-pdf/renderer | 4.3.2 |
| Clipboard | navigator.clipboard wrapper (`lib/utils/clipboard.ts`) | |
| Temp IDs | nanoid (HITL draft items) | |
| Deploy | Vercel | |
| Package | pnpm | |
| Animation | framer-motion | 12.x |
| MagicUI | number-ticker, border-beam, shimmer-button, pulsating-button, marquee, dot-pattern, safari, magic-card, bento-grid, animated-shiny-text | |
| Payment | @polar-sh/nextjs (Polar checkout + webhooks) | |

### LLM Strategy (OpenAI, Tiered)

| Purpose | Model | Env Var | Status |
|---------|-------|---------|--------|
| Time log parsing (Primary) | gpt-5-mini | `LLM_MODEL_PARSE` | Working |
| Time log parsing (Fallback) | gpt-5-mini | `LLM_MODEL_PARSE_FALLBACK` | Working |
| Message generation (default) | gpt-5-mini | `LLM_MODEL_GENERATE` | Working |
| Weekly insight generation | gpt-5-mini | `LLM_MODEL_GENERATE` | Working |
| Invoice item generation | gpt-5-mini | `LLM_MODEL_GENERATE` | Working |
| AI Chat assistant | gpt-5-mini | `LLM_MODEL_GENERATE` | Working |
| Daily briefing | gpt-5-mini | `LLM_MODEL_GENERATE` | Working |
| Message generation (premium) | gpt-5.2 | `LLM_MODEL_GENERATE_PREMIUM` | Not used |

- Most LLM calls use **OpenAI Structured Outputs** (`json_schema`, `strict: true`). Chat uses free-text.
- LLM role is minimal: extract/structure only. Server handles validation/matching/normalization.

#### GPT-5 Model API Rules

| Parameter | gpt-4o family | gpt-5 family |
|-----------|---------------|--------------|
| Token limit | `max_tokens` | `max_completion_tokens` (required) |
| Temperature | `temperature: 0~2` | default(1) only, custom not supported |

Using `max_tokens` will cause `400 Unsupported parameter` error. Must use `max_completion_tokens`.

#### Structured Outputs Strict Mode Rules
- Nullable fields: use `"type": ["string", "null"]` array format (OpenAI official)
- `additionalProperties: false` required on ALL objects
- ALL fields must be in `required` array (even nullable ones)
- Enum fields: `"type": "string"` + `"enum": [...]` format

## Directory Structure

```
src/
├─ app/
│  ├─ [locale]/
│  │  ├─ (auth)/
│  │  │  ├─ login/page.tsx
│  │  │  ├─ reset-password/page.tsx
│  │  │  ├─ verify/page.tsx
│  │  │  └─ layout.tsx
│  │  ├─ (dashboard)/
│  │  │  ├─ dashboard/page.tsx               # KPI + weekly chart + alerts
│  │  │  ├─ projects/page.tsx                # Project list with tab filter
│  │  │  ├─ projects/[projectId]/page.tsx    # Detail (metrics + charts + lifecycle)
│  │  │  ├─ time-log/page.tsx                # NLP + voice input
│  │  │  ├─ time-log/history/page.tsx        # Calendar + list view
│  │  │  ├─ analytics/page.tsx               # Multi-project comparison
│  │  │  ├─ reports/page.tsx                 # Weekly reports list
│  │  │  ├─ reports/[weekStart]/page.tsx     # Report detail
│  │  │  ├─ settings/page.tsx                # Profile + preferences
│  │  │  ├─ clients/page.tsx                 # Client management
│  │  │  ├─ chat/page.tsx                  # AI Consultant (5 roles)
│  │  │  ├─ timesheets/page.tsx            # Timesheet management
│  │  │  └─ layout.tsx
│  │  ├─ (marketing)/
│  │  │  ├─ page.tsx                         # Landing page
│  │  │  ├─ features/page.tsx                # Public feature guide (no auth)
│  │  │  ├─ calculator/page.tsx              # Public rate calculator (no auth)
│  │  │  └─ layout.tsx
│  │  └─ layout.tsx
│  ├─ api/
│  │  ├─ health/route.ts
│  │  ├─ auth/logout/route.ts
│  │  ├─ dashboard/route.ts
│  │  ├─ clients/route.ts
│  │  ├─ clients/[clientId]/route.ts
│  │  ├─ projects/route.ts
│  │  ├─ projects/[projectId]/route.ts
│  │  ├─ projects/[projectId]/metrics/route.ts
│  │  ├─ projects/[projectId]/cost-entries/route.ts
│  │  ├─ projects/[projectId]/invoice/route.ts
│  │  ├─ projects/[projectId]/shares/route.ts
│  │  ├─ shares/[shareId]/route.ts
│  │  ├─ report/[shareToken]/route.ts           # PUBLIC (no auth)
│  │  ├─ cost-entries/[costEntryId]/route.ts
│  │  ├─ time/parse/route.ts
│  │  ├─ time/save/route.ts
│  │  ├─ time/history/route.ts
│  │  ├─ time/transcribe/route.ts
│  │  ├─ time/[entryId]/route.ts
│  │  ├─ alerts/[alertId]/dismiss/route.ts
│  │  ├─ messages/generate/route.ts
│  │  ├─ messages/[messageId]/copied/route.ts
│  │  ├─ analytics/comparison/route.ts
│  │  ├─ reports/weekly/route.ts
│  │  ├─ reports/weekly/generate/route.ts
│  │  ├─ ai/chat/route.ts
│  │  ├─ ai/daily-briefing/route.ts
│  │  ├─ timesheets/route.ts             # Timesheet CRUD (POST create, GET list)
│  │  ├─ timesheets/[id]/route.ts        # Timesheet detail (GET)
│  │  ├─ timesheets/[id]/submit/route.ts # Submit timesheet (POST)
│  │  ├─ timesheets/review/[token]/route.ts # PUBLIC client review (GET/POST)
│  │  ├─ time/[entryId]/history/route.ts # Audit trail (GET)
│  │  ├─ time/flags/route.ts            # Entry flags (GET)
│  │  ├─ time/flags/[flagId]/dismiss/route.ts # Dismiss flag (POST)
│  │  ├─ polar/checkout/route.ts         # Polar checkout session
│  │  ├─ polar/webhooks/route.ts         # Polar webhook handler
│  │  ├─ subscription/route.ts           # Subscription status
│  │  ├─ settings/profile/route.ts
│  │  ├─ settings/preferences/route.ts
│  │  ├─ settings/export/route.ts
│  │  └─ og/route.tsx
│  ├─ globals.css
│  ├─ report/[shareToken]/page.tsx            # Public report page (no locale)
│  ├─ timesheet-review/[token]/page.tsx       # PUBLIC timesheet review (no locale)
│  └─ middleware.ts                          # next-intl + Supabase auth
├─ components/
│  ├─ ui/                    # shadcn/ui + fade-in animation (27 components)
│  ├─ time-log/              # NLP input, HITL cards, history, calendar (15)
│  ├─ projects/              # Cards, forms, lifecycle, cost entries, shares (18)
│  ├─ analytics/             # Charts, insights, comparison (6)
│  ├─ reports/               # Weekly report components + PublicReportClient (6)
│  ├─ charts/                # HourlyRateBar, CostBreakdownPie (2)
│  ├─ alerts/                # ScopeAlertModal (1)
│  ├─ timesheets/            # Timesheet list, detail, submit, review, status badge (5)
│  ├─ dashboard/             # DashboardClient (1)
│  ├─ settings/              # Profile, preferences, account, data (5)
│  ├─ chat/                  # AI chat + consultant page (5)
│  ├─ landing/               # Marketing landing page sections (17, incl. PublicGuideContent, FullCalculator)
│  ├─ layout/                # PageHeader (1)
│  └─ app-sidebar.tsx        # Navigation sidebar
├─ lib/
│  ├─ ai/                    # LLM integrations (14 files)
│  ├─ metrics/               # Real hourly calc + scope rules + entry flags (3)
│  ├─ money/                 # Currency formatting (2)
│  ├─ pdf/                   # Invoice/estimate PDF (2)
│  ├─ reports/               # Weekly data collection (1)
│  ├─ polar/                 # Polar payment + feature-gate.ts (Free/Pro enforcement)
│  ├─ date/index.ts          # date-fns wrapper (SINGLE ENTRY)
│  ├─ auth/                  # getUser(), requireUser(), auth-actions (2)
│  ├─ supabase/              # Server, client, middleware (3)
│  ├─ api/                   # Error handling, response wrapper, rate-limit (3)
│  ├─ validators/            # Zod schemas (11 files, incl. timesheet-schema.ts)
│  ├─ hooks/                 # useCountUp, useStepLoader, useThinkingLog, useAudioRecorder (4)
│  └─ utils/                 # cn, nanoid, clipboard, category-emoji (5)
├─ db/
│  ├─ schema/                # Drizzle table/enum definitions (16 files)
│  ├─ queries/               # DB access functions (14 files, incl. timesheets, versions, flags)
│  └─ index.ts               # Drizzle client init
├─ store/
│  └─ use-draft-store.ts     # zustand (HITL draft ONLY)
├─ types/
│  └─ time-log.ts            # NLP parsing types
├─ i18n/
│  ├─ routing.ts
│  ├─ request.ts
│  └─ navigation.ts
└─ env.ts                    # env validation (Zod)
```

## Coding Conventions

### Naming
- React components: **PascalCase** (`TimeLogInterface.tsx`)
- Hooks/stores: **useXxx** (`useDraftStore.ts`)
- Server logic/utils: **kebab-case** (`get-project-metrics.ts`)
- Zod schemas: **SomethingSchema** (`CreateProjectSchema`)
- Enum values: **lowercase** (`done`, `planned`, `polite`)
- Currency: **UPPERCASE ISO** (`USD`, `KRW`) — only exception

### Import Alias
- `@/*` = `src/*`
- Example: `@/lib/metrics/get-project-metrics`, `@/components/ui/button`

### API Style
- RESTful CRUD + action endpoints (e.g., `/api/time/parse`)
- Request/Response JSON: **camelCase**
- DB columns: **snake_case** (Drizzle schema)
- DTO conversion layer: explicit mapping in `db/queries/dto.ts`
- Route Handlers only (no Server Actions for data mutations)

### Validation Pattern
```typescript
export async function POST(req: Request) {
  const user = await requireUser();
  const body = CreateProjectSchema.parse(await req.json());
  const result = await createProject(user.id, body);
  return NextResponse.json({ data: result }, { status: 201 });
}
```

### Error Response Shape
```json
{ "error": { "code": "SOME_CODE", "message": "Human readable", "details": {} } }
```

### Key Rules
1. **Zod = Single Source of Truth** — forms, API, LLM schemas all Zod-based
2. **server-only** — `lib/metrics`, `lib/ai`, `lib/pdf` are server-only. Client components never import them.
3. **Soft delete** — All queries default `WHERE deleted_at IS NULL`. Only `db/queries/*` touches SQL.
4. **Date wrapper** — ALL date operations go through `lib/date/index.ts`. No direct `format()` calls.
5. **Clipboard wrapper** — ALL copy operations go through `lib/utils/clipboard.ts`.
6. **Category emoji** — ALL category emoji mappings from `lib/utils/category-emoji.ts`.
7. **Rate limiting** — AI endpoints use sliding-window rate limiter (`lib/api/rate-limit.ts`).
8. **Input sanitization** — LLM inputs sanitized via `lib/ai/sanitize-input.ts`.
9. **Error Boundary** — Dashboard pages wrapped in `<ErrorBoundary>` (`components/error-boundary.tsx`).
10. **Public data policy** — real_hourly, nominal_hourly, cost_entries, scope alerts, AI insights are NEVER exposed in public report API (`/api/report/[shareToken]`).
11. **Public endpoint** — `/api/report/:shareToken`, `/api/polar/webhooks`, and `/api/timesheets/review/:token` are unauthenticated. Report uses IP-based rate limiting (60 req/min).
13. **Entry locking** — Approved timesheet entries have `lockedAt` set. Locked entries return 403 on PATCH/DELETE.
12. **Feature gates** — Pro-only features enforced server-side. Free users get 403 `PLAN_LIMIT` or `QUOTA_EXCEEDED`.

## DB Schema (14 Tables)

All tables: UUID PK, `created_at`, `updated_at`, `deleted_at` (soft delete).
RLS: All tables scoped to `auth.uid()`.

### Enums
- `project_currency`: USD, KRW, EUR, GBP, JPY
- `project_status`: active, completed, paused, cancelled
- `time_category`: planning, design, development, meeting, revision, admin, email, research, other
- `time_intent`: done, planned
- `cost_type`: platform_fee, tax, tool, contractor, misc
- `alert_type`: scope_rule1, scope_rule2, scope_rule3, scope_rule4
- `message_tone`: polite, neutral, firm
- `timesheet_status`: draft, submitted, approved, rejected

### Tables
1. **profiles** — `id` (= auth.users.id), `display_name`, `default_currency`, `hourly_goal`, `timezone` (default 'Asia/Seoul'), `locale`, `plan_type` (free/pro), `plan_expires_at?`
2. **clients** — `user_id`, `name`. Unique: `(user_id, name)`
3. **projects** — `user_id`, `client_id?`, `name`, `aliases[]`, `start_date?`, `expected_hours`, `expected_fee`, `currency`, `platform_fee_rate` (0~1), `tax_rate` (0~1), `progress_percent` (0~100), `is_active` (deprecated), `status` (enum, source of truth), `completed_at?`
4. **time_entries** — `project_id`, `date` (DATE), `minutes` (1~1440), `category`, `intent` (default done), `task_description`, `source_text?`, `issues[]`, `timesheet_id?`, `locked_at?`
5. **cost_entries** — `project_id`, `date?`, `amount` (>=0), `cost_type`, `notes?`
6. **alerts** — `project_id`, `alert_type`, `triggered_at`, `dismissed_at?`, `metadata` (jsonb). Partial unique: `(project_id, alert_type)` WHERE `dismissed_at IS NULL AND deleted_at IS NULL`
7. **generated_messages** — `alert_id`, `tone`, `subject`, `body`, `copied_at?`
8. **weekly_reports** — `user_id`, `week_start`, `week_end`, `data` (jsonb), `ai_insight`
9. **project_shares** — `project_id`, `share_token` (UUID), `label?`, `expires_at?`, `show_time_details`, `show_category_breakdown`, `show_progress`, `show_invoice_download`, `is_revoked`, `access_count`, `last_accessed_at`. Unique index on `share_token` WHERE not deleted/revoked.
10. **usage_counts** — `user_id`, `feature` (nlp_parse/ai_chat), `period` (YYYY-MM), `count`. Monthly quota tracking with UPSERT.
11. **timesheets** — `project_id`, `user_id`, `week_start`, `week_end`, `status` (draft/submitted/approved/rejected), `submitted_at?`, `approved_at?`, `rejected_at?`, `reviewer_note?`, `total_minutes`. Unique: `(project_id, week_start)` WHERE not deleted.
12. **timesheet_approvals** — `timesheet_id`, `action` (submitted/approved/rejected), `reviewer_email?`, `reviewer_token` (UUID, auto-generated), `note?`, `acted_at?`
13. **time_entry_versions** — `time_entry_id`, `changed_by`, `changed_at`, `change_type` (create/update/delete), `old_values` (jsonb), `new_values` (jsonb)
14. **entry_flags** — `time_entry_id`, `flag_type` (weekend_work/long_session/backdated/round_number), `severity` (info/warning), `metadata` (jsonb), `dismissed_at?`

### Feature Gate System (`lib/polar/feature-gate.ts`)
- **Free**: 2 projects, 20 NLP parse/mo, 10 AI chat/mo, 1 scope alert project, no PDF/shares/weekly/briefing/CSV/voice
- **Pro** ($9/mo, $7/mo yearly): All unlimited
- Enforcement: `requireFeature()` for boolean limits, `checkQuota()` + `trackUsage()` for monthly quotas, `checkProjectLimit()` for project count
- Payment: Polar checkout → webhook → `profiles.plan_type` update

## Core Logic Reference

### Real Hourly Calculation
```
gross = expected_fee
platform_fee_amount = gross * platform_fee_rate
tax_amount = gross * tax_rate
direct_cost = sum(cost_entries WHERE type NOT IN ('platform_fee','tax')) + platform_fee_amount + tax_amount
net = gross - direct_cost
total_hours = sum(time_entries.minutes WHERE intent='done') / 60
real_hourly = total_hours > 0 ? net / total_hours : null
nominal_hourly = expected_hours > 0 ? gross / expected_hours : null
```

### Scope Creep Rules (checked in getProjectMetrics)
- **Rule 1**: `(total_hours / expected_hours) >= 0.8 AND progress_percent < 50`
- **Rule 2**: revision category time >= 40% of total time
- **Rule 3**: revision time_entries count >= 5

### Project Status Transitions
- `active` → `completed` (sets completedAt, progressPercent=100)
- `active` → `paused`
- `active` → `cancelled`
- `completed`/`paused`/`cancelled` → `active` (clears completedAt)
- Note: `status` is the single source of truth. `is_active` column is deprecated.

### UX Principle
> User must input only **minutes**. Everything else is AI-filled or defaulted.
> Blocking Save = project unmatched/ambiguous OR duration missing (pre-filled 60min, user confirms).
> Warnings only (save allowed) = date ambiguous, duration ambiguous, category ambiguous, future intent.

## Design System

### Brand Colors
- **Primary (Blue)**: `#2B6B93` — Logo clock + "Real" text (trust, professionalism)
- **Accent (Orange)**: `#E8882D` — Logo dollar + "Hourly" text (energy, revenue)
- **Light mode background**: `#FFFFFF` (clean white)
- **Dark mode background**: `#0F0F0F` (deep gray)

### Semantic Status Colors
- Success: `#16A34A` / dark `#4ADE80`
- Warning: `#E8882D` / dark `#FB923C`
- Danger: `#DC2626` / dark `#F87171`
- Info: `#2B6B93` / dark `#5BA3CF`

### Animation System
- **Library**: framer-motion (viewport-triggered)
- **Components**: `FadeIn` (blur optional), `StaggerContainer`, `StaggerItem` in `components/ui/fade-in.tsx`
- **Accessibility**: All animations respect `prefers-reduced-motion: reduce`

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=          # metadataBase (default: https://real-hourly.com)
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
OPENAI_API_KEY=
LLM_MODEL_PARSE=gpt-5-mini
LLM_MODEL_PARSE_FALLBACK=gpt-5-mini
LLM_MODEL_GENERATE=gpt-5-mini
LLM_MODEL_GENERATE_PREMIUM=gpt-5.2
```

## Supported Languages
- UI: Korean / English (next-intl, browser auto-detect)
- NLP Input: Korean / English (LLM handles both)
- Currency: KRW, USD, EUR, GBP, JPY (user profile setting)

## Build & Deploy
```bash
pnpm install
pnpm build          # Next.js production build (58 pages)
pnpm test:run       # Vitest unit tests (88 tests)
pnpm drizzle-kit push   # Push schema changes to DB
pnpm seed           # Seed demo data (optional)
```
