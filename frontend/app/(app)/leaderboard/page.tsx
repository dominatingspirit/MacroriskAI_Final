"use client";

import { useState, Fragment } from "react";
import { useLeaderboard } from "@/lib/hooks/use-leaderboard";
import { useExplainCompany } from "@/lib/hooks/use-narrative";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Activity, X, ChevronDown, ChevronUp } from "lucide-react";

function scoreBadgeVariant(score: number): "good" | "warning" | "critical" {
  if (score >= 66) return "good";
  if (score >= 33) return "warning";
  return "critical";
}

export default function LeaderboardPage() {
  const [monthsAhead] = useState(3);
  const { data, isLoading, isError, error } = useLeaderboard(monthsAhead);
  
  // State for the AI Insight inline drawer
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);
  
  // State for the View Details modal
  const [detailsModal, setDetailsModal] = useState<any | null>(null);
  
  const explain = useExplainCompany();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-md" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="p-6 text-sm text-red-500">
        Couldn&apos;t load the leaderboard: {error.message}
      </Card>
    );
  }

  function handleExplain(company: string, score: number) {
    if (expandedInsight === company) {
      setExpandedInsight(null);
      return;
    }
    setExpandedInsight(company);
    explain.mutate({ company, mode: score >= 50 ? "resilient" : "vulnerable" });
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-ink-primary">Corporate Leaderboard</h1>
        <p className="text-sm text-ink-muted">
          {data?.length} companies ranked by 0–100 Inflation Resilience Score, {monthsAhead}-month horizon.
        </p>
      </div>

      <Card className="overflow-hidden border-line shadow-lg">
        <table className="w-full text-sm">
          <thead className="bg-surface-2/60 text-left text-ink-muted uppercase tracking-wider text-xs border-b border-line">
            <tr>
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">Company</th>
              <th className="px-4 py-3 font-medium">Sector</th>
              <th className="px-4 py-3 font-medium text-center">Score</th>
              <th className="px-4 py-3 font-medium text-center">AI Analysis</th>
              <th className="px-4 py-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/60">
            {data?.map((row) => (
              <Fragment key={row.Company}>
                <tr className="align-middle hover:bg-surface-2/30 transition-colors">
                  <td className="px-4 py-3 text-ink-muted font-mono">{row.rank}</td>
                  <td className="px-4 py-3 font-semibold text-ink-primary">{row.Company}</td>
                  <td className="px-4 py-3 text-ink-secondary text-xs">{row.Industry_Group}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={scoreBadgeVariant(row.resilience_score)} className="font-mono text-xs px-2.5 py-0.5">
                      {row.resilience_score}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Button
                      size="sm"
                      variant="ghost"
                      className={`h-8 text-xs font-medium ${expandedInsight === row.Company ? "bg-surface-3" : ""}`}
                      onClick={() => handleExplain(row.Company, row.resilience_score)}
                    >
                      <Sparkles className={`mr-1.5 h-3.5 w-3.5 ${row.resilience_score >= 50 ? "text-emerald-500" : "text-red-400"}`} />
                      {row.resilience_score >= 50 ? "Insight" : "Warning"}
                      {expandedInsight === row.Company ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />}
                    </Button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs font-medium border-line hover:border-emerald-500/50 hover:text-emerald-500"
                      onClick={() => setDetailsModal(row)}
                    >
                      <Activity className="mr-1.5 h-3.5 w-3.5" />
                      View Details
                    </Button>
                  </td>
                </tr>

                {/* Inline Premium AI Insight Drawer */}
                {expandedInsight === row.Company && (
                  <tr className="bg-surface-2/20">
                    <td colSpan={6} className="p-0 border-b border-line">
                      <div className="px-6 py-4 border-l-4 border-l-emerald-500 flex gap-4">
                        <div className="flex-shrink-0 mt-0.5">
                          <Sparkles className="h-5 w-5 text-emerald-500 animate-pulse" />
                        </div>
                        <div className="flex-1 text-sm text-ink-secondary leading-relaxed">
                          {explain.isPending ? (
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-3/4" />
                              <Skeleton className="h-4 w-1/2" />
                            </div>
                          ) : explain.isError ? (
                            <span className="text-red-500">Failed to generate AI insight.</span>
                          ) : (
                            <span className="animate-in fade-in duration-300">
                              {explain.data?.narrative}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </Card>

      {/* View Details Modal Overlay - 6 Parameters Financial Grid */}
      {detailsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-lg bg-surface-1 border border-line shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-5 py-4 bg-surface-2/50">
              <div>
                <h3 className="text-lg font-bold text-ink-primary">{detailsModal.Company}</h3>
                <p className="text-xs text-ink-muted uppercase tracking-wider">{detailsModal.Industry_Group}</p>
              </div>
              <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" onClick={() => setDetailsModal(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-5 space-y-5">
              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-2/40 border border-line">
                <span className="text-sm font-medium text-ink-secondary">Overall Resilience Score</span>
                <Badge variant={scoreBadgeVariant(detailsModal.resilience_score)} className="text-lg px-4 py-1.5 font-bold">
                  {detailsModal.resilience_score} / 100
                </Badge>
              </div>

              {/* 6-Parameter Financial Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                
                {/* 1. Borrowings */}
                <div className="p-3 rounded-lg border border-line bg-surface-1">
                  <p className="text-[10px] text-ink-muted mb-1 uppercase tracking-wide">Borrowings</p>
                  <p className="text-sm font-mono font-semibold">
                    {detailsModal["Borrowings Growth"] !== undefined ? (
                      <span className={detailsModal["Borrowings Growth"] <= 0 ? "text-emerald-500" : "text-amber-500"}>
                        {detailsModal["Borrowings Growth"] > 0 ? "+" : ""}{detailsModal["Borrowings Growth"]?.toFixed(1)}%
                      </span>
                    ) : <span className="text-ink-muted italic">N/A</span>}
                  </p>
                </div>

                {/* 2. Equity */}
                <div className="p-3 rounded-lg border border-line bg-surface-1">
                  <p className="text-[10px] text-ink-muted mb-1 uppercase tracking-wide">Equity</p>
                  <p className="text-sm font-mono font-semibold">
                    {detailsModal["Equity Growth"] !== undefined ? (
                      <span className={detailsModal["Equity Growth"] >= 0 ? "text-emerald-500" : "text-amber-500"}>
                        {detailsModal["Equity Growth"] > 0 ? "+" : ""}{detailsModal["Equity Growth"]?.toFixed(1)}%
                      </span>
                    ) : <span className="text-ink-muted italic">N/A</span>}
                  </p>
                </div>

                {/* 3. Total Assets */}
                <div className="p-3 rounded-lg border border-line bg-surface-1">
                  <p className="text-[10px] text-ink-muted mb-1 uppercase tracking-wide">Total Assets</p>
                  <p className="text-sm font-mono font-semibold">
                    {detailsModal["Total Assets Growth"] !== undefined ? (
                      <span className={detailsModal["Total Assets Growth"] >= 0 ? "text-emerald-500" : "text-amber-500"}>
                        {detailsModal["Total Assets Growth"] > 0 ? "+" : ""}{detailsModal["Total Assets Growth"]?.toFixed(1)}%
                      </span>
                    ) : <span className="text-ink-muted italic">N/A</span>}
                  </p>
                </div>

                {/* 4. Operating Profit */}
                <div className="p-3 rounded-lg border border-line bg-surface-1">
                  <p className="text-[10px] text-ink-muted mb-1 uppercase tracking-wide">Op. Profit</p>
                  <p className="text-sm font-mono font-semibold">
                    {detailsModal["Operating Profit Growth"] !== undefined ? (
                      <span className={detailsModal["Operating Profit Growth"] >= 0 ? "text-emerald-500" : "text-amber-500"}>
                        {detailsModal["Operating Profit Growth"] > 0 ? "+" : ""}{detailsModal["Operating Profit Growth"]?.toFixed(1)}%
                      </span>
                    ) : <span className="text-ink-muted italic">N/A</span>}
                  </p>
                </div>

                {/* 5. Net Profit */}
                <div className="p-3 rounded-lg border border-line bg-surface-1">
                  <p className="text-[10px] text-ink-muted mb-1 uppercase tracking-wide">Net Profit</p>
                  <p className="text-sm font-mono font-semibold">
                    {detailsModal["Net Profit Growth"] !== undefined ? (
                      <span className={detailsModal["Net Profit Growth"] >= 0 ? "text-emerald-500" : "text-amber-500"}>
                        {detailsModal["Net Profit Growth"] > 0 ? "+" : ""}{detailsModal["Net Profit Growth"]?.toFixed(1)}%
                      </span>
                    ) : <span className="text-ink-muted italic">N/A</span>}
                  </p>
                </div>

                {/* 6. Op. Cash Flow */}
                <div className="p-3 rounded-lg border border-line bg-surface-1">
                  <p className="text-[10px] text-ink-muted mb-1 uppercase tracking-wide">Op. Cash Flow</p>
                  <p className="text-sm font-mono font-semibold">
                    {detailsModal["Operating Cash Flow Growth"] !== undefined ? (
                      <span className={detailsModal["Operating Cash Flow Growth"] >= 0 ? "text-emerald-500" : "text-amber-500"}>
                        {detailsModal["Operating Cash Flow Growth"] > 0 ? "+" : ""}{detailsModal["Operating Cash Flow Growth"]?.toFixed(1)}%
                      </span>
                    ) : <span className="text-ink-muted italic">N/A</span>}
                  </p>
                </div>

              </div>

              <Button className="w-full bg-ink-primary text-surface-1 hover:bg-ink-primary/90" onClick={() => setDetailsModal(null)}>
                Close Details
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}