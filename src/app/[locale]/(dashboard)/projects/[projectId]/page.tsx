import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ProjectDetailClient } from "@/components/projects/ProjectDetailClient";
import { getUser } from "@/lib/auth/server";
import { getProjectById } from "@/db/queries/projects";
import { getProjectMetrics } from "@/lib/metrics/get-project-metrics";

type Props = {
  params: Promise<{ locale: string; projectId: string }>;
};

export default async function ProjectDetailPage({ params }: Props) {
  const { locale, projectId } = await params;
  setRequestLocale(locale);

  const user = await getUser();
  if (!user) notFound();

  // Parallel fetch: project data + metrics (eliminates client waterfall)
  const [project, metricsResult] = await Promise.all([
    getProjectById(projectId, user.id),
    getProjectMetrics(projectId, user.id).catch(() => null),
  ]);

  if (!project) notFound();

  return (
    <ProjectDetailClient
      projectId={projectId}
      project={{
        name: project.name,
        aliases: project.aliases,
        clientId: project.clientId,
        startDate: project.startDate,
        currency: project.currency,
        isActive: project.isActive,
        status: project.status,
        progressPercent: project.progressPercent,
        expectedFee: project.expectedFee,
        expectedHours: project.expectedHours,
        platformFeeRate: project.platformFeeRate,
        taxRate: project.taxRate,
        agreedRevisionCount: project.agreedRevisionCount,
      }}
      initialMetrics={metricsResult?.metrics ?? null}
      initialAlert={metricsResult?.pendingAlert ?? null}
    />
  );
}
