"use client";

import { motion } from "framer-motion";
import { ArrowRight, Bot, Building2, LineChart, Sparkles } from "lucide-react";

const NODES = [
  { icon: LineChart, label: "Macro agent" },
  { icon: Building2, label: "Company agent" },
  { icon: Sparkles, label: "Financial agent" },
  { icon: Bot, label: "Report agent" },
];

export function PipelineFlow() {
  return (
    <section className="border-y border-line bg-surface-1/50">
      <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <div className="mb-10 flex flex-col items-center text-center">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-ink">
            LangGraph orchestration
          </p>
          <h2 className="max-w-xl text-[1.6rem] font-semibold tracking-tight text-ink-primary">
            One request in. One linear, auditable state machine.
          </h2>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 sm:flex-nowrap">
          {NODES.map((node, i) => {
            const Icon = node.icon;
            return (
              <motion.div
                key={node.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.12 }}
                className="flex items-center gap-3"
              >
                <div className="flex flex-col items-center gap-2 rounded-[var(--radius-lg)] border border-line bg-surface-1 px-5 py-4 shadow-[var(--shadow-card)]">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-accent-ink">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-[12.5px] font-medium text-ink-primary">{node.label}</span>
                </div>
                {i < NODES.length - 1 && (
                  <ArrowRight className="hidden h-4 w-4 shrink-0 text-ink-muted sm:block" />
                )}
              </motion.div>
            );
          })}
        </div>

        <p className="mx-auto mt-8 max-w-xl text-center text-[13px] text-ink-muted">
          Four unconditional edges, one shared state object — each node either does its work or passes an
          existing error straight through to the next, so a failure anywhere surfaces cleanly at the end.
        </p>
      </div>
    </section>
  );
}
