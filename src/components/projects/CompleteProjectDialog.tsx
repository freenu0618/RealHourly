"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatCurrency } from "@/lib/money/currency";

/**
 * CompleteProjectDialog
 *
 * @description 프로젝트 완료 확인 다이얼로그
 * 총 작업 시간, 실제 시급, 순수익 요약 표시 후 완료 처리
 *
 * @example
 * <CompleteProjectDialog
 *   open={showDialog}
 *   onOpenChange={setShowDialog}
 *   projectId="uuid"
 *   metrics={{ totalHours: 120, realHourly: 45000, net: 5400000, currency: "KRW" }}
 *   onCompleted={() => router.refresh()}
 * />
 */

interface CompleteProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  metrics: {
    totalHours: number;
    realHourly: number | null;
    net: number;
    currency: string;
  } | null;
  onCompleted: () => void;
}

export function CompleteProjectDialog({
  open,
  onOpenChange,
  projectId,
  metrics,
  onCompleted,
}: CompleteProjectDialogProps) {
  const t = useTranslations("projects");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to complete project");
      }

      toast.success(t("completeSuccess"));
      onOpenChange(false);
      onCompleted();
    } catch (error) {
      toast.error(t("completeError"));
      console.error("Complete project error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-[20px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl flex items-center gap-2">
            🎉 {t("completeProject")}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4 pt-4">
            {metrics && (
              <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">
                    {t("totalHoursLogged")}
                  </span>
                  <span className="text-lg font-bold">
                    {metrics.totalHours.toFixed(1)}h
                  </span>
                </div>

                {metrics.realHourly !== null && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">
                      {t("realHourlyRate")}
                    </span>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(metrics.realHourly, metrics.currency)}/h
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2 border-t border-border">
                  <span className="text-sm font-medium text-muted-foreground">
                    {t("totalRevenue")}
                  </span>
                  <span className="text-xl font-bold text-primary">
                    {formatCurrency(metrics.net, metrics.currency)}
                  </span>
                </div>
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              {t("completeConfirmMessage")}
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting} className="rounded-xl">
            {t("completeCancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleComplete}
            disabled={isSubmitting}
            className="rounded-xl bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? t("completing") : t("completeConfirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
