"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatTile } from "@/components/common/stat-tile";
import { InflationTrajectoryChart } from "@/components/charts/inflation-trajectory-chart";
import { EnsembleBreakdownChart } from "@/components/charts/ensemble-breakdown-chart";
import { CausesDonutChart } from "@/components/charts/causes-donut-chart";
import { TrajectoryTable } from "@/components/forecast/trajectory-table";
import { formatPercent } from "@/lib/utils/format";
import type { ForecastResponse } from "@/lib/api/types";

export function ForecastResults({ data }: { data: ForecastResponse }) {
  const {
    inflation_forecast,
    trajectory,
    ensemble_breakdown_final_month,
    inflation_cause,
    inflation_regime,
    macro_summary,
  } = data;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-6"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile
          label="Final inflation prediction"
          value={formatPercent(inflation_forecast.final_inflation)}
          caption={`Range ${formatPercent(inflation_forecast.forecast_lower_bound)} – ${formatPercent(
            inflation_forecast.forecast_upper_bound,
          )} · ${inflation_forecast.final_target_month ?? "—"}`}
          tone="accent"
        />
        <StatTile
          label="Inflation regime"
          value={inflation_regime.class}
          caption={`Commodity pressure: ${macro_summary.commodity_pressure}`}
          delay={0.05}
        />
        <StatTile
          label="Regime classification"
          value={inflation_regime.class}
          caption="Rule-based classification, final month"
          delay={0.1}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Forecast trajectory</CardTitle>
          <CardDescription>
            Ensemble-predicted YoY inflation, month by month · {inflation_forecast.model_used}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InflationTrajectoryChart trajectory={trajectory} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Causes of inflation</CardTitle>
            <CardDescription>Demand-pull vs. cost-push breakdown, final month</CardDescription>
          </CardHeader>
          <CardContent>
            <CausesDonutChart cause={inflation_cause.relative_pressure} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ensemble breakdown</CardTitle>
            <CardDescription>Final-month prediction, per underlying model</CardDescription>
          </CardHeader>
          <CardContent>
            <EnsembleBreakdownChart breakdown={ensemble_breakdown_final_month} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Month-by-month detail</CardTitle>
          <CardDescription>Exact projected values across every macro input</CardDescription>
        </CardHeader>
        <CardContent>
          <TrajectoryTable trajectory={trajectory} />
        </CardContent>
      </Card>
    </motion.div>
  );
}
