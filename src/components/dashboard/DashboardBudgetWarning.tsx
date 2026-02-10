"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { ProjectSummary } from "./types";

interface DashboardBudgetWarningProps {
  projects: ProjectSummary[];
}

export function DashboardBudgetWarning({ projects }: DashboardBudgetWarningProps) {
  const t = useTranslations("budget");

  const overBudgetProjects = projects.filter((p) => {
    if (!p.expectedHours || p.expectedHours <= 0) return false;
    const ratio = (p.totalMinutes / 60) / p.expectedHours;
    return ratio >= 0.8;
  });

  if (overBudgetProjects.length === 0) return null;

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
      <div className="flex items-center gap-2 text-sm font-medium text-amber-800 dark:text-amber-200">
        <AlertTriangle className="size-4 shrink-0" />
        <span>
          {t("dashboardWarning", { count: String(overBudgetProjects.length) })}
        </span>
      </div>
      <div className="mt-2 space-y-1.5">
        {overBudgetProjects.map((p) => {
          const ratio = (p.totalMinutes / 60) / p.expectedHours;
          const pct = Math.round(ratio * 100);
          const barColor = ratio > 1 ? "bg-red-500" : ratio >= 0.8 ? "bg-orange-500" : "bg-amber-500";
          return (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-amber-100/50 dark:hover:bg-amber-900/20"
            >
              <span className="min-w-0 truncate text-sm text-amber-900 dark:text-amber-100">
                {p.name}
              </span>
              <div className="ml-auto flex items-center gap-2 shrink-0">
                <div className="h-1.5 w-16 overflow-hidden rounded-full bg-amber-200 dark:bg-amber-800">
                  <div
                    className={`h-full rounded-full ${barColor}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                  {pct}%
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
