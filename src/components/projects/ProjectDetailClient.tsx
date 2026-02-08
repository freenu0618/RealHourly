"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HourlyRateBar } from "@/components/charts/HourlyRateBar";
import { CostBreakdownPie } from "@/components/charts/CostBreakdownPie";
import { ScopeAlertModal } from "@/components/alerts/ScopeAlertModal";
import { formatCurrency } from "@/lib/money/currency";
import type { ProjectMetricsDTO } from "@/lib/metrics/get-project-metrics";

interface AlertDTO {
  id: string;
  alertType: string;
  metadata: Record<string, unknown>;
}

interface ProjectDetailClientProps {
  projectId: string;
  project: {
    name: string;
    clientId: string | null;
    currency: string;
    isActive: boolean;
    progressPercent: number;
    expectedFee: number | null;
    expectedHours: number | null;
  };
}

export function ProjectDetailClient({
  projectId,
  project,
}: ProjectDetailClientProps) {
  const t = useTranslations("metrics");
  const tAlerts = useTranslations("alerts");
  const [metrics, setMetrics] = useState<ProjectMetricsDTO | null>(null);
  const [pendingAlert, setPendingAlert] = useState<AlertDTO | null>(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const res = await fetch(`/api/projects/${projectId}/metrics`);
        if (!res.ok) throw new Error();
        const { data } = await res.json();
        setMetrics(data.metrics);
        if (data.pendingAlert) {
          setPendingAlert(data.pendingAlert);
          setShowAlertModal(true);
        }
      } catch {
        // silent fail
      } finally {
        setLoading(false);
      }
    }
    fetchMetrics();
  }, [projectId]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 rounded bg-muted" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  const currency = metrics.currency ?? project.currency;

  return (
    <div className="space-y-6">
      {/* Scope Alert Banner */}
      {pendingAlert && !showAlertModal && (
        <div className="flex items-center justify-between rounded-lg border border-yellow-300 bg-yellow-50 p-3 dark:border-yellow-700 dark:bg-yellow-950">
          <div className="flex items-center gap-2 text-sm font-medium text-yellow-800 dark:text-yellow-200">
            <AlertTriangle className="size-4" />
            {tAlerts("underpaid")}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAlertModal(true)}
          >
            {tAlerts("details")}
          </Button>
        </div>
      )}

      {/* Scope Alert Modal */}
      {pendingAlert && showAlertModal && (
        <ScopeAlertModal
          projectId={projectId}
          alert={pendingAlert}
          projectName={project.name}
          onDismiss={() => {
            setShowAlertModal(false);
            setPendingAlert(null);
          }}
        />
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">{project.name}</h1>
        <Badge variant={project.isActive ? "default" : "secondary"}>
          {project.isActive ? t("active") : t("archived")}
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KPICard
          title={t("nominalHourly")}
          value={
            metrics.nominalHourly !== null
              ? formatCurrency(metrics.nominalHourly, currency)
              : "—"
          }
        />
        <KPICard
          title={t("realHourly")}
          value={
            metrics.realHourly !== null
              ? formatCurrency(metrics.realHourly, currency)
              : "—"
          }
          highlight={
            metrics.realHourly !== null &&
            metrics.nominalHourly !== null &&
            metrics.realHourly < metrics.nominalHourly
          }
        />
        <KPICard
          title={t("totalHours")}
          value={metrics.totalHours > 0 ? `${metrics.totalHours}h` : "0h"}
        />
        <KPICard
          title={t("netRevenue")}
          value={formatCurrency(metrics.net, currency)}
          highlight={metrics.net < 0}
        />
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t("progress")}</span>
          <span className="font-medium">{metrics.progressPercent}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${Math.min(metrics.progressPercent, 100)}%` }}
          />
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {t("hourlyComparison")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <HourlyRateBar
              nominalHourly={metrics.nominalHourly}
              realHourly={metrics.realHourly}
              currency={currency}
              net={metrics.net}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("costBreakdown")}</CardTitle>
          </CardHeader>
          <CardContent>
            <CostBreakdownPie
              costBreakdown={metrics.costBreakdown}
              currency={currency}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KPICard({
  title,
  value,
  highlight,
}: {
  title: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <Card>
      <CardContent className="pt-4">
        <p className="text-xs text-muted-foreground">{title}</p>
        <p
          className={`text-xl font-bold ${highlight ? "text-destructive" : ""}`}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
