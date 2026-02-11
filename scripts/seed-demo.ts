/**
 * RealHourly Demo Seed — 3 months of realistic freelancer data.
 *
 * Run:  pnpm seed:demo [userId]
 *       pnpm seed:demo              → uses first auth.users row
 *       pnpm seed:demo abc-123-...  → uses specific user ID
 *
 * Prerequisites:
 *   - .env.local with DATABASE_URL
 *   - At least one Supabase auth user exists (sign up first)
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, sql } from "drizzle-orm";

import { profiles } from "../src/db/schema/profiles";
import { clients } from "../src/db/schema/clients";
import { projects } from "../src/db/schema/projects";
import { timeEntries } from "../src/db/schema/time-entries";
import { costEntries } from "../src/db/schema/cost-entries";
import { alerts } from "../src/db/schema/alerts";
import { generatedMessages } from "../src/db/schema/generated-messages";
import { aiActions } from "../src/db/schema/ai-actions";

// ─── Database connection ───
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not found in .env.local");
  process.exit(1);
}

const pgClient = postgres(DATABASE_URL, { prepare: false });
const db = drizzle(pgClient);

// ─── Date helpers ───
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function dateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Generate weekday dates within a range (Mon-Fri) */
function weekdays(startDaysAgo: number, endDaysAgo: number): string[] {
  const result: string[] = [];
  for (let i = startDaysAgo; i >= endDaysAgo; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dow = d.getDay();
    if (dow >= 1 && dow <= 5) result.push(d.toISOString().slice(0, 10));
  }
  return result;
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ─── Get user ID ───
async function getUserId(): Promise<string> {
  const argId = process.argv[2];
  if (argId) return argId;

  const rows = await db.execute(
    sql`SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1`,
  );
  if (!rows.length) {
    console.error(
      "No users found. Sign up first, then re-run.\n" +
        "Or pass userId: pnpm seed:demo <userId>",
    );
    process.exit(1);
  }
  return String(rows[0].id);
}

// ─── Clean existing data (idempotent) ───
async function cleanExistingData(userId: string) {
  console.log("Cleaning existing data...");

  // Clean ai_actions
  await db.delete(aiActions).where(eq(aiActions.userId, userId));

  const userProjects = await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.userId, userId));

  const projectIds = userProjects.map((p) => p.id);

  if (projectIds.length > 0) {
    for (const pid of projectIds) {
      const projectAlerts = await db
        .select({ id: alerts.id })
        .from(alerts)
        .where(eq(alerts.projectId, pid));
      for (const alert of projectAlerts) {
        await db
          .delete(generatedMessages)
          .where(eq(generatedMessages.alertId, alert.id));
      }
      await db.delete(alerts).where(eq(alerts.projectId, pid));
      await db.delete(timeEntries).where(eq(timeEntries.projectId, pid));
      await db.delete(costEntries).where(eq(costEntries.projectId, pid));
    }
    await db.delete(projects).where(eq(projects.userId, userId));
  }

  await db.delete(clients).where(eq(clients.userId, userId));
  console.log("  Done\n");
}

// ─── Ensure profile ───
async function ensureProfile(userId: string) {
  await db
    .insert(profiles)
    .values({
      id: userId,
      displayName: "Demo User",
      defaultCurrency: "KRW",
      hourlyGoal: 40000,
      timezone: "Asia/Seoul",
      locale: "ko",
    })
    .onConflictDoNothing();
}

// ─── Time entry task descriptions ───
const TASKS = {
  design: [
    "메인 페이지 UI 작업",
    "서브 페이지 레이아웃 디자인",
    "모바일 반응형 디자인",
    "아이콘 세트 제작",
    "배너 그래픽 작업",
    "컬러 팔레트 확정",
    "타이포그래피 가이드 작성",
    "프로토타입 제작",
    "디자인 시스템 컴포넌트 정리",
    "일러스트레이션 작업",
  ],
  development: [
    "프론트엔드 컴포넌트 개발",
    "API 엔드포인트 구현",
    "데이터베이스 스키마 설계",
    "로그인/회원가입 기능 구현",
    "결제 연동 작업",
    "검색 기능 개발",
    "성능 최적화",
    "반응형 퍼블리싱",
    "SEO 설정",
    "배포 환경 구성",
  ],
  meeting: [
    "킥오프 미팅",
    "주간 진행 미팅",
    "중간 리뷰 미팅",
    "피드백 회의",
    "최종 리뷰 미팅",
    "스프린트 회고",
  ],
  revision: [
    "로고 컨셉 수정 (1차)",
    "로고 컨셉 수정 (2차)",
    "로고 컨셉 수정 (3차)",
    "컬러 변경 요청 반영",
    "폰트 교체 수정",
    "레이아웃 전면 재작업",
    "추가 수정: 배너 사이즈 변경",
    "추가 수정: 아이콘 스타일 통일",
    "클라이언트 피드백 반영 수정",
    "최종 승인전 미세 조정",
  ],
  planning: [
    "요구사항 정리",
    "와이어프레임 작성",
    "프로젝트 스케줄 수립",
    "기술 스택 검토",
    "경쟁사 분석",
    "사용자 리서치",
  ],
  email: [
    "피드백 정리 메일 발송",
    "견적서 발송",
    "진행 상황 공유 메일",
    "최종 파일 전달",
    "인보이스 발송",
  ],
  admin: [
    "인보이스 작성",
    "계약서 검토",
    "파일 정리 및 백업",
    "미팅 노트 정리",
  ],
  research: [
    "경쟁사 브랜드 리서치",
    "트렌드 분석",
    "기술 스택 조사",
    "사용자 인터뷰 분석",
    "벤치마킹 자료 수집",
  ],
};

type Category = "planning" | "design" | "development" | "meeting" | "revision" | "admin" | "email" | "research";

function pickTask(cat: Category): string {
  const list = TASKS[cat] ?? ["기타 작업"];
  return pick(list);
}

/** Generate time entries for a project across given dates with specified category distribution */
function generateEntries(
  dates: string[],
  distribution: Record<Category, number>, // weight 0-100
  dailyMin: number,
  dailyMax: number,
): { date: string; minutes: number; category: Category; taskDescription: string }[] {
  const cats = Object.entries(distribution) as [Category, number][];
  const totalWeight = cats.reduce((sum, [, w]) => sum + w, 0);

  // Build weighted category pool
  const pool: Category[] = [];
  for (const [cat, weight] of cats) {
    const count = Math.round((weight / totalWeight) * 100);
    for (let i = 0; i < count; i++) pool.push(cat);
  }

  const entries: { date: string; minutes: number; category: Category; taskDescription: string }[] = [];

  for (const date of dates) {
    // 1-3 entries per day
    const entryCount = randBetween(1, 3);
    const totalDayMin = randBetween(dailyMin, dailyMax);
    const perEntry = Math.round(totalDayMin / entryCount);

    for (let i = 0; i < entryCount; i++) {
      const cat = pick(pool);
      const minutes = Math.max(30, perEntry + randBetween(-30, 30));
      entries.push({
        date,
        minutes: Math.round(minutes / 30) * 30, // round to 30min
        category: cat,
        taskDescription: pickTask(cat),
      });
    }
  }

  return entries;
}

// ─── Main seed ───
async function seedData(userId: string) {
  // ═══════════════════════════════════════════
  // CLIENTS
  // ═══════════════════════════════════════════
  console.log("=== Clients ===");

  const [clientAlpha] = await db
    .insert(clients)
    .values({ userId, name: "스타트업 Alpha" })
    .returning();
  console.log("  + 스타트업 Alpha (good client)");

  const [clientBeta] = await db
    .insert(clients)
    .values({ userId, name: "에이전시 Beta" })
    .returning();
  console.log("  + 에이전시 Beta (average client)");

  const [clientGamma] = await db
    .insert(clients)
    .values({ userId, name: "대기업 Gamma" })
    .returning();
  console.log("  + 대기업 Gamma (problematic client)");

  // ═══════════════════════════════════════════
  // PROJECT 1: Alpha 앱 디자인 — COMPLETED, good ₩46K/h
  // ═══════════════════════════════════════════
  console.log("\n=== Project 1: Alpha 앱 디자인 (COMPLETED, ~₩46K/h) ===");

  const [p1] = await db
    .insert(projects)
    .values({
      userId,
      clientId: clientAlpha.id,
      name: "Alpha 앱 디자인",
      aliases: ["Alpha", "앱 디자인", "app design"],
      startDate: daysAgo(85),
      expectedHours: "80",
      expectedFee: "5600000",  // ₩560만
      currency: "KRW",
      platformFeeRate: "0.05",
      taxRate: "0.033",
      progressPercent: 100,
      status: "completed",
      completedAt: new Date(daysAgo(20)),
    })
    .returning();

  // P1 time entries: ~80h over ~60 working days, low revision
  const p1Dates = weekdays(85, 20);
  const p1Entries = generateEntries(
    p1Dates.slice(0, 45), // use 45 of the ~45 weekdays
    { development: 40, design: 30, meeting: 10, revision: 5, planning: 8, email: 4, admin: 3, research: 0 },
    90, 150,
  );
  // Target ~4800min (80h). Adjust if needed.
  let p1TotalMin = p1Entries.reduce((s, e) => s + e.minutes, 0);
  // Scale entries to ~4800min
  const p1Scale = 4800 / p1TotalMin;
  for (const e of p1Entries) {
    e.minutes = Math.max(30, Math.round((e.minutes * p1Scale) / 30) * 30);
  }
  p1TotalMin = p1Entries.reduce((s, e) => s + e.minutes, 0);

  await db.insert(timeEntries).values(
    p1Entries.map((e) => ({
      projectId: p1.id,
      date: e.date,
      minutes: e.minutes,
      category: e.category,
      intent: "done" as const,
      taskDescription: e.taskDescription,
    })),
  );
  console.log(`  Time entries: ${p1Entries.length} (${p1TotalMin}min = ${(p1TotalMin / 60).toFixed(1)}h)`);

  // P1 costs
  await db.insert(costEntries).values([
    { projectId: p1.id, amount: "33000", costType: "tool" as const, notes: "Figma Pro (3개월)", date: daysAgo(80) },
    { projectId: p1.id, amount: "15000", costType: "tool" as const, notes: "스톡 이미지 패키지", date: daysAgo(60) },
  ]);
  console.log("  Costs: 2 items");

  // P1 calculation:
  // gross=5,600,000 platform=280,000 tax=184,800 fixed=48,000
  // net=5,600,000-280,000-184,800-48,000 = 5,087,200
  // ~80h → real hourly ~63,590 (great!)
  // But with more hours it'll be lower → target ~₩46K

  // ═══════════════════════════════════════════
  // PROJECT 2: Beta 웹사이트 리뉴얼 — IN PROGRESS 70%, ~₩28K/h
  // ═══════════════════════════════════════════
  console.log("\n=== Project 2: Beta 웹사이트 리뉴얼 (IN PROGRESS 70%, ~₩28K/h) ===");

  const [p2] = await db
    .insert(projects)
    .values({
      userId,
      clientId: clientBeta.id,
      name: "Beta 웹사이트 리뉴얼",
      aliases: ["Beta", "웹사이트", "website"],
      startDate: daysAgo(60),
      expectedHours: "100",
      expectedFee: "4000000", // ₩400만
      currency: "KRW",
      platformFeeRate: "0.10",
      taxRate: "0.033",
      progressPercent: 70,
      status: "active",
    })
    .returning();

  // P2 time entries: ~75h so far over ~40 days
  const p2Dates = weekdays(60, 3);
  const p2Entries = generateEntries(
    p2Dates.slice(0, 35),
    { development: 45, design: 20, meeting: 10, revision: 12, planning: 5, email: 3, admin: 3, research: 2 },
    100, 180,
  );
  let p2TotalMin = p2Entries.reduce((s, e) => s + e.minutes, 0);
  const p2Scale = 4500 / p2TotalMin; // ~75h = 4500min
  for (const e of p2Entries) {
    e.minutes = Math.max(30, Math.round((e.minutes * p2Scale) / 30) * 30);
  }
  p2TotalMin = p2Entries.reduce((s, e) => s + e.minutes, 0);

  await db.insert(timeEntries).values(
    p2Entries.map((e) => ({
      projectId: p2.id,
      date: e.date,
      minutes: e.minutes,
      category: e.category,
      intent: "done" as const,
      taskDescription: e.taskDescription,
    })),
  );
  console.log(`  Time entries: ${p2Entries.length} (${p2TotalMin}min = ${(p2TotalMin / 60).toFixed(1)}h)`);

  // P2 costs
  await db.insert(costEntries).values([
    { projectId: p2.id, amount: "55000", costType: "tool" as const, notes: "Vercel Pro (2개월)", date: daysAgo(55) },
    { projectId: p2.id, amount: "22000", costType: "tool" as const, notes: "도메인 구매", date: daysAgo(50) },
    { projectId: p2.id, amount: "110000", costType: "contractor" as const, notes: "카피라이팅 외주", date: daysAgo(30) },
  ]);
  console.log("  Costs: 3 items");

  // P2 calculation:
  // gross=4,000,000 platform=400,000 tax=132,000 fixed=187,000
  // net=3,281,000  ~75h → real hourly ~43,747  (okay)

  // ═══════════════════════════════════════════
  // PROJECT 3: Gamma 리브랜딩 — IN PROGRESS 45%, ~₩15K/h (BAD!)
  // ═══════════════════════════════════════════
  console.log("\n=== Project 3: Gamma 리브랜딩 (IN PROGRESS 45%, ~₩15K/h - SCOPE CREEP!) ===");

  const [p3] = await db
    .insert(projects)
    .values({
      userId,
      clientId: clientGamma.id,
      name: "Gamma 리브랜딩",
      aliases: ["Gamma", "리브랜딩", "rebrand", "감마"],
      startDate: daysAgo(70),
      expectedHours: "60",
      expectedFee: "3000000", // ₩300만
      currency: "KRW",
      platformFeeRate: "0.10",
      taxRate: "0.033",
      progressPercent: 45,
      agreedRevisionCount: 3,
      status: "active",
    })
    .returning();

  // P3 time entries: heavy revision 45%, ~90h despite only 60h expected
  const p3Dates = weekdays(70, 2);
  const p3Entries = generateEntries(
    p3Dates.slice(0, 40),
    { design: 20, development: 10, meeting: 8, revision: 45, planning: 5, email: 7, admin: 3, research: 2 },
    120, 210,
  );
  let p3TotalMin = p3Entries.reduce((s, e) => s + e.minutes, 0);
  const p3Scale = 5400 / p3TotalMin; // ~90h = 5400min
  for (const e of p3Entries) {
    e.minutes = Math.max(30, Math.round((e.minutes * p3Scale) / 30) * 30);
  }
  p3TotalMin = p3Entries.reduce((s, e) => s + e.minutes, 0);

  // Ensure enough revision entries for scope_rule3 (need >=5)
  const revisionCount = p3Entries.filter((e) => e.category === "revision").length;

  await db.insert(timeEntries).values(
    p3Entries.map((e) => ({
      projectId: p3.id,
      date: e.date,
      minutes: e.minutes,
      category: e.category,
      intent: "done" as const,
      taskDescription: e.taskDescription,
    })),
  );
  console.log(`  Time entries: ${p3Entries.length} (${p3TotalMin}min = ${(p3TotalMin / 60).toFixed(1)}h)`);
  console.log(`  Revision entries: ${revisionCount}`);

  // P3 costs
  await db.insert(costEntries).values([
    { projectId: p3.id, amount: "45000", costType: "tool" as const, notes: "Adobe CC (2개월)", date: daysAgo(65) },
    { projectId: p3.id, amount: "88000", costType: "tool" as const, notes: "스톡 이미지 + 폰트 라이선스", date: daysAgo(40) },
    { projectId: p3.id, amount: "200000", costType: "contractor" as const, notes: "3D 로고 모델링 외주", date: daysAgo(25) },
  ]);
  console.log("  Costs: 3 items");

  // P3 Alerts — scope creep!
  const revisionMinutes = p3Entries.filter((e) => e.category === "revision").reduce((s, e) => s + e.minutes, 0);
  const revisionRatio = revisionMinutes / p3TotalMin;
  const timeRatio = (p3TotalMin / 60) / 60; // totalHours / expectedHours

  const [alert1] = await db.insert(alerts).values({
    projectId: p3.id,
    alertType: "scope_rule1",
    metadata: {
      rule1: { timeRatio: Math.round(timeRatio * 100) / 100, threshold: 0.8, progressPercent: 45, totalHours: Math.round(p3TotalMin / 60 * 10) / 10, expectedHours: 60 },
    },
  }).returning();

  await db.insert(alerts).values({
    projectId: p3.id,
    alertType: "scope_rule2",
    metadata: {
      rule2: { revisionRatio: Math.round(revisionRatio * 100) / 100, threshold: 0.4, revisionMinutes, totalMinutes: p3TotalMin },
    },
  });

  await db.insert(alerts).values({
    projectId: p3.id,
    alertType: "scope_rule3",
    metadata: {
      rule3: { revisionCount, threshold: 5 },
    },
  });
  console.log("  Alerts: 3 scope creep alerts (Rule 1, 2, 3)");

  // Pre-generate billing messages for the first alert
  await db.insert(generatedMessages).values([
    {
      alertId: alert1.id,
      tone: "polite",
      subject: "프로젝트 진행 관련 협의 요청드립니다",
      body: "안녕하세요, Gamma 리브랜딩 프로젝트 관련하여 말씀드릴 부분이 있어 연락드립니다.\n\n현재 프로젝트 진행률 대비 투입 시간이 초과되고 있어, 향후 일정과 범위에 대해 함께 논의하면 좋겠습니다.\n\n편하신 시간에 짧은 미팅이 가능하실까요? 감사합니다.",
    },
    {
      alertId: alert1.id,
      tone: "neutral",
      subject: "Gamma 리브랜딩 — 추가 작업 범위 조정 필요",
      body: "안녕하세요.\n\nGamma 리브랜딩 프로젝트에서 당초 합의된 범위 외 추가 작업이 발생하고 있습니다.\n\n현재까지 약 90시간이 투입되었으며 이는 계약 시간(60시간)을 크게 초과한 상태입니다. 추가 작업에 대한 별도 비용 협의를 제안드립니다.",
    },
    {
      alertId: alert1.id,
      tone: "firm",
      subject: "Gamma 리브랜딩 — 추가 비용 청구 안내",
      body: "안녕하세요.\n\nGamma 리브랜딩 프로젝트가 계약 범위를 크게 초과하고 있어 안내드립니다.\n\n- 계약 시간: 60시간\n- 실제 투입: 약 90시간 (+50% 초과)\n- 수정 작업 비율: 45% (합의 3회 대비 다수 초과)\n\n초과 30시간에 대한 추가 비용 ₩1,500,000을 청구드리며, 향후 추가 수정은 별도 견적으로 진행하겠습니다.",
    },
  ]);
  console.log("  Generated messages: 3 (polite/neutral/firm)");

  // ═══════════════════════════════════════════
  // PROJECT 4: Alpha 마케팅 랜딩 — IN PROGRESS 30%, ~₩35K/h
  // ═══════════════════════════════════════════
  console.log("\n=== Project 4: Alpha 마케팅 랜딩 (IN PROGRESS 30%, ~₩35K/h) ===");

  const [p4] = await db
    .insert(projects)
    .values({
      userId,
      clientId: clientAlpha.id,
      name: "Alpha 마케팅 랜딩",
      aliases: ["Alpha 랜딩", "마케팅", "landing"],
      startDate: daysAgo(25),
      expectedHours: "40",
      expectedFee: "2000000", // ₩200만
      currency: "KRW",
      platformFeeRate: "0.05",
      taxRate: "0.033",
      progressPercent: 30,
      status: "active",
    })
    .returning();

  // P4 time entries: ~15h so far
  const p4Dates = weekdays(25, 1);
  const p4Entries = generateEntries(
    p4Dates.slice(0, 12),
    { development: 35, design: 35, meeting: 10, revision: 5, planning: 10, email: 3, admin: 2, research: 0 },
    60, 100,
  );
  let p4TotalMin = p4Entries.reduce((s, e) => s + e.minutes, 0);
  const p4Scale = 900 / p4TotalMin; // ~15h = 900min
  for (const e of p4Entries) {
    e.minutes = Math.max(30, Math.round((e.minutes * p4Scale) / 30) * 30);
  }
  p4TotalMin = p4Entries.reduce((s, e) => s + e.minutes, 0);

  await db.insert(timeEntries).values(
    p4Entries.map((e) => ({
      projectId: p4.id,
      date: e.date,
      minutes: e.minutes,
      category: e.category,
      intent: "done" as const,
      taskDescription: e.taskDescription,
    })),
  );
  console.log(`  Time entries: ${p4Entries.length} (${p4TotalMin}min = ${(p4TotalMin / 60).toFixed(1)}h)`);

  // P4 costs
  await db.insert(costEntries).values([
    { projectId: p4.id, amount: "22000", costType: "tool" as const, notes: "Figma Pro (1개월)", date: daysAgo(20) },
  ]);
  console.log("  Costs: 1 item");

  // ═══════════════════════════════════════════
  // PROJECT 5: Gamma 추가 작업 — NOT STARTED (for profitability preview demo)
  // ═══════════════════════════════════════════
  console.log("\n=== Project 5: Gamma 추가 작업 (NOT STARTED - for preview demo) ===");

  await db
    .insert(projects)
    .values({
      userId,
      clientId: clientGamma.id,
      name: "Gamma 추가 작업",
      aliases: ["Gamma 추가", "감마 추가"],
      expectedHours: "30",
      expectedFee: "1500000", // ₩150만
      currency: "KRW",
      platformFeeRate: "0.10",
      taxRate: "0.033",
      progressPercent: 0,
      status: "active",
    })
    .returning();
  console.log("  No time/cost entries (clean project for preview)");

  // ═══════════════════════════════════════════
  // ADDITIONAL COST ENTRIES (shared tools)
  // ═══════════════════════════════════════════
  console.log("\n=== Additional cost entries ===");
  await db.insert(costEntries).values([
    { projectId: p2.id, amount: "15000", costType: "misc" as const, notes: "미팅 카페 비용", date: daysAgo(45) },
    { projectId: p2.id, amount: "30000", costType: "misc" as const, notes: "교통비 (클라이언트 방문 2회)", date: daysAgo(35) },
    { projectId: p3.id, amount: "25000", costType: "misc" as const, notes: "미팅 커피/식사", date: daysAgo(50) },
    { projectId: p3.id, amount: "33000", costType: "tool" as const, notes: "Notion Team (1개월)", date: daysAgo(15) },
  ]);
  console.log("  + 4 misc/tool entries across projects");

  // ═══════════════════════════════════════════
  // AI ACTIONS
  // ═══════════════════════════════════════════
  console.log("\n=== AI Actions ===");

  // 1. Pending daily briefing (today)
  await db.insert(aiActions).values({
    userId,
    projectId: null,
    type: "briefing",
    status: "pending",
    title: "오늘의 브리핑: Gamma 리브랜딩 시간 초과 주의",
    message: "Gamma 리브랜딩 프로젝트가 예상 시간의 150%를 사용했습니다. Beta 웹사이트는 70% 완료로 순조롭습니다.\n\n👉 Gamma 클라이언트에게 추가 비용 안내 메시지를 보내보세요.",
    payload: { date: daysAgo(0) },
  });
  console.log("  + 1 pending briefing");

  // 2. Pending billing suggestions
  await db.insert(aiActions).values({
    userId,
    projectId: p3.id,
    type: "billing_suggestion",
    status: "pending",
    title: "Gamma 리브랜딩: 초과 시간 30시간에 대한 추가 청구 검토",
    message: "현재 90시간 투입 (계약 60시간). 추가 30시간 x ₩50,000 = ₩1,500,000 청구를 권장합니다.",
    payload: { projectName: "Gamma 리브랜딩", overHours: 30, suggestedAmount: 1500000 },
  });

  await db.insert(aiActions).values({
    userId,
    projectId: p3.id,
    type: "scope_alert",
    status: "pending",
    title: "Gamma 리브랜딩: 수정 작업 비율 45% — 범위 재협의 필요",
    message: "수정 작업이 전체의 45%를 차지합니다. 합의된 수정 횟수(3회)를 크게 초과했습니다.",
    payload: { projectName: "Gamma 리브랜딩", revisionPercent: 45, agreedCount: 3 },
  });
  console.log("  + 2 pending suggestions (billing + scope)");

  // 3. Dismissed action
  await db.insert(aiActions).values({
    userId,
    projectId: p2.id,
    type: "followup_reminder",
    status: "dismissed",
    title: "Beta 웹사이트: 중간 결과물 공유 리마인더",
    message: "Beta 웹사이트 리뉴얼이 70% 진행되었습니다. 중간 결과물을 클라이언트에게 공유하세요.",
    payload: { projectName: "Beta 웹사이트 리뉴얼" },
    actedAt: new Date(daysAgo(5)),
  });
  console.log("  + 1 dismissed action");

  // ═══════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════
  const totalEntries = p1Entries.length + p2Entries.length + p3Entries.length + p4Entries.length;
  const totalMin = p1TotalMin + p2TotalMin + p3TotalMin + p4TotalMin;

  // Calculations
  const calcProject = (name: string, gross: number, pfRate: number, taxRate: number, fixedCost: number, totalM: number, expectedH: number) => {
    const pf = gross * pfRate;
    const tax = gross * taxRate;
    const net = gross - pf - tax - fixedCost;
    const hours = totalM / 60;
    const nominalH = gross / expectedH;
    const realH = hours > 0 ? net / hours : 0;
    return { name, gross, net: Math.round(net), hours: Math.round(hours * 10) / 10, nominalH: Math.round(nominalH), realH: Math.round(realH) };
  };

  const calcs = [
    calcProject("Alpha 앱 디자인", 5600000, 0.05, 0.033, 48000, p1TotalMin, 80),
    calcProject("Beta 웹사이트 리뉴얼", 4000000, 0.10, 0.033, 187000, p2TotalMin, 100),
    calcProject("Gamma 리브랜딩", 3000000, 0.10, 0.033, 391000, p3TotalMin, 60),
    calcProject("Alpha 마케팅 랜딩", 2000000, 0.05, 0.033, 22000, p4TotalMin, 40),
  ];

  console.log(`
========================================
  SEED COMPLETE
========================================
  Clients:      3
  Projects:     5 (1 completed, 3 active, 1 empty)
  Time entries: ${totalEntries} (${totalMin}min = ${(totalMin / 60).toFixed(1)}h)
  Cost entries: 13
  Alerts:       3 scope creep (Gamma)
  Messages:     3 pre-generated
  AI Actions:   4 (1 briefing + 2 pending + 1 dismissed)

  PROJECT METRICS:
`);

  for (const c of calcs) {
    console.log(`  ${c.name}`);
    console.log(`    ${c.hours}h worked | Nominal: ₩${c.nominalH.toLocaleString()}/h | Real: ₩${c.realH.toLocaleString()}/h`);
  }
  console.log("");
}

// ─── Main ───
async function main() {
  console.log("=== RealHourly Demo Seed ===\n");

  try {
    const userId = await getUserId();
    console.log(`User: ${userId}\n`);

    await cleanExistingData(userId);
    await ensureProfile(userId);
    await seedData(userId);
  } catch (error) {
    console.error("\nSeed failed:", error);
    process.exit(1);
  } finally {
    await pgClient.end();
  }
}

main();
