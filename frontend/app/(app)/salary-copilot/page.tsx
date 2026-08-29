"use client";

import { useState } from "react";
import { useSalaryCopilot } from "@/lib/hooks/use-retail-tools";
import { useSectorIntelligence } from "@/lib/hooks/use-leaderboard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { Calculator, TrendingUp, ShieldAlert, Sparkles, MessageSquareQuote } from "lucide-react";

export default function SalaryCopilotPage() {
  const [currentSalary, setCurrentSalary] = useState<number>(1200000);
  const [sector, setSector] = useState<string>("");
  const [monthsAhead, setMonthsAhead] = useState<number>(6);
  const { data: sectors } = useSectorIntelligence(3);
  const salary = useSalaryCopilot();

  function handleSubmit() {
    salary.mutate({ current_salary: currentSalary, sector: sector || undefined, months_ahead: monthsAhead });
  }

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-500">
      {/* Header Banner */}
      <div className="border-b border-line pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-emerald-400" />
            <h1 className="text-2xl font-bold tracking-tight text-ink-primary">Salary Copilot</h1>
          </div>
          <p className="text-sm text-ink-muted mt-1">
            Real-wage calculator — what your salary needs to be to keep pace with projected inflation, plus a ready-to-send negotiation script.
          </p>
        </div>
        <Badge variant="outline" className="font-mono text-xs">Consumer Intelligence Module</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Input Card */}
        <Card className="p-6 border-line bg-surface-1/60 backdrop-blur-sm space-y-4 lg:col-span-1 shadow-xl">
          <div className="space-y-1 border-b border-line pb-3">
            <h3 className="font-bold text-ink-primary text-base">Parameters</h3>
            <p className="text-xs text-ink-muted">Configure your compensation baseline and timeframe.</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="salary" className="text-xs font-semibold uppercase tracking-wide text-ink-secondary">Current annual salary (₹)</Label>
              <Input
                id="salary"
                type="number"
                min={0}
                value={currentSalary}
                onChange={(e) => setCurrentSalary(Number(e.target.value))}
                className="font-mono bg-surface-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="months" className="text-xs font-semibold uppercase tracking-wide text-ink-secondary">Horizon (months, max 6)</Label>
              <Input
                id="months"
                type="number"
                min={1}
                max={6}
                value={monthsAhead}
                onChange={(e) => setMonthsAhead(Number(e.target.value))}
                className="font-mono bg-surface-2"
              />
            </div>

            <Button onClick={handleSubmit} disabled={salary.isPending} className="w-full font-semibold bg-emerald-600 hover:bg-emerald-500 text-white">
              {salary.isPending ? "Calculating Real Wage Analysis…" : "Calculate Real-Wage Target"}
            </Button>
          </div>
        </Card>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-6">
          {salary.isError && (
            <Card className="p-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20">
              Couldn&apos;t calculate: {salary.error.message}
            </Card>
          )}

          {!salary.data && !salary.isError && (
            <Card className="p-12 border-line bg-surface-1/40 text-center space-y-3 flex flex-col items-center justify-center">
              <div className="p-3 rounded-full bg-surface-2 border border-line text-ink-muted">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-ink-primary">No simulation generated yet</h3>
              <p className="text-xs text-ink-muted max-w-sm">
                Enter your current annual salary and target horizon on the left, then click calculate to reveal your inflation-adjusted wage target.
              </p>
            </Card>
          )}

          {salary.data && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Metric Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="p-5 border-line bg-surface-1/60 space-y-2 shadow-lg">
                  <span className="text-xs font-mono uppercase tracking-wider text-ink-muted">Current Baseline</span>
                  <div className="text-2xl font-bold font-mono text-ink-primary">
                    ₹{salary.data.current_salary.toLocaleString()}
                  </div>
                  <p className="text-xs text-ink-muted">Your starting annual CTC.</p>
                </Card>

                <Card className="p-5 border-line bg-gradient-to-br from-emerald-950/20 to-surface-1 border-emerald-500/30 space-y-2 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">Inflation Target</span>
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-extrabold font-mono text-emerald-400">
                    ₹{salary.data.target_salary.toLocaleString()}
                  </div>
                  <p className="text-xs text-ink-muted">
                    Required target (<span className="text-emerald-400 font-semibold">+{salary.data.required_raise_pct}%</span> raise) to preserve purchasing power.
                  </p>
                </Card>

                <Card className="p-5 border-line bg-surface-1/60 space-y-2 shadow-lg sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">Monthly Purchasing Power Erosion (If Flat)</span>
                    <ShieldAlert className="h-4 w-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-extrabold font-mono text-amber-400">
                    -₹{salary.data.monthly_erosion.toLocaleString()} / month
                  </div>
                  <p className="text-xs text-ink-muted">
                    Estimated real-value degradation each month due to cumulative macroeconomic inflation.
                  </p>
                </Card>
              </div>

              {/* Ready-to-Send Negotiation Script Card */}
              <Card className="p-6 border-line bg-surface-1/60 backdrop-blur-sm space-y-4 shadow-xl">
                <div className="flex items-center gap-2 border-b border-line pb-3">
                  <MessageSquareQuote className="h-5 w-5 text-emerald-400" />
                  <h3 className="font-bold text-ink-primary text-base">AI-Generated Negotiation Script</h3>
                </div>
                <div className="rounded-xl border border-line bg-surface-2/60 p-4 text-sm text-ink-secondary leading-relaxed font-sans whitespace-pre-wrap">
                  {salary.data.negotiation_script}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}