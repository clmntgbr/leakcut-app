"use client"

import { queryKeys } from "@/lib/query/keys"
import { useUser } from "@/lib/user/hooks"
import { useQueryClient } from "@tanstack/react-query"
import { useCallback, useRef } from "react"
import { claimRealtimeEventId } from "./event-dedupe"
import {
  eventTypeEquals,
  isUserStreamEvent,
  shouldRefreshUser,
  shouldRefreshVideos,
} from "./types"
import { useCentrifuge } from "./use-centrifuge"

/**
 * Subscribes to `users:{id}` and refetches GET /videos on pipeline events:
 * video.created → video.uploaded → job.updated
 */
export function UserCentrifugeListener() {
  const { user } = useUser()
  const queryClient = useQueryClient()
  const lastJobOccurredAt = useRef(new Map<string, number>())

  const handlePublication = useCallback(
    (data: unknown) => {
      if (!isUserStreamEvent(data)) return
      if (!claimRealtimeEventId(data.eventId)) return

      if (shouldRefreshUser(data)) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.user.me })
      }

      if (!shouldRefreshVideos(data)) return

      if (eventTypeEquals(data, "job.updated") && isStaleJobUpdate(data, lastJobOccurredAt.current)) {
        return
      }

      void queryClient.refetchQueries({ queryKey: queryKeys.videos.lists() })
      if (data.videoId) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.videos.detail(data.videoId),
        })
      }
    },
    [queryClient]
  )

  useCentrifuge(user?.id ?? null, handlePublication)

  return null
}

function isStaleJobUpdate(
  event: { videoId?: string; occurredAt?: string },
  seen: Map<string, number>
): boolean {
  if (!event.videoId || !event.occurredAt) return false
  const at = Date.parse(event.occurredAt)
  if (Number.isNaN(at)) return false
  const previous = seen.get(event.videoId) ?? 0
  if (at < previous) return true
  seen.set(event.videoId, at)
  return false
}
