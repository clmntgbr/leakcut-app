import { parseApiError } from "@/lib/api-error"
import { User } from "./types"

export const getUser = async (): Promise<User> => {
  const response = await fetch("/api/users", {
    method: "GET",
  })

  if (!response.ok) {
    throw await parseApiError(response, "Failed to fetch user")
  }

  return response.json()
}

export const setCurrentClient = async (clientId: string): Promise<User> => {
  const response = await fetch("/api/users/current-client", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clientId }),
  })

  if (!response.ok) {
    // Backend returns the same 404 "client not found" for unknown id and non-member.
    throw await parseApiError(response, "Client not found")
  }

  return response.json()
}
