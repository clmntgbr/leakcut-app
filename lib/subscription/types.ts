import type { Plan } from "@/lib/plan/types"

export type SubscriptionStatus =
  | "active"
  | "inactive"
  | "cancelled"
  | "pending"
  | "past_due"
  | string

export interface Subscription {
  id: string
  status: SubscriptionStatus
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  startDate: string
  endDate: string | null
  cancelAtPeriodEnd: boolean
  quotaPeriodStart: string
  plan: Plan | null
  createdAt: string
  updatedAt: string
}

export interface CreateSubscriptionRequest {
  planId: string
  prorationDate?: number
}

export interface CreateSubscriptionResponse {
  url: string | null
  updated: boolean
}

export interface BillingPortalResponse {
  url: string
}

export interface SubscriptionPreviewLine {
  description: string | null
  amount: number
  proration: boolean
}

export interface SubscriptionPreview {
  requiresCheckout: boolean
  currency?: string | null
  amountDue: number
  subtotal: number
  total: number
  prorationDate?: number | null
  periodStart: string
  periodEnd: string
  lines: SubscriptionPreviewLine[]
  currentPlanId?: string | null
  currentPlanSlug?: string | null
  targetPlanId: string
  targetPlanSlug: string
  targetPlanName: string
  targetPlanPrice: number
}
