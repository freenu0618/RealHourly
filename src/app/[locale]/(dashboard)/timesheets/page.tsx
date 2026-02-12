import { setRequestLocale } from "next-intl/server";
import { TimesheetListClient } from "@/components/timesheets/TimesheetListClient";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function TimesheetsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <TimesheetListClient />;
}
