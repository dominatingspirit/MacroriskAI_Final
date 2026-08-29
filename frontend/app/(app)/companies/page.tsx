"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Building2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { SectorCompanyPicker } from "@/components/companies/sector-company-picker";
import { HistoricalTrendChart } from "@/components/companies/historical-trend-chart";
import { HistoricalTable } from "@/components/companies/historical-table";
import { StatementsTable } from "@/components/companies/statements-table";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompanyFinancials } from "@/lib/hooks/use-market-data";
import { formatSectorName } from "@/lib/utils/format";

export default function CompaniesPage() {
  const [sector, setSector] = useState<string | null>(null);
  const [company, setCompany] = useState<string | null>(null);

  const financials = useCompanyFinancials(company);

  return (
    <div>
      <PageHeader
        eyebrow="Corporate Analysis Agent"
        title="Company Explorer"
        description="Drill from sector into company to pull the historical growth panel and the granular financial statements behind it."
      />

      <Card className="p-6">
        <SectorCompanyPicker
          sector={sector}
          company={company}
          onSectorChange={(s) => {
            setSector(s);
            setCompany(null);
          }}
          onCompanyChange={setCompany}
        />
      </Card>

      <div className="mt-6">
        {!company && (
          <EmptyState
            icon={Building2}
            title="Pick a sector and a company"
            description="Historical financials and granular statements will appear here once a company is selected."
          />
        )}

        {company && financials.isLoading && (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-20" />
            <Skeleton className="h-72" />
          </div>
        )}

        {company && financials.isError && (
          <ErrorState error={financials.error} onRetry={() => financials.refetch()} />
        )}

        {company && financials.isSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-6"
          >
            <Card className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-ink-primary">
                  {financials.data.company.toUpperCase()}
                </h2>
                <p className="mt-1 text-[13px] text-ink-muted">{formatSectorName(financials.data.industry)}</p>
              </div>
              <Badge variant="accent" className="w-fit">
                Latest data · FY{financials.data.latest_year_available}
              </Badge>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Historical trend</CardTitle>
                <CardDescription>Growth metric over time, from the macro-linked panel dataset</CardDescription>
              </CardHeader>
              <CardContent>
                <HistoricalTrendChart rows={financials.data.historical_trend} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial records</CardTitle>
                <CardDescription>Full panel vs. raw growth-statement CSV, side by side</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="panel">
                  <TabsList>
                    <TabsTrigger value="panel">Historical panel</TabsTrigger>
                    <TabsTrigger value="statements">Growth statements</TabsTrigger>
                  </TabsList>
                  <TabsContent value="panel">
                    <HistoricalTable rows={financials.data.historical_trend} />
                  </TabsContent>
                  <TabsContent value="statements">
                    {financials.data.financial_statements.length === 0 ? (
                      <p className="py-10 text-center text-[13px] text-ink-muted">
                        No granular statements found for this company in the growth-statements CSV.
                      </p>
                    ) : (
                      <StatementsTable rows={financials.data.financial_statements} />
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
