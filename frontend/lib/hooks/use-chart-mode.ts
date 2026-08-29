"use client";

import { useTheme } from "next-themes";
import type { ChartMode } from "@/lib/utils/chart-colors";
import { useMounted } from "@/lib/hooks/use-mounted";

/** Resolves next-themes' theme to a concrete "light" | "dark" for chart palettes, safe across SSR hydration. */
export function useChartMode(): ChartMode {
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();

  if (!mounted) return "dark";
  return resolvedTheme === "light" ? "light" : "dark";
}
