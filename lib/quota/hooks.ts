"use client"

import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query/keys"
import { useUser } from "@/lib/user/hooks"
import { getQuota } from "./api"

export function useQuota() {
  const { currentClientId } = useUser()

  return useQuery({
    queryKey: queryKeys.quota.detail(currentClientId ?? "none"),
    queryFn: getQuota,
    enabled: Boolean(currentClientId),
  })
}
