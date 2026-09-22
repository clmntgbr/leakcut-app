import { createAuthHeaders } from "@/lib/create-auth-headers"
import { requireAuth } from "@/lib/require-auth"
import { NextResponse } from "next/server"

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL
const VIDEO_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth()
    if ("error" in auth) return auth.error

    const { id } = await params
    if (!VIDEO_ID_PATTERN.test(id)) {
      return NextResponse.json({ message: "Invalid video id" }, { status: 400 })
    }

    const response = await fetch(
      `${BACKEND_API_URL}/api/videos/${encodeURIComponent(id)}`,
      {
        method: "GET",
        headers: createAuthHeaders(auth.token),
      }
    )

    const data = await response.json().catch(() => ({
      message: "Failed to get video",
    }))

    return NextResponse.json(data, { status: response.status })
  } catch {
    return NextResponse.json({ message: "Failed to get video" }, { status: 500 })
  }
}
