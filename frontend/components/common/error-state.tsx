import { AlertTriangle, RefreshCw, WifiOff } from "lucide-react";
import { ApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
  className?: string;
}

function describe(error: unknown): { title: string; detail: string; network: boolean } {
  if (error instanceof ApiError) {
    if (error.kind === "network") {
      return { title: "Can't reach the backend", detail: error.detail, network: true };
    }
    if (error.status === 404) {
      return { title: "Not found", detail: error.detail, network: false };
    }
    return { title: `Backend error (${error.status || "—"})`, detail: error.detail, network: false };
  }
  if (error instanceof Error) {
    return { title: "Something went wrong", detail: error.message, network: false };
  }
  return { title: "Something went wrong", detail: "An unexpected error occurred.", network: false };
}

export function ErrorState({ error, onRetry, className }: ErrorStateProps) {
  const { title, detail, network } = describe(error);
  const Icon = network ? WifiOff : AlertTriangle;

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border border-[color-mix(in_oklab,var(--status-critical)_35%,var(--line))] bg-[color-mix(in_oklab,var(--status-critical)_7%,var(--surface-1))] px-6 py-10 text-center",
        className,
      )}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--status-critical)_16%,transparent)] text-critical">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm font-semibold text-ink-primary">{title}</p>
      <p className="max-w-md text-[13px] leading-relaxed text-ink-secondary">{detail}</p>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-1">
          <RefreshCw className="h-3.5 w-3.5" /> Try again
        </Button>
      ) : null}
    </div>
  );
}
