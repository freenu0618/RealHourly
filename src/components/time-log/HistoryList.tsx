"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { formatDate } from "@/lib/date";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CATEGORY_EMOJI, getCategoryEmoji } from "@/lib/utils/category-emoji";

interface HistoryEntry {
  id: string;
  date: string; // YYYY-MM-DD
  minutes: number;
  category: string;
  intent: string;
  taskDescription: string;
  projectId: string;
  projectName: string;
  clientName: string | null;
}

interface HistoryListProps {
  entries: HistoryEntry[];
  onEdit: (
    entryId: string,
    data: {
      date?: string;
      minutes?: number;
      category?: string;
      taskDescription?: string;
      intent?: string;
    }
  ) => Promise<void>;
  onDelete: (entryId: string) => Promise<void>;
  locale: string;
}

/**
 * HistoryList
 *
 * @description Displays time log entries grouped by date with inline editing
 * @example
 * <HistoryList
 *   entries={entries}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 *   locale="ko"
 * />
 */
export default function HistoryList({
  entries,
  onEdit,
  onDelete,
  locale,
}: HistoryListProps) {
  const t = useTranslations("history");
  const tCategory = useTranslations("timeLog");

  // Group entries by date
  const groupedEntries = useMemo(() => {
    const groups = new Map<string, HistoryEntry[]>();

    entries.forEach((entry) => {
      const existing = groups.get(entry.date) || [];
      groups.set(entry.date, [...existing, entry]);
    });

    // Sort dates descending
    return Array.from(groups.entries())
      .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
      .map(([date, dateEntries]) => ({
        date,
        entries: dateEntries,
        totalMinutes: dateEntries.reduce((sum, e) => sum + e.minutes, 0),
      }));
  }, [entries]);

  const formatDateHeader = (dateStr: string, totalMinutes: number) => {
    const date = new Date(dateStr + "T00:00:00");
    const hours = (totalMinutes / 60).toFixed(1);

    if (locale === "ko") {
      const formatted = formatDate(date, "M\uC6D4 d\uC77C EEEE", "ko");
      return `${formatted} \u2014 ${hours}\uC2DC\uAC04`;
    } else {
      const formatted = formatDate(date, "EEE, MMM d", "en");
      return `${formatted} \u2014 ${hours}h`;
    }
  };

  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (locale === "ko") {
      return h > 0 ? `${h}시간 ${m}분` : `${m}분`;
    } else {
      return h > 0 ? `${h}h ${m}m` : `${m}m`;
    }
  };

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {t("noEntries") || "기록된 시간이 없습니다"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groupedEntries.map(({ date, entries: dateEntries, totalMinutes }) => (
        <div key={date}>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            {formatDateHeader(date, totalMinutes)}
          </h3>
          <div className="space-y-2">
            {dateEntries.map((entry) => (
              <HistoryEntryCard
                key={entry.id}
                entry={entry}
                onEdit={onEdit}
                onDelete={onDelete}
                formatDuration={formatDuration}
                categoryLabel={tCategory(`category${entry.category.charAt(0).toUpperCase() + entry.category.slice(1)}`) || entry.category}
                locale={locale}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

interface HistoryEntryCardProps {
  entry: HistoryEntry;
  onEdit: HistoryListProps["onEdit"];
  onDelete: HistoryListProps["onDelete"];
  formatDuration: (minutes: number) => string;
  categoryLabel: string;
  locale: string;
}

function HistoryEntryCard({
  entry,
  onEdit,
  onDelete,
  formatDuration,
  categoryLabel,
  locale,
}: HistoryEntryCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    taskDescription: entry.taskDescription,
    minutes: entry.minutes,
    category: entry.category,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onEdit(entry.id, editData);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save edit:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      taskDescription: entry.taskDescription,
      minutes: entry.minutes,
      category: entry.category,
    });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      locale === "ko"
        ? "이 시간 기록을 삭제하시겠습니까?"
        : "Are you sure you want to delete this entry?"
    );
    if (confirmed) {
      await onDelete(entry.id);
    }
  };

  if (isEditing) {
    return (
      <div className="bg-card border rounded-xl p-4 shadow-sm space-y-3">
        <Input
          value={editData.taskDescription}
          onChange={(e) =>
            setEditData({ ...editData, taskDescription: e.target.value })
          }
          placeholder={locale === "ko" ? "작업 설명" : "Task description"}
          className="text-sm"
        />
        <div className="flex gap-2">
          <Input
            type="number"
            min="1"
            max="1440"
            value={editData.minutes}
            onChange={(e) =>
              setEditData({ ...editData, minutes: parseInt(e.target.value) || 0 })
            }
            className="w-24 text-sm"
          />
          <select
            value={editData.category}
            onChange={(e) =>
              setEditData({ ...editData, category: e.target.value })
            }
            className="flex-1 text-sm border rounded-md px-3 py-2 bg-background"
          >
            {Object.keys(CATEGORY_EMOJI).map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_EMOJI[cat]} {cat}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 justify-end">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCancel}
            disabled={isLoading}
          >
            <X className="h-4 w-4 mr-1" />
            {locale === "ko" ? "취소" : "Cancel"}
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isLoading}>
            <Check className="h-4 w-4 mr-1" />
            {locale === "ko" ? "저장" : "Save"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="group bg-card border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-foreground">
              {entry.projectName}
            </span>
            {entry.clientName && (
              <span className="text-xs text-muted-foreground">
                · {entry.clientName}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm">{getCategoryEmoji(entry.category)}</span>
            <span className="text-xs text-muted-foreground">
              {categoryLabel}
            </span>
          </div>
          <p className="text-sm text-foreground mt-1">{entry.taskDescription}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
            {formatDuration(entry.minutes)}
          </span>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => setIsEditing(true)}
              aria-label={locale === "ko" ? "수정" : "Edit"}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={handleDelete}
              aria-label={locale === "ko" ? "삭제" : "Delete"}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
