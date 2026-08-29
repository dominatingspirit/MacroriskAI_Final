"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";

export function HeroSection() {
  const reducedMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden">
      {/* Background glow - automatically uses the green --accent from globals.css */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-10%] h-[640px] w-[640px] -translate-x-1/2 rounded-full bg-accent/15 blur-[120px]" />
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 pb-16 pt-20 sm:pt-28 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Top Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface-1/80 px-3.5 py-1.5 text-[12px] font-medium text-ink-secondary">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-good opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-good" />
            </span>
            End-to-end macro-financial intelligence.
          </div>

          <h1 className="text-[2.6rem] font-semibold leading-[1.05] tracking-tight text-ink-primary sm:text-[3.4rem]">
            MacroRisk AI
          </h1>
          <p className="mt-2 text-[1.35rem] font-medium leading-snug tracking-tight text-ink-secondary sm:text-[1.6rem]">
            We Predict. You Decide. AI Supports.
          </p>

          {/* Updated Description */}
          <p className="mt-6 max-w-lg text-[16px] leading-relaxed text-ink-muted">
            A comprehensive econometric terminal combining multi-agent corporate analysis, sector intelligence, portfolio stress-testing, and retail financial planning. Powered by LangGraph orchestration and RAG-grounded AI to turn macroeconomic data into actionable foresight.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button asChild variant="accent" size="lg">
              <Link href="/dashboard">
                Enter the console <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/analysis">
                <PlayCircle className="h-4 w-4" /> Run a live analysis
              </Link>
            </Button>
          </div>

          {/* Updated Bottom Feature Tags */}
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-[12px] text-ink-muted">
            <span>Multi-Agent Orchestration</span>
            <span className="h-1 w-1 rounded-full bg-line-strong" />
            <span>Sector & Corporate Leaderboards</span>
            <span className="h-1 w-1 rounded-full bg-line-strong" />
            <span>Portfolio Lab</span>
            <span className="h-1 w-1 rounded-full bg-line-strong" />
            <span>Retail Copilots</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          className="relative aspect-square w-full max-w-[500px] justify-self-center lg:justify-self-end flex items-center justify-center"
        >
          {reducedMotion ? (
            <div
              className="h-full w-full rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 35% 30%, color-mix(in oklab, var(--accent) 55%, transparent), transparent 60%), radial-gradient(circle at 65% 70%, color-mix(in oklab, var(--accent) 30%, transparent), transparent 55%)",
              }}
            />
          ) : (
            <div className="relative flex h-full w-full items-center justify-center">
              {/* Outer financial grid aura */}
              <div className="absolute h-[70%] w-[70%] rounded-full bg-emerald-500/10 blur-[60px] animate-pulse" />

              {/* Outer rotating market ring */}
              <div className="absolute h-[85%] w-[85%] animate-[spin_35s_linear_infinite] rounded-full border border-emerald-500/20 border-t-emerald-400" />

              {/* Counter-spinning radar ring */}
              <div className="absolute h-[70%] w-[70%] animate-[spin_25s_linear_infinite_reverse] rounded-full border border-dashed border-emerald-400/30" />

              {/* Inner core terminal box */}
              <div className="absolute h-[52%] w-[52%] animate-[spin_60s_linear_infinite] rounded-2xl border border-emerald-500/30 bg-surface-1/40 backdrop-blur-md" />

              {/* Glowing center financial reactor orb */}
              <div className="relative z-10 flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 p-[1px] shadow-[0_0_50px_rgba(16,185,129,0.4)] animate-pulse">
                <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-surface-0/95 backdrop-blur-xl p-4 text-center">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-ink-muted">Market Index</span>
                  <span className="text-sm font-bold font-mono text-emerald-400 mt-0.5">NIFTY 50</span>
                  <span className="text-xs font-mono font-semibold text-emerald-300 mt-0.5">+1.48% 🟢</span>
                </div>
              </div>

              {/* Floating Live Stock / Portfolio Widget 1 */}
              <div className="absolute top-[14%] right-[6%] z-20 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-surface-1/95 px-3.5 py-2.5 shadow-2xl backdrop-blur-md">
                <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold text-xs font-mono">
                  📈
                </div>
                <div>
                  <p className="text-[10px] uppercase font-mono text-ink-muted tracking-wider">Portfolio Stress Test</p>
                  <p className="text-xs font-bold font-mono text-ink-primary">Resilience Score: <span className="text-emerald-400">92.4/100</span></p>
                </div>
              </div>

              {/* Floating Live Stock Widget 2 */}
              <div className="absolute bottom-[16%] left-[6%] z-20 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-surface-1/95 px-3.5 py-2.5 shadow-2xl backdrop-blur-md">
                <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold text-xs font-mono">
                  ₹
                </div>
                <div>
                  <p className="text-[10px] uppercase font-mono text-ink-muted tracking-wider">Inflation Outlook</p>
                  <p className="text-xs font-bold font-mono text-ink-primary">3M Forecast: <span className="text-emerald-400">Stable (4.2%)</span></p>
                </div>
              </div>

              {/* Ambient market floating points */}
              <div className="absolute top-[28%] left-[15%] h-3 w-3 animate-ping rounded-full bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.9)]" />
              <div className="absolute bottom-[24%] right-[15%] h-2.5 w-2.5 animate-pulse rounded-full bg-teal-300 shadow-[0_0_12px_rgba(45,212,191,0.9)]" />
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}