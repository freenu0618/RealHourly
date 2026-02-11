"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CreateShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onCreated: () => void;
}

export function CreateShareDialog({
  open,
  onOpenChange,
  projectId,
  onCreated,
}: CreateShareDialogProps) {
  const t = useTranslations("clientReport");
  const [label, setLabel] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [showTimeDetails, setShowTimeDetails] = useState(true);
  const [showCategoryBreakdown, setShowCategoryBreakdown] = useState(true);
  const [showProgress, setShowProgress] = useState(true);
  const [showInvoiceDownload, setShowInvoiceDownload] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate() {
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        showTimeDetails,
        showCategoryBreakdown,
        showProgress,
        showInvoiceDownload,
      };
      if (label.trim()) body.label = label.trim();
      if (expiresAt) body.expiresAt = new Date(expiresAt).toISOString();

      const res = await fetch(`/api/projects/${projectId}/shares`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();

      toast.success(t("linkCreated"));
      onOpenChange(false);
      resetForm();
      onCreated();
    } catch {
      toast.error(t("createFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setLabel("");
    setExpiresAt("");
    setShowTimeDetails(true);
    setShowCategoryBreakdown(true);
    setShowProgress(true);
    setShowInvoiceDownload(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[20px] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">
            {t("createLink")}
          </DialogTitle>
          <DialogDescription className="sr-only">{t("createLink")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>{t("labelPlaceholder")}</Label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="rounded-xl"
              placeholder={t("labelPlaceholder")}
              maxLength={100}
            />
          </div>

          <div className="space-y-1.5">
            <Label>{t("expiresAt")}</Label>
            <Input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="rounded-xl"
            />
            <p className="text-xs text-muted-foreground">{t("noExpiry")}</p>
          </div>

          <div className="space-y-3">
            <ToggleRow
              label={t("showTimeDetails")}
              checked={showTimeDetails}
              onChange={setShowTimeDetails}
            />
            <ToggleRow
              label={t("showCategoryBreakdown")}
              checked={showCategoryBreakdown}
              onChange={setShowCategoryBreakdown}
            />
            <ToggleRow
              label={t("showProgress")}
              checked={showProgress}
              onChange={setShowProgress}
            />
            <ToggleRow
              label={t("showInvoiceDownload")}
              checked={showInvoiceDownload}
              onChange={setShowInvoiceDownload}
            />
          </div>

          <Button
            onClick={handleCreate}
            disabled={submitting}
            className="w-full rounded-xl font-bold"
          >
            {t("generateLink")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
