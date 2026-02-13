"use client";

import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { Bot, Copy, Check } from "lucide-react";
import { useState, useCallback } from "react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore
    }
  }, [text]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="absolute right-2 top-2 rounded-md bg-muted-foreground/10 p-1 opacity-0 transition-opacity hover:bg-muted-foreground/20 group-hover/code:opacity-100"
      aria-label="Copy code"
    >
      {copied ? (
        <Check className="size-3.5 text-emerald-500" />
      ) : (
        <Copy className="size-3.5 text-muted-foreground" />
      )}
    </button>
  );
}

export const ChatMessage = memo(function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === "user";
  const [messageCopied, setMessageCopied] = useState(false);

  const handleCopyMessage = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      setMessageCopied(true);
      setTimeout(() => setMessageCopied(false), 2000);
    } catch {
      // Ignore
    }
  }, [content]);

  return (
    <div
      className={cn("flex gap-2.5", isUser ? "flex-row-reverse" : "flex-row")}
    >
      {/* Avatar */}
      {!isUser && (
        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Bot className="size-4 text-primary" />
        </div>
      )}

      {/* Bubble with copy button */}
      <div className="group relative max-w-[80%]">
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground",
          )}
        >
          {isUser ? (
            // User messages: plain text
            content.split("\n").map((line, i) => (
              <span key={i}>
                {line}
                {i < content.split("\n").length - 1 && <br />}
              </span>
            ))
          ) : (
            // Assistant messages: full markdown rendering
            <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:mb-2 prose-headings:mt-3 prose-headings:text-base prose-headings:font-bold prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-pre:my-2 prose-pre:rounded-lg prose-pre:bg-foreground/5 prose-code:rounded prose-code:bg-foreground/10 prose-code:px-1 prose-code:py-0.5 prose-code:text-[13px] prose-code:before:content-none prose-code:after:content-none prose-strong:font-semibold prose-table:text-xs">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  pre({ children, ...props }) {
                    // Extract text from <code> child for copy button
                    let codeText = "";
                    if (
                      children &&
                      typeof children === "object" &&
                      "props" in (children as { props?: { children?: unknown } })
                    ) {
                      const el = children as { props?: { children?: unknown } };
                      codeText = String(el.props?.children ?? "");
                    }
                    return (
                      <div className="group/code relative">
                        <CopyButton text={codeText} />
                        <pre {...props}>{children}</pre>
                      </div>
                    );
                  },
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Message copy button - shows on hover */}
        <button
          type="button"
          onClick={handleCopyMessage}
          className="absolute -bottom-5 right-1 flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] text-muted-foreground opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
          aria-label="Copy message"
        >
          {messageCopied ? (
            <Check className="size-3" />
          ) : (
            <Copy className="size-3" />
          )}
          <span>{messageCopied ? "Copied" : "Copy"}</span>
        </button>
      </div>
    </div>
  );
});
