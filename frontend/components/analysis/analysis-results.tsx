"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatTile } from "@/components/common/stat-tile";
import { ForecastImpactChart } from "@/components/charts/forecast-impact-chart";
import { InvestmentReportPanel } from "@/components/analysis/investment-report-panel";
import { RawStateDrawer } from "@/components/analysis/raw-state-drawer";
import { formatCurrency, formatPercent, formatSignedPercent } from "@/lib/utils/format";
import type { AnalyzeCompanyResponse } from "@/lib/api/types";

export function AnalysisResults({ data }: { data: AnalyzeCompanyResponse }) {
  const metrics = Object.keys(data.financial_forecasts);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Analysis for</p>
          <h2 className="text-2xl font-semibold tracking-tight text-ink-primary">{data.company.toUpperCase()}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="accent">{data.forecast_horizon_months}-month horizon</Badge>
          <RawStateDrawer data={data} />
        </div>
      </div>

      <div>
        <p className="mb-3 text-[13px] font-semibold text-ink-secondary">Inflation Outlook Agent — macro assumptions applied</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile label="Projected inflation" value={formatPercent(data.macro_assumptions_used.projected_inflation)} tone="accent" />
          <StatTile
            label="Projected repo rate"
            value={formatPercent(data.macro_assumptions_used.projected_repo_rate)}
            delay={0.05}
          />
          <StatTile
            label="Projected Brent oil"
            value={formatCurrency(data.macro_assumptions_used.projected_brent_oil)}
            delay={0.1}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Agent 3 — financial forecasts</CardTitle>
            <CardDescription>Projected growth % under the macro scenario above</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col divide-y divide-line">
              {metrics.length === 0 ? (
                <p className="py-6 text-center text-[13px] text-ink-muted">No forecasts returned.</p>
              ) : (
                metrics.map((metric) => {
                  const value = data.financial_forecasts[metric];
                  const impact = data.macro_impacts?.[metric];
                  return (
                    <div key={metric} className="flex items-center justify-between gap-4 py-3">
                      <div>
                        <p className="text-[13px] font-medium text-ink-primary">{metric}</p>
                        {impact !== undefined ? (
                          <p className="text-[12px] text-ink-muted">
                            Macro impact:{" "}
                            <span className={impact >= 0 ? "text-good" : "text-critical"}>
                              {formatSignedPercent(impact)}
                            </span>
                          </p>
                        ) : null}
                      </div>
                      <span className={`tabular-nums text-[17px] font-semibold ${value >= 0 ? "text-good" : "text-critical"}`}>
                        {formatSignedPercent(value)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Isolated macro impact</CardTitle>
            <CardDescription>Forecast minus a frozen-economy baseline, per metric</CardDescription>
          </CardHeader>
          <CardContent>
            <ForecastImpactChart impacts={data.macro_impacts} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agent 4 — investment report</CardTitle>
          <CardDescription>AI-authored, grounded in the numbers above</CardDescription>
        </CardHeader>
        <CardContent>
          <InvestmentReportPanel report={data.investment_report} />
        </CardContent>
      </Card>
    </motion.div>
  );
}
