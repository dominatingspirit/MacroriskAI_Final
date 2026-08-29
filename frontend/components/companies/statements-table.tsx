import { formatPercent } from "@/lib/utils/format";
import type { FinancialStatementRow } from "@/lib/api/types";

const COLUMNS: { key: keyof FinancialStatementRow; label: string }[] = [
  { key: "Total Liabilities Growth %", label: "Total Liabilities" },
  { key: "Borrowings Growth %", label: "Borrowings" },
  { key: "Equity Growth %", label: "Equity" },
  { key: "Total Assets Growth %", label: "Total Assets" },
  { key: "Operating Profit Growth %", label: "Op. Profit" },
  { key: "Net Profit Growth %", label: "Net Profit" },
  { key: "Operating Cash Flow Growth %", label: "Op. Cash Flow" },
];

export function StatementsTable({ rows }: { rows: FinancialStatementRow[] }) {
  const sorted = [...rows].sort((a, b) => (b.Year ?? 0) - (a.Year ?? 0));

  return (
    <div className="max-h-[420px] overflow-auto rounded-[var(--radius-md)] border border-line">
      <table className="w-full min-w-[760px] border-collapse text-[13px]">
        <thead className="sticky top-0 z-10 bg-surface-2">
          <tr className="text-left text-[11px] uppercase tracking-wide text-ink-muted">
            <th className="px-4 py-3 font-semibold">Year</th>
            {COLUMNS.map((c) => (
              <th key={c.key as string} className="px-4 py-3 font-semibold">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr key={`${row.Year}-${i}`} className={i % 2 === 1 ? "bg-surface-2/25" : undefined}>
              <td className="sticky left-0 bg-inherit px-4 py-2.5 font-semibold text-ink-primary">{row.Year ?? "—"}</td>
              {COLUMNS.map((c) => {
                const value = row[c.key] as number | null | undefined;
                return (
                  <td
                    key={c.key as string}
                    className={`px-4 py-2.5 tabular-nums ${
                      value === null || value === undefined
                        ? "text-ink-muted"
                        : value >= 0
                          ? "text-good"
                          : "text-critical"
                    }`}
                  >
                    {value === null || value === undefined ? "—" : formatPercent(value)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
