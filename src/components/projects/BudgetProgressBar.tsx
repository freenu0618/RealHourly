"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";

interface BudgetProgressBarProps {
  expectedHours: number;
  actualHours: number;
  progressPercent: number;
  compact?: boolean;
}

function getBudgetColor(percent: number) {
  if (percent > 100) return { bar: "bg-red-500", text: "text-red-600 dark:text-red-400" };
  if (percent >= 80) return { bar: "bg-orange-500", text: "text-orange-600 dark:text-orange-400" };
  if (percent >= 60) return { bar: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" };
  return { bar: "bg-green-500", text: "text-green-600 dark:text-green-400" };
}

export function BudgetProgressBar({
  expectedHours,
  actualHours,
  progressPercent,
  compact = false,
}: BudgetProgressBarProps) {
  const t = useTranslations("budget");

  if (expectedHours <= 0) return null;

  const budgetUsed = (actualHours / expectedHours) * 100;
  const budgetRounded = Math.round(budgetUsed);
  const color = getBudgetColor(budgetUsed);
  const isWarning = budgetUsed >= 80;

  if (compact) {
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{t("timeBudget")}</span>
          <span className={`font-medium ${color.text}`}>{budgetRounded}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all ${color.bar}`}
            style={{ width: `${Math.min(budgetUsed, 100)}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{t("timeBudget")}</span>
          {isWarning && (
            <AlertTriangle className="size-4 text-orange-500" />
          )}
        </div>
        <span className={`text-sm font-bold ${color.text}`}>
          {budgetRounded}%
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${color.bar}`}
          style={{ width: `${Math.min(budgetUsed, 100)}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {t("used")}: {actualHours}h / {expectedHours}h
        </span>
        <span>
          {t("progress")}: {progressPercent}%
        </span>
      </div>
      {budgetUsed > 100 && (
        <p className="text-xs font-medium text-red-600 dark:text-red-400">
          {t("overBudget", { hours: String(Math.round((actualHours - expectedHours) * 10) / 10) })}
        </p>
      )}
      {isWarning && budgetUsed <= 100 && budgetUsed > progressPercent && (
        <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
          {t("paceWarning")}
        </p>
      )}
    </div>
  );
}
