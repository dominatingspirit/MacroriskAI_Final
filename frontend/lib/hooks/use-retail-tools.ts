import { useMutation } from "@tanstack/react-query";
import { postEMI, postSalary } from "@/lib/api/endpoints";
import type { EMIRequest, SalaryRequest } from "@/lib/api/types";

export function useEMIShock() {
  return useMutation({ mutationFn: (req: EMIRequest) => postEMI(req) });
}

export function useSalaryCopilot() {
  return useMutation({ mutationFn: (req: SalaryRequest) => postSalary(req) });
}
