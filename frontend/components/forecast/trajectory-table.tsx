import { formatCurrency, formatMonth, formatNumber, formatPercent, formatRupee } from "@/lib/utils/format";
import type { TrajectoryPoint } from "@/lib/api/types";

export function TrajectoryTable({ trajectory }: { trajectory: TrajectoryPoint[] }) {
  return (
    <div className="overflow-x-auto rounded-[var(--radius-md)] border border-line">
      <table className="w-full min-w-[560px] border-collapse text-[13px]">
        <thead>
          <tr className="border-b border-line bg-surface-2/60 text-left text-[11px] uppercase tracking-wide text-ink-muted">
            <th className="px-4 py-3 font-semibold">Month</th>
            <th className="px-4 py-3 font-semibold">Inflation (YoY)</th>
            <th className="px-4 py-3 font-semibold">WPI</th>
            <th className="px-4 py-3 font-semibold">Repo rate</th>
            <th className="px-4 py-3 font-semibold">Brent oil</th>
            <th className="px-4 py-3 font-semibold">Exchange rate</th>
          </tr>
        </thead>
        <tbody>
          {trajectory.map((row, i) => (
            <tr key={row.date} className={i % 2 === 1 ? "bg-surface-2/25" : undefined}>
              <td className="px-4 py-2.5 font-medium text-ink-primary">{formatMonth(row.date)}</td>
              <td className="px-4 py-2.5 tabular-nums font-semibold text-accent-ink">
                {formatPercent(row.inflation_forecast)}
              </td>
              <td className="px-4 py-2.5 tabular-nums text-ink-secondary">{formatNumber(row.projected_wpi)}</td>
              <td className="px-4 py-2.5 tabular-nums text-ink-secondary">{formatPercent(row.projected_repo)}</td>
              <td className="px-4 py-2.5 tabular-nums text-ink-secondary">{formatCurrency(row.projected_oil)}</td>
              <td className="px-4 py-2.5 tabular-nums text-ink-secondary">{formatRupee(row.projected_exchange)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
