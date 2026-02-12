import { getProfile } from "@/db/queries/profiles";
import { getUsageCount, incrementUsage } from "@/db/queries/usage-counts";
import { ApiError } from "@/lib/api/errors";

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

// ─── Enforcement Helpers ───────────────────────────────────────────────

/**
 * Require a boolean feature. Throws 403 if not allowed on user's plan.
 */
export async function requireFeature(
  userId: string,
  feature: keyof FeatureLimits,
): Promise<void> {
  const { limits } = await getUserPlan(userId);
  const value = limits[feature];
  if (value === false) {
    throw new ApiError(
      "PLAN_LIMIT",
      403,
      `This feature requires a Pro plan. Upgrade to unlock.`,
    );
  }
}

/**
 * Check a monthly quota feature. Throws 403 if quota exceeded.
 * Does NOT increment — call trackUsage after the operation succeeds.
 */
export async function checkQuota(
  userId: string,
  feature: "nlp_parse" | "ai_chat",
): Promise<void> {
  const { limits } = await getUserPlan(userId);
  const limitKey = feature === "nlp_parse" ? "nlpParsePerMonth" : "aiChatPerMonth";
  const max = limits[limitKey];

  if (max === Infinity) return; // Pro plan — unlimited

  const current = await getUsageCount(userId, feature);
  if (current >= max) {
    throw new ApiError(
      "QUOTA_EXCEEDED",
      403,
      `Monthly ${feature === "nlp_parse" ? "AI parsing" : "AI chat"} limit reached (${max}). Upgrade to Pro for unlimited access.`,
    );
  }
}

/**
 * Increment monthly quota after successful operation.
 */
export async function trackUsage(
  userId: string,
  feature: "nlp_parse" | "ai_chat",
): Promise<void> {
  await incrementUsage(userId, feature);
}

/**
 * Check project count limit. Throws 403 if at max.
 */
export async function checkProjectLimit(
  userId: string,
  currentActiveCount: number,
): Promise<void> {
  const { limits } = await getUserPlan(userId);
  if (limits.maxProjects === Infinity) return;
  if (currentActiveCount >= limits.maxProjects) {
    throw new ApiError(
      "PLAN_LIMIT",
      403,
      `Free plan allows up to ${limits.maxProjects} projects. Upgrade to Pro for unlimited projects.`,
    );
  }
}
