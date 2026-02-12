import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { getUserPlan } from "@/lib/polar/feature-gate";

/** GET /api/subscription — returns current user's plan info */
export async function GET() {
  const user = await requireUser();
  const { plan, limits } = await getUserPlan(user.id);

  return NextResponse.json({
    data: {
      plan,
      limits: {
        maxProjects: limits.maxProjects === Infinity ? -1 : limits.maxProjects,
        nlpParsePerMonth: limits.nlpParsePerMonth === Infinity ? -1 : limits.nlpParsePerMonth,
        aiChatPerMonth: limits.aiChatPerMonth === Infinity ? -1 : limits.aiChatPerMonth,
        pdfInvoice: limits.pdfInvoice,
        timesheetApproval: limits.timesheetApproval,
        shareLinks: limits.shareLinks,
        weeklyInsight: limits.weeklyInsight,
        dailyBriefing: limits.dailyBriefing,
        csvExport: limits.csvExport,
        voiceInput: limits.voiceInput,
      },
    },
  });
}
