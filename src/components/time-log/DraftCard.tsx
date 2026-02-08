"use client";

import { X, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerField } from "./DatePickerField";
import { useDraftStore } from "@/store/use-draft-store";
import type { ParsedEntry, Category } from "@/types/time-log";
import { CATEGORIES, BLOCKING_ISSUES, WARNING_ISSUES } from "@/types/time-log";
import { cn } from "@/lib/utils";

interface DraftCardProps {
  entry: ParsedEntry;
  projects: { id: string; name: string }[];
}

export function DraftCard({ entry, projects }: DraftCardProps) {
  const t = useTranslations("timeLog");
  const { updateEntry, removeEntry } = useDraftStore();

  const hasBlocking = entry.issues.some((i) =>
    BLOCKING_ISSUES.includes(i),
  );
  const hasWarning = entry.issues.some((i) =>
    WARNING_ISSUES.includes(i),
  );
  const isPlanned = entry.issues.includes("FUTURE_INTENT");

  const borderClass = hasBlocking
    ? "border-red-400 bg-red-50/50 dark:bg-red-950/20"
    : "";

  const categoryLabelMap: Record<Category, string> = {
    planning: t("categoryPlanning"),
    design: t("categoryDesign"),
    development: t("categoryDevelopment"),
    meeting: t("categoryMeeting"),
    revision: t("categoryRevision"),
    admin: t("categoryAdmin"),
    email: t("categoryEmail"),
    research: t("categoryResearch"),
    other: t("categoryOther"),
  };

  return (
    <Card
      className={cn("relative transition-colors", borderClass)}
      role="group"
      aria-label={`${entry.taskDescription} — ${entry.projectNameRaw}`}
      tabIndex={0}
    >
      <CardContent className="space-y-3 pt-4">
        {/* Header: badges + delete */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {hasBlocking && (
              <Badge variant="destructive" className="gap-1 text-xs">
                <AlertCircle className="size-3" />
                {t("selectRequired")}
              </Badge>
            )}
            {entry.issues.includes("DATE_AMBIGUOUS") && (
              <Badge
                variant="outline"
                className="border-yellow-400 bg-yellow-50 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400"
              >
                {t("dateEstimated")}
              </Badge>
            )}
            {entry.issues.includes("DURATION_AMBIGUOUS") && (
              <Badge
                variant="outline"
                className="border-yellow-400 bg-yellow-50 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400"
              >
                {t("durationEstimated")}
              </Badge>
            )}
            {entry.issues.includes("CATEGORY_AMBIGUOUS") && (
              <Badge
                variant="outline"
                className="border-yellow-400 bg-yellow-50 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400"
              >
                {t("categoryEstimated")}
              </Badge>
            )}
            {isPlanned && (
              <Badge
                variant="outline"
                className="border-purple-400 bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400"
              >
                {t("futurePlanned")}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 shrink-0"
            onClick={() => removeEntry(entry.id)}
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Clarification question */}
        {entry.clarificationQuestion && (
          <p className="text-sm font-medium text-red-600 dark:text-red-400">
            {entry.clarificationQuestion}
          </p>
        )}

        {/* Raw project name */}
        <p className="text-sm text-muted-foreground">
          &quot;{entry.projectNameRaw}&quot;
        </p>

        {/* Editable fields grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {/* Project select */}
          <div className="col-span-2 space-y-1 sm:col-span-1">
            <Label className="text-xs">{t("project")}</Label>
            <Select
              value={entry.matchedProjectId ?? ""}
              onValueChange={(val) =>
                updateEntry(entry.id, {
                  matchedProjectId: val || null,
                  matchSource: val ? "name" : "none",
                })
              }
            >
              <SelectTrigger
                className={cn(
                  "h-9",
                  !entry.matchedProjectId && hasBlocking && "border-red-400",
                )}
              >
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

          {/* Task description */}
          <div className="col-span-2 space-y-1 sm:col-span-2">
            <Label className="text-xs">{t("task")}</Label>
            <Input
              value={entry.taskDescription}
              onChange={(e) =>
                updateEntry(entry.id, { taskDescription: e.target.value })
              }
              className="h-9"
            />
          </div>

          {/* Date */}
          <div className="space-y-1">
            <Label className="text-xs">{t("date")}</Label>
            <DatePickerField
              value={entry.date}
              onChange={(date) => updateEntry(entry.id, { date })}
            />
          </div>

          {/* Duration minutes */}
          <div className="space-y-1">
            <Label className="text-xs">{t("duration")}</Label>
            <Input
              type="number"
              min={1}
              max={1440}
              value={entry.durationMinutes ?? ""}
              onChange={(e) => {
                const val = e.target.value === "" ? null : Number(e.target.value);
                updateEntry(entry.id, { durationMinutes: val });
              }}
              placeholder={t("minutes")}
              className={cn(
                "h-9",
                entry.durationMinutes === null && hasBlocking && "border-red-400",
              )}
            />
          </div>

          {/* Category */}
          <div className="space-y-1">
            <Label className="text-xs">{t("category")}</Label>
            <Select
              value={entry.category}
              onValueChange={(val) =>
                updateEntry(entry.id, { category: val as Category })
              }
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {categoryLabelMap[cat]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Intent toggle */}
        {isPlanned && (
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() =>
              updateEntry(entry.id, {
                intent: "done",
                issues: entry.issues.filter((i) => i !== "FUTURE_INTENT"),
              })
            }
          >
            {t("switchToDone")}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
