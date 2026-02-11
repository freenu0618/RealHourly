"use client";

import { useState } from "react";
import { Check, Loader2, Save } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useDraftStore } from "@/store/use-draft-store";
import { formatCurrency } from "@/lib/money/currency";

interface ProjectFeedback {
  projectName: string;
  realHourly: number | null;
  currency: string;
  budgetUsedPercent: number | null;
}

interface ProjectProgress {
  projectId: string;
  projectName: string;
  currentProgress: number;
}

interface PostLogSuggestion {
  type: string;
  severity: "high" | "info" | "low";
  projectName?: string;
  data: Record<string, unknown>;
}

interface SaveAllButtonProps {
  onSaved: () => void;
  onProgressPrompt?: (projects: ProjectProgress[]) => void;
  onSuggestions?: (suggestions: PostLogSuggestion[]) => void;
}

export function SaveAllButton({ onSaved, onProgressPrompt, onSuggestions }: SaveAllButtonProps) {
  const t = useTranslations("timeLog");
  const tFeedback = useTranslations("profitabilityFeedback");
  const tProgress = useTranslations("progress");
  const { entries, canSaveAll, clearAll } = useDraftStore();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const enabled = canSaveAll() && entries.length > 0 && !saving;

  async function handleSave() {
    setSaving(true);
    try {
      const payload = entries.map((e) => ({
        projectId: e.matchedProjectId!,
        date: e.date,
        minutes: e.durationMinutes!,
        category: e.category,
        intent: e.intent,
        taskDescription: e.taskDescription,
        sourceText: e.projectNameRaw,
        issues: e.issues,
      }));

      const res = await fetch("/api/time/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries: payload }),
      });

      if (!res.ok) throw new Error("Save failed");

      const { data } = await res.json();
      const plannedCount = entries.filter((e) => e.intent === "planned").length;

      toast.success(t("saved", { count: data.inserted }));
      if (plannedCount > 0) {
        toast.info(t("savedPlanned", { count: plannedCount }));
      }

      // Show profitability feedback toast
      if (data.feedback && Array.isArray(data.feedback)) {
        for (const fb of data.feedback as ProjectFeedback[]) {
          if (fb.realHourly !== null) {
            const rateStr = formatCurrency(fb.realHourly, fb.currency);
            toast.info(
              tFeedback("rateFeedback", { project: fb.projectName, rate: rateStr }),
              { duration: 5000 },
            );
          }
        }
      }

      // Post-log suggestions
      const suggestions = data.suggestions as PostLogSuggestion[] | undefined;
      if (suggestions && suggestions.length > 0 && onSuggestions) {
        onSuggestions(suggestions);
      }

      // Show progress update prompt (max 1 toast, 8s duration)
      const progressProjects = data.projectProgress as ProjectProgress[] | undefined;
      if (progressProjects && progressProjects.length > 0 && onProgressPrompt) {
        const names = progressProjects.map((p) => p.projectName).join(", ");
        toast.info(tProgress("promptToast", { projects: names }), {
          duration: 8000,
          action: {
            label: tProgress("updateAction"),
            onClick: () => onProgressPrompt(progressProjects),
          },
        });
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
      clearAll();
      onSaved();
    } catch {
      toast.error(t("parseFailed"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Button
      onClick={handleSave}
      disabled={!enabled}
      size="lg"
      className={`gap-2 transition-colors ${saved ? "bg-green-600 hover:bg-green-600" : ""}`}
      aria-label={t("saveAll")}
    >
      {saved ? (
        <>
          <Check className="size-4" />
          {t("saved", { count: 0 }).replace("0", "✓")}
        </>
      ) : saving ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          {t("saving")}
        </>
      ) : (
        <>
          <Save className="size-4" />
          {entries.length > 0
            ? t("saveCount", { count: entries.length })
            : t("saveAll")}
        </>
      )}
    </Button>
  );
}
