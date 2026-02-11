import { getDashboardData } from "@/db/queries/dashboard";
import { getComparisonData } from "@/db/queries/analytics";
import { getProfile } from "@/db/queries/profiles";

export interface ChatContext {
  profile: {
    currency: string;
    timezone: string;
    hourlyGoal: number | null;
  };
  projects: {
    name: string;
    clientName: string | null;
    currency: string;
    progressPercent: number;
    expectedHours: number;
    totalHours: number;
    nominalHourly: number | null;
    realHourly: number | null;
    revisionPercent: number;
    hasActiveAlert: boolean;
  }[];
  weeklyHours: number;
  activeAlertCount: number;
  totalActiveProjects: number;
  avgRealHourly: number | null;
  totalRevenue: number;
  totalHours: number;
  recentActivity: {
    projectName: string;
    date: string;
    minutes: number;
    category: string;
    task: string;
  }[];
}

export async function buildChatContext(userId: string): Promise<ChatContext> {
  const [dashboard, comparison, profile] = await Promise.all([
    getDashboardData(userId),
    getComparisonData(userId),
    getProfile(userId),
  ]);

  // Build alert lookup from dashboard data
  const alertProjectIds = new Set(
    dashboard.activeAlerts.map((a) => a.projectId),
  );

  // Merge comparison data (has realHourly, revisionPercent) with alert info
  const projects = comparison.projects.slice(0, 15).map((p) => ({
    name: p.name,
    clientName: p.clientName,
    currency: p.currency,
    progressPercent: p.progressPercent,
    expectedHours: Math.round(p.gross / (p.nominalHourly ?? 1) * 10) / 10 || 0,
    totalHours: p.totalHours,
    nominalHourly: p.nominalHourly,
    realHourly: p.realHourly,
    revisionPercent: p.revisionPercent,
    hasActiveAlert: alertProjectIds.has(p.id),
  }));

  // Weekly hours from dashboard
  const weeklyHours =
    Math.round(
      (dashboard.weeklyMinutes.reduce((sum, d) => sum + d.minutes, 0) / 60) *
        10,
    ) / 10;

  // Recent activity from dashboard
  const recentActivity = dashboard.recentEntries.map((e) => ({
    projectName: e.projectName,
    date: e.date,
    minutes: e.minutes,
    category: e.category,
    task: e.taskDescription,
  }));

  return {
    profile: {
      currency: profile?.defaultCurrency ?? "KRW",
      timezone: profile?.timezone ?? "Asia/Seoul",
      hourlyGoal: profile?.hourlyGoal ? Number(profile.hourlyGoal) : null,
    },
    projects,
    weeklyHours,
    activeAlertCount: dashboard.activeAlerts.length,
    totalActiveProjects: dashboard.projects.length,
    avgRealHourly: comparison.avgRealHourly,
    totalRevenue: comparison.totalRevenue,
    totalHours: comparison.totalHours,
    recentActivity,
  };
}

export function chatContextToPromptString(ctx: ChatContext): string {
  const lines: string[] = [];

  lines.push(`[사용자 프로필]`);
  lines.push(`통화: ${ctx.profile.currency}, 시간대: ${ctx.profile.timezone}`);
  if (ctx.profile.hourlyGoal) {
    lines.push(`목표 시급: ${ctx.profile.hourlyGoal}`);
  }

  lines.push("");
  lines.push(`[전체 요약]`);
  lines.push(`활성 프로젝트: ${ctx.totalActiveProjects}개`);
  lines.push(`총 작업시간: ${ctx.totalHours}시간`);
  lines.push(`이번 주 작업: ${ctx.weeklyHours}시간`);
  lines.push(`평균 실제 시급: ${ctx.avgRealHourly ?? "N/A"}`);
  lines.push(`총 순수익: ${ctx.totalRevenue}`);
  lines.push(`활성 경고: ${ctx.activeAlertCount}개`);

  if (ctx.projects.length > 0) {
    lines.push("");
    lines.push(`[프로젝트 목록]`);
    for (const p of ctx.projects) {
      const parts = [`${p.name}`];
      if (p.clientName) parts.push(`클라이언트: ${p.clientName}`);
      parts.push(`진행: ${p.progressPercent}%`);
      parts.push(`작업: ${p.totalHours}h/${p.expectedHours}h`);
      if (p.nominalHourly !== null) parts.push(`명목시급: ${p.nominalHourly}`);
      if (p.realHourly !== null) parts.push(`실제시급: ${p.realHourly}`);
      if (p.revisionPercent > 0) parts.push(`수정비율: ${p.revisionPercent}%`);
      if (p.hasActiveAlert) parts.push(`⚠️경고`);
      lines.push(`- ${parts.join(" | ")}`);
    }
  }

  if (ctx.recentActivity.length > 0) {
    lines.push("");
    lines.push(`[최근 기록]`);
    for (const e of ctx.recentActivity) {
      lines.push(
        `- ${e.date} ${e.projectName} ${Math.round((e.minutes / 60) * 10) / 10}h (${e.category}) ${e.task}`,
      );
    }
  }

  return lines.join("\n");
}
