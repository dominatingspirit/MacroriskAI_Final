import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
  {
    variants: {
      variant: {
        neutral: "bg-surface-2 text-ink-secondary border border-line",
        accent: "bg-accent-soft text-accent-ink",
        good: "bg-[color-mix(in_oklab,var(--status-good)_16%,transparent)] text-good",
        warning: "bg-[color-mix(in_oklab,var(--status-warning)_20%,transparent)] text-[var(--status-warning)]",
        critical: "bg-[color-mix(in_oklab,var(--status-critical)_16%,transparent)] text-critical",
        outline: "border border-line-strong text-ink-secondary",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
