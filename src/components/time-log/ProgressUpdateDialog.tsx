"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface ProjectProgress {
  projectId: string;
  projectName: string;
  currentProgress: number;
}

interface ProgressUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: ProjectProgress[];
}

const QUICK_VALUES = [25, 50, 75, 100] as const;

export function ProgressUpdateDialog({
  open,
  onOpenChange,
  projects,
}: ProgressUpdateDialogProps) {
  const t = useTranslations("progress");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);

  const project = projects[currentIndex];

  function handleOpen(isOpen: boolean) {
    if (isOpen && projects.length > 0) {
      setCurrentIndex(0);
      setProgress(projects[0].currentProgress);
    }
    onOpenChange(isOpen);
  }

  function handleQuickSelect(value: number) {
    if (value === 100) {
      setProgress(100);
      setShowCompleteConfirm(true);
    } else {
      setProgress(value);
    }
  }

  function handleSliderChange(values: number[]) {
    const val = values[0];
    setProgress(val);
    if (val === 100) {
      setShowCompleteConfirm(true);
    }
  }

  async function saveProgress(markComplete: boolean) {
    if (!project) return;
    setSaving(true);
    try {
      const body: Record<string, unknown> = { progressPercent: progress };
      if (markComplete) {
        body.status = "completed";
      }
      const res = await fetch(`/api/projects/${project.projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed");

      toast.success(
        t("updated", { project: project.projectName, percent: String(progress) }),
      );

      // Move to next project or close
      if (currentIndex < projects.length - 1) {
        const nextIdx = currentIndex + 1;
        setCurrentIndex(nextIdx);
        setProgress(projects[nextIdx].currentProgress);
      } else {
        onOpenChange(false);
      }
    } catch {
      toast.error(t("updateFailed"));
    } finally {
      setSaving(false);
    }
  }

  function handleSave() {
    if (progress === 100) {
      setShowCompleteConfirm(true);
      return;
    }
    saveProgress(false);
  }

  function handleCompleteConfirm() {
    setShowCompleteConfirm(false);
    saveProgress(true);
  }

  function handleCompleteCancel() {
    setShowCompleteConfirm(false);
    // Keep at 100%, user can adjust
  }

  if (!project) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("title")}</DialogTitle>
            <DialogDescription>
              {t("description", { project: project.projectName })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Quick select buttons */}
            <div className="flex gap-2">
              {QUICK_VALUES.map((val) => (
                <Button
                  key={val}
                  variant={progress === val ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => handleQuickSelect(val)}
                >
                  {val}%
                </Button>
              ))}
            </div>

            {/* Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {t("current")}: {project.currentProgress}%
                </span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Slider
                value={[progress]}
                onValueChange={handleSliderChange}
                min={0}
                max={100}
                step={5}
              />
            </div>

            {/* Multi-project indicator */}
            {projects.length > 1 && (
              <p className="text-xs text-muted-foreground text-center">
                {t("projectCount", {
                  current: String(currentIndex + 1),
                  total: String(projects.length),
                })}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              {t("skip")}
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? t("saving") : t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 100% Completion Confirmation */}
      <AlertDialog open={showCompleteConfirm} onOpenChange={setShowCompleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("completeTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("completeDescription", { project: project.projectName })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCompleteCancel}>
              {t("completeCancel")}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleCompleteConfirm}>
              {t("completeConfirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
