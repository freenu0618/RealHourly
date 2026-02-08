"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

interface QuickChipsProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onInsert: (text: string) => void;
  disabled?: boolean;
}

export function QuickChips({ textareaRef, onInsert, disabled }: QuickChipsProps) {
  const t = useTranslations("timeLog");

  const chips = [
    { key: "chipToday", text: t("chipToday") },
    { key: "chipYesterday", text: t("chipYesterday") },
    { key: "chipMeeting", text: t("chipMeeting") },
    { key: "chipEmail", text: t("chipEmail") },
    { key: "chipRevision", text: t("chipRevision") },
    { key: "chipResearch", text: t("chipResearch") },
  ];

  function handleClick(text: string) {
    const el = textareaRef.current;
    if (!el) {
      onInsert(text);
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const current = el.value;
    const before = current.slice(0, start);
    const after = current.slice(end);
    const needsSpace = before.length > 0 && !before.endsWith(" ") && !before.endsWith("\n");
    const insert = (needsSpace ? " " : "") + text + " ";
    onInsert(before + insert + after);

    requestAnimationFrame(() => {
      const pos = start + insert.length;
      el.setSelectionRange(pos, pos);
      el.focus();
    });
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {chips.map((chip) => (
        <Button
          key={chip.key}
          type="button"
          variant="outline"
          size="sm"
          className="h-7 rounded-full px-3 text-xs"
          disabled={disabled}
          onClick={() => handleClick(chip.text)}
        >
          {chip.text}
        </Button>
      ))}
    </div>
  );
}
