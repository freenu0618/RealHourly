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

const CATEGORY_EMOJI: Record<Category, string> = {
  planning: "\uD83D\uDCCB",
  design: "\uD83C\uDFA8",
  development: "\uD83D\uDCBB",
  meeting: "\uD83D\uDDE3\uFE0F",
  revision: "\uD83D\uDD04",
  admin: "\uD83D\uDCC2",
  email: "\uD83D\uDCE7",
  research: "\uD83D\uDD0D",
  other: "\uD83D\uDCCC",
};

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
  const isPlanned = entry.issues.includes("FUTURE_INTENT");

  const borderClass = hasBlocking
    ? "border-l-4 border-l-orange-400"
    : "border-l-4 border-l-green-500";

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
      className={cn(
        "relative rounded-[20px] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md",
        borderClass,
      )}
      role="group"
      aria-label={`${entry.taskDescription} \u2014 ${entry.projectNameRaw}`}
      tabIndex={0}
    >
      <CardContent className="space-y-3 pt-5">
        {/* Header: category badge + task + delete */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            {/* Category emoji badge */}
            <span className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold",
              hasBlocking
                ? "border border-orange-100 bg-orange-50 text-orange-700 dark:border-orange-900/50 dark:bg-orange-900/20 dark:text-orange-400"
                : "border border-green-100 bg-green-50 text-green-700 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-400",
            )}>
              {CATEGORY_EMOJI[entry.category]} {categoryLabelMap[entry.category]}
            </span>
            {/* Duration */}
            <div className="rounded-lg border bg-muted/60 px-3 py-1.5 font-mono text-sm font-bold">
              {entry.durationMinutes ? `${(entry.durationMinutes / 60).toFixed(1)}h` : "--"}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            onClick={() => removeEntry(entry.id)}
            aria-label={t("removeEntry")}
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Task description */}
        <h4 className="text-base font-bold leading-tight">{entry.taskDescription}</h4>

        {/* Issue badges */}
        <div className="flex flex-wrap gap-1.5">
          {hasBlocking && (
            <Badge variant="destructive" className="gap-1 rounded-full text-xs">
              <AlertCircle className="size-3" />
              {t("selectRequired")}
            </Badge>
          )}
          {entry.issues.includes("DATE_AMBIGUOUS") && (
            <Badge
              variant="outline"
              className="rounded-full border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
            >
              {t("dateEstimated")}
            </Badge>
          )}
          {entry.issues.includes("DURATION_AMBIGUOUS") && (
            <Badge
              variant="outline"
              className="rounded-full border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
            >
              {t("durationEstimated")}
            </Badge>
          )}
          {entry.issues.includes("CATEGORY_AMBIGUOUS") && (
            <Badge
              variant="outline"
              className="rounded-full border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
            >
              {t("categoryEstimated")}
            </Badge>
          )}
          {isPlanned && (
            <Badge
              variant="outline"
              className="rounded-full border-purple-300 bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400"
            >
              {t("futurePlanned")}
            </Badge>
          )}
          {entry.matchSource === "preferred" && (
            <Badge
              variant="outline"
              className="rounded-full border-blue-300 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
            >
              {"\uD83D\uDCCC"} {t("preferredFallback")}
            </Badge>
          )}
        </div>

        {/* Clarification question */}
        {entry.clarificationQuestion && (
          <div className="rounded-2xl rounded-tl-none border border-blue-100 bg-blue-50 p-3 px-4 dark:border-blue-800 dark:bg-blue-900/20">
            <div className="mb-1.5 flex items-center gap-2">
              <span className="text-sm">{"\uD83E\uDD16"}</span>
              <span className="text-xs font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">Clarification</span>
            </div>
            <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
              {entry.clarificationQuestion}
            </p>
          </div>
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
                  "h-9 rounded-xl",
                  !entry.matchedProjectId && hasBlocking && "border-orange-400",
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
              className="h-9 rounded-xl"
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
                "h-9 rounded-xl",
                entry.durationMinutes === null && hasBlocking && "border-orange-400",
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
              <SelectTrigger className="h-9 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {CATEGORY_EMOJI[cat]} {categoryLabelMap[cat]}
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
            className="rounded-xl text-xs"
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
