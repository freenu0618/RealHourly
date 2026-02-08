import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { TimeLogInterface } from "@/components/time-log/TimeLogInterface";

type Props = {
  params: Promise<{ locale: string }>;
};

// TODO: Fetch real active projects from API in STEP 5+
const MOCK_PROJECTS = [
  { id: "mock-project-id", name: "XYZ 앱" },
  { id: "mock-project-2", name: "ABC 리브랜딩" },
  { id: "mock-project-3", name: "내부 프로젝트" },
];

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
      <TimeLogInterface projects={MOCK_PROJECTS} />
    </div>
  );
}
