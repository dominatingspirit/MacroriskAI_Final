"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface ChatMessageData {
  id: string;
  role: "user" | "assistant" | "error";
  content: string;
}

export function ChatMessage({ message }: { message: ChatMessageData }) {
  const isUser = message.role === "user";
  const isError = message.role === "error";

  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold",
          isUser ? "bg-ink-primary text-surface-0" : isError ? "bg-critical/15 text-critical" : "bg-accent text-white",
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div
        className={cn(
          "max-w-[82%] rounded-[var(--radius-lg)] border px-4 py-3 text-[13.5px] leading-relaxed",
          isUser && "rounded-tr-sm border-transparent bg-ink-primary text-surface-0",
          !isUser && !isError && "rounded-tl-sm border-line bg-surface-1 text-ink-secondary shadow-[var(--shadow-card)]",
          isError && "rounded-tl-sm border-critical/30 bg-critical/5 text-critical",
        )}
      >
        {isUser || isError ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="markdown-chat [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-semibold [&_strong]:text-ink-primary [&_table]:my-2 [&_table]:w-full [&_table]:border-collapse [&_table]:text-[12.5px] [&_th]:border-b [&_th]:border-line [&_th]:bg-surface-2 [&_th]:px-2.5 [&_th]:py-1.5 [&_th]:text-left [&_td]:border-b [&_td]:border-line [&_td]:px-2.5 [&_td]:py-1.5 [&_code]:rounded [&_code]:bg-surface-2 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[12px]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
