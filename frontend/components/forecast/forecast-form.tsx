"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const PRESETS = [1, 3, 6];

export function ForecastForm({
  onSubmit,
  pending,
}: {
  onSubmit: (monthsAhead: number) => void;
  pending: boolean;
}) {
  const [months, setMonths] = useState(6);

  return (
    <Card className="p-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex-1">
          <div className="mb-3 flex items-center justify-between">
            <Label htmlFor="horizon">Forecast horizon</Label>
            <span className="rounded-full bg-accent-soft px-2.5 py-1 text-[13px] font-semibold tabular-nums text-accent-ink">
              {months} {months === 1 ? "month" : "months"}
            </span>
          </div>
          <input
            id="horizon"
            type="range"
            min={1}
            max={6}
            step={1}
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-surface-2 accent-[var(--accent)]"
          />
          <div className="mt-2 flex items-center justify-between text-[11px] text-ink-muted">
            <span>1</span>
            <span>6 months</span>
          </div>
          <div className="mt-3 flex gap-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setMonths(p)}
                className={`rounded-full border px-3 py-1 text-[12px] font-medium transition-colors ${
                  months === p
                    ? "border-accent bg-accent-soft text-accent-ink"
                    : "border-line text-ink-secondary hover:bg-surface-2"
                }`}
              >
                {p}mo
              </button>
            ))}
          </div>
        </div>

        <Button variant="accent" size="lg" onClick={() => onSubmit(months)} disabled={pending} className="sm:min-w-[200px]">
          <Sparkles className="h-4 w-4" />
          {pending ? "Forecasting…" : "Generate forecast"}
        </Button>
      </div>
    </Card>
  );
}
