"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";

interface RevisionTrackerProps {
  agreedCount: number;
  actualCount: number;
}

export function RevisionTracker({
  agreedCount,
  actualCount,
}: RevisionTrackerProps) {
  const t = useTranslations("revision");
  const exceeded = actualCount > agreedCount;
  const ratio = agreedCount > 0 ? Math.min(actualCount / agreedCount, 1) : 0;
  const overflowRatio =
    agreedCount > 0 && actualCount > agreedCount
      ? Math.min((actualCount - agreedCount) / agreedCount, 1)
      : 0;

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{t("title")}</p>
        <span
          className={`text-sm font-bold ${exceeded ? "text-destructive" : "text-foreground"}`}
        >
          {actualCount} / {agreedCount}
        </span>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${exceeded ? "bg-destructive" : "bg-primary"}`}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
      {exceeded && (
        <>
          <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-destructive/50 transition-all"
              style={{ width: `${overflowRatio * 100}%` }}
            />
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-destructive">
            <AlertTriangle className="size-3.5" />
            {t("exceeded", { excess: String(actualCount - agreedCount) })}
          </div>
        </>
      )}
    </div>
  );
}
