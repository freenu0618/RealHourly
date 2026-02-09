import { setRequestLocale } from "next-intl/server";
import { ReportDetailClient } from "@/components/reports/ReportDetailClient";

type Props = {
  params: Promise<{ locale: string; weekStart: string }>;
};

export default async function ReportDetailPage({ params }: Props) {
  const { locale, weekStart } = await params;
  setRequestLocale(locale);

  return <ReportDetailClient weekStart={weekStart} />;
}
