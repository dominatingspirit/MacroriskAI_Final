import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { QueryProvider } from "@/lib/providers/query-provider";
import { ThemeProvider } from "@/lib/providers/theme-provider";
import { AnalysisProvider } from "@/lib/providers/analysis-context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MacroRisk AI — Multi-Agent Macro & Equity Intelligence",
  description:
    "Ensemble inflation forecasting, corporate financial modeling, and AI-authored investment research in one console.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f9f9f7" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-surface-0 text-ink-primary">
        <ThemeProvider>
          <QueryProvider>
            <AnalysisProvider>
              {children}
              <Toaster
                position="bottom-right"
                theme="system"
                toastOptions={{
                  style: {
                    background: "var(--surface-1)",
                    color: "var(--ink-primary)",
                    border: "1px solid var(--line)",
                  },
                }}
              />
            </AnalysisProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
