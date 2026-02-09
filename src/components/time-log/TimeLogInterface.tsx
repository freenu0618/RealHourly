"use client";

import { useRef, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StepLoader } from "@/components/ui/step-loader";
import { useStepLoader } from "@/lib/hooks/use-step-loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useDraftStore } from "@/store/use-draft-store";
import { ChatTextarea } from "./ChatTextarea";
import { QuickChips } from "./QuickChips";
import { MagicParseButton } from "./MagicParseButton";
import { DraftCardList } from "./DraftCardList";
import { SaveAllButton } from "./SaveAllButton";
import { ManualEntryForm } from "./ManualEntryForm";

interface TimeLogInterfaceProps {
  projects: { id: string; name: string }[];
}

const PARSE_STEPS = [
  { key: "parseStep1", emoji: "\uD83D\uDCE8", duration: 1500 },
  { key: "parseStep2", emoji: "\uD83E\uDDE0", duration: 2000 },
  { key: "parseStep3", emoji: "\uD83D\uDDC2\uFE0F", duration: 1800 },
  { key: "parseStep4", emoji: "\uD83C\uDFAF", duration: 2000 },
  { key: "parseStep5", emoji: "\u2728", duration: 3000 },
];

export function TimeLogInterface({ projects }: TimeLogInterfaceProps) {
  const t = useTranslations("timeLog");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState("");
  const [preferredProjectId, setPreferredProjectId] = useState<string>("");
  const [showManual, setShowManual] = useState(false);

  const { entries, isLoading, setEntries, setLoading, setError } =
    useDraftStore();

  const stepLoader = useStepLoader(PARSE_STEPS);

  const handleParse = useCallback(async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    stepLoader.start();

    try {
      const res = await fetch("/api/time/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: input.trim(),
          userTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          ...(preferredProjectId && { preferredProjectId }),
        }),
      });

      if (!res.ok) throw new Error("Parse failed");

      const { data } = await res.json();
      setEntries(data.entries);
    } catch {
      toast.error(t("parseFailed"));
      setError(t("parseFailed"));
    } finally {
      stepLoader.complete();
      setLoading(false);
    }
  }, [input, preferredProjectId, setEntries, setLoading, setError, stepLoader, t]);

  function handleExampleFill(text: string) {
    setInput(text);
    textareaRef.current?.focus();
  }

  function handleSaved() {
    setInput("");
    setPreferredProjectId("");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Preferred project (optional) */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">
          {t("preferredProject")}
        </Label>
        <Select
          value={preferredProjectId}
          onValueChange={setPreferredProjectId}
        >
          <SelectTrigger className="h-9 rounded-xl">
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

      {/* Chat textarea */}
      <ChatTextarea
        value={input}
        onChange={setInput}
        onParse={handleParse}
        placeholder={t("inputPlaceholder")}
        disabled={isLoading}
        textareaRef={textareaRef}
      />

      {/* Quick chips */}
      <QuickChips
        textareaRef={textareaRef}
        onInsert={setInput}
        disabled={isLoading}
      />

      {/* Action row: Magic Parse + Example Fill */}
      <div className="flex flex-wrap items-center gap-2">
        <MagicParseButton
          onClick={handleParse}
          loading={isLoading}
          disabled={!input.trim()}
        />
        <Button
          variant="ghost"
          size="sm"
          className="rounded-xl text-xs text-muted-foreground"
          onClick={() => handleExampleFill(t("exampleText1"))}
          disabled={isLoading}
        >
          {t("exampleFill1")}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="rounded-xl text-xs text-muted-foreground"
          onClick={() => handleExampleFill(t("exampleText2"))}
          disabled={isLoading}
        >
          {t("exampleFill2")}
        </Button>
      </div>

      {/* Step-by-step loading */}
      {isLoading && (
        <div className="rounded-[20px] border border-dashed border-primary/30 bg-primary/5">
          <StepLoader
            currentStep={stepLoader.currentStep}
            currentIndex={stepLoader.currentIndex}
            progress={stepLoader.progress}
            namespace="ai"
          />
        </div>
      )}

      {/* HITL Draft Cards */}
      {!isLoading && entries.length > 0 && (
        <>
          <div className="flex items-center justify-between px-1">
            <h3 className="flex items-center gap-2 text-lg font-bold">
              {"\u2705"} {t("reviewEntries")}
            </h3>
            <span className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
              {entries.length} {t("entriesFound")}
            </span>
          </div>
          <DraftCardList projects={projects} />
          <SaveAllButton onSaved={handleSaved} />
        </>
      )}

      {/* Manual entry fallback */}
      {showManual && (
        <ManualEntryForm
          projects={projects}
          onCancel={() => setShowManual(false)}
        />
      )}

      {/* Show manual entry button on error */}
      {!isLoading && entries.length === 0 && !showManual && (
        <div className="flex flex-col items-center gap-3 rounded-[20px] border border-dashed border-border p-8 text-center">
          <span className="text-4xl">{"\u270D\uFE0F"}</span>
          <p className="text-sm text-muted-foreground">{t("emptyState")}</p>
          <Button
            variant="link"
            size="sm"
            className="text-xs text-primary"
            onClick={() => setShowManual(true)}
          >
            {t("manualEntry")}
          </Button>
        </div>
      )}
    </div>
  );
}
