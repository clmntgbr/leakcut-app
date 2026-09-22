"use client"

import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query/keys"
import { listPlans } from "./api"

export function usePlans() {
  return useQuery({
    queryKey: queryKeys.plans.all,
    queryFn: listPlans,
  })
}
