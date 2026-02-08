import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { handleApiError } from "@/lib/api/handler";
import { GenerateMessagesSchema } from "@/lib/validators/messages";
import { createMessages } from "@/db/queries/generated-messages";
import { getProjectById } from "@/db/queries/projects";
import { getActiveAlertByProject } from "@/db/queries/alerts";
import { getSumMinutesByProject } from "@/db/queries/time-entries";
import { generateMessages } from "@/lib/ai/generate-messages";
import { ApiError } from "@/lib/api/errors";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = GenerateMessagesSchema.parse(await req.json());

    const project = await getProjectById(body.projectId, user.id);
    if (!project) throw new ApiError("NOT_FOUND", 404, "Project not found");

    const alert = await getActiveAlertByProject(body.projectId);
    if (!alert || alert.id !== body.alertId) {
      throw new ApiError("NOT_FOUND", 404, "Alert not found");
    }

    const totalMinutes = await getSumMinutesByProject(body.projectId, "done");
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

    const messages = await generateMessages({
      clientName: "",
      projectName: project.name,
      expectedFee: project.expectedFee ?? 0,
      expectedHours: project.expectedHours ?? 0,
      totalHours,
      progressPercent: project.progressPercent,
      triggeredRules: [alert.alertType],
      metadata: alert.metadata,
      currency: project.currency,
    });

    const data = await createMessages(body.alertId, messages);
    return NextResponse.json({ data: { messages: data } });
  } catch (error) {
    return handleApiError(error);
  }
}
