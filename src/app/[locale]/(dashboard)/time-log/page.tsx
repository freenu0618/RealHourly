import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { ClipboardList } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { TimeLogInterface } from "@/components/time-log/TimeLogInterface";
import { getUser } from "@/lib/auth/server";
import { getProjectsByUserId } from "@/db/queries/projects";

type Props = {
  params: Promise<{ locale: string }>;
};

async function getActiveProjects(): Promise<{ id: string; name: string }[]> {
  try {
    const user = await getUser();
    if (!user) return [];
    const projects = await getProjectsByUserId(user.id, { status: "active" });
    return projects.map((p) => ({ id: p.id, name: p.name }));
  } catch {
    return [];
  }
}

export default async function TimeLogPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const projects = await getActiveProjects();

  return <TimeLogContent projects={projects} />;
}

function TimeLogContent({
  projects,
}: {
  projects: { id: string; name: string }[];
}) {
  const t = useTranslations("timeLog");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <Link
          href="/time-log/history"
          className="flex items-center gap-1.5 rounded-xl bg-muted px-4 py-2 text-sm font-medium transition-colors hover:bg-muted/80"
        >
          <ClipboardList className="size-4" />
          {t("viewHistory")}
        </Link>
      </div>
      <TimeLogInterface projects={projects} />
    </div>
  );
}
