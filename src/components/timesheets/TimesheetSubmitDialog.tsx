"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Send, Copy, Check } from "lucide-react";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onClose: () => void;
  timesheetId: string;
  onSubmitted: (reviewToken: string) => void;
};

export function TimesheetSubmitDialog({ open, onClose, timesheetId, onSubmitted }: Props) {
  const t = useTranslations("timesheet");
  const [loading, setLoading] = useState(false);
  const [reviewToken, setReviewToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/timesheets/${timesheetId}/submit`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to submit");
      const { data } = await res.json();
      setReviewToken(data.reviewToken);
      onSubmitted(data.reviewToken);
      toast.success(t("submitted"));
    } catch {
      toast.error("Failed to submit timesheet");
    } finally {
      setLoading(false);
    }
  };

  const reviewUrl = reviewToken
    ? `${window.location.origin}/timesheet-review/${reviewToken}`
    : null;

  const handleCopy = async () => {
    if (!reviewUrl) return;
    await navigator.clipboard.writeText(reviewUrl);
    setCopied(true);
    toast.success(t("linkCopied"));
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("submit")}</DialogTitle>
          <DialogDescription>
            {reviewToken ? t("reviewLink") : t("submitDescription")}
          </DialogDescription>
        </DialogHeader>

        {reviewToken ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 rounded-lg bg-muted p-3">
              <code className="flex-1 truncate text-xs">{reviewUrl}</code>
              <Button size="icon" variant="ghost" onClick={handleCopy}>
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t("submitConfirm")}</p>
        )}

        <DialogFooter>
          {reviewToken ? (
            <Button variant="outline" onClick={onClose}>
              {t("statusSubmitted")}
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <ShimmerButton
                shimmerColor="#4ade80"
                shimmerSize="0.06em"
                background="var(--primary)"
                borderRadius="8px"
                className="h-9 px-4 text-sm font-medium text-primary-foreground"
                onClick={handleSubmit}
                disabled={loading}
              >
                <Send className="mr-2 size-4" />
                {t("submit")}
              </ShimmerButton>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
