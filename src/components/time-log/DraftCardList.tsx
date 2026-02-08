"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { useDraftStore } from "@/store/use-draft-store";
import { DraftCard } from "./DraftCard";

interface DraftCardListProps {
  projects: { id: string; name: string }[];
}

export function DraftCardList({ projects }: DraftCardListProps) {
  const t = useTranslations("timeLog");
  const { entries } = useDraftStore();
  const listRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to first blocking card
  useEffect(() => {
    if (entries.length === 0) return;
    const firstBlocking = entries.findIndex((e) => e.needsUserAction);
    if (firstBlocking < 0) return;

    const el = listRef.current?.children[firstBlocking + 1] as HTMLElement;
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [entries.length]); // eslint-disable-line react-hooks/exhaustive-deps

  if (entries.length === 0) return null;

  return (
    <div ref={listRef} className="space-y-3">
      <Badge variant="secondary" className="text-sm">
        {t("parseSummary", { count: entries.length })}
      </Badge>

      {entries.map((entry) => (
        <DraftCard key={entry.id} entry={entry} projects={projects} />
      ))}
    </div>
  );
}
