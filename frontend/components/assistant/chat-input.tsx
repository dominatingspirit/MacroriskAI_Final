"use client";

import { useState, type KeyboardEvent } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ChatInput({ onSend, disabled }: { onSend: (value: string) => void; disabled?: boolean }) {
  const [value, setValue] = useState("");

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="flex items-end gap-2 border-t border-line bg-surface-1 p-4">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
        placeholder="Ask about inflation impacts, a specific company, or macro theory…"
        className="max-h-32 min-h-[44px] flex-1 resize-none rounded-[var(--radius-md)] border border-line-strong bg-surface-2/50 px-4 py-2.5 text-[13.5px] text-ink-primary placeholder:text-ink-muted outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/25"
      />
      <Button
        variant="accent"
        size="icon"
        className="h-11 w-11 shrink-0 rounded-full"
        onClick={submit}
        disabled={disabled || !value.trim()}
        aria-label="Send message"
      >
        <ArrowUp className="h-4 w-4" />
      </Button>
    </div>
  );
}
