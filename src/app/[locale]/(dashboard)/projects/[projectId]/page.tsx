import { setRequestLocale } from "next-intl/server";
import { ProjectDetailClient } from "@/components/projects/ProjectDetailClient";

type Props = {
  params: Promise<{ locale: string; projectId: string }>;
};

// TODO: Fetch real project from API once auth is set up in browser
const MOCK_PROJECT = {
  name: "Demo Project",
  clientId: null,
  currency: "USD",
  isActive: true,
  progressPercent: 40,
  expectedFee: 2000,
  expectedHours: 40,
};

export default async function ProjectDetailPage({ params }: Props) {
  const { locale, projectId } = await params;
  setRequestLocale(locale);

  return (
    <ProjectDetailClient projectId={projectId} project={MOCK_PROJECT} />
  );
}
