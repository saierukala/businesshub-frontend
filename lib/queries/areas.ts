"use client";

import { useQuery } from "@tanstack/react-query";
import { api, qs } from "@/lib/api";
import type { AreaInUse } from "@/lib/areas";
import type { Page } from "@/lib/types";

// Areas already in use (for suggestions and spelling hints). Customers get technician areas only.
export function useAreas() {
  return useQuery({
    queryKey: ["areas"],
    queryFn: () => api<Page<AreaInUse>>(`/areas${qs({ pageSize: 100 })}`),
    staleTime: 60_000,
  });
}
