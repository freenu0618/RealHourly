"use client";

import { useState, useEffect, useCallback } from "react";
import { X, RefreshCw, Loader2, Bot } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/date";

interface Briefing {
  id: string;
  status: string;
  title: string;
  message: string | null;
  createdAt: string | null;
}

export function BriefingCard() {
  const t = useTranslations("dashboard");
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [error, setError] = useState(false);

  const fetchBriefing = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/ai/daily-briefing");
      if (!res.ok) throw new Error();
      const json = await res.json();
      setBriefing(json.data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBriefing();
  }, [fetchBriefing]);

  const handleDismiss = async () => {
    if (!briefing) return;
    setDismissed(true);
    try {
      await fetch(`/api/ai-actions/${briefing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "dismissed" }),
      });
      toast.success(t("briefingDismissed"));
    } catch {
      // Dismiss optimistically — no need to revert
    }
  };

  if (dismissed) return null;

  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-6 text-white shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <Skeleton className="size-5 rounded bg-white/10" />
          <Skeleton className="h-5 w-32 rounded bg-white/10" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full rounded bg-white/10" />
          <Skeleton className="h-4 w-4/5 rounded bg-white/10" />
          <Skeleton className="h-4 w-3/5 rounded bg-white/10" />
        </div>
        <p className="mt-3 text-xs text-white/40">{t("briefingLoading")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <p className="text-sm text-white/60">{t("briefingError")}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchBriefing}
            className="text-white/60 hover:text-white hover:bg-white/10"
          >
            <RefreshCw className="mr-1 size-3.5" />
            {t("briefingRetry")}
          </Button>
        </div>
      </div>
    );
  }

  if (!briefing?.message) return null;

  // Check if the briefing was already dismissed
  if (briefing.status === "dismissed") return null;

  const today = formatDate(new Date(), "yyyy.MM.dd");

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-6 text-white shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Subtle decorative element */}
      <div className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-white/[0.03]" />

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <Bot className="size-5 text-emerald-400" />
          <h3 className="text-sm font-semibold">{t("briefingTitle")}</h3>
          <span className="text-xs text-white/40">{today}</span>
        </div>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={handleDismiss}
          className="text-white/40 hover:text-white hover:bg-white/10"
        >
          <X />
        </Button>
      </div>

      {/* Body — preserve line breaks */}
      <div className="mt-3 text-sm leading-relaxed text-white/80 whitespace-pre-line">
        {briefing.message}
      </div>
    </div>
  );
}
