import { parseApiError } from "@/lib/api-error"
import type { QuotaUsage } from "./types"

export async function getQuota(): Promise<QuotaUsage> {
  const response = await fetch("/api/quota", { method: "GET" })

  if (!response.ok) {
    throw await parseApiError(response, "Failed to fetch quota")
  }

  return response.json()
}
