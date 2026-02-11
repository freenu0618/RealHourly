"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { X, TrendingDown, AlertTriangle, Clock, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PostLogSuggestion {
  type: string;
  severity: "high" | "info" | "low";
  projectName?: string;
  data: Record<string, unknown>;
}

interface Props {
  suggestions: PostLogSuggestion[];
  onDismiss: () => void;
  onProgressUpdate?: (projectId: string, projectName: string, currentProgress: number) => void;
}

const SEVERITY_STYLES = {
  high: "border-destructive/40 bg-destructive/5",
  info: "border-primary/20 bg-primary/5",
  low: "border-border bg-muted/30",
} as const;

const TYPE_CONFIG: Record<string, { icon: typeof TrendingDown; color: string }> = {
  profitability_warning: { icon: TrendingDown, color: "text-destructive" },
  scope_creep_warning: { icon: AlertTriangle, color: "text-orange-500" },
  daily_summary: { icon: Clock, color: "text-primary" },
  progress_update: { icon: ArrowUpRight, color: "text-emerald-500" },
};

export function PostLogSuggestions({ suggestions, onDismiss, onProgressUpdate }: Props) {
  const t = useTranslations("suggestions");
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());

  const hasHigh = suggestions.some((s) => s.severity === "high");

  const stableDismiss = useCallback(onDismiss, [onDismiss]);

  useEffect(() => {
    if (!hasHigh && suggestions.length > 0) {
      const timer = setTimeout(stableDismiss, 8000);
      return () => clearTimeout(timer);
    }
  }, [hasHigh, suggestions.length, stableDismiss]);

  const visible = suggestions
    .map((s, i) => ({ ...s, idx: i }))
    .filter((s) => !dismissed.has(s.idx))
    .sort((a, b) => {
      const order: Record<string, number> = { high: 0, info: 1, low: 2 };
      return (order[a.severity] ?? 2) - (order[b.severity] ?? 2);
    });

  if (visible.length === 0) return null;

  function dismissOne(idx: number) {
    const next = new Set(dismissed);
    next.add(idx);
    setDismissed(next);
    if (next.size === suggestions.length) onDismiss();
  }

  function getTitle(s: PostLogSuggestion): string {
    switch (s.type) {
      case "profitability_warning":
        return t("profitabilityTitle", { project: s.projectName ?? "" });
      case "scope_creep_warning":
        return t("scopeCreepTitle", { project: s.projectName ?? "" });
      case "daily_summary":
        return t("dailySummaryTitle", { hours: String(s.data.totalHours) });
      case "progress_update":
        return t("progressTitle", { project: s.projectName ?? "" });
      default:
        return "";
    }
  }

  function getDesc(s: PostLogSuggestion): string {
    switch (s.type) {
      case "profitability_warning":
        return t("profitabilityDesc", { ratio: String(s.data.ratio) });
      case "scope_creep_warning":
        return t("scopeCreepDesc", { count: String(s.data.consecutiveRevisions) });
      case "daily_summary":
        return t("dailySummaryDesc");
      case "progress_update":
        return t("progressDesc", { percent: String(s.data.currentProgress) });
      default:
        return "";
    }
  }

  return (
    <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold text-muted-foreground">
          {t("title")}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-xs text-muted-foreground"
          onClick={onDismiss}
        >
          <X className="mr-1 size-3" />
          {t("dismissAll")}
        </Button>
      </div>

      {visible.map((s) => {
        const config = TYPE_CONFIG[s.type] ?? { icon: Clock, color: "text-muted-foreground" };
        const Icon = config.icon;
        return (
          <div
            key={s.idx}
            className={`flex items-start gap-3 rounded-xl border p-3 ${SEVERITY_STYLES[s.severity]}`}
          >
            <Icon className={`mt-0.5 size-4 shrink-0 ${config.color}`} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium leading-snug">{getTitle(s)}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{getDesc(s)}</p>
              {s.type === "progress_update" && onProgressUpdate && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 h-7 rounded-lg text-xs"
                  onClick={() =>
                    onProgressUpdate(
                      s.data.projectId as string,
                      s.projectName ?? "",
                      s.data.currentProgress as number,
                    )
                  }
                >
                  {t("updateProgress")}
                </Button>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-6 shrink-0"
              onClick={() => dismissOne(s.idx)}
            >
              <X className="size-3" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
