"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HourlyRateBar } from "@/components/charts/HourlyRateBar";
import { CostBreakdownPie } from "@/components/charts/CostBreakdownPie";
import { ScopeAlertModal } from "@/components/alerts/ScopeAlertModal";
import { formatCurrency } from "@/lib/money/currency";
import type { ProjectMetricsDTO } from "@/lib/metrics/get-project-metrics";
import { InvoiceDialog } from "./InvoiceDialog";
import { ProjectDetailHeader } from "./ProjectDetailHeader";
import { ProjectStatusBanner } from "./ProjectStatusBanner";
import { ProjectProgressSection } from "./ProjectProgressSection";
import { CompleteProjectDialog } from "./CompleteProjectDialog";
import { EditProjectDialog } from "./EditProjectDialog";
import { DeleteProjectDialog } from "./DeleteProjectDialog";
import { CostEntriesSection } from "./CostEntriesSection";
import { ShareManagementSection } from "./ShareManagementSection";

interface AlertDTO {
  id: string;
  alertType: string;
  metadata: Record<string, unknown>;
}

interface ProjectDetailClientProps {
  projectId: string;
  project: {
    name: string;
    aliases: string[];
    clientId: string | null;
    currency: string;
    isActive: boolean;
    status: string;
    progressPercent: number;
    expectedFee: number | null;
    expectedHours: number | null;
    platformFeeRate: number | null;
    taxRate: number | null;
  };
}

export function ProjectDetailClient({
  projectId,
  project: initialProject,
}: ProjectDetailClientProps) {
  const t = useTranslations("metrics");
  const tAlerts = useTranslations("alerts");
  const router = useRouter();

  const [project, setProject] = useState(initialProject);
  const [metrics, setMetrics] = useState<ProjectMetricsDTO | null>(null);
  const [pendingAlert, setPendingAlert] = useState<AlertDTO | null>(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [invoiceType, setInvoiceType] = useState<"estimate" | "invoice">("estimate");
  const [showInvoice, setShowInvoice] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [loading, setLoading] = useState(true);

  const isEditable = project.status === "active" || project.status === "paused";

  const fetchMetrics = useCallback(async () => {
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
      console.error("[ProjectDetail] Failed to load metrics");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { fetchMetrics(); }, [fetchMetrics]);

  const handleStatusChanged = (newStatus: string) => {
    setProject((p) => ({ ...p, status: newStatus }));
    fetchMetrics();
  };

  const handleResume = async () => {
    const res = await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "active" }),
    });
    if (res.ok) handleStatusChanged("active");
  };

  const handleRefresh = () => {
    fetchMetrics();
    router.refresh();
  };

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
      <ProjectStatusBanner status={project.status} realHourly={metrics.realHourly} currency={currency} onResume={handleResume} />

      {pendingAlert && !showAlertModal && (
        <div className="flex items-center justify-between rounded-lg border border-amber-300 bg-amber-50 p-3 dark:border-amber-700 dark:bg-amber-950">
          <div className="flex items-center gap-2 text-sm font-medium text-amber-800 dark:text-amber-200">
            <Lightbulb className="size-4" />
            {tAlerts("needsAttention")}
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowAlertModal(true)}>
            {tAlerts("details")}
          </Button>
        </div>
      )}

      {pendingAlert && showAlertModal && (
        <ScopeAlertModal projectId={projectId} alert={pendingAlert} projectName={project.name} onDismiss={() => { setShowAlertModal(false); setPendingAlert(null); }} />
      )}

      <ProjectDetailHeader
        projectId={projectId}
        projectName={project.name}
        status={project.status}
        isEditable={isEditable}
        onStatusChanged={handleStatusChanged}
        onCompleteRequest={() => setShowComplete(true)}
        onEditRequest={() => setShowEdit(true)}
        onDeleteRequest={() => setShowDelete(true)}
        onInvoiceRequest={(type) => { setInvoiceType(type); setShowInvoice(true); }}
      />

      <ProjectProgressSection projectId={projectId} initialProgress={metrics.progressPercent} isEditable={isEditable} onProgressUpdated={() => fetchMetrics()} />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KPICard title={t("nominalHourly")} value={metrics.nominalHourly !== null ? formatCurrency(metrics.nominalHourly, currency) : "\u2014"} />
        <KPICard title={t("realHourly")} value={metrics.realHourly !== null ? formatCurrency(metrics.realHourly, currency) : "\u2014"} highlight={metrics.realHourly !== null && metrics.nominalHourly !== null && metrics.realHourly < metrics.nominalHourly} />
        <KPICard title={t("totalHours")} value={metrics.totalHours > 0 ? `${metrics.totalHours}h` : "0h"} />
        <KPICard title={t("netRevenue")} value={formatCurrency(metrics.net, currency)} highlight={metrics.net < 0} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card><CardHeader><CardTitle className="text-base">{t("hourlyComparison")}</CardTitle></CardHeader><CardContent><HourlyRateBar nominalHourly={metrics.nominalHourly} realHourly={metrics.realHourly} currency={currency} net={metrics.net} /></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">{t("costBreakdown")}</CardTitle></CardHeader><CardContent><CostBreakdownPie costBreakdown={metrics.costBreakdown} currency={currency} /></CardContent></Card>
      </div>

      <CostEntriesSection projectId={projectId} currency={currency} isEditable={isEditable} />

      <ShareManagementSection projectId={projectId} />

      <InvoiceDialog open={showInvoice} onOpenChange={setShowInvoice} projectId={projectId} defaultType={invoiceType} />
      <CompleteProjectDialog open={showComplete} onOpenChange={setShowComplete} projectId={projectId} metrics={metrics ? { totalHours: metrics.totalHours, realHourly: metrics.realHourly, net: metrics.net, currency } : null} onCompleted={() => { handleStatusChanged("completed"); setShowComplete(false); }} />
      <EditProjectDialog open={showEdit} onOpenChange={setShowEdit} project={{ id: projectId, name: project.name, aliases: project.aliases, expectedFee: project.expectedFee, expectedHours: project.expectedHours, currency: project.currency, platformFeeRate: project.platformFeeRate, taxRate: project.taxRate }} onUpdated={handleRefresh} />
      <DeleteProjectDialog open={showDelete} onOpenChange={setShowDelete} projectId={projectId} projectName={project.name} />
    </div>
  );
}

function KPICard({ title, value, highlight }: { title: string; value: string; highlight?: boolean }) {
  return (
    <Card><CardContent className="pt-4">
      <p className="text-xs text-muted-foreground">{title}</p>
      <p className={`text-xl font-bold ${highlight ? "text-destructive" : ""}`}>{value}</p>
    </CardContent></Card>
  );
}
