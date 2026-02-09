"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { FileText, Loader2, Download } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface InvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  defaultType?: "estimate" | "invoice";
}

export function InvoiceDialog({
  open,
  onOpenChange,
  projectId,
  defaultType = "estimate",
}: InvoiceDialogProps) {
  const t = useTranslations("invoice");
  const [docType, setDocType] = useState<"estimate" | "invoice">(defaultType);
  const [fromName, setFromName] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [fromAddress, setFromAddress] = useState("");
  const [bankInfo, setBankInfo] = useState("");
  const [issueDate, setIssueDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [generating, setGenerating] = useState(false);

  async function handleGenerate() {
    if (!fromName.trim() || !fromEmail.trim()) return;

    setGenerating(true);
    try {
      const locale =
        document.documentElement.lang === "ko" ? "ko" : "en";

      const res = await fetch(`/api/projects/${projectId}/invoice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: docType,
          from: {
            name: fromName.trim(),
            email: fromEmail.trim(),
            ...(fromAddress.trim() && { address: fromAddress.trim() }),
            ...(bankInfo.trim() && { bankInfo: bankInfo.trim() }),
          },
          issueDate,
          ...(dueDate && { dueDate }),
          ...(notes.trim() && { notes: notes.trim() }),
          locale,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error?.message ?? "Failed");
      }

      // Download the PDF blob
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const disposition = res.headers.get("Content-Disposition");
      const filenameMatch = disposition?.match(/filename="(.+)"/);
      a.download = filenameMatch?.[1] ?? `${docType}-${projectId}.pdf`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(t("success"));
      onOpenChange(false);
    } catch {
      toast.error(t("error"));
    } finally {
      setGenerating(false);
    }
  }

  const canSubmit = fromName.trim() && fromEmail.trim() && issueDate;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-[24px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="size-5" />
            {t("title")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Document type tabs */}
          <Tabs
            value={docType}
            onValueChange={(v) => setDocType(v as "estimate" | "invoice")}
          >
            <TabsList className="w-full">
              <TabsTrigger value="estimate" className="flex-1">
                {t("estimate")}
              </TabsTrigger>
              <TabsTrigger value="invoice" className="flex-1">
                {t("invoice")}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* From fields */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">{t("fromName")}</Label>
              <Input
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
                placeholder="John Doe"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t("fromEmail")}</Label>
              <Input
                type="email"
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
                placeholder="john@example.com"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t("fromAddress")}</Label>
              <Input
                value={fromAddress}
                onChange={(e) => setFromAddress(e.target.value)}
                className="rounded-xl"
              />
            </div>

            {docType === "invoice" && (
              <div className="space-y-1.5">
                <Label className="text-xs">{t("bankInfo")}</Label>
                <Input
                  value={bankInfo}
                  onChange={(e) => setBankInfo(e.target.value)}
                  className="rounded-xl"
                />
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">{t("issueDate")}</Label>
              <Input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="rounded-xl"
              />
            </div>
            {docType === "invoice" && (
              <div className="space-y-1.5">
                <Label className="text-xs">{t("dueDate")}</Label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="rounded-xl"
                />
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs">{t("notes")}</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("notesPlaceholder")}
              className="min-h-[60px] rounded-xl"
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleGenerate}
            disabled={!canSubmit || generating}
            className="w-full gap-2 rounded-xl"
          >
            {generating ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {t("generating")}
              </>
            ) : (
              <>
                <Download className="size-4" />
                {t("downloadPdf")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
