"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import dynamic from "next/dynamic";
import { Lightbulb, BarChart3, Clock, DollarSign, Share2, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { NumberTicker } from "@/components/ui/number-ticker";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { PulsatingButton } from "@/components/ui/pulsating-button";
import { ScopeAlertModal } from "@/components/alerts/ScopeAlertModal";

const HourlyRateBar = dynamic(
  () => import("@/components/charts/HourlyRateBar").then((m) => ({ default: m.HourlyRateBar })),
  { ssr: false, loading: () => <Skeleton className="h-[200px] w-full rounded-xl" /> },
);
const CostBreakdownPie = dynamic(
  () => import("@/components/charts/CostBreakdownPie").then((m) => ({ default: m.CostBreakdownPie })),
  { ssr: false, loading: () => <Skeleton className="h-[200px] w-full rounded-xl" /> },
);
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
import { TimeEntriesSection } from "./TimeEntriesSection";
import { BudgetProgressBar } from "./BudgetProgressBar";
import { RevisionTracker } from "./RevisionTracker";
import { ClientAnalysisCard } from "./ClientAnalysisCard";

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
    startDate: string | null;
    currency: string;
    isActive: boolean;
    status: string;
    progressPercent: number;
    expectedFee: number | null;
    expectedHours: number | null;
    platformFeeRate: number | null;
    taxRate: number | null;
    agreedRevisionCount: number | null;
  };
  initialMetrics?: ProjectMetricsDTO | null;
  initialAlert?: AlertDTO | null;
}

export function ProjectDetailClient({
  projectId,
  project: initialProject,
  initialMetrics = null,
  initialAlert = null,
}: ProjectDetailClientProps) {
  const t = useTranslations("metrics");
  const tAlerts = useTranslations("alerts");
  const tDetail = useTranslations("projectDetail");
  const router = useRouter();

  const [project, setProject] = useState(initialProject);
  const [metrics, setMetrics] = useState<ProjectMetricsDTO | null>(initialMetrics);
  const [pendingAlert, setPendingAlert] = useState<AlertDTO | null>(initialAlert);
  const [showAlertModal, setShowAlertModal] = useState(!!initialAlert);
  const [invoiceType, setInvoiceType] = useState<"estimate" | "invoice">("estimate");
  const [showInvoice, setShowInvoice] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [loading, setLoading] = useState(!initialMetrics);

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

  // Skip initial fetch if metrics were provided by the server
  useEffect(() => { if (!initialMetrics) fetchMetrics(); }, [fetchMetrics, initialMetrics]);

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

      <QuickStatsBar
        realHourly={metrics.realHourly}
        progressPercent={metrics.progressPercent}
        totalHours={metrics.totalHours}
        budgetLeft={project.expectedFee ? project.expectedFee - (metrics.gross - metrics.net) : null}
        currency={currency}
      />

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="size-4" />
            <span className="hidden sm:inline">{tDetail("tabOverview")}</span>
          </TabsTrigger>
          <TabsTrigger value="time" className="flex items-center gap-2">
            <Clock className="size-4" />
            <span className="hidden sm:inline">{tDetail("tabTime")}</span>
          </TabsTrigger>
          <TabsTrigger value="costs" className="flex items-center gap-2">
            <DollarSign className="size-4" />
            <span className="hidden sm:inline">{tDetail("tabCosts")}</span>
          </TabsTrigger>
          <TabsTrigger value="shares" className="flex items-center gap-2">
            <Share2 className="size-4" />
            <span className="hidden sm:inline">{tDetail("tabShares")}</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="size-4" />
            <span className="hidden sm:inline">{tDetail("tabSettings")}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {project.expectedHours != null && project.expectedHours > 0 && (
            <BudgetProgressBar
              expectedHours={project.expectedHours}
              actualHours={metrics.totalHours}
              progressPercent={metrics.progressPercent}
            />
          )}

          {metrics.agreedRevisionCount != null && metrics.agreedRevisionCount > 0 && (
            <RevisionTracker
              agreedCount={metrics.agreedRevisionCount}
              actualCount={metrics.actualRevisionCount}
            />
          )}

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

          {project.clientId && (
            <ClientAnalysisCard clientId={project.clientId} />
          )}

          {metrics.progressPercent >= 80 && (
            <div className="flex justify-center">
              <ShimmerButton
                onClick={() => { setInvoiceType("invoice"); setShowInvoice(true); }}
              >
                {tDetail("generateInvoice")}
              </ShimmerButton>
            </div>
          )}

          {pendingAlert && (
            <div className="flex justify-center">
              <PulsatingButton onClick={() => setShowAlertModal(true)}>
                {tDetail("reviewAlert")}
              </PulsatingButton>
            </div>
          )}
        </TabsContent>

        <TabsContent value="time" className="space-y-6">
          <TimeEntriesSection projectId={projectId} />
        </TabsContent>

        <TabsContent value="costs" className="space-y-6">
          <CostEntriesSection projectId={projectId} currency={currency} isEditable={isEditable} />
        </TabsContent>

        <TabsContent value="shares" className="space-y-6">
          <ShareManagementSection projectId={projectId} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{tDetail("tabSettings")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => setShowEdit(true)} disabled={!isEditable}>
                  {tDetail.raw("edit") || "Edit Project"}
                </Button>
                <Button variant="outline" onClick={() => setShowComplete(true)} disabled={project.status !== "active"}>
                  Complete
                </Button>
                <Button variant="outline" onClick={() => { setInvoiceType("estimate"); setShowInvoice(true); }}>
                  Generate Estimate
                </Button>
                <Button variant="outline" onClick={() => { setInvoiceType("invoice"); setShowInvoice(true); }}>
                  Generate Invoice
                </Button>
                <Button variant="destructive" onClick={() => setShowDelete(true)}>
                  Delete Project
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <InvoiceDialog open={showInvoice} onOpenChange={setShowInvoice} projectId={projectId} defaultType={invoiceType} />
      <CompleteProjectDialog open={showComplete} onOpenChange={setShowComplete} projectId={projectId} metrics={metrics ? { totalHours: metrics.totalHours, realHourly: metrics.realHourly, net: metrics.net, currency } : null} onCompleted={() => { handleStatusChanged("completed"); setShowComplete(false); }} />
      <EditProjectDialog open={showEdit} onOpenChange={setShowEdit} project={{ id: projectId, name: project.name, clientId: project.clientId, aliases: project.aliases, startDate: project.startDate, expectedFee: project.expectedFee, expectedHours: project.expectedHours, currency: project.currency, platformFeeRate: project.platformFeeRate, taxRate: project.taxRate, agreedRevisionCount: project.agreedRevisionCount }} onUpdated={handleRefresh} />
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

function QuickStatsBar({
  realHourly,
  progressPercent,
  totalHours,
  budgetLeft,
  currency,
}: {
  realHourly: number | null;
  progressPercent: number;
  totalHours: number;
  budgetLeft: number | null;
  currency: string;
}) {
  const tDetail = useTranslations("projectDetail");

  return (
    <div className="sticky top-0 z-10 -mx-4 bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:-mx-6 sm:px-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">{tDetail("quickRealRate")}</span>
          <span className="text-lg font-bold">
            {realHourly !== null ? (
              <>
                {currency === "KRW" ? "₩" : "$"}
                <NumberTicker value={Math.round(realHourly)} />
              </>
            ) : (
              "—"
            )}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">{tDetail("quickProgress")}</span>
          <span className="text-lg font-bold">
            <NumberTicker value={progressPercent} />%
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">{tDetail("quickLogged")}</span>
          <span className="text-lg font-bold">
            <NumberTicker value={totalHours} />h
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">{tDetail("quickBudgetLeft")}</span>
          <span className="text-lg font-bold">
            {budgetLeft !== null ? formatCurrency(budgetLeft, currency) : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}
