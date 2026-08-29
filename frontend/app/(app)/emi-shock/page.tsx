"use client";

import { useState } from "react";
import { useEMIShock } from "@/lib/hooks/use-retail-tools";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calculator, TrendingUp, ShieldAlert, Sparkles, Landmark, ArrowUpRight } from "lucide-react";

export default function EmiShockPage() {
  const [principal, setPrincipal] = useState<number>(5000000);
  const [rate, setRate] = useState<number>(8.5);
  const [tenureYears, setTenureYears] = useState<number>(20);
  const [monthsAhead, setMonthsAhead] = useState<number>(3);
  const emi = useEMIShock();

  function handleSubmit() {
    emi.mutate({ principal, rate, tenure_years: tenureYears, months_ahead: monthsAhead });
  }

  const delta = emi.data?.monthly_delta ?? 0;

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-500">
      {/* Header Banner */}
      <div className="border-b border-line pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Landmark className="h-5 w-5 text-emerald-400" />
            <h1 className="text-2xl font-bold tracking-tight text-ink-primary">EMI Shock Absorber</h1>
          </div>
          <p className="text-sm text-ink-muted mt-1">
            Floating-rate loan stress test — simulates monthly and annual EMI spikes if your loan rate reprices with projected repo rate hikes.
          </p>
        </div>
        <Badge variant="outline" className="font-mono text-xs">Consumer Risk Module</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Input Parameters Card */}
        <Card className="p-6 border-line bg-surface-1/60 backdrop-blur-sm space-y-4 lg:col-span-1 shadow-xl">
          <div className="space-y-1 border-b border-line pb-3">
            <h3 className="font-bold text-ink-primary text-base">Loan Parameters</h3>
            <p className="text-xs text-ink-muted">Enter your active debt structure and baseline interest profile.</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="principal" className="text-xs font-semibold uppercase tracking-wide text-ink-secondary">Loan principal (₹)</Label>
              <Input
                id="principal"
                type="number"
                min={0}
                value={principal}
                onChange={(e) => setPrincipal(Number(e.target.value))}
                className="font-mono bg-surface-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate" className="text-xs font-semibold uppercase tracking-wide text-ink-secondary">Current annual interest rate (%)</Label>
              <Input
                id="rate"
                type="number"
                min={0}
                max={30}
                step={0.1}
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="font-mono bg-surface-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tenure" className="text-xs font-semibold uppercase tracking-wide text-ink-secondary">Tenure (years)</Label>
              <Input
                id="tenure"
                type="number"
                min={1}
                max={30}
                value={tenureYears}
                onChange={(e) => setTenureYears(Number(e.target.value))}
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

            <Button onClick={handleSubmit} disabled={emi.isPending} className="w-full font-semibold bg-emerald-600 hover:bg-emerald-500 text-white">
              {emi.isPending ? "Simulating Repo Hike Shock…" : "Run Stress Test Simulation"}
            </Button>
          </div>
        </Card>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-6">
          {emi.isError && (
            <Card className="p-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20">
              Couldn&apos;t calculate: {emi.error.message}
            </Card>
          )}

          {!emi.data && !emi.isError && (
            <Card className="p-12 border-line bg-surface-1/40 text-center space-y-3 flex flex-col items-center justify-center">
              <div className="p-3 rounded-full bg-surface-2 border border-line text-ink-muted">
                <Calculator className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-ink-primary">No stress test executed yet</h3>
              <p className="text-xs text-ink-muted max-w-sm">
                Input your mortgage or education loan details on the left and run the simulation to preview repo rate repricing risk.
              </p>
            </Card>
          )}

          {emi.data && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="p-5 border-line bg-surface-1/60 space-y-2 shadow-lg">
                  <span className="text-xs font-mono uppercase tracking-wider text-ink-muted">Baseline Monthly EMI</span>
                  <div className="text-2xl font-bold font-mono text-ink-primary">
                    ₹{emi.data.baseline_emi.toLocaleString()}
                  </div>
                  <p className="text-xs text-ink-muted">Current obligation before repricing.</p>
                </Card>

                <Card className="p-5 border-line bg-gradient-to-br from-surface-1 to-surface-2 border-line space-y-2 shadow-lg">
                  <span className="text-xs font-mono uppercase tracking-wider text-ink-muted">Projected Monthly EMI</span>
                  <div className="text-2xl font-extrabold font-mono text-ink-primary">
                    ₹{emi.data.projected_emi.toLocaleString()}
                  </div>
                  <p className="text-xs text-ink-muted">Expected monthly outflow post-repricing.</p>
                </Card>

                <Card className="p-5 border-line bg-surface-1/60 space-y-2 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-ink-muted">Monthly Delta</span>
                    <ArrowUpRight className={`h-4 w-4 ${delta > 0 ? "text-red-400" : "text-emerald-400"}`} />
                  </div>
                  <div className={`text-2xl font-extrabold font-mono ${delta > 0 ? "text-red-400" : "text-emerald-400"}`}>
                    {delta > 0 ? "+" : ""}₹{delta.toLocaleString()}
                  </div>
                  <p className="text-xs text-ink-muted">Change in monthly cash outflow.</p>
                </Card>

                <Card className="p-5 border-line bg-surface-1/60 space-y-2 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-ink-muted">Annual Burden Delta</span>
                    <ShieldAlert className={`h-4 w-4 ${delta > 0 ? "text-red-400" : "text-emerald-400"}`} />
                  </div>
                  <div className={`text-2xl font-extrabold font-mono ${delta > 0 ? "text-red-400" : "text-emerald-400"}`}>
                    {delta > 0 ? "+" : ""}₹{emi.data.annual_delta.toLocaleString()}
                  </div>
                  <p className="text-xs text-ink-muted">Total extra yearly outflow due to hike.</p>
                </Card>
              </div>

              {/* Repo Rate Shift Summary Card */}
              <Card className="p-6 border-line bg-surface-1/60 backdrop-blur-sm space-y-3 shadow-xl">
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                    <h3 className="font-bold text-ink-primary text-sm uppercase tracking-wider">Monetary Policy Repricing Impact</h3>
                  </div>
                  <Badge variant="outline" className="font-mono text-xs">
                    {emi.data.repo_rate_delta_bps > 0 ? `+${emi.data.repo_rate_delta_bps} bps` : `${emi.data.repo_rate_delta_bps} bps`}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-ink-secondary pt-1">
                  <span>Simulated Benchmark Shift:</span>
                  <span className="font-mono font-bold text-ink-primary">
                    {emi.data.current_repo_rate}% → {emi.data.projected_repo_rate}%
                  </span>
                </div>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Floating-rate loans benchmarked against central bank repo actions will automatically adjust according to the basis point (bps) delta projected over your selected horizon.
                </p>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}