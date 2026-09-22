"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query/keys"
import { getUser, setCurrentClient } from "./api"

export function useUser() {
  const query = useQuery({
    queryKey: queryKeys.user.me,
    queryFn: getUser,
  })

  return {
    user: query.data ?? null,
    currentClientId: query.data?.currentClientId ?? null,
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  }
}
