"use client";

import { useState } from "react";
import { Copy, Check, Mail, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { copyToClipboard } from "@/lib/utils/clipboard";

interface Message {
  tone: string;
  subject: string;
  body: string;
}

interface Metrics {
  expectedHours: number;
  totalHours: number;
  overHours: number;
  progressPercent: number;
  nominalHourly: number | null;
  realHourly: number | null;
  actualRevisionCount: number;
  currency: string;
}

interface ScopeAlertActionModalProps {
  action: {
    id: string;
    title: string;
    payload: {
      messages: Message[];
      metrics: Metrics;
      triggeredRules: string[];
      clientName: string;
      projectName: string;
    } | null;
  };
  onDismiss: () => void;
  onExecute: () => void;
}

export function ScopeAlertActionModal({
  action,
  onDismiss,
  onExecute,
}: ScopeAlertActionModalProps) {
  const t = useTranslations("messages");
  const [copiedTone, setCopiedTone] = useState<string | null>(null);

  const payload = action.payload;
  if (!payload) return null;

  const { messages, metrics } = payload;

  const handleCopy = async (msg: Message) => {
    const fullText = `${msg.subject}\n\n${msg.body}`;
    const success = await copyToClipboard(fullText);
    if (success) {
      setCopiedTone(msg.tone);
      toast.success(t("copied"));
      setTimeout(() => setCopiedTone(null), 2000);
    }
  };

  const handleEmail = (msg: Message) => {
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(msg.subject)}&body=${encodeURIComponent(msg.body)}`;
    window.open(mailtoUrl, "_self");
    toast.success(t("emailSent"));
    onExecute();
  };

  const fmtNum = (n: number | null) =>
    n != null ? n.toLocaleString(undefined, { maximumFractionDigits: 0 }) : "—";

  return (
    <Dialog open onOpenChange={onDismiss}>
      <DialogContent className="overflow-hidden rounded-[24px] p-0 sm:max-w-[560px]">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 px-8 pb-5 pt-7 dark:from-amber-950/40 dark:to-orange-950/40">
          <div className="pointer-events-none absolute left-1/2 top-[-20px] h-32 w-32 -translate-x-1/2 rounded-full bg-white/40 blur-xl dark:bg-white/5" />
          <DialogHeader className="relative z-10">
            <span className="mb-2 block text-4xl">💰</span>
            <DialogTitle className="text-lg font-bold">
              {payload.projectName}
            </DialogTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {action.title}
            </p>
          </DialogHeader>
        </div>

        <div className="flex flex-col gap-5 overflow-y-auto p-6 md:p-8">
          {/* Metrics grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MetricBox
              label={t("expectedHours")}
              value={`${metrics.expectedHours}h`}
            />
            <MetricBox
              label={t("actualHours")}
              value={`${metrics.totalHours}h`}
              highlight={metrics.overHours > 0}
            />
            <MetricBox
              label={t("revisionCount")}
              value={`${metrics.actualRevisionCount}`}
            />
            <MetricBox
              label={t("progressLabel")}
              value={`${metrics.progressPercent}%`}
            />
          </div>

          {/* Rate comparison */}
          {metrics.nominalHourly != null && metrics.realHourly != null && (
            <div className="flex gap-3">
              <div className="flex-1 rounded-xl bg-muted/50 p-3 text-center">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {t("nominalRate")}
                </p>
                <p className="mt-1 text-lg font-bold">
                  {fmtNum(metrics.nominalHourly)}
                  <span className="ml-0.5 text-xs font-normal text-muted-foreground">
                    {metrics.currency}/h
                  </span>
                </p>
              </div>
              <div className="flex items-center text-muted-foreground">→</div>
              <div className="flex-1 rounded-xl bg-destructive/10 p-3 text-center">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {t("realRate")}
                </p>
                <p className="mt-1 text-lg font-bold text-destructive">
                  {fmtNum(metrics.realHourly)}
                  <span className="ml-0.5 text-xs font-normal text-muted-foreground">
                    {metrics.currency}/h
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* 3-tone tabs */}
          <Tabs defaultValue="polite" className="w-full">
            <TabsList className="grid w-full grid-cols-3 rounded-full bg-muted p-1">
              <TabsTrigger
                value="polite"
                className="rounded-full text-xs font-medium"
              >
                🕊️ {t("polite")}
              </TabsTrigger>
              <TabsTrigger
                value="neutral"
                className="rounded-full text-xs font-medium"
              >
                ⚖️ {t("neutral")}
              </TabsTrigger>
              <TabsTrigger
                value="firm"
                className="rounded-full text-xs font-medium"
              >
                💪 {t("firm")}
              </TabsTrigger>
            </TabsList>

            {messages.map((msg) => (
              <TabsContent key={msg.tone} value={msg.tone}>
                <div className="space-y-3">
                  <div className="rounded-xl bg-muted p-3">
                    <p className="text-sm font-medium">{msg.subject}</p>
                  </div>
                  <div className="max-h-[240px] overflow-y-auto rounded-xl border-l-4 border-l-primary bg-muted/40 p-4">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {msg.body}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 rounded-xl"
                      onClick={() => handleCopy(msg)}
                    >
                      {copiedTone === msg.tone ? (
                        <>
                          <Check className="mr-1.5 size-4" /> {t("copied")}
                        </>
                      ) : (
                        <>
                          <Copy className="mr-1.5 size-4" /> {t("copy")}
                        </>
                      )}
                    </Button>
                    <Button
                      className="flex-1 rounded-xl bg-primary font-semibold shadow-lg shadow-primary/20 transition-all hover:bg-[#6CA395] active:scale-[0.98]"
                      onClick={() => handleEmail(msg)}
                    >
                      <Mail className="mr-1.5 size-4" /> {t("sendEmail")}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {/* Dismiss button */}
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="text-muted-foreground"
            >
              <X className="mr-1 size-3.5" />
              {t("close")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MetricBox({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl bg-muted/50 p-3 text-center">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={`mt-1 text-base font-bold ${highlight ? "text-destructive" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}
