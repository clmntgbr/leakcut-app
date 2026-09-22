export type UserEventType = "user.created" | "user.updated" | "user.deleted"

export type VideoEventType =
  | "video.created"
  | "video.uploaded"
  | "video.frames_extracted"
  | "video.frame_extraction_failed"
  | "video.upload_expired"

export type RealtimeEventType = UserEventType | VideoEventType

export interface UserStreamEvent {
  type: string
  eventId?: string
  userId?: string
  clerkId?: string
  firstName?: string
  lastName?: string
  email?: string
  videoId?: string
  status?: string
  filename?: string
  storageKey?: string
  frameCount?: number
  reason?: string
  timestamp?: string
}

const EVENT_TYPES = new Set<string>([
  "user.created",
  "user.updated",
  "user.deleted",
  "video.created",
  "video.uploaded",
  "video.frames_extracted",
  "video.frame_extraction_failed",
  "video.upload_expired",
])

export function canonicalizeRealtimeType(type: string): string {
  return type.replace(/\.v\d+$/, "")
}

export function isUserStreamEvent(data: unknown): data is UserStreamEvent {
  if (!data || typeof data !== "object") return false
  const type = (data as { type?: unknown }).type
  if (typeof type !== "string") return false
  return EVENT_TYPES.has(canonicalizeRealtimeType(type))
}

export function eventTypeEquals(
  event: UserStreamEvent,
  type: RealtimeEventType
): boolean {
  return canonicalizeRealtimeType(event.type) === type
}

export function shouldRefreshUser(event: UserStreamEvent): boolean {
  return (
    eventTypeEquals(event, "user.updated") ||
    eventTypeEquals(event, "user.deleted")
  )
}

export function shouldRefreshVideo(event: UserStreamEvent): boolean {
  return canonicalizeRealtimeType(event.type).startsWith("video.")
}
