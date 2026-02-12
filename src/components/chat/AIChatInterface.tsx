"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  Send,
  Loader2,
  Sparkles,
  BarChart3,
  Briefcase,
  Compass,
  Clock,
  Wallet,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChatMessage } from "./ChatMessage";

/* ── Types ── */
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

let msgCounter = 0;
function nextMsgId() {
  return `m-${Date.now()}-${++msgCounter}`;
}

/* ── Role Chips ── */
const ROLE_CHIPS = [
  { key: "dataAnalyst", icon: BarChart3, color: "text-blue-600 dark:text-blue-400" },
  { key: "bizAdvisor", icon: Briefcase, color: "text-brand-orange dark:text-orange-400" },
  { key: "careerGuide", icon: Compass, color: "text-emerald-600 dark:text-emerald-400" },
  { key: "timeCoach", icon: Clock, color: "text-violet-600 dark:text-violet-400" },
  { key: "finConsultant", icon: Wallet, color: "text-rose-600 dark:text-rose-400" },
] as const;

/* ── Quick Prompts per Role ── */
const ROLE_PROMPTS: Record<string, string> = {
  dataAnalyst: "내 프로젝트들의 수익성과 시간 패턴을 분석해줘",
  bizAdvisor: "현재 진행 중인 프로젝트의 가격 책정이 적절한지 검토해줘",
  careerGuide: "프리랜서로서 다음 분기 성장 전략을 제안해줘",
  timeCoach: "내 시간 사용 패턴을 분석하고 생산성 향상 팁을 알려줘",
  finConsultant: "비용 구조를 분석하고 수익 최적화 방안을 제안해줘",
};

/* ── localStorage helpers ── */
const STORAGE_KEY = "realhourly-chat-messages";

function loadMessagesFromStorage(): Message[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveMessagesToStorage(messages: Message[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {
    // Ignore storage errors
  }
}

function clearMessagesFromStorage() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}

/* ── Component ── */
export function AIChatInterface() {
  const t = useTranslations("chatPage");
  const tChat = useTranslations("chat");

  // Conversations (in-memory)
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>(loadMessagesFromStorage);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeConv = conversations.find((c) => c.id === activeConvId);

  // Save messages to localStorage
  useEffect(() => {
    saveMessagesToStorage(messages);
  }, [messages]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, [activeConvId]);

  // Create new conversation
  function createConversation(firstMessage?: string) {
    const id = `conv-${Date.now()}`;
    const conv: Conversation = {
      id,
      title: firstMessage?.slice(0, 30) || t("newConversation"),
      messages: [],
      createdAt: new Date(),
    };
    setConversations((prev) => [conv, ...prev]);
    setActiveConvId(id);
    setMessages([]);
    return id;
  }

  // Delete conversation
  function deleteConversation(convId: string) {
    setConversations((prev) => prev.filter((c) => c.id !== convId));
    if (activeConvId === convId) {
      setActiveConvId(null);
      setMessages([]);
    }
  }

  // Sync messages back to conversation
  function syncMessages(convId: string, msgs: Message[]) {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId
          ? { ...c, messages: msgs, title: msgs[0]?.content.slice(0, 30) || c.title }
          : c,
      ),
    );
  }

  // Send message
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      let convId = activeConvId;
      if (!convId) {
        convId = createConversation(text.trim());
      }

      const userMsg: Message = { id: nextMsgId(), role: "user", content: text.trim() };
      const newMessages = [...messages, userMsg];
      setMessages(newMessages);
      setInput("");
      setIsLoading(true);

      try {
        const history = newMessages
          .slice(-20)
          .map((m) => ({ role: m.role, content: m.content }));

        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text.trim(),
            conversationHistory: history.slice(0, -1),
          }),
        });

        if (res.status === 429) {
          toast.error(tChat("rateLimited"));
          return;
        }
        if (!res.ok) throw new Error("API error");

        const json = await res.json();
        const assistantMsg: Message = {
          id: nextMsgId(),
          role: "assistant",
          content: json.data.reply,
        };
        const updated = [...newMessages, assistantMsg];
        setMessages(updated);
        syncMessages(convId, updated);
      } catch {
        toast.error(tChat("errorMessage"));
      } finally {
        setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isLoading, messages, activeConvId, tChat],
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function handleRoleClick(key: string) {
    const prompt = ROLE_PROMPTS[key];
    if (prompt) sendMessage(prompt);
  }

  function handleConversationClick(conv: Conversation) {
    setActiveConvId(conv.id);
    setMessages(conv.messages);
  }

  // Clear chat
  function clearChat() {
    setMessages([]);
    clearMessagesFromStorage();
    toast.success(tChat("chatCleared") || "Chat cleared");
  }

  const showWelcome = messages.length === 0 && !isLoading;

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left: Conversation List (desktop) */}
      <aside className="hidden w-64 flex-col border-r border-border bg-muted/30 lg:flex">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-sm font-semibold">{t("conversations")}</h3>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => createConversation()}
          >
            <Plus className="size-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {conversations.length === 0 ? (
            <p className="px-2 py-8 text-center text-xs text-muted-foreground">
              {t("noConversations")}
            </p>
          ) : (
            <div className="space-y-1">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={cn(
                    "group flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted",
                    activeConvId === conv.id && "bg-muted font-medium",
                  )}
                  onClick={() => handleConversationClick(conv)}
                >
                  <Sparkles className="size-3.5 shrink-0 text-brand-orange" />
                  <span className="flex-1 truncate">{conv.title}</span>
                  <button
                    type="button"
                    className="hidden shrink-0 rounded p-0.5 text-muted-foreground hover:text-destructive group-hover:block"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conv.id);
                    }}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Right: Chat Area */}
      <div className="flex flex-1 flex-col">
        {/* Chat Header */}
        <div className="flex items-center gap-3 border-b px-5 py-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-brand-orange/10">
            <Sparkles className="size-5 text-brand-orange" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-semibold">{t("title")}</h2>
            <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
          </div>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="size-8 shrink-0"
              onClick={clearChat}
              title={tChat("clearChat") || "Clear chat"}
            >
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6">
          {showWelcome ? (
            <div className="mx-auto flex max-w-lg flex-col items-center gap-6 pt-8 md:pt-16">
              {/* Welcome */}
              <div className="flex size-16 items-center justify-center rounded-2xl bg-brand-orange/10">
                <Sparkles className="size-8 text-brand-orange" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold">{t("welcomeTitle")}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("welcomeDescription")}
                </p>
              </div>

              {/* Role Cards */}
              <div className="grid w-full gap-2 sm:grid-cols-2">
                {ROLE_CHIPS.map((role) => {
                  const Icon = role.icon;
                  return (
                    <button
                      key={role.key}
                      type="button"
                      onClick={() => handleRoleClick(role.key)}
                      disabled={isLoading}
                      className="flex items-start gap-3 rounded-xl border border-border/60 bg-card p-3 text-left transition-all hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm disabled:opacity-50"
                    >
                      <Icon className={cn("mt-0.5 size-5 shrink-0", role.color)} />
                      <div>
                        <p className="text-sm font-medium">{t(`role_${role.key}`)}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {t(`roleDesc_${role.key}`)}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Quick chips */}
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  { key: "chipWeekSummary", msg: "이번 주 작업 요약해줘" },
                  { key: "chipProfitCompare", msg: "수익성 가장 좋은/나쁜 프로젝트 비교해줘" },
                  { key: "chipScopeRisk", msg: "스코프 크리프 위험이 있는 프로젝트 알려줘" },
                ].map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={() => sendMessage(chip.msg)}
                    disabled={isLoading}
                    className="rounded-full border border-border/60 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-foreground disabled:opacity-50"
                  >
                    {tChat(chip.key)}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-2xl space-y-4">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} role={msg.role} content={msg.content} />
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-orange/10">
                    <Sparkles className="size-4 text-brand-orange" />
                  </div>
                  <div className="rounded-2xl bg-muted px-4 py-3">
                    <div className="flex gap-1">
                      <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:0ms]" />
                      <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:150ms]" />
                      <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t bg-background px-4 py-3 md:px-6">
          <form
            onSubmit={handleSubmit}
            className="mx-auto flex max-w-2xl items-end gap-2"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={tChat("placeholder")}
              disabled={isLoading}
              rows={1}
              className="max-h-32 min-h-[44px] flex-1 resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className="size-11 shrink-0 rounded-xl bg-brand-orange hover:bg-brand-orange/90"
            >
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
