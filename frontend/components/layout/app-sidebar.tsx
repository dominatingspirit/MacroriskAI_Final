"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { navItems } from "./nav-items";
import { cn } from "@/lib/utils/cn";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-[248px] shrink-0 flex-col border-r border-line bg-surface-1/60 px-4 py-6 lg:flex">
      <Link href="/" className="mb-8 flex items-center gap-2.5 px-2">
        <Image src="/logo.jpg" alt="MacroRisk AI" width={32} height={32} className="h-8 w-8 shrink-0 rounded-full" />
        <div className="leading-tight">
          <p className="text-[13px] font-semibold tracking-tight text-ink-primary">MacroRisk AI</p>
          <p className="text-[11px] text-ink-muted">Console</p>
        </div>
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-start justify-between gap-2 rounded-[var(--radius-sm)] px-3 py-2.5 text-[13px] font-medium transition-colors",
                active
                  ? "bg-surface-2 text-ink-primary"
                  : "text-ink-secondary hover:bg-surface-2/70 hover:text-ink-primary",
              )}
            >
              <span className="flex min-w-0 flex-1 items-start gap-2.5">
                <Icon
                  className={cn(
                    "mt-0.5 h-[17px] w-[17px] shrink-0",
                    active ? "text-accent-ink" : "text-ink-muted group-hover:text-ink-secondary",
                  )}
                />
                <span className="min-w-0 break-words leading-snug">{item.label}</span>
              </span>
              {item.agent ? (
                <span className="mt-0.5 shrink-0 rounded-full bg-surface-3 px-1.5 py-0.5 text-[10px] font-semibold text-ink-muted">
                  {item.agent}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <Link
        href="/"
        className="flex items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2.5 text-[13px] font-medium text-ink-muted transition-colors hover:bg-surface-2/70 hover:text-ink-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to overview
      </Link>
    </aside>
  );
}
