"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function MarketingNavbar() {
  return (
    <header className="glass sticky top-0 z-40 border-b border-line">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.jpg" alt="MacroRisk AI" width={32} height={32} className="h-8 w-8 shrink-0 rounded-full" />
          <span className="text-[14px] font-semibold tracking-tight text-ink-primary">MacroRisk AI</span>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="default" size="sm" className="ml-1">
            <Link href="/dashboard">Enter console</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
