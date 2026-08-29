"use client";

import { useEffect, useRef, useState } from "react";
import { Link2, Link2Off } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChatMessage, type ChatMessageData } from "@/components/assistant/chat-message";
import { ChatInput } from "@/components/assistant/chat-input";
import { TypingBubble } from "@/components/assistant/typing-bubble";
import { useChat } from "@/lib/hooks/use-chat";
import { useAnalysisContext } from "@/lib/providers/analysis-context";
import { ChatHistorySidebar, type ChatThread } from "@/components/assistant/chat-history-sidebar";

const WELCOME: ChatMessageData = {
  id: "welcome",
  role: "assistant",
  content:
    "Hello Krishna! I'm trained on the macro-financial research corpus and vector store. If you've run **Full Analysis** on a company, I also have access to that run's forecasts and statements — ask away.",
};

export default function AssistantPage() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string>("default-thread");
  const [sessionMessages, setSessionMessages] = useState<Record<string, ChatMessageData[]>>({
    "default-thread": [WELCOME],
  });

  const messages = sessionMessages[activeThreadId] || [WELCOME];
  const chat = useChat();
  const { lastAnalysis } = useAnalysisContext();
  const viewportRef = useRef<HTMLDivElement>(null);

  // Load saved threads from localStorage on mount
  useEffect(() => {
    const savedThreads = localStorage.getItem("macrorisk_chat_threads");
    const savedMessages = localStorage.getItem("macrorisk_chat_messages");
    if (savedThreads) setThreads(JSON.parse(savedThreads));
    if (savedMessages) setSessionMessages(JSON.parse(savedMessages));
  }, []);

  // Save threads to localStorage when updated
  useEffect(() => {
    if (threads.length > 0) {
      localStorage.setItem("macrorisk_chat_threads", JSON.stringify(threads));
      localStorage.setItem("macrorisk_chat_messages", JSON.stringify(sessionMessages));
    }
  }, [threads, sessionMessages]);

  useEffect(() => {
    viewportRef.current?.scrollTo({ top: viewportRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, chat.isPending]);

  function handleNewChat() {
    const newId = crypto.randomUUID();
    const newThread: ChatThread = {
      id: newId,
      title: "New Macro Session",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setThreads((prev) => [newThread, ...prev]);
    setSessionMessages((prev) => ({ ...prev, [newId]: [WELCOME] }));
    setActiveThreadId(newId);
  }

  function handleDeleteThread(id: string) {
    const remainingThreads = threads.filter((t) => t.id !== id);
    setThreads(remainingThreads);
    if (activeThreadId === id && remainingThreads.length > 0) {
      setActiveThreadId(remainingThreads[0].id);
    } else if (remainingThreads.length === 0) {
      setActiveThreadId("default-thread");
      setSessionMessages({ "default-thread": [WELCOME] });
    }
  }

  function handleSend(query: string) {
    const userMessage: ChatMessageData = { id: crypto.randomUUID(), role: "user", content: query };
    
    // Clean up query for a neat title (e.g., capitalize first letter, limit length)
    const cleanedTitle = query.trim().charAt(0).toUpperCase() + query.trim().slice(1);
    const shortTitle = cleanedTitle.length > 25 ? cleanedTitle.slice(0, 25) + "..." : cleanedTitle;

    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeThreadId && t.title === "New Macro Session"
          ? { ...t, title: shortTitle }
          : t
      )
    );

    const updatedMessages = [...messages, userMessage];
    setSessionMessages((prev) => ({ ...prev, [activeThreadId]: updatedMessages }));

    const chatHistoryPayload = updatedMessages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role, content: m.content }));

    chat.mutate(
      { query, chat_history: chatHistoryPayload, context: lastAnalysis },
      {
        onSuccess: (data) => {
          const assistantMessage: ChatMessageData = { id: crypto.randomUUID(), role: "assistant", content: data.answer };
          setSessionMessages((prev) => ({
            ...prev,
            [activeThreadId]: [...(prev[activeThreadId] || []), assistantMessage],
          }));
        },
        onError: (error) => {
          const errorMessage: ChatMessageData = {
            id: crypto.randomUUID(),
            role: "error",
            content: error instanceof Error ? error.message : "Something went wrong reaching the assistant.",
          };
          setSessionMessages((prev) => ({
            ...prev,
            [activeThreadId]: [...(prev[activeThreadId] || []), errorMessage],
          }));
        },
      }
    );
  }

  return (
    <div className="flex h-[calc(100vh-8.5rem)] flex-col">
      <PageHeader
        eyebrow="RAG"
        title="Financial Knowledge Assistant"
        description="Conversational memory with persistent browser-backed session storage.
        It's a RAG powered by a knowledge database containing many research papers related to inflation and monetary policies"
        actions={
          lastAnalysis ? (
            <Badge variant="accent">
              <Link2 className="h-3 w-3" /> Grounded in {lastAnalysis.company.toUpperCase()}
            </Badge>
          ) : (
            <Badge variant="neutral">
              <Link2Off className="h-3 w-3" /> No pipeline context attached
            </Badge>
          )
        }
      />

      <div className="flex flex-1 min-h-0 border border-line rounded-xl overflow-hidden bg-surface-1/40">
        {/* Sidebar for History Threads */}
        <ChatHistorySidebar
          threads={threads}
          activeThreadId={activeThreadId}
          onSelectThread={setActiveThreadId}
          onNewChat={handleNewChat}
          onDeleteThread={handleDeleteThread}
        />

        {/* Main Chat Window */}
        <Card className="flex flex-1 flex-col overflow-hidden p-0 border-0 rounded-none bg-transparent">
          <div ref={viewportRef} className="flex-1 overflow-y-auto">
            <div className="flex flex-col gap-5 p-6">
              {messages.map((m) => (
                <ChatMessage key={m.id} message={m} />
              ))}
              {chat.isPending && <TypingBubble />}
            </div>
          </div>
          <ChatInput onSend={handleSend} disabled={chat.isPending} />
        </Card>
      </div>
    </div>
  );
}
