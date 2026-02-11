"use client";

import { useState, useCallback, useEffect } from "react";
import { Bell, Check, X, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { NotificationItem } from "./NotificationItem";

type AiAction = {
  id: string;
  type: string;
  status: string;
  title: string;
  message: string | null;
  createdAt: string | null;
};

export function NotificationBell() {
  const t = useTranslations("aiActions");
  const [open, setOpen] = useState(false);
  const [actions, setActions] = useState<AiAction[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [acting, setActing] = useState<string | null>(null);

  const fetchActions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai-actions?status=pending");
      if (!res.ok) return;
      const json = await res.json();
      setActions(json.data ?? []);
      setPendingCount(json.pendingCount ?? 0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActions();
    const interval = setInterval(fetchActions, 60_000);
    return () => clearInterval(interval);
  }, [fetchActions]);

  const handleAction = async (actionId: string, status: "approved" | "dismissed") => {
    setActing(actionId);
    try {
      const res = await fetch(`/api/ai-actions/${actionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      toast.success(status === "approved" ? t("actionApproved") : t("actionDismissed"));
      setActions((prev) => prev.filter((a) => a.id !== actionId));
      setPendingCount((prev) => Math.max(0, prev - 1));
    } catch {
      toast.error(t("actionFailed"));
    } finally {
      setActing(null);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-4" />
          {pendingCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
              {pendingCount > 9 ? "9+" : pendingCount}
            </span>
          )}
          <span className="sr-only">{t("notifications")}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b px-4 py-3">
          <h3 className="text-sm font-semibold">{t("notifications")}</h3>
          {pendingCount > 0 && (
            <p className="text-xs text-muted-foreground">
              {t("pendingCount", { count: pendingCount })}
            </p>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {loading && actions.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : actions.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {t("noNotifications")}
            </p>
          ) : (
            actions.map((action) => (
              <NotificationItem
                key={action.id}
                action={action}
                acting={acting === action.id}
                onApprove={() => handleAction(action.id, "approved")}
                onDismiss={() => handleAction(action.id, "dismissed")}
              />
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
