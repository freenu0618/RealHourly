"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { BarChart3, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/money/currency";

interface AnalysisData {
  hasData: boolean;
  clientName: string;
  totalProjects: number;
  avgRevisionRate?: number;
  avgTimeOverrun?: number;
  avgRealHourlyRate?: number | null;
  currency?: string;
  insights?: string[];
  recommendedHourlyRate?: number | null;
}

interface ClientAnalysisCardProps {
  clientId: string;
}

export function ClientAnalysisCard({ clientId }: ClientAnalysisCardProps) {
  const t = useTranslations("clientAnalysis");
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/clients/${clientId}/analysis`);
        if (!res.ok) throw new Error();
        const { data: d } = await res.json();
        if (!cancelled) setData(d);
      } catch {
        if (!cancelled) setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [clientId]);

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  // Not enough data
  if (!data.hasData) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="size-4" />
            {t("title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t("collecting", { count: String(data.totalProjects) })}
          </p>
        </CardContent>
      </Card>
    );
  }

  const currency = data.currency ?? "USD";
  const insights = data.insights ?? [];
  const hasWarning = (data.avgRevisionRate ?? 0) > 30 || (data.avgTimeOverrun ?? 0) > 150;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="size-4" />
          {t("titleWithName", { name: data.clientName })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Metrics */}
        <div className="space-y-2">
          <MetricRow
            label={t("totalProjects")}
            value={t("projectCount", { count: String(data.totalProjects) })}
          />
          <MetricRow
            label={t("avgRevisionRate")}
            value={`${data.avgRevisionRate ?? 0}%`}
            warn={(data.avgRevisionRate ?? 0) > 30}
          />
          <MetricRow
            label={t("avgTimeOverrun")}
            value={`${data.avgTimeOverrun ?? 0}%`}
            warn={(data.avgTimeOverrun ?? 0) > 150}
          />
          <MetricRow
            label={t("avgRealHourly")}
            value={
              data.avgRealHourlyRate != null
                ? formatCurrency(data.avgRealHourlyRate, currency)
                : "\u2014"
            }
          />
        </div>

        {/* Insights */}
        {insights.length > 0 && (
          <div className="space-y-1.5 border-t pt-3">
            {insights.map((key) => (
              <div
                key={key}
                className="flex items-start gap-2 text-xs"
              >
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
                <span className="text-muted-foreground">{t(`insight_${key}`)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Recommended rate */}
        {data.recommendedHourlyRate != null && (
          <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
            <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" />
            <div>
              <p className="text-xs font-medium">{t("recommendedRate")}</p>
              <p className="text-lg font-bold text-primary">
                {formatCurrency(data.recommendedHourlyRate, currency)}
                <span className="ml-1 text-xs font-normal text-muted-foreground">
                  {t("perHour")}
                </span>
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MetricRow({
  label,
  value,
  warn,
}: {
  label: string;
  value: string;
  warn?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-medium ${warn ? "text-amber-600 dark:text-amber-400" : ""}`}>
        {value}
        {warn && <AlertTriangle className="ml-1 inline size-3.5 text-amber-500" />}
      </span>
    </div>
  );
}
