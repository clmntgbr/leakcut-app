const MAX_SEEN_EVENT_IDS = 500

const seenIds = new Set<string>()
const seenOrder: string[] = []

/**
 * Returns true the first time `eventId` is seen (caller should process).
 * Returns false for duplicates. Events without an id are always processed.
 */
export function claimRealtimeEventId(eventId: string | undefined | null): boolean {
  if (!eventId) return true
  if (seenIds.has(eventId)) return false

  seenIds.add(eventId)
  seenOrder.push(eventId)

  if (seenOrder.length > MAX_SEEN_EVENT_IDS) {
    const oldest = seenOrder.shift()
    if (oldest) seenIds.delete(oldest)
  }

  return true
}

/** Test helper — clears the in-memory dedupe window. */
export function resetRealtimeEventDedupe() {
  seenIds.clear()
  seenOrder.length = 0
}
