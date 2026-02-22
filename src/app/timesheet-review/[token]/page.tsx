import type { Metadata } from "next";
import { TimesheetReviewClient } from "@/components/timesheets/TimesheetReviewClient";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ token: string }>;
};

export default async function TimesheetReviewPage({ params }: Props) {
  const { token } = await params;
  return <TimesheetReviewClient token={token} />;
}
