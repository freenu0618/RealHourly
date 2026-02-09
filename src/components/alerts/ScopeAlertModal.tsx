"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { copyToClipboard } from "@/lib/utils/clipboard";

interface ScopeAlertModalProps {
  projectId: string;
  alert: {
    id: string;
    alertType: string;
    metadata: Record<string, unknown>;
  };
  projectName: string;
  onDismiss: () => void;
}

interface GeneratedMessage {
  id: string;
  tone: "polite" | "neutral" | "firm";
  subject: string;
  body: string;
}

type Phase = "alert" | "loading" | "messages";

export function ScopeAlertModal({
  projectId,
  alert,
  projectName,
  onDismiss,
}: ScopeAlertModalProps) {
  const tAlerts = useTranslations("alerts");
  const tMessages = useTranslations("messages");
  const [phase, setPhase] = useState<Phase>("alert");
  const [messages, setMessages] = useState<GeneratedMessage[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getRuleExplanation = (): string => {
    const { alertType, metadata } = alert;
    const ruleKey = alertType.replace("scope_", "");
    const ruleData = (metadata[ruleKey] ?? metadata) as Record<string, unknown>;

    if (alertType === "scope_rule1") {
      const timeRatio = ((ruleData.timeRatio as number) ?? 0) * 100;
      const progressPercent = (ruleData.progressPercent as number) ?? 0;
      return tAlerts("ruleExplanation1", {
        ratio: timeRatio.toFixed(0),
        progress: String(progressPercent),
      });
    }

    if (alertType === "scope_rule2") {
      const revisionRatio = ((ruleData.revisionRatio as number) ?? 0) * 100;
      return tAlerts("ruleExplanation2", { ratio: revisionRatio.toFixed(0) });
    }

    if (alertType === "scope_rule3") {
      const revisionCount = (ruleData.revisionCount as number) ?? 0;
      return tAlerts("ruleExplanation3", { count: String(revisionCount) });
    }

    return tAlerts("ruleDefault");
  };

  const handleGenerateMessages = async () => {
    setPhase("loading");

    try {
      const response = await fetch("/api/messages/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, alertId: alert.id }),
      });

      if (!response.ok) throw new Error("Failed to generate messages");

      const { data } = await response.json();
      setMessages(data.messages ?? []);
      setPhase("messages");
    } catch {
      toast.error(tAlerts("generateError"));
      setPhase("alert");
    }
  };

  const handleCopy = async (message: GeneratedMessage) => {
    const fullText = `${message.subject}\n\n${message.body}`;
    const success = await copyToClipboard(fullText);

    if (success) {
      setCopiedId(message.id);
      toast.success(tMessages("copied"));

      fetch(`/api/messages/${message.id}/copied`, { method: "POST" }).catch(
        () => {}
      );

      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleDismiss = async () => {
    try {
      await fetch(`/api/alerts/${alert.id}/dismiss`, { method: "POST" });
    } catch {
      // dismiss is best-effort
    } finally {
      onDismiss();
    }
  };

  return (
    <Dialog open={true} onOpenChange={handleDismiss}>
      <DialogContent className="overflow-hidden rounded-[24px] p-0 sm:max-w-[520px]">
        {/* Warm pastel header */}
        <div className="relative overflow-hidden bg-[#FFF0E0] px-8 pb-6 pt-8 text-center dark:bg-[#4A3B2A]">
          <div className="pointer-events-none absolute left-1/2 top-[-20px] h-32 w-32 -translate-x-1/2 rounded-full bg-white/40 blur-xl dark:bg-white/5" />
          <span className="relative z-10 mb-3 block text-6xl drop-shadow-sm">{"\uD83D\uDCA1"}</span>
          <DialogHeader className="relative z-10">
            <DialogTitle className="text-xl font-bold text-[#3E342B] dark:text-[#EAE0D5]">
              {tAlerts("scopeCreepDetected")}
            </DialogTitle>
            <p className="mt-1 text-sm font-medium text-[#8C7A6B] dark:text-[#B0A395]">
              {projectName}
            </p>
          </DialogHeader>
        </div>

        <div className="flex flex-col gap-6 overflow-y-auto p-6 md:p-8">
          {phase === "alert" && (
            <>
              {/* Data card */}
              <div className="rounded-2xl border bg-muted/40 p-5">
                <p className="text-base leading-relaxed">{getRuleExplanation()}</p>
              </div>
              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={handleDismiss}
                  className="rounded-xl"
                >
                  {tAlerts("dismiss")}
                </Button>
                <Button
                  onClick={handleGenerateMessages}
                  className="rounded-xl bg-primary font-semibold shadow-lg shadow-primary/20 transition-all hover:bg-[#6CA395] active:scale-[0.98]"
                >
                  {tAlerts("generateMessage")} {"\u2709\uFE0F"}
                </Button>
              </DialogFooter>
            </>
          )}

          {phase === "loading" && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {phase === "messages" && (
            <>
              <Tabs defaultValue="polite" className="w-full">
                <TabsList className="grid w-full grid-cols-3 rounded-full bg-muted p-1">
                  <TabsTrigger value="polite" className="rounded-full text-xs font-medium">
                    {"\uD83D\uDD4A\uFE0F"} {tMessages("polite")}
                  </TabsTrigger>
                  <TabsTrigger value="neutral" className="rounded-full text-xs font-medium">
                    {"\u2696\uFE0F"} {tMessages("neutral")}
                  </TabsTrigger>
                  <TabsTrigger value="firm" className="rounded-full text-xs font-medium">
                    {"\uD83D\uDCAA"} {tMessages("firm")}
                  </TabsTrigger>
                </TabsList>

                {messages.map((message) => (
                  <TabsContent key={message.id} value={message.tone}>
                    <div className="space-y-4">
                      <div className="rounded-xl bg-muted p-3">
                        <p className="font-medium">{message.subject}</p>
                      </div>
                      <div className="group relative max-h-[300px] overflow-y-auto rounded-xl border-l-4 border-l-primary bg-muted/40 p-4">
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">
                          {message.body}
                        </p>
                        <div className="absolute bottom-3 right-3 opacity-0 transition-opacity group-hover:opacity-100">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopy(message)}
                            className="rounded-lg border bg-card text-xs shadow-sm"
                          >
                            {copiedId === message.id ? (
                              <><Check className="mr-1 h-3 w-3" /> {tMessages("copied")}</>
                            ) : (
                              <><Copy className="mr-1 h-3 w-3" /> {tMessages("copy")}</>
                            )}
                          </Button>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleCopy(message)}
                        className="w-full rounded-xl bg-primary font-semibold shadow-lg shadow-primary/20 transition-all hover:bg-[#6CA395] active:scale-[0.98]"
                      >
                        {copiedId === message.id ? (
                          <><Check className="mr-2 h-4 w-4" /> {tMessages("copied")}</>
                        ) : (
                          <><Copy className="mr-2 h-4 w-4" /> {tMessages("copy")}</>
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={handleDismiss}
                  className="rounded-xl"
                >
                  {tAlerts("dismiss")}
                </Button>
              </DialogFooter>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
