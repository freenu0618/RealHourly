import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { OfflineClient } from "@/app/offline/OfflineClient";

type Props = { params: Promise<{ locale: string }> };

export const metadata: Metadata = {
  title: "Offline | RealHourly",
  robots: { index: false, follow: false, noarchive: true },
};

export default async function LocalizedOfflinePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <OfflineClient />;
}
