"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, Building2, Cpu, Bot, 
  BarChart3, Layers, Briefcase, Calculator, ArrowRight 
} from "lucide-react";

// All platform modules mapped into gorgeous interactive cards
const PLATFORM_MODULES = [
  {
    title: "Macro Forecast",
    subtitle: "INFLATION OUTLOOK AGENT",
    description: "Autoregressive ensemble of XGBoost, LightGBM, SARIMAX and VAR(2) projecting India CPI inflation, repo rate, Brent oil and FX up to 6 months out.",
    href: "/forecast",
    icon: TrendingUp,
    badge: "Agent 1",
    metric: "CPI & Repo Live",
  },
  {
    title: "Company Explorer",
    subtitle: "CORPORATE ANALYSIS AGENT",
    description: "Sector → company drill-down over the historical growth panel and granular financial statements, rendered Moneycontrol-style.",
    href: "/companies",
    icon: Building2,
    badge: "Agent 2",
    metric: "Financial Depth",
  },
  {
    title: "Econometric Projection & Analysis",
    subtitle: "AGENTS 1–4 ORCHESTRATION",
    description: "The LangGraph pipeline end to end — macro projection, historical baseline, scenario resilience forecasting, and an AI-authored investment report.",
    href: "/analysis",
    icon: Cpu,
    badge: "LangGraph",
    metric: "End-to-End AI",
  },
  {
    title: "Financial Knowledge RAG",
    subtitle: "RAG KNOWLEDGE BASE",
    description: "Ask questions against the research corpus and vector store — automatically grounded in your most recent Full Analysis run.",
    href: "/assistant",
    icon: Bot,
    badge: "RAG Vector",
    metric: "Instant Context",
  },
  {
    title: "Inflation Resilience Leaderboard",
    subtitle: "MARKET RANKINGS",
    description: "Live ranking of all tracked companies sorted by their 0-100 inflation resilience score across upcoming macroeconomic horizons.",
    href: "/leaderboard",
    icon: BarChart3,
    badge: "Market Intel",
    metric: "0-100 Scoring",
  },
  {
    title: "Sector-wise Intelligence",
    subtitle: "SECTOR MEDIANS",
    description: "Analyze median resilience scores, margin expansions, and capital expenditure trends aggregated by economic sector.",
    href: "/sectors",
    icon: Layers,
    badge: "Macro View",
    metric: "Cross-Sector",
  },
  {
    title: "Portfolio Lab ",
    subtitle: "ASSET MODELING & STRESS TESTS",
    description: "Build custom portfolio weights, ingest CSV brokerage statements via AI, compare models head-to-head, and execute custom macro stress tests.",
    href: "/portfolio",
    icon: Briefcase,
    badge: "Simulator",
    metric: "CSV Ingestion",
  },
  {
    title: "Personal Finance Tools",
    subtitle: "EMI & SALARY SHOCK CALCULATOR",
    description: "Stress-test personal floating-rate loans against projected repo rate hikes or calculate inflation-adjusted target wages.",
    href: "/emi-salary",
    icon: Calculator,
    badge: "Consumer",
    metric: "Shock Analysis",
  },
];

export default function OverviewDashboard() {
  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-500">
      {/* Top Banner with Ticker Vibe */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-line pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">MacroRisk AI Terminal Active</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink-primary">Welcome!</h1>
          <p className="text-sm text-ink-muted">
            Multi-agent macroeconomic intelligence platform. Select any intelligence module below or launch a live simulation.
          </p>
        </div>

        {/* Live Market Quick Badges */}
        <div className="flex items-center gap-3 bg-surface-2/60 p-3 rounded-xl border border-line">
          <div className="text-right">
            <p className="text-[10px] uppercase font-mono text-ink-muted">Target Inflation</p>
            <p className="text-sm font-bold text-emerald-400 font-mono">5.46% CPI</p>
          </div>
          <div className="h-8 w-px bg-line" />
          <div className="text-right">
            <p className="text-[10px] uppercase font-mono text-ink-muted">Repo Rate Benchmark</p>
            <p className="text-sm font-bold text-ink-primary font-mono">6.50%</p>
          </div>
        </div>
      </div>

      {/* Module Cards Grid - Showing ALL Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {PLATFORM_MODULES.map((mod, index) => {
          const IconComponent = mod.icon;
          return (
            <Link key={mod.title} href={mod.href} className="group block">
              <Card className="relative p-6 h-full border-line/80 bg-surface-1/60 hover:bg-surface-2/50 backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-950/20 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-surface-2 border border-line text-ink-primary group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-colors">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-[10px] text-ink-muted">
                        {mod.metric}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px] font-semibold">
                        {mod.badge}
                      </Badge>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono uppercase tracking-widest text-ink-muted block mb-1">
                    {mod.subtitle}
                  </span>
                  <h3 className="text-xl font-bold text-ink-primary group-hover:text-emerald-400 transition-colors flex items-center justify-between">
                    {mod.title}
                    <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-emerald-400" />
                  </h3>
                  <p className="text-sm text-ink-secondary mt-2 leading-relaxed line-clamp-2">
                    {mod.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-line/60 flex items-center justify-between text-xs font-medium text-ink-muted group-hover:text-ink-primary transition-colors">
                  <span>Launch module</span>
                  <span className="font-mono text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">→ Access</span>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
