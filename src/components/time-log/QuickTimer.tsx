"use client";

import { useEffect, useState } from "react";
import { Timer, Square } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTimerStore, type TimerResult } from "@/store/use-timer-store";
import { CATEGORIES } from "@/types/time-log";
import { getCategoryEmoji } from "@/lib/utils/category-emoji";

interface QuickTimerProps {
  projects: { id: string; name: string }[];
  onTimerStopped: (result: TimerResult) => void;
}

export function QuickTimer({ projects, onTimerStopped }: QuickTimerProps) {
  const t = useTranslations("timer");
  const {
    isRunning,
    elapsedSeconds,
    projectName,
    start,
    stop,
    tick,
  } = useTimerStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [taskDesc, setTaskDesc] = useState("");

  // Tick interval
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => tick(), 1000);
    return () => clearInterval(interval);
  }, [isRunning, tick]);

  // beforeunload warning
  useEffect(() => {
    if (!isRunning) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isRunning]);

  const handleStart = () => {
    if (!selectedProjectId || !selectedCategory) return;
    const proj = projects.find((p) => p.id === selectedProjectId);
    start(selectedProjectId, proj?.name ?? "", selectedCategory, taskDesc);
    setDialogOpen(false);
    setTaskDesc("");
  };

  const handleStop = () => {
    const result = stop();
    if (result) onTimerStopped(result);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  if (isRunning) {
    return (
      <div className="flex shrink-0 items-center gap-1.5 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-1.5">
        <span className="size-2 animate-pulse rounded-full bg-destructive" />
        <span className="font-mono text-sm font-medium tabular-nums">
          {formatTime(elapsedSeconds)}
        </span>
        {projectName && (
          <span className="hidden text-xs text-muted-foreground sm:inline">
            {projectName}
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-destructive hover:bg-destructive/10"
          onClick={handleStop}
          aria-label={t("stop")}
        >
          <Square className="size-3.5 fill-current" />
        </Button>
      </div>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="shrink-0 gap-1.5 rounded-xl text-xs"
        onClick={() => setDialogOpen(true)}
      >
        <Timer className="size-3.5" />
        {t("button")}
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-[20px] sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              {t("dialogTitle")}
            </DialogTitle>
            <DialogDescription className="sr-only">{t("dialogTitle")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm">{t("selectProject")}</Label>
              <Select
                value={selectedProjectId}
                onValueChange={setSelectedProjectId}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder={t("selectProject")} />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">{t("selectCategory")}</Label>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder={t("selectCategory")} />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {getCategoryEmoji(cat)} {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">{t("taskDescription")}</Label>
              <Input
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
                placeholder={t("taskDescription")}
                className="rounded-xl"
              />
            </div>

            <Button
              onClick={handleStart}
              disabled={!selectedProjectId || !selectedCategory}
              className="w-full gap-2 rounded-xl bg-primary font-semibold"
            >
              <Timer className="size-4" />
              {t("start")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
