"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { startOfWeek, subWeeks, addDays } from "date-fns";
import { formatDate } from "@/lib/date";

interface ReportRow {
  id: string;
  weekStart: string;
  weekEnd: string;
  data: { totalMinutes: number; entryCount: number };
}

export function ReportsListClient() {
  const t = useTranslations("reports");
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    try {
      const res = await fetch("/api/reports/weekly");
      if (!res.ok) throw new Error();
      const json = await res.json();
      setReports(json.data ?? []);
    } catch {
      toast.error(t("fetchError"));
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate(weekStart: string) {
    setGenerating(weekStart);
    try {
      const res = await fetch("/api/reports/weekly/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weekStart }),
      });
      if (!res.ok) throw new Error();
      await fetchReports();
    } catch {
      toast.error(t("generateError"));
    } finally {
      setGenerating(null);
    }
  }

  // Generate last 12 weeks
  const weeks = Array.from({ length: 12 }, (_, i) => {
    const monday = startOfWeek(subWeeks(new Date(), i + 1), {
      weekStartsOn: 1,
    });
    const sunday = addDays(monday, 6);
    return {
      weekStart: formatDate(monday, "yyyy-MM-dd"),
      weekEnd: formatDate(sunday, "yyyy-MM-dd"),
      mondayDisplay: formatDate(monday, "M/d"),
      sundayDisplay: formatDate(sunday, "M/d"),
    };
  });

  const reportMap = new Map(reports.map((r) => [r.weekStart, r]));

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 p-6">
        <div className="h-8 w-48 animate-pulse rounded-xl bg-muted" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="space-y-3">
        {weeks.map((week) => {
          const report = reportMap.get(week.weekStart);
          const isGenerating = generating === week.weekStart;

          return (
            <div
              key={week.weekStart}
              className="flex items-center justify-between rounded-[16px] border border-border/50 bg-card px-5 py-4"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{"📋"}</span>
                <div>
                  <p className="text-sm font-medium">
                    {week.mondayDisplay} ~ {week.sundayDisplay}
                  </p>
                  {report && (
                    <p className="text-xs text-muted-foreground">
                      {Math.round(
                        ((report.data?.totalMinutes ?? 0) / 60) * 10,
                      ) / 10}
                      {t("hours")} | {t("entries", { count: String(report.data?.entryCount ?? 0) })}
                    </p>
                  )}
                </div>
              </div>

              {report ? (
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="rounded-xl text-xs"
                >
                  <Link href={`/reports/${week.weekStart}`}>
                    {t("viewReport")}
                  </Link>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-xs"
                  onClick={() => handleGenerate(week.weekStart)}
                  disabled={isGenerating}
                >
                  {isGenerating ? t("generating") : t("generate")}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
