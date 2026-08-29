"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu } from "lucide-react";
import { navItems } from "./nav-items";
import { ThemeToggle } from "./theme-toggle";
import { ConnectionStatus } from "@/components/common/connection-status";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export function AppTopbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const current = navItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));

  return (
    <header className="glass sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-line px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div>
          <p className="text-[15px] font-semibold tracking-tight text-ink-primary">
            {current?.label ?? "Console"}
          </p>
          {current?.agent ? <p className="text-[11px] text-ink-muted">Powered by {current.agent}</p> : null}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <ConnectionStatus />
        <ThemeToggle />
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent className="sm:max-w-xs p-0">
          <div className="flex items-center gap-2.5 border-b border-line px-5 py-5">
            <Image src="/logo.jpg" alt="MacroRisk AI" width={32} height={32} className="h-8 w-8 shrink-0 rounded-full" />
            <p className="text-[13px] font-semibold text-ink-primary">MacroRisk AI</p>
          </div>
          <nav className="flex flex-col gap-1 p-3">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-[var(--radius-sm)] px-3 py-2.5 text-sm font-medium",
                    active ? "bg-surface-2 text-ink-primary" : "text-ink-secondary hover:bg-surface-2/70",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}
