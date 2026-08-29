"use client";

import { MessageSquare, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export interface ChatThread {
  id: string;
  title: string;
  timestamp: string;
}

interface ChatHistorySidebarProps {
  threads: ChatThread[];
  activeThreadId: string;
  onSelectThread: (id: string) => void;
  onNewChat: () => void;
  onDeleteThread: (id: string) => void;
}

export function ChatHistorySidebar({
  threads,
  activeThreadId,
  onSelectThread,
  onNewChat,
  onDeleteThread,
}: ChatHistorySidebarProps) {
  return (
    <Card className="w-64 border-r border-line bg-surface-1/60 p-4 flex flex-col h-full rounded-none">
      <div className="flex items-center justify-between pb-3 border-b border-line mb-3">
        <span className="text-xs font-mono uppercase tracking-wider text-ink-muted font-semibold">Saved Sessions</span>
        <Button size="sm" variant="outline" onClick={onNewChat} className="h-7 px-2 text-xs gap-1">
          <Plus className="h-3.5 w-3.5" /> New Chat
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
        {threads.length === 0 ? (
          <p className="text-xs text-ink-muted text-center py-6">No past chats yet.</p>
        ) : (
          threads.map((thread) => (
            <div
              key={thread.id}
              onClick={() => onSelectThread(thread.id)}
              className={`group flex items-center justify-between p-2.5 rounded-lg text-xs cursor-pointer transition-colors ${
                activeThreadId === thread.id
                  ? "bg-surface-2 text-ink-primary font-medium border border-line"
                  : "text-ink-secondary hover:bg-surface-2/50 hover:text-ink-primary"
              }`}
            >
              <div className="flex items-center gap-2 truncate pr-2">
                <MessageSquare className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">{thread.title}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteThread(thread.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-ink-muted hover:text-red-400 transition-opacity"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}