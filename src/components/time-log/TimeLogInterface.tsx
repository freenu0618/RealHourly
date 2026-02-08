"use client";

import { useRef, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
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

export function TimeLogInterface({ projects }: TimeLogInterfaceProps) {
  const t = useTranslations("timeLog");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState("");
  const [preferredProjectId, setPreferredProjectId] = useState<string>("");
  const [showManual, setShowManual] = useState(false);

  const { entries, isLoading, setEntries, setLoading, setError } =
    useDraftStore();

  const handleParse = useCallback(async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/time/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: input.trim(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
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
      setLoading(false);
    }
  }, [input, preferredProjectId, setEntries, setLoading, setError, t]);

  function handleExampleFill(text: string) {
    setInput(text);
    textareaRef.current?.focus();
  }

  function handleSaved() {
    setInput("");
    setPreferredProjectId("");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {/* Preferred project (optional) */}
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">
          {t("preferredProject")}
        </Label>
        <Select
          value={preferredProjectId}
          onValueChange={setPreferredProjectId}
        >
          <SelectTrigger className="h-9">
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
          className="text-xs text-muted-foreground"
          onClick={() => handleExampleFill(t("exampleText1"))}
          disabled={isLoading}
        >
          {t("exampleFill1")}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground"
          onClick={() => handleExampleFill(t("exampleText2"))}
          disabled={isLoading}
        >
          {t("exampleFill2")}
        </Button>
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-36 w-full rounded-lg" />
          <Skeleton className="h-36 w-full rounded-lg" />
        </div>
      )}

      {/* HITL Draft Cards */}
      {!isLoading && entries.length > 0 && (
        <>
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
        <div className="text-center">
          <Button
            variant="link"
            size="sm"
            className="text-xs text-muted-foreground"
            onClick={() => setShowManual(true)}
          >
            {t("manualEntry")}
          </Button>
        </div>
      )}
    </div>
  );
}
