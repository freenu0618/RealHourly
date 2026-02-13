"use client";

import { useRef, useState, useCallback, useEffect } from "react";
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
import { ProgressUpdateDialog } from "./ProgressUpdateDialog";
import { ManualEntryForm } from "./ManualEntryForm";
import { VoiceInput } from "./VoiceInput";
import { QuickTimer } from "./QuickTimer";
import { PostLogSuggestions, type PostLogSuggestion } from "./PostLogSuggestions";
import type { TimerResult } from "@/store/use-timer-store";
import { generateId } from "@/lib/utils/nanoid";
import type { Category } from "@/types/time-log";
import { cn } from "@/lib/utils";
import { Clock, Repeat } from "lucide-react";

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
  const [progressHint, setProgressHint] = useState<{
    detected: boolean;
    suggestedProgress: number | null;
    reason: string;
    projectNameRaw: string | null;
  } | null>(null);
  const [suggestedProgress, setSuggestedProgress] = useState(0);
  const [showProgressHint, setShowProgressHint] = useState(false);
  const [suggestions, setSuggestions] = useState<PostLogSuggestion[]>([]);
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const [progressProjects, setProgressProjects] = useState<
    { projectId: string; projectName: string; currentProgress: number }[]
  >([]);
  const [recentProjects, setRecentProjects] = useState<
    { id: string; name: string }[]
  >([]);
  const [lastEntry, setLastEntry] = useState<{
    projectId: string;
    projectName: string;
    taskDescription: string;
    minutes: number;
    category: Category;
  } | null>(null);

  const { entries, isLoading, setEntries, setLoading, setError } =
    useDraftStore();

  const thinking = useThinkingLog();

  // Load recent projects and last entry from localStorage
  useEffect(() => {
    try {
      const storedRecent = localStorage.getItem("realhourly:recent-projects");
      if (storedRecent) {
        const parsed = JSON.parse(storedRecent) as { id: string; name: string }[];
        // Filter against current projects (only show projects that still exist)
        const validRecent = parsed.filter((r) => projects.some((p) => p.id === r.id));
        setRecentProjects(validRecent.slice(0, 3));
      }

      const storedLast = localStorage.getItem("realhourly:last-entry");
      if (storedLast) {
        const parsed = JSON.parse(storedLast);
        // Validate that the project still exists
        if (projects.some((p) => p.id === parsed.projectId)) {
          setLastEntry(parsed);
        }
      }
    } catch (err) {
      // Ignore localStorage errors
    }
  }, [projects]);

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

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        const code = errBody?.error?.code;
        if (res.status === 429) throw new Error("RATE_LIMIT");
        if (code === "VALIDATION_ERROR") throw new Error("VALIDATION");
        throw new Error("PARSE_FAILED");
      }
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

      // Check for progress hint
      if (data.progressHint?.detected) {
        setProgressHint(data.progressHint);
        setSuggestedProgress(data.progressHint.suggestedProgress ?? 50);
        setShowProgressHint(true);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg === "RATE_LIMIT") {
        toast.error(t("rateLimitExceeded"));
      } else {
        toast.error(t("parseFailed"));
      }
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

  async function handleUpdateProgress() {
    if (!progressHint || suggestedProgress === null) return;
    // Find the matched project from entries
    const matchedEntry = entries.find((e) => e.matchedProjectId);
    const projectId = matchedEntry?.matchedProjectId;
    if (!projectId) {
      toast.error(t("selectProjectFirst"));
      return;
    }

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ progressPercent: suggestedProgress }),
      });
      if (!res.ok) throw new Error();
      toast.success(t("progressUpdated", { percent: String(suggestedProgress) }));
      setShowProgressHint(false);
      setProgressHint(null);
    } catch {
      toast.error(t("progressUpdateFailed"));
    }
  }

  function handleSaved() {
    // Persist recent projects and last entry to localStorage
    try {
      // Get unique projects from saved entries
      const savedProjects = entries
        .filter((e) => e.matchedProjectId)
        .map((e) => ({
          id: e.matchedProjectId!,
          name: projects.find((p) => p.id === e.matchedProjectId)?.name || e.projectNameRaw,
        }));

      // Update recent projects (deduplicate, push to front, cap at 5)
      const storedRecent = localStorage.getItem("realhourly:recent-projects");
      let recentList: { id: string; name: string }[] = storedRecent
        ? JSON.parse(storedRecent)
        : [];

      // Add saved projects to the front (newest first)
      savedProjects.forEach((sp) => {
        // Remove if already exists
        recentList = recentList.filter((r) => r.id !== sp.id);
        // Add to front
        recentList.unshift(sp);
      });

      // Cap at 5
      recentList = recentList.slice(0, 5);
      localStorage.setItem("realhourly:recent-projects", JSON.stringify(recentList));
      setRecentProjects(recentList.slice(0, 3));

      // Store last entry (first entry's data)
      if (entries.length > 0 && entries[0].matchedProjectId && entries[0].durationMinutes) {
        const firstEntry = entries[0];
        const lastEntryData = {
          projectId: firstEntry.matchedProjectId!,
          projectName: projects.find((p) => p.id === firstEntry.matchedProjectId)?.name || firstEntry.projectNameRaw,
          taskDescription: firstEntry.taskDescription,
          minutes: firstEntry.durationMinutes!,
          category: firstEntry.category,
        };
        localStorage.setItem("realhourly:last-entry", JSON.stringify(lastEntryData));
        setLastEntry(lastEntryData);
      }
    } catch (err) {
      // Ignore localStorage errors
    }

    setInput("");
    setPreferredProjectId("");
    setShowProgressHint(false);
    setProgressHint(null);
  }

  function handleSuggestions(s: PostLogSuggestion[]) {
    setSuggestions(s);
  }

  function handleSuggestionProgressUpdate(
    projectId: string,
    projectName: string,
    currentProgress: number,
  ) {
    setProgressProjects([{ projectId, projectName, currentProgress }]);
    setProgressDialogOpen(true);
  }

  function handleProgressPrompt(
    projects: { projectId: string; projectName: string; currentProgress: number }[],
  ) {
    setProgressProjects(projects);
    setProgressDialogOpen(true);
  }

  function handleRepeatLast() {
    if (!lastEntry) return;
    const entry: ParsedEntry = {
      id: generateId(),
      projectNameRaw: lastEntry.projectName,
      matchedProjectId: lastEntry.projectId,
      matchSource: "name",
      taskDescription: lastEntry.taskDescription,
      date: new Date().toISOString(),
      durationMinutes: lastEntry.minutes,
      category: lastEntry.category,
      intent: "done",
      issues: [],
      needsUserAction: false,
      clarificationQuestion: null,
    };
    setEntries([...entries, entry]);
    toast.success(t("repeatLastSuccess"));
  }

  function handleTimerStopped(result: TimerResult) {
    const entry: ParsedEntry = {
      id: generateId(),
      projectNameRaw: result.projectName,
      matchedProjectId: result.projectId,
      matchSource: "name",
      taskDescription: result.taskDescription,
      date: result.startedAt,
      durationMinutes: result.minutes,
      category: result.category as Category,
      intent: "done",
      issues: [],
      needsUserAction: false,
      clarificationQuestion: null,
    };
    setEntries([...entries, entry]);
    toast.success(t("timerStopped"));
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Enter: Parse
      if (e.ctrlKey && e.key === "Enter" && !e.shiftKey && !e.altKey) {
        if (input.trim() && !isLoading) {
          e.preventDefault();
          handleParse();
        }
      }
      // Ctrl+S: Save All
      if (e.ctrlKey && e.key === "s" && !e.shiftKey && !e.altKey) {
        const canSave = entries.length > 0 && entries.every((e) => e.matchedProjectId && e.durationMinutes);
        if (canSave) {
          e.preventDefault();
          // Trigger SaveAllButton's save action
          const saveButton = document.querySelector('[aria-label="' + t("saveAll") + '"]') as HTMLButtonElement;
          if (saveButton && !saveButton.disabled) {
            saveButton.click();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [input, isLoading, entries, handleParse, t]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Recent projects quick chips */}
      {recentProjects.length > 0 && (
        <div className="space-y-2">
          <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {t("recentProjects")}
          </Label>
          <div className="flex flex-wrap gap-2">
            {recentProjects.map((project) => (
              <button
                key={project.id}
                type="button"
                onClick={() => setPreferredProjectId(project.id)}
                disabled={isLoading}
                className={cn(
                  "rounded-full bg-muted/50 px-3 py-1.5 text-xs transition-colors hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed",
                  preferredProjectId === project.id &&
                    "bg-primary/10 text-primary ring-1 ring-primary/30"
                )}
              >
                {project.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Preferred project (optional) */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">
          {t("preferredProject")}
        </Label>
        <Select
          value={preferredProjectId || "__none__"}
          onValueChange={(val) => setPreferredProjectId(val === "__none__" ? "" : val)}
        >
          <SelectTrigger className="h-9 rounded-xl">
            <SelectValue placeholder={t("selectProject")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">{t("noPreference")}</SelectItem>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Chat textarea + voice input + timer */}
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <ChatTextarea
            value={input}
            onChange={setInput}
            onParse={handleParse}
            placeholder={t("inputPlaceholder")}
            disabled={isLoading}
            textareaRef={textareaRef}
          />
        </div>
        <div className="flex flex-col gap-1.5 pt-2.5">
          <VoiceInput
            onTranscribed={(text) => {
              setInput((prev) => (prev ? `${prev}\n${text}` : text));
              textareaRef.current?.focus();
            }}
            disabled={isLoading}
          />
          <QuickTimer
            projects={projects}
            onTimerStopped={handleTimerStopped}
          />
        </div>
      </div>

      {/* Quick chips */}
      <QuickChips
        textareaRef={textareaRef}
        onInsert={setInput}
        disabled={isLoading}
      />

      {/* Action row: Magic Parse + Example Fill + Repeat Last */}
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
        {lastEntry && (
          <Button
            variant="ghost"
            size="sm"
            className="rounded-xl text-xs text-primary/80 hover:text-primary hover:bg-primary/10"
            onClick={handleRepeatLast}
            disabled={isLoading}
          >
            <Repeat className="mr-1.5 h-3.5 w-3.5" />
            {t("repeatLast")}
          </Button>
        )}
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

      {/* Progress Hint */}
      {showProgressHint && progressHint && !showThinking && (
        <div className="rounded-[20px] border border-primary/20 bg-primary/5 p-5">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-base">{"\uD83D\uDCA1"}</span>
            <span className="text-sm font-semibold">{t("progressHintTitle")}</span>
          </div>
          <p className="mb-4 text-xs text-muted-foreground">
            {t("progressHintDesc", { reason: progressHint.reason })}
          </p>
          <div className="mb-4 flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={suggestedProgress}
              onChange={(e) => setSuggestedProgress(Number(e.target.value))}
              className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-muted accent-primary"
            />
            <span className="w-12 text-right text-sm font-bold text-primary">
              {suggestedProgress}%
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              className="rounded-xl"
              onClick={handleUpdateProgress}
            >
              {t("progressUpdate")}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="rounded-xl text-muted-foreground"
              onClick={() => {
                setShowProgressHint(false);
                setProgressHint(null);
              }}
            >
              {t("progressLater")}
            </Button>
          </div>
        </div>
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
          <SaveAllButton onSaved={handleSaved} onProgressPrompt={handleProgressPrompt} onSuggestions={handleSuggestions} />
        </>
      )}

      {/* Post-log suggestions */}
      {suggestions.length > 0 && !showThinking && entries.length === 0 && (
        <PostLogSuggestions
          suggestions={suggestions}
          onDismiss={() => setSuggestions([])}
          onProgressUpdate={handleSuggestionProgressUpdate}
        />
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

      {/* Progress Update Dialog */}
      <ProgressUpdateDialog
        open={progressDialogOpen}
        onOpenChange={setProgressDialogOpen}
        projects={progressProjects}
      />
    </div>
  );
}
