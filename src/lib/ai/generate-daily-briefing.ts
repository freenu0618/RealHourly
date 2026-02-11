import OpenAI from "openai";
import { getDashboardData } from "@/db/queries/dashboard";

let _openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  }
  return _openai;
}

const SYSTEM_PROMPT = `당신은 프리랜서의 비즈니스 매니저입니다.
아래 JSON 데이터를 바탕으로 오늘의 업무 브리핑을 작성하세요.

필수 규칙:
1. 반드시 각 프로젝트의 이름을 그대로 언급하세요 (예: "Alpha 앱 디자인")
2. 각 프로젝트마다 구체적 숫자를 포함하세요 (실제 시급, 수정비율, 진행률)
3. 위험한 프로젝트는 🚨, 순조로운 프로젝트는 ✅ 표시
4. 3~5문장 이내
5. 마지막 줄은 반드시 이 형식으로 작성:
   👉 [구체적 행동]
   예시: "👉 Gamma 리브랜딩 프로젝트에 추가 청구 메시지를 보내세요"

절대 하지 말 것:
- "3개의 프로젝트가 진행 중입니다" 같은 일반적 표현 금지
- 프로젝트 이름 없이 숫자만 나열 금지`;

interface BriefingContext {
  projects: {
    name: string;
    progressPercent: number;
    expectedHours: number;
    totalHours: number;
    timeUsageRate: number;
    nominalHourly: number | null;
    realHourly: number | null;
    currency: string;
  }[];
  yesterdayEntries: {
    projectName: string;
    totalMinutes: number;
    categories: string[];
  }[];
  yesterdayTotalMinutes: number;
  activeAlertCount: number;
  totalActiveProjects: number;
}

function buildContext(data: Awaited<ReturnType<typeof getDashboardData>>): BriefingContext {
  const projects = data.projects.map((p) => {
    const gross = p.expectedFee;
    const platformFee = gross * p.platformFeeRate;
    const tax = gross * p.taxRate;
    const directCost = p.fixedCosts + platformFee + tax;
    const net = gross - directCost;
    const totalHours = p.totalMinutes / 60;
    const timeUsageRate = p.expectedHours > 0
      ? Math.round((totalHours / p.expectedHours) * 100)
      : 0;

    return {
      name: p.name,
      progressPercent: p.progressPercent,
      expectedHours: p.expectedHours,
      totalHours: Math.round(totalHours * 10) / 10,
      timeUsageRate,
      nominalHourly:
        p.expectedHours > 0 ? Math.round((gross / p.expectedHours) * 100) / 100 : null,
      realHourly:
        totalHours > 0 ? Math.round((net / totalHours) * 100) / 100 : null,
      currency: p.currency,
    };
  });

  // Yesterday's entries from recentEntries (approximate — entries from last day)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  const yesterdayEntries = new Map<string, { totalMinutes: number; categories: Set<string> }>();
  for (const entry of data.recentEntries) {
    if (entry.date === yesterdayStr) {
      const existing = yesterdayEntries.get(entry.projectName) ?? {
        totalMinutes: 0,
        categories: new Set<string>(),
      };
      existing.totalMinutes += entry.minutes;
      existing.categories.add(entry.category);
      yesterdayEntries.set(entry.projectName, existing);
    }
  }

  const yesterdayResult = Array.from(yesterdayEntries.entries()).map(([name, val]) => ({
    projectName: name,
    totalMinutes: val.totalMinutes,
    categories: Array.from(val.categories),
  }));

  return {
    projects,
    yesterdayEntries: yesterdayResult,
    yesterdayTotalMinutes: yesterdayResult.reduce((sum, e) => sum + e.totalMinutes, 0),
    activeAlertCount: data.activeAlerts.length,
    totalActiveProjects: data.projects.length,
  };
}

export async function generateDailyBriefing(
  userId: string,
): Promise<{ title: string; message: string }> {
  const data = await getDashboardData(userId);

  if (data.projects.length === 0) {
    return {
      title: "오늘의 브리핑",
      message: "아직 진행 중인 프로젝트가 없습니다. 새 프로젝트를 만들어보세요!",
    };
  }

  const context = buildContext(data);

  try {
    const model = process.env.LLM_MODEL_GENERATE || "gpt-4o-mini";

    const completion = await getOpenAI().chat.completions.create({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `다음 데이터를 바탕으로 오늘의 모닝 브리핑을 작성해주세요:\n\n${JSON.stringify(context, null, 2)}`,
        },
      ],
      max_completion_tokens: 800,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("LLM returned empty response");

    return {
      title: "오늘의 브리핑",
      message: content.trim(),
    };
  } catch (error) {
    console.error("Daily briefing generation failed, using fallback:", error);
    return {
      title: "오늘의 브리핑",
      message: getFallbackBriefing(context),
    };
  }
}

function getFallbackBriefing(ctx: BriefingContext): string {
  const lines: string[] = [];

  lines.push(`📊 현재 ${ctx.totalActiveProjects}개 프로젝트가 진행 중이에요.`);

  if (ctx.yesterdayTotalMinutes > 0) {
    const hrs = Math.round((ctx.yesterdayTotalMinutes / 60) * 10) / 10;
    lines.push(`✅ 어제 총 ${hrs}시간 작업했어요.`);
  } else {
    lines.push(`어제는 기록된 작업이 없어요.`);
  }

  // Find risky projects
  const risky = ctx.projects.filter((p) => p.timeUsageRate >= 80 && p.progressPercent < 50);
  if (risky.length > 0) {
    lines.push(
      `🚨 ${risky.map((p) => p.name).join(", ")} — 시간 사용률이 높은데 진행률이 낮아요.`,
    );
  }

  if (ctx.activeAlertCount > 0) {
    lines.push(`🚨 ${ctx.activeAlertCount}개의 활성 경고가 있어요.`);
  }

  const lowProfit = ctx.projects.filter(
    (p) => p.nominalHourly && p.realHourly && p.realHourly < p.nominalHourly * 0.5,
  );
  if (lowProfit.length > 0) {
    lines.push(
      `🚨 ${lowProfit.map((p) => p.name).join(", ")} — 실제 시급이 명목 시급의 50% 미만이에요.`,
    );
  }

  lines.push(`👉 시간 기록을 꼼꼼히 입력하고, 경고가 있다면 확인해보세요.`);

  return lines.join("\n");
}
