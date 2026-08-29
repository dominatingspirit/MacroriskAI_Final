"use client";

import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useChartMode } from "@/lib/hooks/use-chart-mode";
import { chartChrome, diverging } from "@/lib/utils/chart-colors";
import { formatSignedPercent } from "@/lib/utils/format";
import type { MacroImpacts } from "@/lib/api/types";
import { ChartTooltipShell, ChartTooltipRow } from "./chart-tooltip";

/** Polarity, not identity — a diverging blue/red pair around a zero baseline, not categorical hues. */
export function ForecastImpactChart({ impacts }: { impacts: MacroImpacts }) {
  const mode = useChartMode();
  const chrome = chartChrome[mode];
  const pair = diverging[mode];

  const data = Object.entries(impacts)
    .map(([metric, value]) => ({ metric, value }))
    .sort((a, b) => b.value - a.value);

  if (data.length === 0) return null;

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 40, bottom: 0, left: 0 }} barCategoryGap={8}>
          <CartesianGrid horizontal={false} stroke={chrome.gridline} strokeDasharray="3 4" />
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="metric"
            tick={{ fill: chrome.secondaryInk, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={150}
          />
          <ReferenceLine x={0} stroke={chrome.baseline} />
          <Tooltip
            cursor={{ fill: chrome.gridline, opacity: 0.4 }}
            content={({ active, payload }) => (
              <ChartTooltipShell active={active} label={payload?.[0]?.payload?.metric}>
                <ChartTooltipRow
                  swatch={(payload?.[0]?.value as number) >= 0 ? pair.positive : pair.negative}
                  label="Macro impact"
                  value={formatSignedPercent(payload?.[0]?.value as number)}
                />
              </ChartTooltipShell>
            )}
          />
          <Bar dataKey="value" radius={4} maxBarSize={18}>
            {data.map((entry) => (
              <Cell key={entry.metric} fill={entry.value >= 0 ? pair.positive : pair.negative} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
