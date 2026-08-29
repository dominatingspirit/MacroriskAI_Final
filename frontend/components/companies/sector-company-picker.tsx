"use client";

import { Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompaniesBySector, useSectors } from "@/lib/hooks/use-market-data";
import { formatSectorName } from "@/lib/utils/format";

interface SectorCompanyPickerProps {
  sector: string | null;
  company: string | null;
  onSectorChange: (sector: string) => void;
  onCompanyChange: (company: string) => void;
  onSubmit?: () => void;
  submitLabel?: string;
  pending?: boolean;
}

export function SectorCompanyPicker({
  sector,
  company,
  onSectorChange,
  onCompanyChange,
  onSubmit,
  submitLabel = "Fetch",
  pending,
}: SectorCompanyPickerProps) {
  const sectorsQuery = useSectors();
  const companiesQuery = useCompaniesBySector(sector);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
      <div>
        <Label>Sector</Label>
        {sectorsQuery.isLoading ? (
          <Skeleton className="mt-2 h-11 w-full" />
        ) : (
          <Select value={sector ?? undefined} onValueChange={onSectorChange}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select a sector" />
            </SelectTrigger>
            <SelectContent>
              {Array.from(new Set(sectorsQuery.data ?? [])).map((s) => (
                <SelectItem key={s} value={s}>
                  {formatSectorName(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div>
        <Label>Company</Label>
        <Select value={company ?? undefined} onValueChange={onCompanyChange} disabled={!sector}>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder={sector ? "Select a company" : "Select a sector first"} />
          </SelectTrigger>
          <SelectContent>
            {(companiesQuery.data ?? []).length === 0 && sector && !companiesQuery.isLoading ? (
              <div className="px-3 py-2 text-[13px] text-ink-muted">No companies in this sector</div>
            ) : null}
            {Array.from(new Set(companiesQuery.data ?? [])).map((c) => (
              <SelectItem key={c} value={c}>
                {c.toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {onSubmit ? (
        <Button variant="accent" onClick={onSubmit} disabled={!company || pending} className="h-11">
          <Search className="h-4 w-4" />
          {pending ? "Loading…" : submitLabel}
        </Button>
      ) : null}
    </div>
  );
}
