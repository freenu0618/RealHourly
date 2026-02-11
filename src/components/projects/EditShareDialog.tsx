"use client";

import { useState, useEffect } from "react";
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

interface ShareData {
  id: string;
  label: string | null;
  expiresAt: string | null;
  showTimeDetails: boolean;
  showCategoryBreakdown: boolean;
  showProgress: boolean;
  showInvoiceDownload: boolean;
}

interface EditShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  share: ShareData | null;
  onUpdated: () => void;
}

export function EditShareDialog({
  open,
  onOpenChange,
  share,
  onUpdated,
}: EditShareDialogProps) {
  const t = useTranslations("clientReport");
  const [label, setLabel] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [showTimeDetails, setShowTimeDetails] = useState(true);
  const [showCategoryBreakdown, setShowCategoryBreakdown] = useState(true);
  const [showProgress, setShowProgress] = useState(true);
  const [showInvoiceDownload, setShowInvoiceDownload] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (share) {
      setLabel(share.label ?? "");
      setExpiresAt(
        share.expiresAt
          ? new Date(share.expiresAt).toISOString().slice(0, 16)
          : "",
      );
      setShowTimeDetails(share.showTimeDetails);
      setShowCategoryBreakdown(share.showCategoryBreakdown);
      setShowProgress(share.showProgress);
      setShowInvoiceDownload(share.showInvoiceDownload);
    }
  }, [share]);

  async function handleSave() {
    if (!share) return;
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        label: label.trim() || null,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        showTimeDetails,
        showCategoryBreakdown,
        showProgress,
        showInvoiceDownload,
      };

      const res = await fetch(`/api/shares/${share.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();

      toast.success(t("linkUpdated"));
      onOpenChange(false);
      onUpdated();
    } catch {
      toast.error(t("createFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[20px] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">
            {t("editSettings")}
          </DialogTitle>
          <DialogDescription className="sr-only">{t("editSettings")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>{t("labelPlaceholder")}</Label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="rounded-xl"
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
            onClick={handleSave}
            disabled={submitting}
            className="w-full rounded-xl font-bold"
          >
            {t("editSettings")}
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
