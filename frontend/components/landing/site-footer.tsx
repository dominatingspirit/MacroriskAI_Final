import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-10 text-center sm:flex-row sm:justify-between sm:text-left lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-[13px] font-medium text-ink-secondary">
          <Image src="/logo.jpg" alt="MacroRisk AI" width={16} height={16} className="h-4 w-4 shrink-0 rounded-full" />
          MacroRisk AI
        </Link>
        <p className="text-[12px] text-ink-muted">
          A FastAPI + LangGraph multi-agent pipeline, console built with Next.js.
        </p>
      </div>
    </footer>
  );
}
