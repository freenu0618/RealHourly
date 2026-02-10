import { generateId } from "@/lib/utils/nanoid";
import type { ParsedEntry, ParsedResponse } from "@/types/time-log";

export function mockParseTimeInput(_input: string): ParsedResponse {
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86_400_000)
    .toISOString()
    .split("T")[0];

  const entries: ParsedEntry[] = [
    {
      id: generateId(),
      projectNameRaw: "ABC 리브랜딩",
      matchedProjectId: null,
      matchSource: "none",
      taskDescription: "기획서 작성 및 클라이언트 미팅",
      date: yesterday,
      durationMinutes: 120,
      category: "planning",
      intent: "done",
      issues: ["PROJECT_UNMATCHED"],
      needsUserAction: true,
      clarificationQuestion: "프로젝트를 선택해주세요",
    },
    {
      id: generateId(),
      projectNameRaw: "내부 회의",
      matchedProjectId: null,
      matchSource: "none",
      taskDescription: "팀 주간 회의",
      date: today,
      durationMinutes: null,
      category: "meeting",
      intent: "done",
      issues: ["PROJECT_UNMATCHED", "DURATION_MISSING"],
      needsUserAction: true,
      clarificationQuestion: "프로젝트와 소요 시간을 입력해주세요",
    },
    {
      id: generateId(),
      projectNameRaw: "XYZ 앱",
      matchedProjectId: "mock-project-id",
      matchSource: "name",
      taskDescription: "이메일 정리",
      date: today,
      durationMinutes: 30,
      category: "email",
      intent: "done",
      issues: ["DATE_AMBIGUOUS"],
      needsUserAction: false,
      clarificationQuestion: null,
    },
  ];

  const blocking = entries.filter((e) => e.needsUserAction).length;

  return {
    entries,
    parseSummary: { total: entries.length, blocking },
    progressHint: null,
  };
}
