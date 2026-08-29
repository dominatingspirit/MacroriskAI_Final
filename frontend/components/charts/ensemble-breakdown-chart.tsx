"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useChartMode } from "@/lib/hooks/use-chart-mode";
import { categorical, chartChrome } from "@/lib/utils/chart-colors";
import { formatPercent } from "@/lib/utils/format";
import type { EnsembleBreakdown } from "@/lib/api/types";
import { ChartTooltipShell, ChartTooltipRow } from "./chart-tooltip";

/** Fixed entity -> color-slot assignment, independent of value ranking. */
const MODEL_ORDER = ["XGBoost", "LightGBM", "ARIMAX", "VAR"] as const;

/** Display-only relabeling — the wire key stays "ARIMAX", but the model is seasonal, so the UI calls it SARIMAX. */
const MODEL_LABELS: Record<(typeof MODEL_ORDER)[number], string> = {
  XGBoost: "XGBoost",
  LightGBM: "LightGBM",
  ARIMAX: "SARIMAX",
  VAR: "VAR",
};

export function EnsembleBreakdownChart({ breakdown }: { breakdown: EnsembleBreakdown }) {
  const mode = useChartMode();
  const chrome = chartChrome[mode];
  const palette = categorical[mode];

  const data = MODEL_ORDER.filter((m) => breakdown[m] !== undefined).map((model) => ({
    model: MODEL_LABELS[model],
    value: breakdown[model] as number,
    color: palette[MODEL_ORDER.indexOf(model)],
  }));

  if (data.length === 0) return null;

  return (
    <div className="h-[180px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 28, bottom: 0, left: 0 }} barCategoryGap={10}>
          <CartesianGrid horizontal={false} stroke={chrome.gridline} strokeDasharray="3 4" />
          <XAxis type="number" hide domain={[0, (max: number) => max * 1.25]} />
          <YAxis
            type="category"
            dataKey="model"
            tick={{ fill: chrome.secondaryInk, fontSize: 12, fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
            width={68}
          />
          <Tooltip
            cursor={{ fill: chrome.gridline, opacity: 0.4 }}
            content={({ active, payload }) => (
              <ChartTooltipShell active={active} label={payload?.[0]?.payload?.model}>
                <ChartTooltipRow
                  swatch={payload?.[0]?.payload?.color}
                  label="Final-month inflation"
                  value={formatPercent(payload?.[0]?.value as number)}
                />
              </ChartTooltipShell>
            )}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={22}>
            {data.map((entry) => (
              <Cell key={entry.model} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
