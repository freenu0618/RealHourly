"use client";

import React, { useState } from "react";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

/**
 * ProjectProgressSection
 *
 * @description Displays and allows editing of project progress percentage
 * @example
 * <ProjectProgressSection
 *   projectId="123"
 *   initialProgress={45}
 *   isEditable={true}
 *   onProgressUpdated={(newProgress) => console.log(newProgress)}
 * />
 */
interface ProjectProgressSectionProps {
  projectId: string;
  initialProgress: number;
  isEditable: boolean;
  onProgressUpdated: (newProgress: number) => void;
}

export function ProjectProgressSection({
  projectId,
  initialProgress,
  isEditable,
  onProgressUpdated,
}: ProjectProgressSectionProps) {
  const t = useTranslations("projects");
  const tMetrics = useTranslations("metrics");

  const [isEditing, setIsEditing] = useState(false);
  const [progress, setProgress] = useState(initialProgress);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
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
      onProgressUpdated(progress);
      setIsEditing(false);
    } catch (error) {
      toast.error(t("updateFailed"));
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setProgress(initialProgress);
    setIsEditing(false);
  };

  const handleSliderChange = (values: number[]) => {
    setProgress(values[0]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
    setProgress(value);
  };

  if (isEditing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">{tMetrics("progress")}</label>
          <Input
            type="number"
            min="0"
            max="100"
            value={progress}
            onChange={handleInputChange}
            className="w-20 rounded-xl"
          />
        </div>
        <Slider
          value={[progress]}
          onValueChange={handleSliderChange}
          min={0}
          max={100}
          step={5}
          className="w-full"
        />
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={handleCancel} disabled={isSaving}>
            {t("cancel")}
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? t("saving") : t("save")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{tMetrics("progress")}</label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{initialProgress}%</span>
          {isEditable && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      <div className="h-2.5 rounded-full bg-muted">
        <div
          className="h-2.5 rounded-full bg-primary transition-all"
          style={{ width: `${initialProgress}%` }}
        />
      </div>
    </div>
  );
}
