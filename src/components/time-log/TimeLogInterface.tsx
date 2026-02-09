"use client";

import { useRef, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ThinkingLog } from "@/components/ui/ThinkingLog";
import { useThinkingLog, sleep } from "@/lib/hooks/use-thinking-log";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useDraftStore } from "@/store/use-draft-store";
import type { ParsedEntry } from "@/types/time-log";
import { ChatTextarea } from "./ChatTextarea";
import { QuickChips } from "./QuickChips";
import { MagicParseButton } from "./MagicParseButton";
import { DraftCardList } from "./DraftCardList";
import { SaveAllButton } from "./SaveAllButton";
import { ManualEntryForm } from "./ManualEntryForm";

interface TimeLogInterfaceProps {
  projects: { id: string; name: string }[];
}

export function TimeLogInterface({ projects }: TimeLogInterfaceProps) {
  const t = useTranslations("timeLog");
  const tAi = useTranslations("ai");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState("");
  const [preferredProjectId, setPreferredProjectId] = useState<string>("");
  const [showManual, setShowManual] = useState(false);
  const [showThinking, setShowThinking] = useState(false);

  const { entries, isLoading, setEntries, setLoading, setError } =
    useDraftStore();

  const thinking = useThinkingLog();

  const handleParse = useCallback(async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    thinking.reset();
    setShowThinking(true);

    // Step 1: Reading input
    const s1 = thinking.addStep("\uD83D\uDCD6", tAi("readingInput"));
    const preview =
      input.trim().slice(0, 50) + (input.trim().length > 50 ? "..." : "");
    thinking.addDetail(s1, tAi("detected", { text: preview }));
    await sleep(400);

    // Step 2: Requesting AI
    thinking.completeStep(s1);
    const s2 = thinking.addStep("\uD83E\uDD16", tAi("requestingAI"));

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
      const parsedEntries = data.entries as ParsedEntry[];

      // Step 3: Organizing results
      thinking.completeStep(s2);
      const s3 = thinking.addStep("\uD83D\uDD0D", tAi("organizingResults"));

      for (const entry of parsedEntries) {
        await sleep(300);
        const dur = entry.durationMinutes ?? "?";
        thinking.addDetail(
          s3,
          `${entry.projectNameRaw}: ${entry.taskDescription} (${dur}${t("minutes")})`
        );
      }

      // Step 4: Matching projects
      thinking.completeStep(s3);
      const matched = parsedEntries.filter((e) => e.matchedProjectId);
      const unmatched = parsedEntries.filter((e) => !e.matchedProjectId);
      const s4 = thinking.addStep("\uD83C\uDFF7\uFE0F", tAi("matchingProjects"));

      if (matched.length > 0) {
        thinking.addDetail(
          s4,
          tAi("autoMatched", { count: String(matched.length) })
        );
      }
      if (unmatched.length > 0) {
        await sleep(200);
        thinking.addDetail(
          s4,
          tAi("needsReview", { count: String(unmatched.length) })
        );
      }

      // Complete
      thinking.completeStep(s4);
      await sleep(500);
      thinking.complete(
        tAi("foundEntries", { count: String(parsedEntries.length) })
      );

      // Wait, then transition to HITL cards
      await sleep(1000);
      setShowThinking(false);
      setEntries(data.entries);
    } catch {
      toast.error(t("parseFailed"));
      setError(t("parseFailed"));
      thinking.reset();
      setShowThinking(false);
    } finally {
      setLoading(false);
    }
  }, [input, preferredProjectId, setEntries, setLoading, setError, thinking, t, tAi]);

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

      {/* Thinking Log */}
      {showThinking && (
        <ThinkingLog
          title={tAi("thinkingTitle")}
          steps={thinking.steps}
          isComplete={thinking.isComplete}
          completionText={thinking.completionText}
        />
      )}

      {/* HITL Draft Cards */}
      {!isLoading && !showThinking && entries.length > 0 && (
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
      {!isLoading && !showThinking && entries.length === 0 && !showManual && (
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
