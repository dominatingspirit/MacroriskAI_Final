"use client";

import { useSectorIntelligence } from "@/lib/hooks/use-leaderboard";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

function scoreBadgeVariant(score: number): "good" | "warning" | "critical" {
  if (score >= 66) return "good";
  if (score >= 33) return "warning";
  return "critical";
}

export default function SectorsPage() {
  const { data, isLoading, isError, error } = useSectorIntelligence(3);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full rounded-xl bg-surface-2/50" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="p-6 text-sm text-red-400 bg-red-500/10 border-red-500/20">
        Couldn&apos;t load sector intelligence: {error.message}
      </Card>
    );
  }

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-500">
      {/* Header */}
      <div className="border-b border-line pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-primary">Sector Intelligence</h1>
          <p className="text-sm text-ink-muted mt-1">
            Aggregated resilience by sector — median & equal-weighted mean, 3-month horizon.
          </p>
        </div>
        <Badge variant="outline" className="font-mono text-xs">Macro View</Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {data?.map((sector) => {
          const chartData = Object.entries(sector.median_growth).map(([metric, value]) => ({
            metric: metric.replace(" Growth", ""),
            value,
          }));
          return (
            <Card key={sector.sector} className="p-5 border-line bg-surface-1/60 backdrop-blur-sm shadow-xl hover:border-emerald-500/30 transition-colors">
              <div className="mb-4 flex items-start justify-between border-b border-line pb-3">
                <div>
                  <h2 className="font-bold text-ink-primary text-base">{sector.sector}</h2>
                  <p className="text-xs text-ink-muted font-mono mt-0.5">{sector.company_count} companies tracked</p>
                </div>
                <div className="text-right">
                  <Badge className={
                    sector.median_resilience_score >= 66 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" :
                    sector.median_resilience_score >= 33 ? "bg-amber-500/10 text-amber-400 border-amber-500/30" :
                    "bg-red-500/10 text-red-400 border-red-500/30"
                  }>
                    Median {sector.median_resilience_score}
                  </Badge>
                  <p className="mt-1.5 text-[10px] text-ink-muted font-mono uppercase tracking-wider">Mean {sector.mean_resilience_score}</p>
                </div>
              </div>

              <div className="mb-5 flex gap-4 text-xs font-medium text-ink-secondary bg-surface-2/50 p-2.5 rounded-lg border border-line">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400"></span>{sector.pct_companies_positive_outlook}% positive</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-400"></span>{sector.pct_companies_high_leverage}% high leverage</span>
              </div>

              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ left: 24, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#374151" strokeOpacity={0.4} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="metric" tick={{ fontSize: 10, fill: "#9ca3af" }} width={90} axisLine={false} tickLine={false} />
                    <Tooltip
                      formatter={(v: number) => [`${v.toFixed(1)}%`, "Growth"]}
                      cursor={{fill: '#374151', opacity: 0.2}}
                      contentStyle={{
                        backgroundColor: "#111827",
                        border: "1px solid #10b981", // Emerald border for tooltip
                        borderRadius: 8,
                        fontSize: 12,
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)"
                      }}      
                      labelStyle={{ color: "#9ca3af", marginBottom: "4px" }}
                      itemStyle={{ color: "#10b981", fontWeight: "bold" }}
                    />
                    {/* CHANGED FROM BLUE TO DYNAMIC GREEN/RED */}
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.value >= 0 ? "#10b981" : "#ef4444"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
