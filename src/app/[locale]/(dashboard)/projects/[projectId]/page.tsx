import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ProjectDetailClient } from "@/components/projects/ProjectDetailClient";
import { getUser } from "@/lib/auth/server";
import { getProjectById } from "@/db/queries/projects";

type Props = {
  params: Promise<{ locale: string; projectId: string }>;
};

export default async function ProjectDetailPage({ params }: Props) {
  const { locale, projectId } = await params;
  setRequestLocale(locale);

  const user = await getUser();
  if (!user) notFound();

  const project = await getProjectById(projectId, user.id);
  if (!project) notFound();

  return (
    <ProjectDetailClient
      projectId={projectId}
      project={{
        name: project.name,
        aliases: project.aliases,
        clientId: project.clientId,
        currency: project.currency,
        isActive: project.isActive,
        status: project.status,
        progressPercent: project.progressPercent,
        expectedFee: project.expectedFee,
        expectedHours: project.expectedHours,
        platformFeeRate: project.platformFeeRate,
        taxRate: project.taxRate,
      }}
    />
  );
}
