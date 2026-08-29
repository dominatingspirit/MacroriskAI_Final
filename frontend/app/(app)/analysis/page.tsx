"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Cpu, Activity, ShieldCheck, Terminal } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { AnalysisForm } from "@/components/analysis/analysis-form";
import { AnalysisResults } from "@/components/analysis/analysis-results";
import { PipelineTimeline } from "@/components/analysis/pipeline-timeline";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAnalyzeCompany } from "@/lib/hooks/use-analyze-company";
import { useAnalysisContext } from "@/lib/providers/analysis-context";

export default function AnalysisPage() {
  const analysis = useAnalyzeCompany();
  const { setLastAnalysis } = useAnalysisContext();

  useEffect(() => {
    if (analysis.isSuccess) setLastAnalysis(analysis.data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysis.isSuccess, analysis.data]);

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-500">
      {/* Header Banner */}
      <div className="border-b border-line pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
  <div>
    <div className="flex items-center gap-2">
      <Cpu className="h-5 w-5 text-emerald-400" />
      <h1 className="text-2xl font-bold tracking-tight text-ink-primary">Econometric Projection & Analysis</h1>
    </div>
    <p className="text-sm text-ink-muted mt-1">
      Runs the LangGraph pipeline end-to-end: macro projection, company baseline, scenario-resilience forecasting, and an AI investment report.
    </p>
  </div>
  <Badge variant="outline" className="font-mono text-xs">Agents 1 → 4 Orchestration</Badge>
</div>

      <div className="flex flex-col gap-6">
        {/* Analysis Form Card */}
        <div className="transition-all">
          <AnalysisForm
            onSubmit={(companyName, monthsAhead) => analysis.mutate({ company_name: companyName, months_ahead: monthsAhead })}
            pending={analysis.isPending}
          />
        </div>

        {analysis.isPending && (
          <Card className="p-6 border-emerald-500/30 bg-gradient-to-br from-surface-1 to-emerald-950/10 shadow-xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-emerald-400 animate-spin" />
                <h3 className="font-bold text-ink-primary text-base">Multi-Agent Pipeline Executing</h3>
              </div>
              <Badge variant="neutral" className="font-mono text-xs text-emerald-400">Live Synthasis</Badge>
            </div>
            <div>
              <p className="text-sm font-semibold text-ink-primary">Agents are collaborating…</p>
              <p className="text-xs text-ink-muted mt-0.5">
                This is a single blocking request — the timeline below highlights sequential coordination steps across macro, fundamental, and scenario engines.
              </p>
            </div>
            <div className="pt-2">
              <PipelineTimeline />
            </div>
          </Card>
        )}

        {analysis.isError && <ErrorState error={analysis.error} />}

        {analysis.isSuccess && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <AnalysisResults data={analysis.data} />
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Link
                href="/assistant"
                className="group flex items-center justify-between gap-3 rounded-xl border border-line bg-surface-1/80 hover:bg-surface-2/80 px-6 py-4 text-sm text-ink-secondary transition-all shadow-lg hover:border-emerald-500/40"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-surface-2 border border-line text-emerald-400 group-hover:scale-105 transition-transform">
                    <Terminal className="h-4 w-4" />
                  </div>
                  <span>
                    This run is now active context for the <strong className="text-ink-primary font-semibold">AI Assistant</strong> —
                    ask deep follow-up questions about <span className="text-emerald-400 font-bold">{analysis.data.company.toUpperCase()}</span>.
                  </span>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-ink-muted group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
              </Link>
            </motion.div>
          </div>
        )}

        {analysis.isIdle && (
          <Card className="p-12 border-line bg-surface-1/40 text-center flex flex-col items-center justify-center space-y-3">
            <div className="p-3 rounded-full bg-surface-2 border border-line text-ink-muted">
              <Sparkles className="h-6 w-6 text-emerald-400" />
            </div>
            <h3 className="font-semibold text-ink-primary">No analysis pipeline executed yet</h3>
            <p className="text-xs text-ink-muted max-w-sm">
              Select a target company and forecast horizon above to trigger the full multi-agent financial synthesis engine.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
