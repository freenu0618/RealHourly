"use client";

import { useTranslations } from "next-intl";

interface QuickActionChipsProps {
  onSelect: (message: string) => void;
  disabled?: boolean;
}

const CHIPS = [
  { labelKey: "chipWeekSummary", message: "이번 주 작업 요약해줘" },
  { labelKey: "chipProfitCompare", message: "수익성 가장 좋은 프로젝트와 나쁜 프로젝트 비교해줘" },
  { labelKey: "chipScopeRisk", message: "스코프 크리프 위험이 있는 프로젝트 알려줘" },
  { labelKey: "chipNextAction", message: "지금 가장 먼저 해야 할 일 추천해줘" },
  { labelKey: "chipBillingMsg", message: "추가 청구 메시지 작성해줘" },
] as const;

export function QuickActionChips({ onSelect, disabled }: QuickActionChipsProps) {
  const t = useTranslations("chat");

  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      {CHIPS.map((chip) => (
        <button
          key={chip.labelKey}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(chip.message)}
          className="shrink-0 rounded-full border border-border/60 bg-background px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-foreground disabled:opacity-50"
        >
          {t(chip.labelKey)}
        </button>
      ))}
    </div>
  );
}
