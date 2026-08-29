"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useChartMode } from "@/lib/hooks/use-chart-mode";
import { categorical, chartChrome } from "@/lib/utils/chart-colors";
import type { InflationCauseClass } from "@/lib/api/types";
import { ChartTooltipShell, ChartTooltipRow } from "./chart-tooltip";

/** Agent 1 scores exactly these two mutually-exclusive causes; values always sum to 100. */
const CAUSE_ORDER: InflationCauseClass[] = ["Demand Pull", "Cost Push"];

export function CausesDonutChart({ cause }: { cause: Record<InflationCauseClass, number> }) {
  const mode = useChartMode();
  const chrome = chartChrome[mode];
  const palette = categorical[mode];

  const data = CAUSE_ORDER.map((label, i) => ({
    label,
    value: cause?.[label] ?? 0,
    // Offset from the regime chart's palette slots so the two donuts never share a color.
    color: palette[(i + 2) % palette.length],
  }));

  const leading = data.reduce((a, b) => (b.value > a.value ? b : a), data[0]);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative mx-auto h-[168px] w-[168px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius={54}
              outerRadius={80}
              paddingAngle={2}
              cornerRadius={4}
              stroke={chrome.surface}
              strokeWidth={2}
            >
              {data.map((entry) => (
                <Cell key={entry.label} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => (
                <ChartTooltipShell active={active} label={payload?.[0]?.name as string}>
                  <ChartTooltipRow
                    swatch={payload?.[0]?.payload?.color}
                    label="Probability"
                    value={`${payload?.[0]?.value}%`}
                  />
                </ChartTooltipShell>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[11px] font-medium uppercase tracking-wide text-ink-muted">Leading</span>
          <span className="text-center text-[13px] font-semibold leading-tight text-ink-primary">
            {leading.label}
          </span>
        </div>
      </div>

      <ul className="flex flex-1 flex-col gap-2.5">
        {data.map((entry) => (
          <li key={entry.label} className="flex items-center justify-between gap-3 text-[13px]">
            <span className="flex items-center gap-2 text-ink-secondary">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: entry.color }} />
              {entry.label}
            </span>
            <span className="tabular-nums font-semibold text-ink-primary">{entry.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
