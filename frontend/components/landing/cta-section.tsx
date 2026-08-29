"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-[var(--radius-xl)] border border-line bg-ink-primary px-8 py-16 text-center sm:px-16"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(circle at 20% 20%, color-mix(in oklab, var(--accent) 45%, transparent), transparent 55%), radial-gradient(circle at 80% 80%, color-mix(in oklab, var(--accent) 30%, transparent), transparent 50%)",
          }}
        />
        <div className="relative">
          <h2 className="text-[1.9rem] font-semibold tracking-tight text-surface-0 sm:text-[2.2rem]">
            Pick a company. See the whole picture.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[14px] text-surface-0/70">
            Macro projection, historical baseline, scenario forecasting, and an AI-authored report — in one run.
          </p>
          <Button asChild variant="accent" size="lg" className="mt-8">
            <Link href="/analysis">
              Run a full analysis <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
