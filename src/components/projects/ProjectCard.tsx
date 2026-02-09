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
    progressPercent: number;
    expectedFee: number | null;
    expectedHours: number | null;
  };
}

function getStatusBadge(progress: number, isActive: boolean) {
  if (!isActive) return { emoji: "\uD83D\uDCA4", label: "Archived", color: "text-muted-foreground bg-muted" };
  if (progress >= 80) return { emoji: "\uD83C\uDF3F", label: "Almost Done", color: "text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-900/30" };
  if (progress >= 40) return { emoji: "\uD83D\uDCA1", label: "In Progress", color: "text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/30" };
  return { emoji: "\uD83C\uDF31", label: "Getting Started", color: "text-primary bg-primary/10" };
}

export function ProjectCard({ project }: ProjectCardProps) {
  const t = useTranslations("projects");
  const status = getStatusBadge(project.progressPercent, project.isActive);

  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="group rounded-[20px] border-transparent shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-base font-bold transition-colors group-hover:text-primary">
              {project.name}
            </CardTitle>
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${status.color}`}>
              {status.emoji} {status.label}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium text-muted-foreground">
              <span>{t("progress")}</span>
              <span>{project.progressPercent}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${Math.min(project.progressPercent, 100)}%` }}
              />
            </div>
          </div>

          {/* Rate section */}
          <div className="flex items-end justify-between rounded-xl bg-muted/60 p-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("expectedFee")}</p>
              <p className="text-sm font-semibold">
                {project.expectedFee != null
                  ? formatCurrency(project.expectedFee, project.currency)
                  : "\u2014"}
              </p>
            </div>
            {project.expectedHours != null && (
              <>
                <div className="mx-2 h-8 w-px bg-border" />
                <div className="text-right">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {t("expectedHours")}
                  </p>
                  <p className="text-sm font-semibold">{project.expectedHours}h</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
