"use client";

import { 
  LineChart, Building2, Layers, Briefcase, 
  Trophy, Bot, Calculator, ShieldAlert 
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: LineChart,
    title: "Macro Projection Engine",
    description: "An autoregressive ensemble of XGBoost, LightGBM, and SARIMAX projecting inflation and macro indicators month-by-month.",
  },
  {
    icon: Building2,
    title: "Corporate Analysis",
    description: "Pulls historical growth panels and granular financial statements, evaluating baseline performance before macro shocks.",
  },
  {
    icon: Layers,
    title: "Sector Intelligence",
    description: "Aggregates corporate resilience across entire industries to find the median and mean vulnerabilities of market sectors.",
  },
  {
    icon: Briefcase,
    title: "Portfolio Lab",
    description: "Stress-test your custom stock portfolio against massive macro shocks (like extreme inflation) to see theoretical drawdowns.",
  },
  {
    icon: Trophy,
    title: "Resilience Leaderboard",
    description: "A dynamically ranked 0–100 index of Indian companies based on their ability to withstand upcoming macro-financial turbulence.",
  },
  {
    icon: Bot,
    title: "RAG Investment Assistant",
    description: "Chat directly with an AI grounded in your latest LangGraph execution pipeline, vector store, and corporate statements.",
  },
  {
    icon: Calculator,
    title: "Retail Copilots",
    description: "Personal finance tools like the EMI Shock Absorber and Salary Copilot to translate macro metrics into household impact.",
  },
  {
    icon: ShieldAlert,
    title: "Scenario Resilience",
    description: "Panel-regression models run twice—once projected, once frozen—to isolate the exact effect of macro volatility on a company.",
  },
];

export function FeatureGrid() {
  return (
    <section className="relative overflow-hidden py-24 bg-surface-0">
      {/* Premium Ambient Green Glow Background */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <div className="h-[800px] w-[800px] rounded-full bg-accent/5 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-sm font-semibold leading-7 text-accent-strong uppercase tracking-wider font-mono">
            Ecosystem Overview
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-ink-primary sm:text-4xl">
            A Complete Macro-Financial Terminal
          </p>
          <p className="mt-4 text-lg leading-8 text-ink-muted">
            From institutional sector intelligence down to retail salary copilot, every tool is powered by our unified predictive engine.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <div className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-12 lg:max-w-none lg:grid-cols-4 md:grid-cols-2">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div 
                  key={feature.title} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="flex flex-col rounded-2xl bg-surface-1/60 p-6 shadow-card border border-line backdrop-blur-sm hover:border-accent/40 transition-colors"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 border border-accent/20">
                    <Icon className="h-6 w-6 text-accent" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-semibold leading-7 text-ink-primary">
                    {feature.title}
                  </h3>
                  <p className="mt-2 flex flex-auto flex-col text-sm leading-relaxed text-ink-secondary">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
