import type { Metadata } from "next";
import { PublicReportClient } from "@/components/reports/PublicReportClient";

export const metadata: Metadata = {
  title: "Work Report — RealHourly",
  robots: { index: false, follow: false },
};

export default async function PublicReportPage({
  params,
}: {
  params: Promise<{ shareToken: string }>;
}) {
  const { shareToken } = await params;
  return <PublicReportClient shareToken={shareToken} />;
}
