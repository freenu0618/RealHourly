import OpenAI from "openai";
import type { WeeklyReportData } from "@/lib/reports/collect-weekly-data";

let _openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  }
  return _openai;
}

const SYSTEM_PROMPT = `당신은 프리랜서의 주간 업무 코치입니다.
주간 데이터를 분석해서 3~5문장의 따뜻하고 실용적인 인사이트를 작성하세요.

톤: 힐링 + 응원. 비난이나 압박 절대 금지.
포함할 것: 잘한 점 1개, 개선 포인트 1개, 다음 주 제안 1개.
한국어로 작성하되, 이모지를 적절히 사용하세요.

규칙:
- 시간이 줄어도 "효율적으로 일한 한 주였어요 🌿" 같은 긍정적 표현
- revision이 많아도 "클라이언트와 소통이 활발했던 주예요. 다음엔 범위를 미리 정해보는 건 어떨까요? 💡"
- 절대 부정적이거나 압박하는 표현 사용 금지
- "이번 주는..." 으로 시작하세요`;

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
        categoryCount: data.byCategory.length,
        projectCount: data.byProject.length,
        busiestDay: data.busiestDay,
        scopeAlertCount: data.scopeAlerts.length,
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
          content: `다음 주간 데이터를 분석해서 인사이트를 작성해주세요:\n\n${context}`,
        },
      ],
      max_completion_tokens: 500,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("LLM returned empty response");

    return content.trim();
  } catch (error) {
    console.error("Weekly insight generation failed, using fallback:", error);
    return getFallbackInsight(data);
  }
}

function getFallbackInsight(data: WeeklyReportData): string {
  const totalHours = Math.round((data.totalMinutes / 60) * 10) / 10;
  const delta = Math.round((data.minutesDelta / 60) * 10) / 10;

  let insight = `이번 주는 총 ${totalHours}시간을 작업했어요. `;

  if (delta > 0) {
    insight += `지난주보다 ${delta}시간 더 열심히 달렸네요! 충분히 쉬고 있나요? ☕ `;
  } else if (delta < 0) {
    insight += `지난주보다 ${Math.abs(delta)}시간 덜 일했지만, 효율적으로 일한 한 주였어요 🌿 `;
  }

  if (data.topProject.minutes > 0) {
    insight += `${data.topProject.name} 프로젝트에 가장 많은 시간을 투자했어요. `;
  }

  if (data.revisionPercent >= 30) {
    insight += `수정 작업이 ${data.revisionPercent}%를 차지했는데, 다음엔 범위를 미리 정해보는 건 어떨까요? 💡`;
  } else {
    insight += `다음 주도 화이팅이에요! 🌱`;
  }

  return insight;
}
