"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FolderPlus,
  Clock,
  DollarSign,
  TrendingUp,
  FileText,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  PartyPopper,
  ArrowRight,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { OnboardingProgress } from "@/app/api/onboarding/progress/route";

interface StepConfig {
  key: keyof Omit<OnboardingProgress, "completedCount" | "totalCount">;
  icon: React.ElementType;
  href: string;
  color: string;
  bgColor: string;
}

const STORAGE_KEY = "onboarding-checklist-dismissed";

export function OnboardingChecklist() {
  const t = useTranslations("onboardingChecklist");
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const fetchProgress = useCallback(async () => {
    try {
      const res = await fetch("/api/onboarding/progress");
      if (!res.ok) return;
      const json = await res.json();
      setProgress(json.data);
    } catch {
      // Silently fail — checklist is non-critical
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setIsClient(true);
    const wasDismissed = localStorage.getItem(STORAGE_KEY);
    if (wasDismissed) {
      setDismissed(true);
      setLoading(false);
      return;
    }
    fetchProgress();
  }, [fetchProgress]);

  if (!isClient || loading || dismissed) return null;
  if (!progress) return null;
  if (progress.completedCount === progress.totalCount) {
    return <CompletionCard onDismiss={() => {
      localStorage.setItem(STORAGE_KEY, "true");
      setDismissed(true);
    }} />;
  }

  const steps: StepConfig[] = [
    { key: "hasProject", icon: FolderPlus, href: "/projects", color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-100 dark:bg-blue-900/30" },
    { key: "hasTimeEntry", icon: Clock, href: "/time-log", color: "text-orange-600 dark:text-orange-400", bgColor: "bg-orange-100 dark:bg-orange-900/30" },
    { key: "hasCostOrFee", icon: DollarSign, href: "/projects", color: "text-emerald-600 dark:text-emerald-400", bgColor: "bg-emerald-100 dark:bg-emerald-900/30" },
    { key: "hasEnoughEntries", icon: TrendingUp, href: "/time-log", color: "text-purple-600 dark:text-purple-400", bgColor: "bg-purple-100 dark:bg-purple-900/30" },
    { key: "hasWeeklyReport", icon: FileText, href: "/reports", color: "text-cyan-600 dark:text-cyan-400", bgColor: "bg-cyan-100 dark:bg-cyan-900/30" },
    { key: "hasUsedAiChat", icon: Sparkles, href: "/chat", color: "text-pink-600 dark:text-pink-400", bgColor: "bg-pink-100 dark:bg-pink-900/30" },
  ];

  const pct = Math.round((progress.completedCount / progress.totalCount) * 100);

  return (
    <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-card to-card/80 p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
            <Sparkles className="size-4.5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">{t("title")}</h3>
            <p className="text-xs text-muted-foreground">
              {t("progress", { completed: progress.completedCount, total: progress.totalCount })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
          </button>
          <button
            onClick={() => {
              localStorage.setItem(STORAGE_KEY, "true");
              setDismissed(true);
            }}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Dismiss"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-[#E8882D] transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Steps */}
      {!collapsed && (
        <div className="mt-4 space-y-2">
          {steps.map((step, idx) => {
            const done = progress[step.key];
            const Icon = step.icon;
            return (
              <Link
                key={step.key}
                href={done ? "#" : step.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors",
                  done
                    ? "cursor-default opacity-60"
                    : "hover:bg-muted/50",
                )}
                onClick={done ? (e: React.MouseEvent) => e.preventDefault() : undefined}
              >
                <div className={cn("flex size-7 shrink-0 items-center justify-center rounded-lg", done ? "bg-green-100 dark:bg-green-900/30" : step.bgColor)}>
                  {done ? (
                    <Check className="size-3.5 text-green-600 dark:text-green-400" />
                  ) : (
                    <Icon className={cn("size-3.5", step.color)} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-medium", done && "line-through text-muted-foreground")}>
                    {t(`steps.${idx}.title`)}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {t(`steps.${idx}.description`)}
                  </p>
                </div>
                {!done && <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" />}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CompletionCard({ onDismiss }: { onDismiss: () => void }) {
  const t = useTranslations("onboardingChecklist");
  return (
    <div className="rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-5 shadow-sm dark:border-green-800/40 dark:from-green-950/30 dark:to-emerald-950/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PartyPopper className="size-6 text-green-600 dark:text-green-400" />
          <div>
            <h3 className="text-sm font-semibold text-green-800 dark:text-green-300">{t("complete.title")}</h3>
            <p className="text-xs text-green-600 dark:text-green-400">{t("complete.description")}</p>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="rounded-lg p-1.5 text-green-600 transition-colors hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900/30"
          aria-label="Dismiss"
        >
          <X className="size-4" />
        </button>
      </div>
      <div className="mt-3">
        <Button asChild size="sm" className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600">
          <Link href="/guide">
            {t("complete.cta")} <ArrowRight className="ml-1 size-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
