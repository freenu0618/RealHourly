# CLAUDE.md — RealHourly

> AI-powered freelancer profitability dashboard.
> "Your contract says $75/hr. Your bank account says $23. Find your real rate."

## Project Overview

**Product**: RealHourly (realhourly.ai)
**Problem**: Freelancers don't know their real hourly rate after hidden costs (platform fees, taxes, tool subscriptions, unbilled time like meetings/emails/revisions).
**Solution**: NLP time logging → hidden cost analysis → real hourly rate calculation → scope creep detection → auto-generated billing messages.
**Target**: Global freelancers (Upwork, Fiverr, 크몽, 숨고 + independent)

**3 Core Features**:
1. **NLP Time Log** — Natural language input → AI parsing → HITL confirmation → save
2. **Real Rate Calculator** — Cost-adjusted hourly rate with "fact bomb" visualization
3. **Scope Creep Alert** — Rule-based detection + LLM-generated billing messages (3 tones)

**Phase**: P0 Hackathon MVP (demo-ready, 3 core screens)

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 15 (App Router) + TypeScript strict |
| Styling | Tailwind CSS + shadcn/ui |
| i18n | next-intl (`/[locale]/[feature]` URL prefix, auto-detect browser lang) |
| DB | Supabase (PostgreSQL + Auth + RLS) |
| ORM | Drizzle ORM (snake_case DB ↔ camelCase DTO) |
| Validation | Zod (single source of truth for forms + API + LLM schemas) |
| Forms | React Hook Form + Zod (shadcn official) |
| Charts | Recharts |
| State | zustand (HITL draft store ONLY — minimal scope) |
| Icons | lucide-react |
| Toast | sonner |
| Date | date-fns (ALL date ops via `lib/date/index.ts` wrapper) |
| Clipboard | navigator.clipboard wrapper (`lib/utils/clipboard.ts`) |
| Temp IDs | nanoid (HITL draft items) |
| Deploy | Vercel |
| Package | pnpm |

### LLM Strategy (OpenAI, Tiered)

| Purpose | Model | Env Var |
|---------|-------|---------|
| Time log parsing (1st) | gpt-5-nano | `LLM_MODEL_PARSE` |
| Time log parsing (fallback) | gpt-5-mini | `LLM_MODEL_PARSE_FALLBACK` |
| Message generation (default) | gpt-5-mini | `LLM_MODEL_GENERATE` |
| Message generation (premium) | gpt-5.2 | `LLM_MODEL_GENERATE_PREMIUM` |

- All LLM calls use **OpenAI Structured Outputs** (`json_schema`, `strict: true`)
- LLM role is minimal: extract/structure only. Server handles validation/matching/normalization.

## Directory Structure

```
src/
├─ app/
│  ├─ (auth)/
│  ├─ (dashboard)/
│  │  ├─ projects/
│  │  │  ├─ page.tsx                        # Projects list
│  │  │  └─ [projectId]/page.tsx            # Project Detail (metrics + charts + alert modal)
│  │  ├─ time-log/page.tsx                  # NLP input
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
│  │  ├─ time/parse/route.ts
│  │  ├─ time/save/route.ts
│  │  ├─ alerts/[alertId]/dismiss/route.ts
│  │  ├─ messages/generate/route.ts
│  │  └─ messages/[messageId]/copied/route.ts
│  ├─ globals.css
│  └─ middleware.ts                         # next-intl locale routing
├─ components/
│  ├─ ui/                                   # shadcn/ui generated
│  ├─ time-log/                             # domain: NLP input + HITL cards
│  ├─ projects/                             # domain: project cards, forms
│  ├─ alerts/                               # domain: scope alert modal
│  └─ charts/                               # domain: bar + pie charts
├─ lib/
│  ├─ ai/
│  │  ├─ time-log-schema.ts                 # LLM parse schema (Zod → JSON Schema)
│  │  └─ message-schema.ts                  # LLM message gen schema
│  ├─ metrics/
│  │  ├─ get-project-metrics.ts             # real hourly calculation
│  │  └─ scope-rules.ts                     # 3 scope creep rules
│  ├─ money/
│  │  ├─ currency.ts                        # currency formatter per locale
│  │  └─ format.ts                          # "fact bomb" format ($50 → $18)
│  ├─ date/index.ts                         # date-fns wrapper (SINGLE ENTRY)
│  ├─ auth/server.ts                        # getUser(), requireUser()
│  ├─ supabase/
│  │  ├─ server.ts
│  │  └─ client.ts
│  ├─ validators/                           # API request Zod schemas
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
│  ├─ schema/                               # Drizzle table/enum definitions
│  ├─ queries/                              # DB access functions (one per domain)
│  └─ index.ts                              # Drizzle client init
├─ store/
│  └─ use-draft-store.ts                    # zustand (HITL draft ONLY)
├─ types/index.ts                           # shared types (minimal)
└─ env.ts                                   # env validation (Zod)
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
- DTO conversion layer: explicit mapping in API layer
- P0: Route Handlers only (no Server Actions)

### Validation Pattern
```typescript
// Every route handler:
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
2. **server-only** — `lib/metrics`, `lib/ai` are server-only. Client components never import them.
3. **Soft delete** — All queries default `WHERE deleted_at IS NULL`. Only `db/queries/*` touches SQL.
4. **Date wrapper** — ALL date operations go through `lib/date/index.ts`. No direct `format()` calls.
5. **Clipboard wrapper** — ALL copy operations go through `lib/utils/clipboard.ts`.

## DB Schema (7 Tables)

All tables: UUID PK, `created_at`, `updated_at`, `deleted_at` (soft delete).
RLS: All tables scoped to `auth.uid()`.

### Enums
- `project_currency`: USD, KRW, EUR, GBP, JPY
- `time_category`: planning, design, development, meeting, revision, admin, email, research, other
- `time_intent`: done, planned
- `cost_type`: platform_fee, tax, tool, contractor, misc
- `alert_type`: scope_rule1, scope_rule2, scope_rule3
- `message_tone`: polite, neutral, firm

### Tables
1. **profiles** — `id` (= auth.users.id), `default_currency`, `timezone` (default 'Asia/Seoul'), `locale`
2. **clients** — `user_id`, `name`. Unique: `(user_id, name)`
3. **projects** — `user_id`, `client_id?`, `name`, `aliases[]`, `start_date?`, `expected_hours`, `expected_fee`, `currency`, `platform_fee_rate` (0~1), `tax_rate` (0~1), `progress_percent` (0~100), `is_active`
4. **time_entries** — `project_id`, `date` (DATE), `minutes` (1~1440), `category`, `intent` (default done), `task_description`, `source_text?`, `issues[]`
5. **cost_entries** — `project_id`, `date?`, `amount` (≥0), `cost_type`, `notes?`
6. **alerts** — `project_id`, `alert_type`, `triggered_at`, `dismissed_at?`, `metadata` (jsonb). Partial unique: `(project_id, alert_type)` WHERE `dismissed_at IS NULL AND deleted_at IS NULL`
7. **generated_messages** — `alert_id`, `tone`, `subject`, `body`, `copied_at?`

## Core Logic Reference

### Real Hourly Calculation
```
gross = expected_fee
platform_fee_amount = gross * platform_fee_rate
tax_amount = gross * tax_rate
direct_cost = sum(cost_entries) + platform_fee_amount + tax_amount
net = gross - direct_cost
total_hours = sum(time_entries.minutes WHERE intent='done') / 60
real_hourly = total_hours > 0 ? net / total_hours : null
nominal_hourly = expected_hours > 0 ? gross / expected_hours : null
```

### Scope Creep Rules (checked in getProjectMetrics)
- **Rule 1**: `(total_hours / expected_hours) >= 0.8 AND progress_percent < 50`
- **Rule 2**: revision category time >= 40% of total time
- **Rule 3**: revision time_entries count >= 5

### UX Principle
> User must input only **minutes**. Everything else is AI-filled or defaulted.
> Blocking Save = project unmatched/ambiguous OR duration missing (pre-filled 60min, user confirms).
> Warnings only (save allowed) = date ambiguous, duration ambiguous, category ambiguous, future intent.

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
OPENAI_API_KEY=
LLM_MODEL_PARSE=gpt-5-nano
LLM_MODEL_PARSE_FALLBACK=gpt-5-mini
LLM_MODEL_GENERATE=gpt-5-mini
LLM_MODEL_GENERATE_PREMIUM=gpt-5.2
```

## Supported Languages
- UI: Korean / English (next-intl, browser auto-detect)
- NLP Input: Korean / English (LLM handles both)
- Currency: KRW, USD, EUR, GBP, JPY (user profile setting)
