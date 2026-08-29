"use client";

import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useChartMode } from "@/lib/hooks/use-chart-mode";
import { categorical, chartChrome } from "@/lib/utils/chart-colors";
import { formatPercent } from "@/lib/utils/format";
import type { HistoricalTrendRow } from "@/lib/api/types";
import { ChartTooltipShell, ChartTooltipRow } from "@/components/charts/chart-tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const METRICS = [
  "Net Profit Growth",
  "Operating Profit Growth",
  "Total Assets Growth",
  "Equity Growth",
  "Borrowings Growth",
  "Operating Cash Flow Growth",
] as const;

export function HistoricalTrendChart({ rows }: { rows: HistoricalTrendRow[] }) {
  const [metric, setMetric] = useState<(typeof METRICS)[number]>("Net Profit Growth");
  const mode = useChartMode();
  const chrome = chartChrome[mode];
  const line = categorical[mode][0];

  const data = useMemo(
    () =>
      rows
        .filter((r) => r.Year !== undefined && r[metric] !== undefined)
        .map((r) => ({ year: r.Year, value: r[metric] as number })),
    [rows, metric],
  );

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-[13px] text-ink-muted">Metric</p>
        <Select value={metric} onValueChange={(v) => setMetric(v as (typeof METRICS)[number])}>
          <SelectTrigger className="h-9 w-[220px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {METRICS.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {data.length === 0 ? (
        <p className="py-10 text-center text-[13px] text-ink-muted">No data for this metric.</p>
      ) : (
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 8, left: 4 }}>
              <defs>
                <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={line} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={line} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke={chrome.gridline} strokeDasharray="3 4" />
              <XAxis
                dataKey="year"
                tick={{ fill: chrome.mutedInk, fontSize: 11 }}
                axisLine={{ stroke: chrome.baseline }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: chrome.mutedInk, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={44}
                tickFormatter={(v: number) => `${v}%`}
              />
              <Tooltip
                cursor={{ stroke: chrome.baseline, strokeWidth: 1 }}
                content={({ active, payload, label }) => (
                  <ChartTooltipShell active={active} label={`FY ${label}`}>
                    <ChartTooltipRow swatch={line} label={metric} value={formatPercent(payload?.[0]?.value as number)} />
                  </ChartTooltipShell>
                )}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={line}
                strokeWidth={2}
                fill="url(#trendFill)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: chrome.surface }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
