import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string; projectId: string }>;
};

export default async function ProjectDetailPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ProjectDetailContent />;
}

function ProjectDetailContent() {
  const t = useTranslations("projects");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">{t("details")}</h1>
    </div>
  );
}
