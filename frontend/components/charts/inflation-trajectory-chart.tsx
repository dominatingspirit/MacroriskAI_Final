"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useChartMode } from "@/lib/hooks/use-chart-mode";
import { categorical, chartChrome } from "@/lib/utils/chart-colors";
import { formatMonth, formatPercent } from "@/lib/utils/format";
import type { TrajectoryPoint } from "@/lib/api/types";
import { ChartTooltipShell, ChartTooltipRow } from "./chart-tooltip";

export function InflationTrajectoryChart({ trajectory }: { trajectory: TrajectoryPoint[] }) {
  const mode = useChartMode();
  const chrome = chartChrome[mode];
  const line = categorical[mode][0];

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={trajectory} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
          <defs>
            <linearGradient id="inflationFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={line} stopOpacity={0.28} />
              <stop offset="100%" stopColor={line} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={chrome.gridline} strokeDasharray="3 4" />
          <XAxis
            dataKey="date"
            tickFormatter={(v: string) => formatMonth(v)}
            tick={{ fill: chrome.mutedInk, fontSize: 11 }}
            axisLine={{ stroke: chrome.baseline }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: chrome.mutedInk, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={40}
            tickFormatter={(v: number) => `${v}%`}
          />
          <Tooltip
            cursor={{ stroke: chrome.baseline, strokeWidth: 1 }}
            content={({ active, payload, label }) => (
              <ChartTooltipShell active={active} label={formatMonth(label as string)}>
                <ChartTooltipRow
                  swatch={line}
                  label="Inflation (YoY)"
                  value={formatPercent(payload?.[0]?.value as number)}
                />
              </ChartTooltipShell>
            )}
          />
          <Area
            type="monotone"
            dataKey="inflation_forecast"
            stroke={line}
            strokeWidth={2}
            fill="url(#inflationFill)"
            activeDot={{ r: 4, strokeWidth: 2, stroke: chrome.surface }}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
