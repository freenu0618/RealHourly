"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/money/currency";

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    currency: string;
    isActive: boolean;
    status: string;
    progressPercent: number;
    expectedFee: number | null;
    expectedHours: number | null;
    clientName: string | null;
    totalMinutes: number;
    realHourly: number | null;
    nominalHourly: number | null;
  };
}

function getStatusBadge(status: string, progress: number, t: (key: string) => string) {
  if (status === "completed") return { label: t("statusCompleted"), color: "text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-900/30" };
  if (status === "paused") return { label: t("statusPaused"), color: "text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/30" };
  if (status === "cancelled") return { label: t("statusCancelled"), color: "text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-900/30" };
  if (progress >= 80) return { label: t("statusAlmostDone"), color: "text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-900/30" };
  if (progress >= 40) return { label: t("statusInProgress"), color: "text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/30" };
  return { label: t("statusActive"), color: "text-primary bg-primary/10" };
}

function getRateHealth(realHourly: number | null, currency: string) {
  if (realHourly === null) {
    return { emoji: "\u2014", color: "text-muted-foreground", bg: "" };
  }
  // Normalize to USD equivalent for thresholds
  const usdEquiv = currency === "KRW" ? realHourly / 1300
    : currency === "JPY" ? realHourly / 150
    : currency === "EUR" ? realHourly * 1.1
    : currency === "GBP" ? realHourly * 1.25
    : realHourly;

  if (realHourly < 0) {
    return { emoji: "\uD83D\uDEA8", color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/30" };
  }
  if (usdEquiv >= 40) {
    return { emoji: "\uD83C\uDF3F", color: "text-green-700 dark:text-green-400", bg: "bg-green-50/50 dark:bg-green-950/20" };
  }
  if (usdEquiv >= 25) {
    return { emoji: "\uD83D\uDCA1", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50/50 dark:bg-amber-950/20" };
  }
  return { emoji: "\uD83D\uDD25", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50/50 dark:bg-orange-950/20" };
}

export function ProjectCard({ project }: ProjectCardProps) {
  const t = useTranslations("projects");
  const status = getStatusBadge(project.status ?? "active", project.progressPercent, t);
  const health = getRateHealth(project.realHourly, project.currency);

  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="group rounded-[20px] border-transparent shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <CardTitle className="truncate text-base font-bold transition-colors group-hover:text-primary">
                {project.name}
              </CardTitle>
              {project.clientName && (
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {project.clientName}
                </p>
              )}
            </div>
            <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${status.color}`}>
              {status.label}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium text-muted-foreground">
              <span>{t("progress")}</span>
              <span>{project.progressPercent}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${Math.min(project.progressPercent, 100)}%` }}
              />
            </div>
          </div>

          {/* Fee & Hours */}
          <div className="flex items-end justify-between rounded-xl bg-muted/50 px-3.5 py-3">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{t("expectedFee")}</p>
              <p className="text-sm font-semibold">
                {project.expectedFee != null
                  ? formatCurrency(project.expectedFee, project.currency)
                  : "\u2014"}
              </p>
            </div>
            {project.expectedHours != null && (
              <>
                <div className="mx-2 h-7 w-px bg-border" />
                <div className="text-right">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    {t("expectedHours")}
                  </p>
                  <p className="text-sm font-semibold">{project.expectedHours}h</p>
                </div>
              </>
            )}
          </div>

          {/* Real Hourly Rate */}
          <div className={`flex items-center justify-between rounded-xl px-3.5 py-3 ${health.bg || "bg-muted/30"}`}>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-lg">{health.emoji}</span>
                <span className={`text-lg font-bold tabular-nums ${health.color}`}>
                  {project.realHourly !== null
                    ? `${formatCurrency(project.realHourly, project.currency)}/h`
                    : "\u2014"}
                </span>
                {project.realHourly !== null && project.realHourly < 0 && (
                  <span className="rounded-md bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700 dark:bg-red-900/50 dark:text-red-300">
                    {t("deficit")}
                  </span>
                )}
              </div>
              {project.nominalHourly !== null && project.realHourly !== null && (
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {t("nominalRate")} {formatCurrency(project.nominalHourly, project.currency)}/h
                </p>
              )}
            </div>
            {project.totalMinutes > 0 && (
              <span className="text-xs text-muted-foreground">
                {Math.round((project.totalMinutes / 60) * 10) / 10}h
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
