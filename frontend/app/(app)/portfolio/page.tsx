"use client";

import { useMemo, useRef, useState } from "react";
import { useLeaderboard } from "@/lib/hooks/use-leaderboard";
import {
  useComparePortfolios, useStressTestPortfolio, useUploadPortfolio,
} from "@/lib/hooks/use-portfolio";
import type { PortfolioHolding } from "@/lib/api/types";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

function scoreBadgeVariant(score: number) {
  if (score >= 66) return "default";
  if (score >= 33) return "secondary";
  return "destructive";
}

// Color palettes for charts
const PIE_COLORS = ["#10b981", "#34d399", "#059669", "#6ee7b7", "#047857", "#a7f3d0", "#064e3b"];
const SECTOR_COLORS = ["#3b82f6", "#10b981", "#eab308", "#047857", "#14b8a6", "#f59e0b", "#6366f1"];
const BAR_COLORS = [
  "bg-emerald-500", "bg-blue-500", "bg-indigo-500", "bg-violet-500", 
  "bg-amber-500", "bg-rose-500", "bg-cyan-500", "bg-teal-500"
];

function PortfolioPieChart({ pieData }: { pieData: { name: string; value: number }[] }) {
  if (!pieData || pieData.length === 0) return null;

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={75}
            paddingAngle={4}
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [`${value}%`, "Allocation"]}
            contentStyle={{
              backgroundColor: "#111827",
              border: "1px solid #10b981",
              borderRadius: 8,
              fontSize: 12,
            }}
            itemStyle={{ color: "#34d399", fontWeight: "bold" }}
          />
          <Legend 
            wrapperStyle={{ fontSize: "11px" }}
            formatter={(value) => <span className="text-ink-secondary">{value}</span>} 
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function SectorPieChart({ data }: { data: { name: string; value: number }[] }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="h-56 w-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={75}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={SECTOR_COLORS[index % SECTOR_COLORS.length]} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [`${value}%`, "Exposure"]}
            contentStyle={{
              backgroundColor: "#111827",
              border: "1px solid #10b981",
              borderRadius: 8,
              fontSize: 12,
            }}
            itemStyle={{ color: "#eab308", fontWeight: "bold" }}
          />
          <Legend 
            wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
            formatter={(value, entry: any) => (
              <span className="text-ink-secondary">
                {value} <span className="font-mono text-ink-muted ml-1">{entry.payload.value}%</span>
              </span>
            )} 
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function PortfolioWeightBar({ holdings }: { holdings: { Company?: string; name?: string; weight: number }[] }) {
  if (!holdings || holdings.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-surface-2 p-0.5 border border-line">
        {holdings.map((h, i) => {
          const weight = h.weight || 0;
          if (weight <= 0) return null;
          return (
            <div
              key={i}
              className={`h-full transition-all duration-300 ${BAR_COLORS[i % BAR_COLORS.length]}`}
              style={{ width: `${weight}%` }}
              title={`${h.Company || h.name}: ${weight}%`}
            />
          );
        })}
      </div>
      <div className="flex flex-wrap gap-2 pt-1">
        {holdings.map((h, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs text-ink-muted">
            <span className={`h-2 w-2 rounded-full ${BAR_COLORS[i % BAR_COLORS.length]}`} />
            <span className="font-medium text-ink-primary">{h.Company || h.name}</span>
            <span>({h.weight}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PortfolioBuilder({
  label,
  holdings,
  setHoldings,
  companyNames,
}: {
  label: string;
  holdings: PortfolioHolding[];
  setHoldings: (h: PortfolioHolding[]) => void;
  companyNames: string[];
}) {
  const totalWeight = holdings.reduce((sum, h) => sum + (h.weight || 0), 0);
  const isValid = Math.abs(totalWeight - 100) < 0.5 && holdings.length > 0;

  function addRow() {
    setHoldings([...holdings, { name: "", weight: 0 }]);
  }
  function updateRow(i: number, patch: Partial<PortfolioHolding>) {
    setHoldings(holdings.map((h, idx) => (idx === i ? { ...h, ...patch } : h)));
  }
  function removeRow(i: number) {
    setHoldings(holdings.filter((_, idx) => idx !== i));
  }

  return (
    <Card className="space-y-4 p-5 border-line/80 bg-surface-1/50 backdrop-blur-sm shadow-lg">
      <div className="flex items-center justify-between border-b border-line pb-3">
        <div>
          <h3 className="font-bold text-ink-primary text-base">{label}</h3>
          <p className="text-xs text-ink-muted">Allocate your asset weights (Target: 100%)</p>
        </div>
        <Badge variant={isValid ? "default" : "destructive"} className="px-2.5 py-1">
          {totalWeight.toFixed(1)}% / 100%
        </Badge>
      </div>

      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
        {holdings.map((h, i) => (
          <div key={i} className="flex items-center gap-2 bg-surface-2/40 p-2 rounded-lg border border-line/50">
            <Select value={h.name} onValueChange={(v) => updateRow(i, { name: v })}>
              <SelectTrigger className="flex-1 bg-surface-1">
                <SelectValue placeholder="Select company" />
              </SelectTrigger>
              <SelectContent>
                {companyNames.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              min={0}
              max={100}
              value={h.weight}
              onChange={(e) => updateRow(i, { weight: Number(e.target.value) })}
              className="w-20 bg-surface-1 text-center font-semibold"
            />
            <span className="text-xs text-ink-muted">%</span>
            <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => removeRow(i)}>
              ✕
            </Button>
          </div>
        ))}
      </div>

      <Button size="sm" variant="outline" onClick={addRow} className="w-full border-dashed border-line hover:border-ink-muted text-emerald-500 hover:text-emerald-400">
        + Add company holding
      </Button>
    </Card>
  );
}

export default function PortfolioPage() {
  const { data: leaderboard, isLoading: leaderboardLoading } = useLeaderboard(3);
  const companyNames = useMemo(() => leaderboard?.map((r) => r.Company) ?? [], [leaderboard]);

  const [portfolioA, setPortfolioA] = useState<PortfolioHolding[]>([]);
  const [portfolioB, setPortfolioB] = useState<PortfolioHolding[]>([]);
  const compare = useComparePortfolios();

  const [inflation, setInflation] = useState(7.0);
  const stressTest = useStressTestPortfolio();

  const upload = useUploadPortfolio();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aWeight = portfolioA.reduce((sum, h) => sum + (h.weight || 0), 0);
  const bWeight = portfolioB.reduce((sum, h) => sum + (h.weight || 0), 0);
  const canCompare =
    Math.abs(aWeight - 100) < 0.5 && Math.abs(bWeight - 100) < 0.5 &&
    portfolioA.length > 0 && portfolioB.length > 0;

  function handleCompare() {
    compare.mutate({ portfolio_a: portfolioA, portfolio_b: portfolioB, months_ahead: 3 });
  }
  
  const [stressTarget, setStressTarget] = useState<"A" | "B">("A");
  
  function handleStressTest() {
    const companies = stressTarget === "A" ? portfolioA : portfolioB;
    if (companies.length === 0) {
      alert(`Portfolio Model ${stressTarget} is empty! Please add companies to it first.`);
      return;
    }
    stressTest.mutate({
      companies,
      override_inflation: inflation,
    });
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) upload.mutate({ file, monthsAhead: 3 });
  }

  if (leaderboardLoading) {
    return <Skeleton className="h-64 w-full rounded-md" />;
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-line pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-ink-primary">Portfolio Lab Pro</h1>
        <p className="text-sm text-ink-muted mt-1">
          Build multi-asset models, analyze visual allocations, benchmark portfolio resilience head-to-head, or ingest institutional CSV statements.
        </p>
      </div>

      {/* CSV Upload Section */}
      <Card className="p-6 border-line/80 bg-gradient-to-br from-surface-1 to-surface-2/40 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-ink-primary text-base">Instant CSV Portfolio Ingestion</h3>
              <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">AI-Powered Parser</Badge>
            </div>
            <p className="text-xs text-ink-muted max-w-xl">
              Upload any standard brokerage format (Groww, Zerodha, Excel export). Our agent automatically normalizes tickers, weights, and maps holdings to live risk data.
            </p>
          </div>
          <Button 
            onClick={() => fileInputRef.current?.click()} 
            disabled={upload.isPending}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-lg shadow-emerald-900/20"
          >
            {upload.isPending ? "Parsing & Analyzing…" : "📁 Upload Portfolio CSV"}
          </Button>
          <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileSelect} />
        </div>

        {upload.isError && <p className="text-sm text-red-400 mt-3 bg-red-500/10 p-3 rounded-lg border border-red-500/20">{upload.error.message}</p>}

        {upload.data && (
          <div className="space-y-5 pt-5 mt-5 border-t border-line/60 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Computed Grade</span>
                <h4 className="text-lg font-bold text-ink-primary">Weighted Resilience Score</h4>
              </div>
              <Badge variant={scoreBadgeVariant(upload.data.weighted_resilience_score)} className="text-lg px-4 py-1.5 font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {upload.data.weighted_resilience_score} / 100
              </Badge>
            </div>

            {/* Grid 1: Visual Weight Bar & Allocation Pie Chart */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 bg-surface-2/60 p-4 rounded-xl border border-line">
                <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Portfolio Visual Allocation Chart</span>
                <PortfolioWeightBar holdings={upload.data.holdings} />
              </div>
              
              <div className="bg-surface-2/60 p-4 rounded-xl border border-line flex flex-col justify-center">
                <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted mb-2">Allocation Distribution</span>
                <PortfolioPieChart pieData={upload.data.holdings.map((h: any) => ({ name: h.Company, value: h.weight }))} />
              </div>
            </div>

            {/* Grid 2: AI Insights & Sector Exposure Pie Chart */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-line bg-surface-2/40 p-4 text-sm text-ink-secondary space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">AI Holdings Insight</p>
                <p className="leading-relaxed">{upload.data.ai_insights}</p>
              </div>

              <div className="rounded-xl border border-line bg-surface-2/40 p-4 flex flex-col justify-center">
                <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted mb-2">Sector Exposure Breakdown</span>
                <SectorPieChart 
                  data={
                    Array.isArray(upload.data.sector_analysis) 
                      ? upload.data.sector_analysis 
                      : [
                          { name: "Financial Services", value: 25 },
                          { name: "Manufacturing & Consumer", value: 25 },
                          { name: "Information Technology", value: 20 },
                          { name: "Industrials & Ports", value: 15 },
                          { name: "Energy & Utilities", value: 15 }
                        ]
                  } 
                />
              </div>
            </div>

            <div className="rounded-xl border border-line bg-surface-2/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted mb-3">Matched Holdings Breakdown</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {upload.data.holdings.map((h: any, i: number) => (
                  <div key={`${h.Company}-${i}`} className="flex items-center justify-between bg-surface-1 p-2.5 rounded-lg border border-line">
                    <span className="font-medium text-ink-primary text-xs truncate max-w-[120px]" title={h.Company}>{h.Company}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-ink-muted">{h.weight}%</span>
                      <Badge variant="outline" className="text-xs font-mono border-emerald-500/20 text-emerald-400">{h.resilience_score}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Manual Portfolio Builders */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <PortfolioBuilder
          label="Portfolio Model A"
          holdings={portfolioA}
          setHoldings={setPortfolioA}
          companyNames={companyNames}
        />
        <PortfolioBuilder
          label="Portfolio Model B"
          holdings={portfolioB}
          setHoldings={setPortfolioB}
          companyNames={companyNames}
        />
      </div>

      <div className="flex justify-center">
        <Button 
          size="lg" 
          onClick={handleCompare} 
          disabled={!canCompare || compare.isPending}
          className="px-8 font-semibold shadow-xl bg-emerald-600 text-white hover:bg-emerald-500"
        >
          {compare.isPending ? "Evaluating Head-to-Head…" : "⚖️ Compare Portfolios Side-by-Side"}
        </Button>
      </div>

      {compare.isError && (
        <Card className="p-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20">
          Couldn&apos;t compare portfolios: {compare.error.message}
        </Card>
      )}

      {compare.data && (
        <div className="animate-in fade-in duration-300">
          {/* Side-by-Side Portfolio Comparison Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-6">
            {[
              { label: "Portfolio Model A", data: compare.data.portfolio_a },
              { label: "Portfolio Model B", data: compare.data.portfolio_b },
            ].map(({ label, data }) => (
              <Card key={label} className="p-5 border-line bg-surface-1 space-y-5 shadow-lg">
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <h3 className="font-bold text-ink-primary text-base">{label}</h3>
                  <Badge className="text-sm px-3 py-1 font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Score: {data.weighted_resilience_score}
                  </Badge>
                </div>

                <div className="space-y-1.5 bg-surface-2/40 p-3 rounded-xl border border-line">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Weight Distribution</span>
                  <PortfolioWeightBar holdings={data.holdings} />
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Asset Allocation</span>
                  <PortfolioPieChart pieData={data.holdings.map((h: any) => ({ name: h.Company, value: h.weight }))} />
                </div>

                <ul className="space-y-2 text-sm max-h-48 overflow-y-auto">
                  {data.holdings.map((h: any, i: number) => (
                    <li key={`${h.Company}-${i}`} className="flex justify-between items-center text-ink-secondary bg-surface-2/30 px-3 py-1.5 rounded-lg border border-line/40">
                      <span className="font-medium text-ink-primary">{h.Company} <span className="text-xs text-ink-muted">({h.weight}%)</span></span>
                      <Badge variant="outline" className="font-mono text-xs text-emerald-400 border-emerald-500/20">Resilience: {h.resilience_score}</Badge>
                    </li>
                  ))}
                </ul>
                {data.missing_companies?.length > 0 && (
                  <p className="text-xs text-red-400 bg-red-500/10 p-2 rounded">
                    Not found in universe: {data.missing_companies.join(", ")}
                  </p>
                )}
              </Card>
            ))}
          </div>

          {/* LLM Suggestion positioned directly below comparison */}
          <Card className="p-5 border-emerald-500/30 bg-emerald-500/5 shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <h3 className="text-sm font-bold text-emerald-400 tracking-wide uppercase">AI Portfolio Recommendation</h3>
            </div>
            <p className="text-sm text-ink-secondary leading-relaxed">
              {compare.data.ai_insights || "Based on the Multi-Factor Scoring Framework, the portfolio with the higher Weighted Resilience Score demonstrates superior capital allocation efficiency and is better insulated against margin degradation. If macroeconomic conditions deteriorate, rebalancing capital away from lower-tier holdings towards Tier-1 fortress assets is highly recommended."}
            </p>
          </Card>
        </div>
      )}

      {/* Macro Stress Test Lab */}
      <Card className="space-y-5 p-6 border-line bg-surface-1/60 backdrop-blur-sm shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-ink-primary text-base">Macro Stress Test Engine</h3>
            <p className="text-xs text-ink-muted mt-0.5">
              Simulate custom crisis conditions and inflation spikes across your tailored model.
            </p>
          </div>
          {/* Target Portfolio Switcher */}
          <div className="flex items-center gap-1.5 bg-surface-2 p-1 rounded-lg border border-line z-10 relative">
            <span className="text-xs text-ink-muted px-2 font-medium">Target:</span>
            <Button
              size="sm"
              className={`h-7 px-3 text-xs ${stressTarget === "A" ? "bg-emerald-600 text-white hover:bg-emerald-500" : "bg-transparent text-ink-secondary hover:bg-surface-3"}`}
              onClick={() => setStressTarget("A")}
            >
              Model A
            </Button>
            <Button
              size="sm"
              className={`h-7 px-3 text-xs ${stressTarget === "B" ? "bg-emerald-600 text-white hover:bg-emerald-500" : "bg-transparent text-ink-secondary hover:bg-surface-3"}`}
              onClick={() => setStressTarget("B")}
            >
              Model B
            </Button>
          </div>
        </div>

        {/* Sliders Container */}
        <div className="grid grid-cols-1 gap-6 bg-surface-2/40 p-4 rounded-xl border border-line">
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-ink-secondary font-medium">
              <span>Inflation Shock (CPI)</span>
              <span className="text-emerald-400 font-bold">{inflation.toFixed(1)}%</span>
            </div>
            {/* The wrapper sets the styling for shadcn Slider to map to the new Emerald theme */}
            <div className="[&_[role=slider]]:border-emerald-500 [&_[role=slider]]:bg-emerald-500 [&_[data-orientation=horizontal]>span]:bg-emerald-500">
              <Slider min={-2} max={15} step={0.1} value={[inflation]} onValueChange={([v]) => setInflation(v)} />
            </div>
          </div>
        </div>

        <Button onClick={handleStressTest} disabled={stressTest.isPending} variant="outline" className="w-full font-semibold border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10">
          {stressTest.isPending ? `Simulating Model ${stressTarget}...` : `⚡ Run Stress Test on Model ${stressTarget}`}
        </Button>

        {stressTest.isError && (
          <p className="text-sm text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">Couldn&apos;t run stress test: {stressTest.error.message}</p>
        )}

        {stressTest.data && (
          <div className="rounded-xl border border-line overflow-hidden bg-surface-2/30 mt-4">
            <div className="bg-surface-2 px-3 py-2 text-xs font-semibold text-ink-secondary border-b border-line">
              Results for Portfolio Model {stressTarget}
            </div>
            <table className="w-full text-sm text-left">
              <thead className="bg-surface-2/60 text-ink-muted text-xs uppercase tracking-wider border-b border-line">
                <tr>
                  <th className="p-3">Company</th>
                  <th className="p-3">Net Profit Growth</th>
                  <th className="p-3">Operating Cash Flow</th>
                  <th className="p-3">Borrowings Growth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {stressTest.data.results.map((r: any, idx: number) => (
                  <tr key={`${r.Company}-${idx}`} className="hover:bg-surface-2/50 transition-colors">
                    <td className="p-3 font-semibold text-ink-primary">{r.Company}</td>
                    <td className="p-3 font-mono text-emerald-400">{r.forecasts["Net Profit Growth"]?.toFixed(1)}%</td>
                    <td className="p-3 font-mono text-emerald-400">{r.forecasts["Operating Cash Flow Growth"]?.toFixed(1)}%</td>
                    <td className="p-3 font-mono text-amber-400">{r.forecasts["Borrowings Growth"]?.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}