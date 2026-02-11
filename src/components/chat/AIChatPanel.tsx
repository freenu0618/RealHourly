"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { X, Send, Loader2, Bot } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChatMessage } from "./ChatMessage";
import { QuickActionChips } from "./QuickActionChips";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface AIChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

let messageId = 0;
function nextId() {
  return `msg-${++messageId}`;
}

export function AIChatPanel({ isOpen, onClose }: AIChatPanelProps) {
  const t = useTranslations("chat");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Escape to close
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMsg: Message = { id: nextId(), role: "user", content: text.trim() };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsLoading(true);

      try {
        const history = [...messages, userMsg]
          .slice(-20)
          .map((m) => ({ role: m.role, content: m.content }));

        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text.trim(),
            conversationHistory: history.slice(0, -1), // exclude current user msg
          }),
        });

        if (res.status === 429) {
          toast.error(t("rateLimited"));
          return;
        }

        if (!res.ok) throw new Error("API error");

        const json = await res.json();
        const assistantMsg: Message = {
          id: nextId(),
          role: "assistant",
          content: json.data.reply,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch {
        toast.error(t("errorMessage"));
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages, t],
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  return (
    <>
      {/* Backdrop (mobile only) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full flex-col border-l border-border bg-background shadow-xl transition-transform duration-300 md:w-[400px]",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-full bg-primary/10">
              <Bot className="size-4 text-primary" />
            </div>
            <h2 className="text-sm font-semibold">{t("title")}</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 rounded-lg"
            onClick={onClose}
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center gap-3 pt-12 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                <Bot className="size-6 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                {t("emptyState")}
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <ChatMessage key={msg.id} role={msg.role} content={msg.content} />
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex items-center gap-2.5">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Bot className="size-4 text-primary" />
              </div>
              <div className="rounded-2xl bg-muted px-3.5 py-2.5">
                <div className="flex gap-1">
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:0ms]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:150ms]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="border-t border-border/50 px-4 pt-2">
          <QuickActionChips onSelect={sendMessage} disabled={isLoading} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex gap-2 p-4 pt-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("placeholder")}
            disabled={isLoading}
            className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none disabled:opacity-50"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading}
            className="size-9 shrink-0 rounded-xl"
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </form>
      </div>
    </>
  );
}
