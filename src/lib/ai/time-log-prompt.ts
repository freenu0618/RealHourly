import type { ProjectForMatching } from "@/types/time-log";

export function buildSystemPrompt(
  projects: ProjectForMatching[],
  preferredProjectId?: string,
  userTimezone = "Asia/Seoul",
): string {
  const projectList = projects
    .map((p) => {
      const parts = [p.name];
      if (p.aliases?.length) parts.push(`(aliases: ${p.aliases.join(", ")})`);
      if (p.clientName) parts.push(`[client: ${p.clientName}]`);
      if (p.id === preferredProjectId) parts.push("★ preferred");
      return `- ${parts.join(" ")}`;
    })
    .join("\n");

  return `You are a time log parser. Extract structured time entries from the user's natural language input.
The user may write in Korean, English, or a mix of both.

## Rules

1. **project_name_raw**: Copy the exact text the user used to refer to the project/client. Do NOT translate or modify.
2. **task_description**: A brief description of the work (e.g. "기획서 작성", "logo feedback", "팀 미팅").
3. **date**:
   - If the user specifies a clear date, output "YYYY-MM-DD".
   - Relative expressions are allowed: "오늘"/"today" → today's date, "어제"/"yesterday" → yesterday's date, "그제" → day before yesterday.
   - Today's date in ${userTimezone}: use the current date as reference.
   - Future dates (내일/tomorrow) → output the date AND set intent="planned".
   - If ambiguous or not mentioned → output null.
4. **duration_minutes**: Integer 1–1440.
   - "2시간" → 120, "30분" → 30, "1.5h" → 90, "2h 30m" → 150.
   - If the user gives a vague estimate like "조금", "잠깐" → set duration_source="ambiguous" and estimate a reasonable value.
   - If NO time information at all → null with duration_source="missing".
5. **duration_source**: "explicit" (user stated exact time), "ambiguous" (vague/estimated), "missing" (no time info).
6. **category**: Choose the best match from: planning, design, development, meeting, revision, admin, email, research, other.
7. **intent**: "done" for past/completed work, "planned" for future/upcoming work.

## Active Projects for Reference
${projectList || "(no projects yet)"}

## Few-shot Examples

### Example 1 (Korean)
Input: "어제 ABC 리브랜딩 기획 2시간, 팀 미팅 30분"
Output:
{
  "entries": [
    {
      "project_name_raw": "ABC 리브랜딩",
      "task_description": "기획",
      "date": "어제",
      "duration_minutes": 120,
      "duration_source": "explicit",
      "category": "planning",
      "intent": "done"
    },
    {
      "project_name_raw": "팀 미팅",
      "task_description": "팀 미팅",
      "date": "어제",
      "duration_minutes": 30,
      "duration_source": "explicit",
      "category": "meeting",
      "intent": "done"
    }
  ]
}

### Example 2 (English)
Input: "Today 2h on XYZ app design revision, emails 20min"
Output:
{
  "entries": [
    {
      "project_name_raw": "XYZ app",
      "task_description": "design revision",
      "date": "오늘",
      "duration_minutes": 120,
      "duration_source": "explicit",
      "category": "revision",
      "intent": "done"
    },
    {
      "project_name_raw": "emails",
      "task_description": "이메일 처리",
      "date": "오늘",
      "duration_minutes": 20,
      "duration_source": "explicit",
      "category": "email",
      "intent": "done"
    }
  ]
}

### Example 3 (Mixed, no duration)
Input: "내일 클라이언트 미팅 예정"
Output:
{
  "entries": [
    {
      "project_name_raw": "클라이언트",
      "task_description": "클라이언트 미팅",
      "date": "내일",
      "duration_minutes": null,
      "duration_source": "missing",
      "category": "meeting",
      "intent": "planned"
    }
  ]
}

Now parse the user's input into the structured format.`;
}
