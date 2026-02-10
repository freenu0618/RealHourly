"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

/**
 * ProgressUpdateModal
 *
 * @description Modal for updating project progress after saving time entries
 * @example
 * <ProgressUpdateModal
 *   open={true}
 *   onOpenChange={setOpen}
 *   projectId="123"
 *   projectName="Website Redesign"
 *   currentProgress={45}
 *   onUpdated={() => refetch()}
 * />
 */
interface ProgressUpdateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
  currentProgress: number;
  onUpdated: () => void;
}

export function ProgressUpdateModal({
  open,
  onOpenChange,
  projectId,
  projectName,
  currentProgress,
  onUpdated,
}: ProgressUpdateModalProps) {
  const t = useTranslations("projects");
  const [progress, setProgress] = useState(currentProgress);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ progressPercent: progress }),
      });

      if (!response.ok) {
        throw new Error("Failed to update progress");
      }

      toast.success(t("progressUpdated", { percent: String(progress) }));
      onUpdated();
      onOpenChange(false);
    } catch (error) {
      toast.error(t("updateFailed"));
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSkip = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("progressAfterSave")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{projectName}</p>
            <p className="text-sm">
              {t("currentProgress")}: {currentProgress}%
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t("newProgress")}</span>
              <span className="text-lg font-bold">{progress}%</span>
            </div>
            <Slider
              value={[progress]}
              onValueChange={(values) => setProgress(values[0])}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
          </div>
        </div>
        <DialogFooter className="flex gap-2">
          <Button variant="ghost" onClick={handleSkip} disabled={isUpdating}>
            {t("skipProgress")}
          </Button>
          <Button onClick={handleUpdate} disabled={isUpdating}>
            {isUpdating ? t("updating") : t("update")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
