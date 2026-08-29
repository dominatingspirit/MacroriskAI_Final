"use client";

import { useMutation } from "@tanstack/react-query";
import { postChat } from "@/lib/api/endpoints";
import type { ChatRequest } from "@/lib/api/types";

export function useChat() {
  return useMutation({
    mutationFn: (req: ChatRequest) => postChat(req),
  });
}
