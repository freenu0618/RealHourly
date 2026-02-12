import { getProfile } from "@/db/queries/profiles";

export type PlanType = "free" | "pro";

export interface FeatureLimits {
  maxProjects: number;
  nlpParsePerMonth: number;
  aiChatPerMonth: number;
  scopeAlertProjects: number;
  pdfInvoice: boolean;
  timesheetApproval: boolean;
  shareLinks: boolean;
  weeklyInsight: boolean;
  dailyBriefing: boolean;
  csvExport: boolean;
  voiceInput: boolean;
}

/** Feature limits per plan */
const LIMITS: Record<PlanType, FeatureLimits> = {
  free: {
    maxProjects: 2,
    nlpParsePerMonth: 20,
    aiChatPerMonth: 10,
    scopeAlertProjects: 1,
    pdfInvoice: false,
    timesheetApproval: false,
    shareLinks: false,
    weeklyInsight: false,
    dailyBriefing: false,
    csvExport: false,
    voiceInput: false,
  },
  pro: {
    maxProjects: Infinity,
    nlpParsePerMonth: Infinity,
    aiChatPerMonth: Infinity,
    scopeAlertProjects: Infinity,
    pdfInvoice: true,
    timesheetApproval: true,
    shareLinks: true,
    weeklyInsight: true,
    dailyBriefing: true,
    csvExport: true,
    voiceInput: true,
  },
};

export function getPlanLimits(plan: PlanType): FeatureLimits {
  return LIMITS[plan] ?? LIMITS.free;
}

/** Check if user's plan is still valid (not expired) */
function isPlanActive(planType: string, expiresAt: Date | null): PlanType {
  if (planType !== "pro") return "free";
  if (!expiresAt) return "pro"; // No expiry = lifetime
  return new Date() < expiresAt ? "pro" : "free";
}

/** Get user's effective plan and limits */
export async function getUserPlan(userId: string): Promise<{
  plan: PlanType;
  limits: FeatureLimits;
}> {
  const profile = await getProfile(userId);
  if (!profile) return { plan: "free", limits: LIMITS.free };

  const plan = isPlanActive(profile.planType, profile.planExpiresAt);
  return { plan, limits: getPlanLimits(plan) };
}

/** Quick check: is user on Pro? */
export async function isProUser(userId: string): Promise<boolean> {
  const { plan } = await getUserPlan(userId);
  return plan === "pro";
}
