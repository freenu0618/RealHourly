import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { handleApiError } from "@/lib/api/handler";
import { eq, and, isNull, inArray, desc } from "drizzle-orm";
import { db } from "@/db";
import { timeEntries, projects } from "@/db/schema";
import { requireFeature } from "@/lib/polar/feature-gate";

export async function GET() {
  try {
    const user = await requireUser();
    await requireFeature(user.id, "csvExport");

    const userProjects = await db
      .select({ id: projects.id, name: projects.name })
      .from(projects)
      .where(and(eq(projects.userId, user.id), isNull(projects.deletedAt)));

    if (userProjects.length === 0) {
      return new NextResponse("date,project,category,intent,minutes,description\n", {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="realhourly-export-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    const projectMap = new Map(userProjects.map((p) => [p.id, p.name]));
    const projectIds = userProjects.map((p) => p.id);

    const rows = await db
      .select()
      .from(timeEntries)
      .where(and(inArray(timeEntries.projectId, projectIds), isNull(timeEntries.deletedAt)))
      .orderBy(desc(timeEntries.date), desc(timeEntries.createdAt));

    const header = "date,project,category,intent,minutes,description\n";
    const csvRows = rows.map((r) => {
      const desc = r.taskDescription.replace(/"/g, '""');
      const projectName = (projectMap.get(r.projectId) ?? "").replace(/"/g, '""');
      return `${r.date},"${projectName}",${r.category},${r.intent},${r.minutes},"${desc}"`;
    });

    const csv = header + csvRows.join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="realhourly-export-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
