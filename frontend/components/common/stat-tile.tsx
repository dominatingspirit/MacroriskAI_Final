"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface StatTileProps {
  label: string;
  value: ReactNode;
  caption?: ReactNode;
  icon?: ReactNode;
  tone?: "default" | "good" | "critical" | "accent";
  className?: string;
  delay?: number;
}

const toneClass: Record<NonNullable<StatTileProps["tone"]>, string> = {
  default: "text-ink-primary",
  good: "text-good",
  critical: "text-critical",
  accent: "text-accent-ink",
};

export function StatTile({ label, value, caption, icon, tone = "default", className, delay = 0 }: StatTileProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "rounded-[var(--radius-lg)] border border-line bg-surface-1 p-6 shadow-[var(--shadow-card)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">{label}</p>
        {icon ? <div className="text-ink-muted">{icon}</div> : null}
      </div>
      <p className={cn("mt-2 text-3xl font-semibold tabular-nums tracking-tight", toneClass[tone])}>{value}</p>
      {caption ? <p className="mt-2 text-[13px] text-ink-muted">{caption}</p> : null}
    </motion.div>
  );
}
