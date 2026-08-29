"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const STEPS = [
  { label: "Predicting the macro economy", agent: "Inflation Outlook Agent" },
  { label: "Fetching company history & statements", agent: "Corporate Analysis Agent" },
  { label: "Forecasting financial scenarios", agent: "Agent 3" },
  { label: "Writing the investment report", agent: "Agent 4" },
];

/**
 * POST /analyze_company is one blocking call with no server-sent progress —
 * this is a paced narrative of what's happening, not a literal progress feed.
 * Mounted only while the pipeline request is in flight (see AnalysisPage), so
 * it always starts its own timers fresh — no external "active" flag needed.
 */
export function PipelineTimeline() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = STEPS.slice(1).map((_, i) => setTimeout(() => setStep(i + 1), (i + 1) * 1800));
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex flex-col gap-1">
      {STEPS.map((s, i) => {
        const done = i < step;
        const current = i === step;
        return (
          <div key={s.label} className="flex items-center gap-3.5 py-2.5">
            <div
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold transition-colors",
                done && "border-good bg-[color-mix(in_oklab,var(--status-good)_16%,transparent)] text-good",
                current && "border-accent bg-accent-soft text-accent-ink",
                !done && !current && "border-line text-ink-muted",
              )}
            >
              {done ? <Check className="h-3.5 w-3.5" /> : current ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : i + 1}
            </div>
            <div className="flex-1">
              <p className={cn("text-[13px] font-medium", current ? "text-ink-primary" : done ? "text-ink-secondary" : "text-ink-muted")}>
                {s.label}
              </p>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">{s.agent}</span>
            {current && (
              <motion.div
                layoutId="pipeline-pulse"
                className="h-1.5 w-1.5 rounded-full bg-accent"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
