import { TimesheetReviewClient } from "@/components/timesheets/TimesheetReviewClient";

type Props = {
  params: Promise<{ token: string }>;
};

export default async function TimesheetReviewPage({ params }: Props) {
  const { token } = await params;
  return <TimesheetReviewClient token={token} />;
}
