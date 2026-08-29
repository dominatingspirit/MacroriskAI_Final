"use client";

import { useHealthCheck } from "@/lib/hooks/use-market-data";
import { cn } from "@/lib/utils/cn";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getApiBaseUrl } from "@/lib/api/client";

export function ConnectionStatus() {
  const { isSuccess, isError, isPending } = useHealthCheck();

  const state = isPending ? "checking" : isSuccess ? "online" : isError ? "offline" : "checking";

  const label = state === "online" ? "Backend online" : state === "offline" ? "Backend unreachable" : "Checking…";

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 rounded-[var(--radius-pill)] border border-line bg-surface-2/70 px-3 py-1.5 text-xs font-medium text-ink-secondary">
            <span className="relative flex h-2 w-2">
              {state === "online" && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-good opacity-60" />
              )}
              <span
                className={cn(
                  "relative inline-flex h-2 w-2 rounded-full",
                  state === "online" && "bg-good",
                  state === "offline" && "bg-critical",
                  state === "checking" && "bg-[var(--status-warning)]",
                )}
              />
            </span>
            <span className="hidden sm:inline">{label}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {getApiBaseUrl()} — {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
