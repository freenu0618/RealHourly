"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AIChatPanel } from "./AIChatPanel";

export function AIChatWrapper() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Chat Button */}
      <Button
        onClick={() => setIsOpen(true)}
        size="icon"
        className={cn(
          "fixed bottom-6 right-6 z-40 size-14 rounded-full shadow-lg",
          "bg-primary text-primary-foreground hover:bg-primary/90",
          "transition-all duration-200 hover:scale-105",
          isOpen && "hidden md:flex",
        )}
        aria-label="AI Assistant"
      >
        <MessageCircle className="size-6" />
      </Button>

      {/* Chat Panel */}
      <AIChatPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
