"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FadeIn } from "@/components/ui/fade-in";
import { TimesheetStatusBadge } from "./TimesheetStatusBadge";
import { TimesheetSubmitDialog } from "./TimesheetSubmitDialog";
import { Plus, Clock, FileText, Send } from "lucide-react";
import { toast } from "sonner";

type Timesheet = {
  id: string;
  projectId: string;
  projectName: string;
  weekStart: string;
  weekEnd: string;
  status: string;
  totalMinutes: number;
  submittedAt: string | null;
  approvedAt: string | null;
};

type Project = {
  id: string;
  name: string;
};

export function TimesheetListClient() {
  const t = useTranslations("timesheet");
  const router = useRouter();
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [submitDialogId, setSubmitDialogId] = useState<string | null>(null);

  const fetchTimesheets = useCallback(async () => {
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    const res = await fetch(`/api/timesheets?${params}`);
    if (res.ok) {
      const { data } = await res.json();
      setTimesheets(data);
    }
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    fetchTimesheets();
  }, [fetchTimesheets]);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then(({ data }) => setProjects(data ?? []))
      .catch(() => {});
  }, []);

  const handleCreate = async () => {
    if (!selectedProject) return;
    setCreating(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const res = await fetch("/api/timesheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: selectedProject, weekStart: today }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error?.message ?? "Failed to create");
        return;
      }
      await fetchTimesheets();
      setSelectedProject("");
      toast.success(t("createNew"));
    } catch {
      toast.error("Failed to create timesheet");
    } finally {
      setCreating(false);
    }
  };

  const formatHours = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      {/* Create + Filter bar */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[200px]">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger>
              <SelectValue placeholder={t("selectProject")} />
            </SelectTrigger>
            <SelectContent>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={handleCreate}
          disabled={!selectedProject || creating}
          size="sm"
        >
          <Plus className="mr-1 size-4" />
          {t("createNew")}
        </Button>
        <div className="ml-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="draft">{t("statusDraft")}</SelectItem>
              <SelectItem value="submitted">{t("statusSubmitted")}</SelectItem>
              <SelectItem value="approved">{t("statusApproved")}</SelectItem>
              <SelectItem value="rejected">{t("statusRejected")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Timesheet list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : timesheets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto mb-3 size-10 text-muted-foreground/50" />
            <p className="text-muted-foreground">{t("noTimesheets")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {timesheets.map((ts, i) => (
            <FadeIn key={ts.id} delay={i * 0.05}>
              <Card
                className="cursor-pointer transition-colors hover:bg-muted/50"
                onClick={() => router.push(`/timesheets?detail=${ts.id}`)}
              >
                <CardContent className="flex items-center gap-4 py-4">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                    <Clock className="size-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{ts.projectName}</span>
                      <TimesheetStatusBadge status={ts.status} />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {ts.weekStart} ~ {ts.weekEnd}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatHours(ts.totalMinutes)}</div>
                  </div>
                  {ts.status === "draft" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSubmitDialogId(ts.id);
                      }}
                    >
                      <Send className="mr-1 size-3" />
                      {t("submit")}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      )}

      {submitDialogId && (
        <TimesheetSubmitDialog
          open={!!submitDialogId}
          onClose={() => setSubmitDialogId(null)}
          timesheetId={submitDialogId}
          onSubmitted={() => fetchTimesheets()}
        />
      )}
    </div>
  );
}
