import { createAuthHeaders } from "@/lib/create-auth-headers"
import { requireAuth } from "@/lib/require-auth"
import { NextResponse } from "next/server"

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL

export async function GET(request: Request) {
  try {
    const auth = await requireAuth()
    if ("error" in auth) return auth.error

    const { search } = new URL(request.url)
    const response = await fetch(`${BACKEND_API_URL}/api/videos${search}`, {
      method: "GET",
      headers: createAuthHeaders(auth.token),
      cache: "no-store",
    })

    const data = await response.json().catch(() => ({
      message: "Failed to list videos",
    }))

    return NextResponse.json(data, { status: response.status })
  } catch {
    return NextResponse.json(
      { message: "Failed to list videos" },
      { status: 500 }
    )
  }
}
