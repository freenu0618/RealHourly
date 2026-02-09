/**
 * Verify seed data and metrics calculation.
 * Run: pnpm tsx scripts/verify-seed.ts
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, and, isNull, sql } from "drizzle-orm";

import { clients } from "../src/db/schema/clients";
import { projects } from "../src/db/schema/projects";
import { timeEntries } from "../src/db/schema/time-entries";
import { costEntries } from "../src/db/schema/cost-entries";
import { alerts } from "../src/db/schema/alerts";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL not found in .env.local");
  process.exit(1);
}

const pgClient = postgres(DATABASE_URL, { prepare: false });
const db = drizzle(pgClient);

// ─── Test helpers ───
let passed = 0;
let failed = 0;

function assert(label: string, actual: unknown, expected: unknown) {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  if (actualStr === expectedStr) {
    console.log(`  ✅ ${label}: ${actualStr}`);
    passed++;
  } else {
    console.log(`  ❌ ${label}: got ${actualStr}, expected ${expectedStr}`);
    failed++;
  }
}

function assertApprox(label: string, actual: number, expected: number, tolerance = 0.01) {
  if (Math.abs(actual - expected) <= tolerance) {
    console.log(`  ✅ ${label}: ${actual.toFixed(2)}`);
    passed++;
  } else {
    console.log(`  ❌ ${label}: got ${actual.toFixed(2)}, expected ${expected.toFixed(2)}`);
    failed++;
  }
}

// ─── Get first user ───
async function getFirstUserId(): Promise<string> {
  const rows = await db.execute(
    sql`SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1`,
  );
  if (!rows.length) {
    console.error("❌ 유저가 없습니다.");
    process.exit(1);
  }
  return String(rows[0].id);
}

// ─── Step 2: DB verification ───
async function verifyDB(userId: string) {
  console.log("\n══════════════════════════════════════");
  console.log("  2단계: DB 데이터 검증");
  console.log("══════════════════════════════════════\n");

  // 1. Clients check
  console.log("📋 클라이언트 테이블:");
  const userClients = await db
    .select({ id: clients.id, name: clients.name })
    .from(clients)
    .where(and(eq(clients.userId, userId), isNull(clients.deletedAt)));

  assert("클라이언트 수", userClients.length, 2);
  const clientNames = userClients.map((c) => c.name).sort();
  assert("클라이언트 이름", clientNames, ["ABC Corp", "XYZ Studio"]);

  // 2. Projects check
  console.log("\n📋 프로젝트 테이블:");
  const userProjects = await db
    .select({
      id: projects.id,
      name: projects.name,
      expectedFee: projects.expectedFee,
      expectedHours: projects.expectedHours,
      platformFeeRate: projects.platformFeeRate,
      taxRate: projects.taxRate,
      progressPercent: projects.progressPercent,
      aliases: projects.aliases,
      currency: projects.currency,
    })
    .from(projects)
    .where(and(eq(projects.userId, userId), isNull(projects.deletedAt)));

  assert("프로젝트 수", userProjects.length, 2);

  // ── ABC 리브랜딩 ──
  const abc = userProjects.find((p) => p.name === "ABC 리브랜딩");
  if (!abc) {
    console.log("  ❌ 'ABC 리브랜딩' 프로젝트를 찾을 수 없습니다.");
    failed++;
    return { abcId: "", xyzId: "" };
  }

  console.log("\n📊 프로젝트 1: ABC 리브랜딩");

  // Time entries
  const abcTimeEntries = await db
    .select()
    .from(timeEntries)
    .where(
      and(
        eq(timeEntries.projectId, abc.id),
        isNull(timeEntries.deletedAt),
      ),
    );
  assert("타임 엔트리 건수", abcTimeEntries.length, 19);

  // SUM(minutes) WHERE intent='done'
  const [abcSum] = await db
    .select({ total: sql<number>`COALESCE(SUM(${timeEntries.minutes}), 0)` })
    .from(timeEntries)
    .where(
      and(
        eq(timeEntries.projectId, abc.id),
        eq(timeEntries.intent, "done"),
        isNull(timeEntries.deletedAt),
      ),
    );
  assert("SUM(minutes) intent=done", Number(abcSum.total), 2820);

  // Revision count
  const abcRevisions = abcTimeEntries.filter(
    (e) => e.category === "revision",
  );
  assert("revision 카테고리 건수", abcRevisions.length, 7);

  // Cost entries
  const abcCosts = await db
    .select({ amount: costEntries.amount, costType: costEntries.costType })
    .from(costEntries)
    .where(
      and(
        eq(costEntries.projectId, abc.id),
        isNull(costEntries.deletedAt),
      ),
    );
  assert("비용 항목 건수", abcCosts.length, 1);
  assert("비용 금액", Number(abcCosts[0]?.amount), 50);

  // ── XYZ 웹사이트 리디자인 ──
  const xyz = userProjects.find((p) => p.name === "XYZ 웹사이트 리디자인");
  if (!xyz) {
    console.log("  ❌ 'XYZ 웹사이트 리디자인' 프로젝트를 찾을 수 없습니다.");
    failed++;
    return { abcId: abc.id, xyzId: "" };
  }

  console.log("\n📊 프로젝트 2: XYZ 웹사이트 리디자인");

  const xyzTimeEntries = await db
    .select()
    .from(timeEntries)
    .where(
      and(
        eq(timeEntries.projectId, xyz.id),
        isNull(timeEntries.deletedAt),
      ),
    );
  assert("타임 엔트리 건수", xyzTimeEntries.length, 6);

  const [xyzSum] = await db
    .select({ total: sql<number>`COALESCE(SUM(${timeEntries.minutes}), 0)` })
    .from(timeEntries)
    .where(
      and(
        eq(timeEntries.projectId, xyz.id),
        eq(timeEntries.intent, "done"),
        isNull(timeEntries.deletedAt),
      ),
    );
  assert("SUM(minutes) intent=done", Number(xyzSum.total), 1320);

  const xyzCosts = await db
    .select({ amount: costEntries.amount, costType: costEntries.costType })
    .from(costEntries)
    .where(
      and(
        eq(costEntries.projectId, xyz.id),
        isNull(costEntries.deletedAt),
      ),
    );
  assert("비용 항목 건수", xyzCosts.length, 1);
  assert("비용 금액", Number(xyzCosts[0]?.amount), 20);

  return { abcId: abc.id, xyzId: xyz.id };
}

// ─── Step 3: Metrics calculation verification ───
// Re-implement getProjectMetrics logic inline (no @/ alias in scripts)
async function verifyMetrics(
  userId: string,
  abcId: string,
  xyzId: string,
) {
  console.log("\n══════════════════════════════════════");
  console.log("  3단계: 메트릭스 계산 검증");
  console.log("══════════════════════════════════════");

  // Helper: get project data
  async function getProject(projectId: string) {
    const [row] = await db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.id, projectId),
          eq(projects.userId, userId),
          isNull(projects.deletedAt),
        ),
      );
    return row;
  }

  // Helper: sum minutes
  async function sumMinutes(projectId: string): Promise<number> {
    const [result] = await db
      .select({
        total: sql<number>`COALESCE(SUM(${timeEntries.minutes}), 0)`,
      })
      .from(timeEntries)
      .where(
        and(
          eq(timeEntries.projectId, projectId),
          eq(timeEntries.intent, "done"),
          isNull(timeEntries.deletedAt),
        ),
      );
    return Number(result.total);
  }

  // Helper: sum fixed costs (excluding platform_fee, tax types)
  async function sumFixedCosts(projectId: string): Promise<number> {
    const [result] = await db
      .select({
        total: sql<number>`COALESCE(SUM(${costEntries.amount}::numeric), 0)`,
      })
      .from(costEntries)
      .where(
        and(
          eq(costEntries.projectId, projectId),
          sql`${costEntries.costType} NOT IN ('platform_fee', 'tax')`,
          isNull(costEntries.deletedAt),
        ),
      );
    return Number(result.total);
  }

  // Helper: get time entries for scope rules
  async function getTimeEntryInfos(projectId: string) {
    const rows = await db
      .select({ minutes: timeEntries.minutes, category: timeEntries.category })
      .from(timeEntries)
      .where(
        and(
          eq(timeEntries.projectId, projectId),
          eq(timeEntries.intent, "done"),
          isNull(timeEntries.deletedAt),
        ),
      );
    return rows;
  }

  // ── ABC 리브랜딩 ──
  console.log("\n📊 ABC 리브랜딩 — 메트릭스 계산");
  const abcProject = await getProject(abcId);
  if (!abcProject) {
    console.log("  ❌ ABC 프로젝트를 찾을 수 없음");
    failed++;
    return;
  }

  const abcTotalMinutes = await sumMinutes(abcId);
  const abcFixedCosts = await sumFixedCosts(abcId);
  const abcEntryInfos = await getTimeEntryInfos(abcId);

  const abcGross = Number(abcProject.expectedFee);
  const abcPlatformFee = abcGross * Number(abcProject.platformFeeRate);
  const abcTax = abcGross * Number(abcProject.taxRate);
  const abcDirectCost = abcFixedCosts + abcPlatformFee + abcTax;
  const abcNet = abcGross - abcDirectCost;
  const abcTotalHours = abcTotalMinutes / 60;
  const abcExpectedHours = Number(abcProject.expectedHours);
  const abcNominalHourly = abcExpectedHours > 0 ? abcGross / abcExpectedHours : null;
  const abcRealHourly = abcTotalHours > 0 ? abcNet / abcTotalHours : null;

  assertApprox("gross", abcGross, 2000);
  assertApprox("platform_fee_amount", abcPlatformFee, 400);
  assertApprox("tax_amount", abcTax, 200);
  assertApprox("fixed_cost", abcFixedCosts, 50);
  assertApprox("direct_cost", abcDirectCost, 650);
  assertApprox("net", abcNet, 1350);
  assertApprox("total_hours", abcTotalHours, 47);
  assertApprox("nominal_hourly", abcNominalHourly!, 50.00);
  assertApprox("real_hourly", abcRealHourly!, 28.72);

  // Scope rules
  console.log("\n  🚨 스코프 크립 룰 검증:");
  const abcTimeRatio = abcTotalHours / abcExpectedHours;
  const abcProgressPercent = abcProject.progressPercent;
  const rule1Triggered = abcTimeRatio >= 0.8 && abcProgressPercent < 50;
  assert("Rule 1 (시간초과+진행부족)", rule1Triggered, true);

  const abcRevisionMinutes = abcEntryInfos
    .filter((e) => e.category === "revision")
    .reduce((s, e) => s + e.minutes, 0);
  const abcRevisionRatio = abcRevisionMinutes / abcTotalMinutes;
  const rule2Triggered = abcRevisionRatio >= 0.4;
  // revision: 1140/2820 = 40.4% → at 40%, TRIGGERED
  assert("Rule 2 (수정비율 40%+)", rule2Triggered, true);
  console.log(`    ℹ️  revision 비율: ${(abcRevisionRatio * 100).toFixed(1)}% (threshold: 40%)`);

  const abcRevisionCount = abcEntryInfos.filter(
    (e) => e.category === "revision",
  ).length;
  const rule3Triggered = abcRevisionCount >= 5;
  assert("Rule 3 (수정횟수 5+)", rule3Triggered, true);
  console.log(`    ℹ️  revision 건수: ${abcRevisionCount}건`);

  // Check alerts in DB
  const abcAlerts = await db
    .select({ alertType: alerts.alertType })
    .from(alerts)
    .where(
      and(eq(alerts.projectId, abcId), isNull(alerts.dismissedAt)),
    );
  const alertTypes = abcAlerts.map((a) => a.alertType).sort();
  assert("DB 알림 타입", alertTypes, ["scope_rule1", "scope_rule2", "scope_rule3"]);

  // ── XYZ 웹사이트 리디자인 ──
  console.log("\n📊 XYZ 웹사이트 리디자인 — 메트릭스 계산");
  const xyzProject = await getProject(xyzId);
  if (!xyzProject) {
    console.log("  ❌ XYZ 프로젝트를 찾을 수 없음");
    failed++;
    return;
  }

  const xyzTotalMinutes = await sumMinutes(xyzId);
  const xyzFixedCosts = await sumFixedCosts(xyzId);
  const xyzEntryInfos = await getTimeEntryInfos(xyzId);

  const xyzGross = Number(xyzProject.expectedFee);
  const xyzPlatformFee = xyzGross * Number(xyzProject.platformFeeRate);
  const xyzTax = xyzGross * Number(xyzProject.taxRate);
  const xyzDirectCost = xyzFixedCosts + xyzPlatformFee + xyzTax;
  const xyzNet = xyzGross - xyzDirectCost;
  const xyzTotalHours = xyzTotalMinutes / 60;
  const xyzExpectedHours = Number(xyzProject.expectedHours);
  const xyzNominalHourly = xyzExpectedHours > 0 ? xyzGross / xyzExpectedHours : null;
  const xyzRealHourly = xyzTotalHours > 0 ? xyzNet / xyzTotalHours : null;

  assertApprox("gross", xyzGross, 3000);
  assertApprox("platform_fee_amount", xyzPlatformFee, 300);
  assertApprox("tax_amount", xyzTax, 99);
  assertApprox("fixed_cost", xyzFixedCosts, 20);
  assertApprox("direct_cost", xyzDirectCost, 419);
  assertApprox("net", xyzNet, 2581);
  assertApprox("total_hours", xyzTotalHours, 22);
  assertApprox("nominal_hourly", xyzNominalHourly!, 50.00);

  // real_hourly should be > 40 (healthy project)
  const xyzRealHealthy = xyzRealHourly !== null && xyzRealHourly > 40;
  assert("real_hourly > $40 (건강한 프로젝트)", xyzRealHealthy, true);
  console.log(`    ℹ️  actual real_hourly: $${xyzRealHourly!.toFixed(2)}`);

  // Scope rules — none should trigger
  console.log("\n  🚨 스코프 크립 룰 검증:");
  const xyzTimeRatio = xyzTotalHours / xyzExpectedHours;
  const xyzRule1 = xyzTimeRatio >= 0.8 && xyzProject.progressPercent < 50;
  assert("Rule 1 트리거", xyzRule1, false);

  const xyzRevisionMinutes = xyzEntryInfos
    .filter((e) => e.category === "revision")
    .reduce((s, e) => s + e.minutes, 0);
  const xyzRule2 = xyzTotalMinutes > 0 && xyzRevisionMinutes / xyzTotalMinutes >= 0.4;
  assert("Rule 2 트리거", xyzRule2, false);

  const xyzRevisionCount = xyzEntryInfos.filter(
    (e) => e.category === "revision",
  ).length;
  const xyzRule3 = xyzRevisionCount >= 5;
  assert("Rule 3 트리거", xyzRule3, false);

  // No alerts in DB for XYZ
  const xyzAlerts = await db
    .select({ id: alerts.id })
    .from(alerts)
    .where(
      and(eq(alerts.projectId, xyzId), isNull(alerts.dismissedAt)),
    );
  assert("XYZ 활성 알림 수", xyzAlerts.length, 0);
}

// ─── Main ───
async function main() {
  console.log("══════════════════════════════════════");
  console.log("  RealHourly 시드 데이터 검증");
  console.log("══════════════════════════════════════");

  try {
    const userId = await getFirstUserId();
    console.log(`\n👤 유저 ID: ${userId}`);

    const { abcId, xyzId } = await verifyDB(userId);

    if (abcId && xyzId) {
      await verifyMetrics(userId, abcId, xyzId);
    }

    // Summary
    console.log("\n══════════════════════════════════════");
    console.log(`  검증 결과: ${passed} passed, ${failed} failed`);
    console.log("══════════════════════════════════════\n");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error("\n❌ 검증 실패:", error);
    process.exit(1);
  } finally {
    await pgClient.end();
  }
}

main();
