"use client";

import { Check, X, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "@/lib/date";

const TYPE_ICONS: Record<string, string> = {
  briefing: "📋",
  scope_alert: "⚠️",
  billing_suggestion: "💰",
  profitability_warning: "📉",
  followup_reminder: "🔔",
  weekly_report: "📊",
};

type AiAction = {
  id: string;
  type: string;
  status: string;
  title: string;
  message: string | null;
  createdAt: string | null;
};

export function NotificationItem({
  action,
  acting,
  onApprove,
  onDismiss,
}: {
  action: AiAction;
  acting: boolean;
  onApprove: () => void;
  onDismiss: () => void;
}) {
  const t = useTranslations("aiActions");
  const icon = TYPE_ICONS[action.type] ?? "🤖";
  const typeLabel = t(`types.${action.type}` as Parameters<typeof t>[0]);

  return (
    <div className="flex gap-3 border-b px-4 py-3 last:border-b-0">
      <span className="mt-0.5 text-lg leading-none">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {typeLabel}
            </span>
            <p className="text-sm font-medium leading-snug">{action.title}</p>
            {action.message && (
              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                {action.message}
              </p>
            )}
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between">
          {action.createdAt && (
            <span className="text-[10px] text-muted-foreground">
              {formatDistanceToNow(new Date(action.createdAt))}
            </span>
          )}
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={onApprove}
              disabled={acting}
              title={t("approve")}
            >
              {acting ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Check className="text-emerald-500" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={onDismiss}
              disabled={acting}
              title={t("dismiss")}
            >
              <X className="text-muted-foreground" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
