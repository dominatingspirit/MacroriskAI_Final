/**
 * Chart palette — the dataviz skill's validated default (colorblind-safe,
 * six-checks passed). Both light and dark steps are the same eight hues,
 * re-stepped for each surface; use the resolved theme to pick the column.
 */

export type ChartMode = "light" | "dark";

export const categorical: Record<ChartMode, string[]> = {
  light: [
    "#2a78d6", // 1 blue
    "#eb6834", // 2 orange
    "#1baf7a", // 3 aqua
    "#eda100", // 4 yellow
    "#e87ba4", // 5 magenta
    "#008300", // 6 green
    "#4a3aa7", // 7 violet
    "#e34948", // 8 red
  ],
  dark: [
    "#3987e5",
    "#d95926",
    "#199e70",
    "#c98500",
    "#d55181",
    "#008300",
    "#9085e9",
    "#e66767",
  ],
};

/** Single-hue sequential ramp (blue), 100 -> 700, lightest = "near zero". */
export const sequentialBlue: Record<ChartMode, string[]> = {
  light: [
    "#cde2fb",
    "#b7d3f6",
    "#9ec5f4",
    "#86b6ef",
    "#6da7ec",
    "#5598e7",
    "#3987e5",
    "#2a78d6",
    "#256abf",
    "#1c5cab",
    "#184f95",
    "#104281",
    "#0d366b",
  ],
  dark: [
    "#cde2fb",
    "#b7d3f6",
    "#9ec5f4",
    "#86b6ef",
    "#6da7ec",
    "#5598e7",
    "#3987e5",
    "#2a78d6",
    "#256abf",
    "#1c5cab",
    "#184f95",
    "#104281",
    "#0d366b",
  ],
};

export const diverging: Record<ChartMode, { negative: string; neutral: string; positive: string }> = {
  light: { negative: "#e34948", neutral: "#f0efec", positive: "#2a78d6" },
  dark: { negative: "#e66767", neutral: "#383835", positive: "#3987e5" },
};

export const status = {
  good: "#0ca30c",
  warning: "#fab219",
  serious: "#ec835a",
  critical: "#d03b3b",
};

export const chartChrome: Record<
  ChartMode,
  { surface: string; primaryInk: string; secondaryInk: string; mutedInk: string; gridline: string; baseline: string }
> = {
  light: {
    surface: "#fcfcfb",
    primaryInk: "#0b0b0b",
    secondaryInk: "#52514e",
    mutedInk: "#898781",
    gridline: "#e1e0d9",
    baseline: "#c3c2b7",
  },
  dark: {
    surface: "#1a1a19",
    primaryInk: "#ffffff",
    secondaryInk: "#c3c2b7",
    mutedInk: "#898781",
    gridline: "#2c2c2a",
    baseline: "#383835",
  },
};
