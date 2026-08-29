"use client";

import { useEffect } from "react";
import { LineChart } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { ForecastForm } from "@/components/forecast/forecast-form";
import { ForecastResults } from "@/components/forecast/forecast-results";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useForecast } from "@/lib/hooks/use-forecast";

export default function ForecastPage() {
  const forecast = useForecast();

  useEffect(() => {
    forecast.mutate({ months_ahead: 6 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <PageHeader
        eyebrow="Inflation Outlook Agent"
        title="Macro Forecast"
        description="A multi-step autoregressive ensemble of XGBoost, LightGBM, SARIMAX and VAR(2) — projecting India's CPI inflation path, and the WPI / repo / Brent / FX trajectory it's derived from."
      />

      <div className="flex flex-col gap-6">
        <ForecastForm onSubmit={(months) => forecast.mutate({ months_ahead: months })} pending={forecast.isPending} />

        {forecast.isPending && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
        )}

        {forecast.isError && <ErrorState error={forecast.error} onRetry={() => forecast.mutate({ months_ahead: 6 })} />}

        {forecast.isSuccess && <ForecastResults data={forecast.data} />}

        {forecast.isIdle && (
          <EmptyState
            icon={LineChart}
            title="No forecast yet"
            description="Choose a horizon above and generate a forecast to see the projected inflation path."
          />
        )}
      </div>
    </div>
  );
}
