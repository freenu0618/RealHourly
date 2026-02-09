import { setRequestLocale } from "next-intl/server";
import { getUser } from "@/lib/auth/server";
import { getProjectsByUserId } from "@/db/queries/projects";
import HistoryClient from "@/components/time-log/HistoryClient";

type Props = {
  params: Promise<{ locale: string }>;
};

async function getProjects() {
  try {
    const user = await getUser();
    if (!user) return [];
    const projects = await getProjectsByUserId(user.id);
    return projects.map((p) => ({ id: p.id, name: p.name }));
  } catch {
    return [];
  }
}

export default async function TimeLogHistoryPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const projects = await getProjects();

  return <HistoryClient projects={projects} locale={locale} />;
}
