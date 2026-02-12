import { NextResponse } from "next/server";
import { eq, and, isNull, inArray, sql } from "drizzle-orm";
import { requireUser } from "@/lib/auth/server";
import { handleApiError } from "@/lib/api/handler";
import { CreateProjectSchema } from "@/lib/validators/projects";
import { getProjectsByUserId, createProject } from "@/db/queries/projects";
import { db } from "@/db";
import { timeEntries, costEntries, clients, projects } from "@/db/schema";
import { checkProjectLimit } from "@/lib/polar/feature-gate";

export async function GET(req: Request) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status");
    const opts = statusParam ? { status: statusParam } : undefined;
    const baseProjects = await getProjectsByUserId(user.id, opts);

    if (baseProjects.length === 0) {
      return NextResponse.json({ data: [] });
    }

    const projectIds = baseProjects.map((p) => p.id);

    const [timeAgg, costAgg, clientRows] = await Promise.all([
      db
        .select({
          projectId: timeEntries.projectId,
          totalMinutes:
            sql<number>`COALESCE(SUM(${timeEntries.minutes}), 0)`.as(
              "total_minutes",
            ),
        })
        .from(timeEntries)
        .where(
          and(
            inArray(timeEntries.projectId, projectIds),
            eq(timeEntries.intent, "done"),
            isNull(timeEntries.deletedAt),
          ),
        )
        .groupBy(timeEntries.projectId),

      db
        .select({
          projectId: costEntries.projectId,
          totalCost:
            sql<number>`COALESCE(SUM(${costEntries.amount}::numeric), 0)`.as(
              "total_cost",
            ),
        })
        .from(costEntries)
        .where(
          and(
            inArray(costEntries.projectId, projectIds),
            sql`${costEntries.costType} NOT IN ('platform_fee', 'tax')`,
            isNull(costEntries.deletedAt),
          ),
        )
        .groupBy(costEntries.projectId),

      db
        .select({ id: clients.id, name: clients.name })
        .from(clients)
        .where(and(eq(clients.userId, user.id), isNull(clients.deletedAt))),
    ]);

    const timeMap = new Map(
      timeAgg.map((r) => [r.projectId, Number(r.totalMinutes)]),
    );
    const costMap = new Map(
      costAgg.map((r) => [r.projectId, Number(r.totalCost)]),
    );
    const clientMap = new Map(clientRows.map((c) => [c.id, c.name]));

    const data = baseProjects.map((p) => {
      const totalMinutes = timeMap.get(p.id) ?? 0;
      const fixedCosts = costMap.get(p.id) ?? 0;
      const gross = p.expectedFee ?? 0;
      const platformFee = gross * (p.platformFeeRate ?? 0);
      const tax = gross * (p.taxRate ?? 0);
      const net = gross - (fixedCosts + platformFee + tax);
      const totalHours = totalMinutes / 60;

      const rawNominal =
        (p.expectedHours ?? 0) > 0 ? gross / p.expectedHours! : null;
      const nominalHourly = rawNominal !== null && Number.isFinite(rawNominal) ? rawNominal : null;
      const rawReal = totalHours > 0 ? net / totalHours : null;
      const realHourly = rawReal !== null && Number.isFinite(rawReal) ? rawReal : null;

      return {
        ...p,
        clientName: p.clientId ? (clientMap.get(p.clientId) ?? null) : null,
        totalMinutes,
        realHourly:
          realHourly !== null ? Math.round(realHourly * 100) / 100 : null,
        nominalHourly:
          nominalHourly !== null
            ? Math.round(nominalHourly * 100) / 100
            : null,
      };
    });

    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();

    // Check project count limit
    const [countRow] = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(projects)
      .where(
        and(
          eq(projects.userId, user.id),
          isNull(projects.deletedAt),
          sql`${projects.status} != 'cancelled'`,
        ),
      );
    await checkProjectLimit(user.id, countRow?.count ?? 0);

    const body = CreateProjectSchema.parse(await req.json());

    // If clientName is provided but no clientId, find or create client
    if (body.clientName && !body.clientId) {
      const trimmed = body.clientName.trim();
      if (trimmed) {
        const existing = await db
          .select({ id: clients.id })
          .from(clients)
          .where(
            and(
              eq(clients.userId, user.id),
              sql`LOWER(${clients.name}) = LOWER(${trimmed})`,
              isNull(clients.deletedAt),
            ),
          )
          .limit(1);

        if (existing.length > 0) {
          body.clientId = existing[0].id;
        } else {
          const [newClient] = await db
            .insert(clients)
            .values({ userId: user.id, name: trimmed })
            .returning({ id: clients.id });
          body.clientId = newClient.id;
        }
      }
    }

    const data = await createProject(user.id, body);
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
