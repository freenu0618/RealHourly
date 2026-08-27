/**
 * RealHourly 핵심 비즈니스 로직 단위 테스트
 * 실행: pnpm test:logic
 *
 * DB/Auth 없이 순수 로직만 테스트합니다.
 */

// ── 경로 alias 해결 ──
import { resolve, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __filename_local = typeof __filename !== "undefined" ? __filename : fileURLToPath(import.meta.url);
const __dirname_local = typeof __dirname !== "undefined" ? __dirname : dirname(__filename_local);
const root = resolve(__dirname_local, "..");

// @/ alias를 위한 동적 import helper
async function importSrc<T>(path: string): Promise<T> {
  const fullPath = resolve(root, "src", path);
  return import(pathToFileURL(fullPath).href) as Promise<T>;
}

// ── 테스트 유틸 ──
let passed = 0;
let failed = 0;

function describe(name: string, fn: () => void | Promise<void>) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`  ${name}`);
  console.log("=".repeat(60));
  return fn();
}

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.log(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

function assertApprox(actual: number, expected: number, tolerance: number, message: string) {
  const diff = Math.abs(actual - expected);
  if (diff <= tolerance) {
    console.log(`  ✅ PASS: ${message} (got ${actual}, expected ~${expected})`);
    passed++;
  } else {
    console.log(`  ❌ FAIL: ${message} (got ${actual}, expected ~${expected}, diff ${diff})`);
    failed++;
  }
}

function assertEqual<T>(actual: T, expected: T, message: string) {
  if (actual === expected) {
    console.log(`  ✅ PASS: ${message} (${JSON.stringify(actual)})`);
    passed++;
  } else {
    console.log(`  ❌ FAIL: ${message} (got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)})`);
    failed++;
  }
}

// ============================================
// 테스트 시작
// ============================================

async function main() {
  console.log("🧪 RealHourly 비즈니스 로직 단위 테스트");
  console.log(`📅 ${new Date().toISOString()}`);

  // ── Import modules ──
  const { checkScopeCreep } = await importSrc<typeof import("../src/lib/metrics/scope-rules")>(
    "lib/metrics/scope-rules.ts",
  );
  const { formatCurrency } = await importSrc<typeof import("../src/lib/money/currency")>(
    "lib/money/currency.ts",
  );
  const { formatFactBomb, formatHours } = await importSrc<typeof import("../src/lib/money/format")>(
    "lib/money/format.ts",
  );

  // ============================================
  // TEST 1: Real Hourly Rate 계산
  // ============================================
  await describe("TEST 1: Real Hourly Rate 계산 (PRD Section 11 시드 데이터)", () => {
    // getProjectMetrics의 순수 계산 로직 재현
    const expectedFee = 2000;
    const expectedHours = 40;
    const platformFeeRate = 0.20;
    const taxRate = 0.10;
    const totalMinutesDone = 3120; // 52시간
    const fixedCosts = 50; // Figma Pro

    const gross = expectedFee;
    const platformFeeAmount = gross * platformFeeRate;
    const taxAmount = gross * taxRate;
    const directCost = fixedCosts + platformFeeAmount + taxAmount;
    const net = gross - directCost;
    const totalHours = totalMinutesDone / 60;
    const nominalHourly = expectedHours > 0 ? gross / expectedHours : null;
    const realHourly = totalHours > 0 ? net / totalHours : null;

    assertEqual(gross, 2000, "gross = 2000");
    assertEqual(platformFeeAmount, 400, "platform_fee = 2000 * 0.20 = 400");
    assertEqual(taxAmount, 200, "tax = 2000 * 0.10 = 200");
    assertEqual(directCost, 650, "direct_cost = 400 + 200 + 50 = 650");
    assertEqual(net, 1350, "net = 2000 - 650 = 1350");
    assertEqual(totalHours, 52, "total_hours = 3120 / 60 = 52");
    assertEqual(nominalHourly, 50, "nominal_hourly = 2000 / 40 = 50");
    assertApprox(realHourly!, 25.96, 0.01, "real_hourly = 1350 / 52 ≈ 25.96");

    // 반올림 로직 (getProjectMetrics와 동일)
    const roundedReal = Math.round(realHourly! * 100) / 100;
    assertEqual(roundedReal, 25.96, "rounded real_hourly = 25.96");
  });

  // ============================================
  // TEST 2: Edge Cases
  // ============================================
  await describe("TEST 2: Edge Cases", () => {
    // Case A: total_hours = 0 → real_hourly = null
    {
      const totalHours = 0;
      const net = 1350;
      const realHourly = totalHours > 0 ? net / totalHours : null;
      assertEqual(realHourly, null, "Case A: total_hours=0 → real_hourly=null");
    }

    // Case B: expected_hours = 0 → nominal_hourly = null
    {
      const expectedHours = 0;
      const gross = 2000;
      const nominalHourly = expectedHours > 0 ? gross / expectedHours : null;
      assertEqual(nominalHourly, null, "Case B: expected_hours=0 → nominal_hourly=null");
    }

    // Case C: net < 0 → real_hourly = negative
    {
      const net = -500;
      const totalHours = 52;
      const realHourly = totalHours > 0 ? net / totalHours : null;
      assert(realHourly !== null && realHourly < 0, "Case C: net<0 → real_hourly is negative");
      assertApprox(realHourly!, -9.62, 0.01, "Case C: real_hourly = -500/52 ≈ -9.62");
    }

    // Case D: 모든 값 0
    {
      const gross = 0;
      const net = 0;
      const totalHours = 0;
      const nominalHourly = 0 > 0 ? gross / 0 : null;
      const realHourly = totalHours > 0 ? net / totalHours : null;
      assertEqual(nominalHourly, null, "Case D: all zero → nominal_hourly=null");
      assertEqual(realHourly, null, "Case D: all zero → real_hourly=null");
    }
  });

  // ============================================
  // TEST 3: Scope Creep Rules
  // ============================================
  await describe("TEST 3: Scope Creep Rules", () => {
    // Rule 1: (totalHours / expectedHours) >= 0.8 AND progressPercent < 50
    {
      // 52/40 = 1.3 >= 0.8, progress 40 < 50 → TRIGGER
      const result = checkScopeCreep(
        { expectedHours: 40, progressPercent: 40 },
        3120, // 52시간
        [],
      );
      assert(result !== null && result.triggered.includes("scope_rule1"),
        "Rule 1: 52h/40h=1.3, progress=40% → TRIGGER");
    }
    {
      // 20/40 = 0.5 < 0.8, progress 40 → NO TRIGGER
      const result = checkScopeCreep(
        { expectedHours: 40, progressPercent: 40 },
        1200, // 20시간
        [],
      );
      const hasRule1 = result?.triggered.includes("scope_rule1") ?? false;
      assert(!hasRule1, "Rule 1: 20h/40h=0.5, progress=40% → NO TRIGGER");
    }
    {
      // 35/40 = 0.875 >= 0.8, progress 60 >= 50 → NO TRIGGER
      const result = checkScopeCreep(
        { expectedHours: 40, progressPercent: 60 },
        2100, // 35시간
        [],
      );
      const hasRule1 = result?.triggered.includes("scope_rule1") ?? false;
      assert(!hasRule1, "Rule 1: 35h/40h=0.875, progress=60% → NO TRIGGER");
    }
    {
      // expectedHours = null → Rule 1 skip
      const result = checkScopeCreep(
        { expectedHours: null, progressPercent: 30 },
        3120,
        [],
      );
      const hasRule1 = result?.triggered.includes("scope_rule1") ?? false;
      assert(!hasRule1, "Rule 1: expectedHours=null → SKIP");
    }

    // Rule 2: revision minutes >= 40%
    {
      // 1080/3120 = 34.6% < 40% → NO TRIGGER
      const entries = [
        ...Array(5).fill({ minutes: 216, category: "revision" }), // 1080분
        ...Array(10).fill({ minutes: 204, category: "development" }), // 2040분
      ];
      const result = checkScopeCreep(
        { expectedHours: 100, progressPercent: 80 },
        3120,
        entries,
      );
      const hasRule2 = result?.triggered.includes("scope_rule2") ?? false;
      assert(!hasRule2, "Rule 2: 1080/3120=34.6% → NO TRIGGER");
    }
    {
      // 1300/3120 = 41.7% >= 40% → TRIGGER
      const entries = [
        { minutes: 1300, category: "revision" },
        { minutes: 1820, category: "development" },
      ];
      const result = checkScopeCreep(
        { expectedHours: 100, progressPercent: 80 },
        3120,
        entries,
      );
      assert(result !== null && result.triggered.includes("scope_rule2"),
        "Rule 2: 1300/3120=41.7% → TRIGGER");
    }

    // Rule 3: revision count >= 5
    {
      // count = 7 → TRIGGER
      const entries = Array(7).fill({ minutes: 60, category: "revision" });
      const result = checkScopeCreep(
        { expectedHours: 100, progressPercent: 80 },
        3120,
        entries,
      );
      assert(result !== null && result.triggered.includes("scope_rule3"),
        "Rule 3: revision count=7 → TRIGGER");
    }
    {
      // count = 3 → NO TRIGGER
      const entries = [
        ...Array(3).fill({ minutes: 60, category: "revision" }),
        ...Array(5).fill({ minutes: 60, category: "development" }),
      ];
      const result = checkScopeCreep(
        { expectedHours: 100, progressPercent: 80 },
        480,
        entries,
      );
      const hasRule3 = result?.triggered.includes("scope_rule3") ?? false;
      assert(!hasRule3, "Rule 3: revision count=3 → NO TRIGGER");
    }
    {
      // No rules triggered → null
      const result = checkScopeCreep(
        { expectedHours: 100, progressPercent: 80 },
        600, // 10 hours < 0.8*100
        [{ minutes: 600, category: "development" }],
      );
      assertEqual(result, null, "No rules triggered → null");
    }
  });

  // ============================================
  // TEST 4: Currency Formatting
  // ============================================
  await describe("TEST 4: Currency Formatting", () => {
    // USD
    const usd50 = formatCurrency(50, "USD");
    assert(usd50.includes("50"), `formatCurrency(50, USD) → "${usd50}" contains "50"`);
    assert(usd50.includes("$"), `formatCurrency(50, USD) → "${usd50}" contains "$"`);

    const usd25_96 = formatCurrency(25.96, "USD");
    assert(usd25_96.includes("25.96"), `formatCurrency(25.96, USD) → "${usd25_96}" contains "25.96"`);

    // KRW — 소수점 없음
    const krw23000 = formatCurrency(23000, "KRW");
    assert(krw23000.includes("23,000") || krw23000.includes("23000"), `formatCurrency(23000, KRW) → "${krw23000}" contains "23,000"`);
    assert(!krw23000.includes("."), `formatCurrency(23000, KRW) → "${krw23000}" has no decimal`);

    // EUR
    const eur100 = formatCurrency(100, "EUR");
    assert(eur100.includes("100"), `formatCurrency(100, EUR) → "${eur100}" contains "100"`);

    // JPY — 소수점 없음
    const jpy5000 = formatCurrency(5000, "JPY");
    assert(jpy5000.includes("5,000") || jpy5000.includes("5000"), `formatCurrency(5000, JPY) → "${jpy5000}" contains "5000"`);
    assert(!jpy5000.includes("."), `formatCurrency(5000, JPY) → "${jpy5000}" has no decimal`);

    // GBP
    const gbp75 = formatCurrency(75, "GBP");
    assert(gbp75.includes("75"), `formatCurrency(75, GBP) → "${gbp75}" contains "75"`);

    // 0원
    const zero = formatCurrency(0, "USD");
    assert(zero.includes("0"), `formatCurrency(0, USD) → "${zero}" contains "0"`);

    // 음수
    const negative = formatCurrency(-50, "USD");
    assert(negative.includes("50"), `formatCurrency(-50, USD) → "${negative}" contains "50"`);
  });

  // ============================================
  // TEST 5: Fact Bomb & Hours Formatting
  // ============================================
  await describe("TEST 5: Fact Bomb & Hours Formatting", () => {
    const bomb = formatFactBomb(50, 25.96, "USD");
    assert(bomb.includes("→"), `formatFactBomb contains "→": "${bomb}"`);
    assert(bomb.includes("50"), `formatFactBomb contains "50": "${bomb}"`);
    assert(bomb.includes("25.96"), `formatFactBomb contains "25.96": "${bomb}"`);

    assertEqual(formatHours(120), "2h", "formatHours(120) = '2h'");
    assertEqual(formatHours(90), "1h 30m", "formatHours(90) = '1h 30m'");
    assertEqual(formatHours(60), "1h", "formatHours(60) = '1h'");
    assertEqual(formatHours(45), "0h 45m", "formatHours(45) = '0h 45m'");
    assertEqual(formatHours(0), "0h", "formatHours(0) = '0h'");
    assertEqual(formatHours(3120), "52h", "formatHours(3120) = '52h'");
  });

  // ============================================
  // TEST 6: Issue Code Logic (normalizeEntries)
  // ============================================
  await describe("TEST 6: Issue Code 할당 로직", async () => {
    const { normalizeEntries } = await importSrc<typeof import("../src/lib/ai/normalize-parsed-entries")>(
      "lib/ai/normalize-parsed-entries.ts",
    );

    const projects = [
      { id: "proj-1", name: "ABC 리브랜딩", aliases: ["ABC"], clientName: null },
      { id: "proj-2", name: "XYZ 웹사이트", aliases: null, clientName: null },
    ];

    // Case 1: null date → DATE_AMBIGUOUS
    {
      const result = normalizeEntries(
        { entries: [{
          project_name_raw: "ABC 리브랜딩",
          task_description: "디자인",
          date: null,
          duration_minutes: 120,
          duration_source: "explicit",
          category: "design",
          intent: "done",
        }], progress_hint: null },
        projects,
        "Asia/Seoul",
      );
      const entry = result.entries[0];
      assert(entry.issues.includes("DATE_AMBIGUOUS"), "null date → DATE_AMBIGUOUS");
      assert(!entry.needsUserAction, "DATE_AMBIGUOUS is warning, not blocking");
    }

    // Case 2: duration_source=missing → DURATION_MISSING (blocking)
    {
      const result = normalizeEntries(
        { entries: [{
          project_name_raw: "ABC 리브랜딩",
          task_description: "회의",
          date: "2026-02-08",
          duration_minutes: null,
          duration_source: "missing",
          category: "meeting",
          intent: "done",
        }], progress_hint: null },
        projects,
        "Asia/Seoul",
      );
      const entry = result.entries[0];
      assert(entry.issues.includes("DURATION_MISSING"), "duration_source=missing → DURATION_MISSING");
      assertEqual(entry.durationMinutes, 60, "missing duration defaults to 60");
      assert(entry.needsUserAction, "DURATION_MISSING is blocking");
    }

    // Case 3: duration_source=ambiguous → DURATION_AMBIGUOUS (warning)
    {
      const result = normalizeEntries(
        { entries: [{
          project_name_raw: "ABC 리브랜딩",
          task_description: "개발",
          date: "2026-02-08",
          duration_minutes: 90,
          duration_source: "ambiguous",
          category: "development",
          intent: "done",
        }], progress_hint: null },
        projects,
        "Asia/Seoul",
      );
      const entry = result.entries[0];
      assert(entry.issues.includes("DURATION_AMBIGUOUS"), "duration_source=ambiguous → DURATION_AMBIGUOUS");
      assertEqual(entry.durationMinutes, 90, "ambiguous keeps LLM-estimated duration");
      assert(!entry.needsUserAction, "DURATION_AMBIGUOUS is warning, not blocking");
    }

    // Case 4: intent=planned → FUTURE_INTENT
    {
      const result = normalizeEntries(
        { entries: [{
          project_name_raw: "ABC 리브랜딩",
          task_description: "내일 할 일",
          date: "2026-02-09",
          duration_minutes: 120,
          duration_source: "explicit",
          category: "development",
          intent: "planned",
        }], progress_hint: null },
        projects,
        "Asia/Seoul",
      );
      const entry = result.entries[0];
      assert(entry.issues.includes("FUTURE_INTENT"), "intent=planned → FUTURE_INTENT");
      assert(!entry.needsUserAction, "FUTURE_INTENT is not blocking");
    }

    // Case 5: no project match → PROJECT_UNMATCHED (blocking)
    {
      const result = normalizeEntries(
        { entries: [{
          project_name_raw: "존재하지 않는 프로젝트",
          task_description: "작업",
          date: "2026-02-08",
          duration_minutes: 60,
          duration_source: "explicit",
          category: "development",
          intent: "done",
        }], progress_hint: null },
        projects,
        "Asia/Seoul",
      );
      const entry = result.entries[0];
      assert(entry.issues.includes("PROJECT_UNMATCHED"), "no match → PROJECT_UNMATCHED");
      assertEqual(entry.matchedProjectId, null, "unmatched → matchedProjectId=null");
      assert(entry.needsUserAction, "PROJECT_UNMATCHED is blocking");
    }

    // Case 6: 정상 매칭 → 이슈 없음
    {
      const result = normalizeEntries(
        { entries: [{
          project_name_raw: "ABC 리브랜딩",
          task_description: "로고 작업",
          date: "2026-02-08",
          duration_minutes: 120,
          duration_source: "explicit",
          category: "design",
          intent: "done",
        }], progress_hint: null },
        projects,
        "Asia/Seoul",
      );
      const entry = result.entries[0];
      assertEqual(entry.issues.length, 0, "정상 입력 → 이슈 없음");
      assertEqual(entry.matchedProjectId, "proj-1", "ABC 리브랜딩 매칭");
      assert(!entry.needsUserAction, "이슈 없음 → needsUserAction=false");
    }
  });

  // ============================================
  // TEST 7: canSaveAll 로직
  // ============================================
  await describe("TEST 7: canSaveAll 로직", () => {
    // canSaveAll 로직을 순수 함수로 재현 (zustand store 없이)
    function canSaveAll(entries: { matchedProjectId: string | null; durationMinutes: number | null }[]): boolean {
      if (entries.length === 0) return false;
      return entries.every(
        (e) =>
          e.matchedProjectId !== null &&
          e.durationMinutes !== null &&
          e.durationMinutes >= 1 &&
          e.durationMinutes <= 1440,
      );
    }

    // 정상: 모든 엔트리에 projectId + valid minutes
    assert(
      canSaveAll([
        { matchedProjectId: "p1", durationMinutes: 60 },
        { matchedProjectId: "p2", durationMinutes: 120 },
      ]),
      "valid entries → true",
    );

    // projectId가 null인 엔트리
    assert(
      !canSaveAll([
        { matchedProjectId: "p1", durationMinutes: 60 },
        { matchedProjectId: null, durationMinutes: 120 },
      ]),
      "null projectId → false",
    );

    // minutes = 0
    assert(
      !canSaveAll([
        { matchedProjectId: "p1", durationMinutes: 0 },
      ]),
      "minutes=0 → false",
    );

    // minutes = null
    assert(
      !canSaveAll([
        { matchedProjectId: "p1", durationMinutes: null },
      ]),
      "minutes=null → false",
    );

    // minutes > 1440
    assert(
      !canSaveAll([
        { matchedProjectId: "p1", durationMinutes: 1441 },
      ]),
      "minutes=1441 → false",
    );

    // 빈 배열
    assert(
      !canSaveAll([]),
      "empty entries → false",
    );

    // 경계값: minutes = 1 (최소)
    assert(
      canSaveAll([{ matchedProjectId: "p1", durationMinutes: 1 }]),
      "minutes=1 (min) → true",
    );

    // 경계값: minutes = 1440 (최대)
    assert(
      canSaveAll([{ matchedProjectId: "p1", durationMinutes: 1440 }]),
      "minutes=1440 (max) → true",
    );
  });

  // ============================================
  // 결과 요약
  // ============================================
  console.log(`\n${"=".repeat(60)}`);
  console.log(`  📊 테스트 결과 요약`);
  console.log("=".repeat(60));
  console.log(`  ✅ PASSED: ${passed}`);
  console.log(`  ❌ FAILED: ${failed}`);
  console.log(`  📋 TOTAL:  ${passed + failed}`);
  console.log("=".repeat(60));

  if (failed > 0) {
    console.log("\n⚠️  일부 테스트가 실패했습니다. 소스 코드를 확인하세요.");
    process.exit(1);
  } else {
    console.log("\n🎉 모든 테스트가 통과했습니다!");
    process.exit(0);
  }
}

main().catch((err) => {
  console.error("테스트 실행 중 오류:", err);
  process.exit(2);
});
