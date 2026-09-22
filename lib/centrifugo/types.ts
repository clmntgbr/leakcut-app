export type UserEventType = "user.created" | "user.updated" | "user.deleted"

export type VideoEventType = "video.created" | "video.uploaded"

export type JobEventType = "job.updated"

export type RealtimeEventType = UserEventType | VideoEventType | JobEventType

export interface UserStreamEvent {
  type: string
  eventId?: string
  userId?: string
  videoId?: string
  originalFilename?: string
  status?: string
  videoStatus?: string
  id?: string
  jobType?: string
  frameCount?: number
  expectedFrameCount?: number
  ocrCompletedCount?: number
  failureReason?: string
  occurredAt?: string
}

const EVENT_TYPES = new Set<string>([
  "user.created",
  "user.updated",
  "user.deleted",
  "video.created",
  "video.uploaded",
  "job.updated",
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

export function shouldRefreshVideos(event: UserStreamEvent): boolean {
  return (
    eventTypeEquals(event, "video.created") ||
    eventTypeEquals(event, "video.uploaded") ||
    eventTypeEquals(event, "job.updated")
  )
}
