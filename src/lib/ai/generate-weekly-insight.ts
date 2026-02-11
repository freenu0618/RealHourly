import OpenAI from "openai";
import type { WeeklyReportData } from "@/lib/reports/collect-weekly-data";

let _openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  }
  return _openai;
}

/** Structured AI insight returned from LLM */
export interface WeeklyInsight {
  summary: string;
  projectBreakdown: { name: string; emoji: string; note: string }[];
  insights: { emoji: string; text: string }[];
  actions: { text: string; projectName: string | null }[];
}

const SYSTEM_PROMPT = `당신은 프리랜서의 주간 업무 코치입니다.
주간 데이터를 분석해서 구조화된 인사이트를 JSON으로 작성하세요.

톤: 힐링 + 응원. 비난이나 압박 절대 금지.
한국어로 작성하되, 이모지를 적절히 사용하세요.

규칙:
- summary: 핵심 숫자를 포함한 2~3문장 요약. "이번 주는..."으로 시작.
- projectBreakdown: 이번 주 작업한 프로젝트별 한 줄 코멘트. emoji는 프로젝트 상태 이모지(✅진행좋음, ⚠️주의, 🔥급함, 🌱시작).
- insights: 데이터 기반 관찰 1~2개. emoji는 🚨(경고) 또는 💡(팁).
- actions: 구체적이고 실행 가능한 추천 액션 1~3개. projectName은 관련 프로젝트명 또는 null.
- 시간이 줄어도 긍정적으로 표현
- revision이 많아도 "소통이 활발했다"로 표현 후 개선 제안
- 절대 부정적이거나 압박하는 표현 금지`;

const RESPONSE_SCHEMA: OpenAI.ResponseFormatJSONSchema["json_schema"] = {
  name: "weekly_insight",
  strict: true,
  schema: {
    type: "object",
    properties: {
      summary: { type: "string" },
      projectBreakdown: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            emoji: { type: "string" },
            note: { type: "string" },
          },
          required: ["name", "emoji", "note"],
          additionalProperties: false,
        },
      },
      insights: {
        type: "array",
        items: {
          type: "object",
          properties: {
            emoji: { type: "string" },
            text: { type: "string" },
          },
          required: ["emoji", "text"],
          additionalProperties: false,
        },
      },
      actions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            text: { type: "string" },
            projectName: { type: ["string", "null"] },
          },
          required: ["text", "projectName"],
          additionalProperties: false,
        },
      },
    },
    required: ["summary", "projectBreakdown", "insights", "actions"],
    additionalProperties: false,
  },
};

export async function generateWeeklyInsight(
  data: WeeklyReportData,
): Promise<string> {
  try {
    const model = process.env.LLM_MODEL_GENERATE || "gpt-4o-mini";
    const totalHours = Math.round((data.totalMinutes / 60) * 10) / 10;
    const prevHours = Math.round((data.prevWeekMinutes / 60) * 10) / 10;

    const context = JSON.stringify(
      {
        period: data.period,
        totalHours,
        entryCount: data.entryCount,
        prevWeekHours: prevHours,
        deltaHours: Math.round((data.minutesDelta / 60) * 10) / 10,
        topProject: data.topProject,
        revisionPercent: data.revisionPercent,
        projectCount: data.byProject.length,
        busiestDay: data.busiestDay,
        scopeAlertCount: data.scopeAlerts.length,
        projects: data.byProject.map((p) => ({
          name: p.name,
          hours: Math.round((p.minutes / 60) * 10) / 10,
          realHourly: p.realHourly,
          topCategory: p.categories.sort((a, b) => b.minutes - a.minutes)[0]?.category ?? null,
        })),
        scopeAlerts: data.scopeAlerts,
      },
      null,
      2,
    );

    const completion = await getOpenAI().chat.completions.create({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `다음 주간 데이터를 분석해서 인사이트를 JSON으로 작성해주세요:\n\n${context}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: RESPONSE_SCHEMA,
      },
      max_completion_tokens: 800,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("LLM returned empty response");

    // Validate JSON parse
    const parsed = JSON.parse(content) as WeeklyInsight;
    if (!parsed.summary || !Array.isArray(parsed.actions)) {
      throw new Error("Invalid structured response");
    }

    return content;
  } catch (error) {
    console.error("Weekly insight generation failed, using fallback:", error);
    return JSON.stringify(getFallbackInsight(data));
  }
}

/** Parse stored ai_insight string back to structured format */
export function parseWeeklyInsight(raw: string | null): WeeklyInsight | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed.summary && Array.isArray(parsed.actions)) {
      return parsed as WeeklyInsight;
    }
    return null;
  } catch {
    // Legacy free-text format: wrap in summary-only structure
    return {
      summary: raw,
      projectBreakdown: [],
      insights: [],
      actions: [],
    };
  }
}

function getFallbackInsight(data: WeeklyReportData): WeeklyInsight {
  const totalHours = Math.round((data.totalMinutes / 60) * 10) / 10;
  const delta = Math.round((data.minutesDelta / 60) * 10) / 10;

  let summary = `이번 주는 총 ${totalHours}시간을 작업했어요. `;
  if (delta > 0) {
    summary += `지난주보다 ${delta}시간 더 열심히 달렸네요! 충분히 쉬고 있나요? ☕`;
  } else if (delta < 0) {
    summary += `지난주보다 ${Math.abs(delta)}시간 덜 일했지만, 효율적으로 일한 한 주였어요 🌿`;
  } else {
    summary += `지난주와 비슷한 페이스를 유지하고 있어요 🌱`;
  }

  const projectBreakdown = data.byProject.slice(0, 5).map((p) => ({
    name: p.name,
    emoji: p.realHourly !== null && p.realHourly > 0 ? "✅" : "🌱",
    note: `${Math.round((p.minutes / 60) * 10) / 10}시간 작업`,
  }));

  const insights: WeeklyInsight["insights"] = [];
  if (data.revisionPercent >= 30) {
    insights.push({
      emoji: "🚨",
      text: `수정 작업이 전체의 ${data.revisionPercent}%를 차지했어요. 클라이언트와 소통이 활발했던 주예요. 다음엔 범위를 미리 정해보는 건 어떨까요?`,
    });
  }
  if (data.topProject.minutes > 0) {
    insights.push({
      emoji: "💡",
      text: `${data.topProject.name} 프로젝트에 가장 많은 시간을 투자했어요.`,
    });
  }

  const actions: WeeklyInsight["actions"] = [];
  if (data.revisionPercent >= 30) {
    actions.push({
      text: "수정 범위를 미리 정의하는 체크리스트를 만들어보세요",
      projectName: null,
    });
  }
  if (data.scopeAlerts.length > 0) {
    actions.push({
      text: `${data.scopeAlerts[0].projectName} 프로젝트의 스코프를 확인하세요`,
      projectName: data.scopeAlerts[0].projectName,
    });
  }
  actions.push({
    text: "다음 주 목표 작업 시간을 미리 설정해보세요",
    projectName: null,
  });

  return { summary, projectBreakdown, insights, actions };
}
