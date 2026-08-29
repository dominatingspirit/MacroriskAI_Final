"use client";

import { Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { AnalyzeCompanyResponse } from "@/lib/api/types";

export function RawStateDrawer({ data }: { data: AnalyzeCompanyResponse }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Code2 className="h-3.5 w-3.5" />
          View raw response
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col p-0">
        <SheetHeader>
          <SheetTitle>Raw LangGraph state</SheetTitle>
          <SheetDescription>Exact JSON returned by POST /analyze_company</SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-1">
          <pre className="p-6 text-[12px] leading-relaxed text-ink-secondary">
            <code>{JSON.stringify(data, null, 2)}</code>
          </pre>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
