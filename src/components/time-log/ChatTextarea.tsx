"use client";

import { useRef, useCallback, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";

interface ChatTextareaProps {
  value: string;
  onChange: (value: string) => void;
  onParse: () => void;
  placeholder: string;
  disabled?: boolean;
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
}

export function ChatTextarea({
  value,
  onChange,
  onParse,
  placeholder,
  disabled,
  textareaRef,
}: ChatTextareaProps) {
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const ref = textareaRef ?? internalRef;

  const autoResize = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(el.scrollHeight, 80)}px`;
  }, [ref]);

  useEffect(() => {
    autoResize();
  }, [value, autoResize]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      onParse();
    }
  }

  return (
    <Textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      disabled={disabled}
      className="min-h-[80px] resize-none text-base"
    />
  );
}
