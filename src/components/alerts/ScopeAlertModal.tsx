"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, Loader2, Copy, Check } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
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
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            {tAlerts("scopeCreepDetected")}
          </DialogTitle>
        </DialogHeader>

        {phase === "alert" && (
          <>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{alert.alertType}</Badge>
                <span className="text-sm text-muted-foreground">
                  {projectName}
                </span>
              </div>
              <p className="text-base">{getRuleExplanation()}</p>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={handleDismiss}>
                {tAlerts("dismiss")}
              </Button>
              <Button onClick={handleGenerateMessages}>
                {tAlerts("generateMessage")}
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
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="polite">
                  {tMessages("polite")}
                </TabsTrigger>
                <TabsTrigger value="neutral">
                  {tMessages("neutral")}
                </TabsTrigger>
                <TabsTrigger value="firm">
                  {tMessages("firm")}
                </TabsTrigger>
              </TabsList>

              {messages.map((message) => (
                <TabsContent key={message.id} value={message.tone}>
                  <div className="space-y-4">
                    <div className="rounded-md bg-muted p-3">
                      <p className="font-medium">{message.subject}</p>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto rounded-md border p-4">
                      <p className="whitespace-pre-wrap text-sm">
                        {message.body}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => handleCopy(message)}
                      className="w-full"
                    >
                      {copiedId === message.id ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          {tMessages("copied")}
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          {tMessages("copy")}
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
            <DialogFooter>
              <Button variant="outline" onClick={handleDismiss}>
                {tAlerts("dismiss")}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
