"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query/keys"
import { useUser } from "@/lib/user/hooks"
import {
  createBillingPortalSession,
  createSubscription,
  getSubscription,
  previewSubscription,
} from "./api"
import type { CreateSubscriptionRequest } from "./types"

export function useSubscription() {
  const { currentClientId } = useUser()

  return useQuery({
    queryKey: queryKeys.subscription.detail(currentClientId ?? "none"),
    queryFn: getSubscription,
    enabled: Boolean(currentClientId),
  })
}

export function usePreviewSubscription() {
  return useMutation({
    mutationFn: (planId: string) => previewSubscription(planId),
  })
}

export function useCreateSubscription() {
  const queryClient = useQueryClient()
  const { currentClientId } = useUser()

  return useMutation({
    mutationFn: (input: CreateSubscriptionRequest) => createSubscription(input),
    onSuccess: async () => {
      if (!currentClientId) return
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.subscription.detail(currentClientId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.quota.detail(currentClientId),
        }),
      ])
    },
  })
}

export function useBillingPortal() {
  return useMutation({
    mutationFn: createBillingPortalSession,
  })
}
