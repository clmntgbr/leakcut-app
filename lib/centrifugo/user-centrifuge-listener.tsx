"use client"

import { queryKeys } from "@/lib/query/keys"
import { useUser } from "@/lib/user/hooks"
import { useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"
import { claimRealtimeEventId } from "./event-dedupe"
import {
  isUserStreamEvent,
  shouldRefreshUser,
  shouldRefreshVideo,
} from "./types"
import { useCentrifuge } from "./use-centrifuge"

/**
 * Subscribes to `users:{id}`.
 * Realtime only syncs cache — local mutations already refetch via React Query.
 *
 * user.updated | user.deleted
 * video.created | video.uploaded | video.frames_extracted
 * video.frame_extraction_failed | video.upload_expired
 */
export function UserCentrifugeListener() {
  const { user, currentClientId } = useUser()
  const queryClient = useQueryClient()

  const handlePublication = useCallback(
    (data: unknown) => {
      if (!isUserStreamEvent(data)) return
      if (!claimRealtimeEventId(data.eventId)) return

      if (shouldRefreshUser(data)) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.user.me })
      }

      if (shouldRefreshVideo(data)) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.videos.all })
        if (currentClientId) {
          void queryClient.invalidateQueries({
            queryKey: queryKeys.quota.detail(currentClientId),
          })
        }
      }
    },
    [currentClientId, queryClient]
  )

  useCentrifuge(user?.id ?? null, handlePublication)

  return null
}
