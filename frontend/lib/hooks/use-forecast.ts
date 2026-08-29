"use client";

import { useMutation } from "@tanstack/react-query";
import { postForecast } from "@/lib/api/endpoints";
import type { ForecastRequest } from "@/lib/api/types";

export function useForecast() {
  return useMutation({
    mutationFn: (req: ForecastRequest) => postForecast(req),
  });
}
