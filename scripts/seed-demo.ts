/**
 * Seed script for RealHourly demo data.
 * Run: pnpm seed
 *
 * Prerequisites:
 *   - .env.local with DATABASE_URL
 *   - Database tables already created (via Drizzle migrations or setup-db.sql)
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

// ─── Database connection ───
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL not found in .env.local");
  process.exit(1);
}

const client = postgres(DATABASE_URL, { prepare: false });
const db = drizzle(client);

// ─── Lookup first user from Supabase auth.users ───
async function getFirstUserId(): Promise<string> {
  const rows = await db.execute(
    sql`SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1`,
  );
  if (!rows.length) {
    console.error(
      "❌ 유저가 없습니다. 먼저 회원가입하세요.\n" +
        "   → 앱에서 이메일 로그인 후 다시 실행해주세요.",
    );
    process.exit(1);
  }
  return String(rows[0].id);
}

// ─── Clean existing demo data (idempotent) ───
async function cleanExistingData(userId: string) {
  console.log("🧹 기존 데이터 정리 중...");

  const userProjects = await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.userId, userId));

  const projectIds = userProjects.map((p) => p.id);

  if (projectIds.length > 0) {
    for (const pid of projectIds) {
      // Delete generated messages via alerts
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
  console.log("  ✅ 정리 완료");
}

// ─── Ensure profile exists ───
async function ensureProfile(userId: string) {
  await db
    .insert(profiles)
    .values({
      id: userId,
      defaultCurrency: "USD",
      timezone: "Asia/Seoul",
      locale: "ko",
    })
    .onConflictDoNothing();
}

// ─── Seed data ───
async function seedData(userId: string) {
  // ── Client 1: ABC Corp ──
  console.log("\n📁 클라이언트 생성: ABC Corp");
  const [abcClient] = await db
    .insert(clients)
    .values({ userId, name: "ABC Corp" })
    .returning();

  // ── Project 1: ABC 리브랜딩 (Scope Creep Demo) ──
  console.log("📊 프로젝트 생성: ABC 리브랜딩");
  const [project1] = await db
    .insert(projects)
    .values({
      userId,
      clientId: abcClient.id,
      name: "ABC 리브랜딩",
      aliases: ["ABC", "리브랜딩", "rebrand"],
      startDate: "2026-01-15",
      expectedHours: "40",
      expectedFee: "2000",
      currency: "USD",
      platformFeeRate: "0.20",
      taxRate: "0.10",
      progressPercent: 40,
      isActive: true,
    })
    .returning();

  // Cost entry
  await db.insert(costEntries).values({
    projectId: project1.id,
    amount: "50",
    costType: "tool",
    notes: "Figma Pro",
  });

  // 19 time entries
  const p1Entries = [
    { date: "2026-01-15", minutes: 180, category: "planning" as const, taskDescription: "프로젝트 킥오프 미팅 + 브리프 정리" },
    { date: "2026-01-16", minutes: 240, category: "design" as const, taskDescription: "로고 컨셉 A/B/C 작업" },
    { date: "2026-01-17", minutes: 120, category: "meeting" as const, taskDescription: "클라이언트 피드백 미팅" },
    { date: "2026-01-17", minutes: 60, category: "email" as const, taskDescription: "피드백 정리 메일" },
    { date: "2026-01-20", minutes: 300, category: "design" as const, taskDescription: "로고 B안 디테일 작업" },
    { date: "2026-01-21", minutes: 180, category: "revision" as const, taskDescription: "1차 수정: 컬러 변경 요청" },
    { date: "2026-01-22", minutes: 240, category: "revision" as const, taskDescription: "2차 수정: 폰트 + 레이아웃" },
    { date: "2026-01-23", minutes: 120, category: "meeting" as const, taskDescription: "수정사항 확인 미팅" },
    { date: "2026-01-23", minutes: 60, category: "admin" as const, taskDescription: "인보이스 작성" },
    { date: "2026-01-24", minutes: 180, category: "revision" as const, taskDescription: "3차 수정: 최종 컬러 조정" },
    { date: "2026-01-27", minutes: 240, category: "design" as const, taskDescription: "브랜드 가이드 문서 작성" },
    { date: "2026-01-28", minutes: 180, category: "revision" as const, taskDescription: "4차 수정: 가이드 피드백 반영" },
    { date: "2026-01-29", minutes: 120, category: "revision" as const, taskDescription: "5차 수정: 최종 승인전 미세 조정" },
    { date: "2026-01-30", minutes: 60, category: "meeting" as const, taskDescription: "최종 리뷰 미팅" },
    { date: "2026-01-30", minutes: 60, category: "email" as const, taskDescription: "최종 파일 전달 + 감사 메일" },
    { date: "2026-02-03", minutes: 180, category: "revision" as const, taskDescription: "추가 수정: 명함 디자인 요청 (scope creep)" },
    { date: "2026-02-04", minutes: 120, category: "design" as const, taskDescription: "명함 디자인 작업" },
    { date: "2026-02-05", minutes: 60, category: "revision" as const, taskDescription: "명함 수정" },
    { date: "2026-02-05", minutes: 120, category: "research" as const, taskDescription: "경쟁사 브랜드 리서치" },
  ];

  await db.insert(timeEntries).values(
    p1Entries.map((e) => ({
      projectId: project1.id,
      date: e.date,
      minutes: e.minutes,
      category: e.category,
      intent: "done" as const,
      taskDescription: e.taskDescription,
    })),
  );
  console.log(`  ⏱️  타임 엔트리 ${p1Entries.length}건 삽입`);

  // Pre-create alerts for demo
  // Actual totals: 2820 min = 47h, revision = 1140/2820 = 40.4%
  await db.insert(alerts).values({
    projectId: project1.id,
    alertType: "scope_rule1",
    metadata: {
      rule1: { timeRatio: 1.18, threshold: 0.8, progressPercent: 40, totalHours: 47, expectedHours: 40 },
    },
  });
  await db.insert(alerts).values({
    projectId: project1.id,
    alertType: "scope_rule2",
    metadata: {
      rule2: { revisionRatio: 0.40, threshold: 0.4, revisionMinutes: 1140, totalMinutes: 2820 },
    },
  });
  await db.insert(alerts).values({
    projectId: project1.id,
    alertType: "scope_rule3",
    metadata: {
      rule3: { revisionCount: 7, threshold: 5 },
    },
  });
  console.log("  🚨 스코프 크립 알림 3건 생성 (Rule 1, Rule 2, Rule 3)");

  // ── Client 2: XYZ Studio ──
  console.log("\n📁 클라이언트 생성: XYZ Studio");
  const [xyzClient] = await db
    .insert(clients)
    .values({ userId, name: "XYZ Studio" })
    .returning();

  // ── Project 2: XYZ 웹사이트 리디자인 (Healthy Project) ──
  console.log("📊 프로젝트 생성: XYZ 웹사이트 리디자인");
  const [project2] = await db
    .insert(projects)
    .values({
      userId,
      clientId: xyzClient.id,
      name: "XYZ 웹사이트 리디자인",
      aliases: ["XYZ", "웹사이트", "website"],
      startDate: "2026-01-10",
      expectedHours: "60",
      expectedFee: "3000",
      currency: "USD",
      platformFeeRate: "0.10",
      taxRate: "0.033",
      progressPercent: 70,
      isActive: true,
    })
    .returning();

  // Cost entry
  await db.insert(costEntries).values({
    projectId: project2.id,
    amount: "20",
    costType: "tool",
    notes: "Vercel Pro",
  });

  // 6 time entries
  const p2Entries = [
    { date: "2026-01-10", minutes: 180, category: "planning" as const, taskDescription: "요구사항 정리 + 와이어프레임" },
    { date: "2026-01-13", minutes: 300, category: "design" as const, taskDescription: "메인 페이지 디자인" },
    { date: "2026-01-15", minutes: 240, category: "development" as const, taskDescription: "퍼블리싱 작업" },
    { date: "2026-01-17", minutes: 120, category: "meeting" as const, taskDescription: "중간 리뷰 미팅" },
    { date: "2026-01-20", minutes: 300, category: "development" as const, taskDescription: "서브 페이지 개발" },
    { date: "2026-01-22", minutes: 180, category: "design" as const, taskDescription: "반응형 디자인 작업" },
  ];

  await db.insert(timeEntries).values(
    p2Entries.map((e) => ({
      projectId: project2.id,
      date: e.date,
      minutes: e.minutes,
      category: e.category,
      intent: "done" as const,
      taskDescription: e.taskDescription,
    })),
  );
  console.log(`  ⏱️  타임 엔트리 ${p2Entries.length}건 삽입`);
  console.log("  ✅ 스코프 경고 없음 (건강한 프로젝트)");

  return { project1, project2 };
}

// ─── Verification output ───
function printVerification() {
  // Project 1: ABC 리브랜딩
  const p1_gross = 2000;
  const p1_platformFee = p1_gross * 0.20; // 400
  const p1_tax = p1_gross * 0.10; // 200
  const p1_fixedCost = 50;
  const p1_directCost = p1_platformFee + p1_tax + p1_fixedCost; // 650
  const p1_net = p1_gross - p1_directCost; // 1350
  const p1_totalMin = 2820; // actual sum of 19 entries
  const p1_totalHours = p1_totalMin / 60; // 47
  const p1_nominalHourly = p1_gross / 40; // 50
  const p1_realHourly = p1_net / p1_totalHours; // 28.72

  // Project 2: XYZ 웹사이트 리디자인
  const p2_gross = 3000;
  const p2_platformFee = p2_gross * 0.10; // 300
  const p2_tax = p2_gross * 0.033; // 99
  const p2_fixedCost = 20;
  const p2_directCost = p2_platformFee + p2_tax + p2_fixedCost; // 419
  const p2_net = p2_gross - p2_directCost; // 2581
  const p2_totalMin = 1320;
  const p2_totalHours = p2_totalMin / 60; // 22
  const p2_nominalHourly = p2_gross / 60; // 50
  const p2_realHourly = p2_net / p2_totalHours; // 117.32

  console.log(`
=== 시드 데이터 삽입 완료 ===

프로젝트 1: ABC 리브랜딩
  타임 엔트리: 19건
  총 시간: ${p1_totalMin.toLocaleString()}분 (${p1_totalHours}시간)
  revision 건수: 7건 → Rule 3 트리거 예상 ✅
  revision 비율: 1,140/${p1_totalMin} = 40.4% → Rule 2 트리거 예상 ✅
  시간 소진율: ${p1_totalHours}/${40} = ${(p1_totalHours / 40 * 100).toFixed(0)}% + 진척도 40% → Rule 1 트리거 예상 ✅
  예상 명목 시급: $${p1_nominalHourly.toFixed(2)}
  예상 실제 시급: $${p1_realHourly.toFixed(2)}

프로젝트 2: XYZ 웹사이트 리디자인
  타임 엔트리: 6건
  총 시간: ${p2_totalMin.toLocaleString()}분 (${p2_totalHours}시간)
  스코프 경고 없음 예상 ❌
  예상 명목 시급: $${p2_nominalHourly.toFixed(2)}
  예상 실제 시급: $${p2_realHourly.toFixed(2)} (건강한 프로젝트)
`);
}

// ─── Main ───
async function main() {
  console.log("=== RealHourly Demo Seed ===\n");

  try {
    const userId = await getFirstUserId();
    console.log(`👤 유저 ID: ${userId}\n`);

    await cleanExistingData(userId);
    await ensureProfile(userId);
    await seedData(userId);

    printVerification();
  } catch (error) {
    console.error("\n❌ 시드 실패:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
