import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function TimeLogPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <TimeLogContent />;
}

function TimeLogContent() {
  const t = useTranslations("timeLog");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
      <p className="text-muted-foreground">{t("noEntries")}</p>
    </div>
  );
}
