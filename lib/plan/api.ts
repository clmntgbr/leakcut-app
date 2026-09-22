import { parseApiError } from "@/lib/api-error"
import type { Plan } from "./types"

export async function listPlans(): Promise<Plan[]> {
  const response = await fetch("/api/plans", { method: "GET" })

  if (!response.ok) {
    throw await parseApiError(response, "Failed to fetch plans")
  }

  return response.json()
}
