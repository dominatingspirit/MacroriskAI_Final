"use client";

import type { ReactNode } from "react";
import { useChartMode } from "@/lib/hooks/use-chart-mode";
import { chartChrome } from "@/lib/utils/chart-colors";

interface ChartTooltipShellProps {
  active?: boolean;
  label?: ReactNode;
  children?: ReactNode;
}

/** Consistent tooltip chrome for every Recharts chart in the app. */
export function ChartTooltipShell({ active, label, children }: ChartTooltipShellProps) {
  const mode = useChartMode();
  const chrome = chartChrome[mode];

  if (!active) return null;

  return (
    <div
      className="rounded-[10px] border px-3.5 py-2.5 text-[12px] shadow-[var(--shadow-pop)]"
      style={{ background: chrome.surface, borderColor: chrome.gridline, color: chrome.primaryInk }}
    >
      {label ? (
        <p className="mb-1.5 font-semibold" style={{ color: chrome.primaryInk }}>
          {label}
        </p>
      ) : null}
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}

export function ChartTooltipRow({ swatch, label, value }: { swatch?: string; label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="flex items-center gap-1.5 text-ink-secondary">
        {swatch ? (
          <span className="h-2 w-2 rounded-full" style={{ background: swatch }} />
        ) : null}
        {label}
      </span>
      <span className="font-medium tabular-nums text-ink-primary">{value}</span>
    </div>
  );
}
