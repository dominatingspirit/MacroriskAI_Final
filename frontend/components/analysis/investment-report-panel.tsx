"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AlertTriangle, FileText } from "lucide-react";

/** investment_report can be a "❌ Error generating report with OpenAI: ..." string on a still-200 response. */
export function InvestmentReportPanel({ report }: { report: string | null }) {
  if (!report) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-center">
        <FileText className="h-5 w-5 text-ink-muted" />
        <p className="text-[13px] text-ink-muted">No report was generated for this run.</p>
      </div>
    );
  }

  const failed = report.trim().startsWith("❌");

  if (failed) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-[var(--radius-md)] border border-[color-mix(in_oklab,var(--status-warning)_35%,var(--line))] bg-[color-mix(in_oklab,var(--status-warning)_8%,transparent)] px-6 py-10 text-center">
        <AlertTriangle className="h-5 w-5 text-[var(--status-warning)]" />
        <p className="text-[13px] font-medium text-ink-primary">Report generation failed</p>
        <p className="max-w-md text-[12px] text-ink-secondary">
          {report.replace(/^❌\s*/, "")} The rest of this analysis (forecasts, macro context, historical data) is
          unaffected — only the AI-authored narrative failed to generate.
        </p>
      </div>
    );
  }

  return (
    <article className="markdown-body max-w-none text-[14px] leading-relaxed text-ink-secondary [&_h1]:mt-0 [&_h1]:mb-3 [&_h1]:text-lg [&_h1]:font-semibold [&_h1]:text-ink-primary [&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:text-[15px] [&_h2]:font-semibold [&_h2]:text-ink-primary [&_h3]:mt-4 [&_h3]:mb-1.5 [&_h3]:text-[14px] [&_h3]:font-semibold [&_h3]:text-ink-primary [&_p]:mb-3 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_strong]:font-semibold [&_strong]:text-ink-primary [&_table]:w-full [&_table]:border-collapse [&_table]:text-[13px] [&_th]:border-b [&_th]:border-line [&_th]:bg-surface-2 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_td]:border-b [&_td]:border-line [&_td]:px-3 [&_td]:py-2 [&_table]:mb-4 [&_table]:overflow-hidden [&_table]:rounded-[10px]">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{report}</ReactMarkdown>
    </article>
  );
}
