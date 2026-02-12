"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";

const statusConfig = {
  draft: { variant: "outline" as const, className: "border-muted-foreground/30 text-muted-foreground" },
  submitted: { variant: "secondary" as const, className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  approved: { variant: "secondary" as const, className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
  rejected: { variant: "secondary" as const, className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
};

export function TimesheetStatusBadge({ status }: { status: string }) {
  const t = useTranslations("timesheet");
  const config = statusConfig[status as keyof typeof statusConfig] ?? statusConfig.draft;

  const labelMap: Record<string, string> = {
    draft: t("statusDraft"),
    submitted: t("statusSubmitted"),
    approved: t("statusApproved"),
    rejected: t("statusRejected"),
  };

  return (
    <Badge variant={config.variant} className={config.className}>
      {labelMap[status] ?? status}
    </Badge>
  );
}
