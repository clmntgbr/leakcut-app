"use client"

import { ApiError } from "@/lib/api-error"
import { queryKeys } from "@/lib/query/keys"
import { useUser } from "@/lib/user/hooks"
import { useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import {
  pollVideoUntilSettled,
  requestUploadUrl,
  uploadFileToPresignedUrl,
} from "./api"
import type { Video } from "./types"

export type VideoUploadPhase =
  | "idle"
  | "requesting"
  | "uploading"
  | "processing"
  | "done"
  | "failed"
  | "expired"

function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === "AbortError") ||
    (error instanceof Error && error.name === "AbortError")
  )
}

export function useVideoUpload() {
  const queryClient = useQueryClient()
  const { currentClientId } = useUser()
  const [phase, setPhase] = useState<VideoUploadPhase>("idle")
  const [progress, setProgress] = useState(0)
  const [video, setVideo] = useState<Video | null>(null)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const runIdRef = useRef(0)
  const inFlightRef = useRef(false)

  const reset = useCallback(() => {
    runIdRef.current += 1
    inFlightRef.current = false
    abortRef.current?.abort()
    abortRef.current = null
    setPhase("idle")
    setProgress(0)
    setVideo(null)
    setError(null)
  }, [])

  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  const upload = useCallback(async (file: File) => {
    if (inFlightRef.current) return
    inFlightRef.current = true

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    const runId = runIdRef.current + 1
    runIdRef.current = runId

    const isCurrent = () =>
      runIdRef.current === runId && !controller.signal.aborted

    setError(null)
    setProgress(0)
    setVideo(null)
    setPhase("requesting")

    try {
      const { videoId, uploadUrl } = await requestUploadUrl(
        {
          filename: file.name,
          contentType: file.type || "application/octet-stream",
          sizeBytes: file.size,
        },
        controller.signal
      )

      if (!isCurrent()) return

      setPhase("uploading")
      await uploadFileToPresignedUrl(
        file,
        uploadUrl,
        (next) => {
          if (isCurrent()) setProgress(next)
        },
        controller.signal
      )

      if (!isCurrent()) return

      setPhase("processing")
      const settled = await pollVideoUntilSettled(
        videoId,
        controller.signal,
        (next) => {
          if (isCurrent()) setVideo(next)
        }
      )

      if (!isCurrent()) return

      if (settled.status === "frames_ready") {
        setPhase("done")
        void queryClient.invalidateQueries({ queryKey: queryKeys.videos.all })
        if (currentClientId) {
          void queryClient.invalidateQueries({
            queryKey: queryKeys.quota.detail(currentClientId),
          })
        }
        toast.success(
          settled.frameCount === 1
            ? "Video ready — 1 frame kept"
            : `Video ready — ${settled.frameCount} frames kept`
        )
        return
      }
      if (settled.status === "upload_expired") {
        const message =
          settled.failureReason ?? "Upload expired. Start a new upload."
        setPhase("expired")
        setError(message)
        toast.error(message)
        return
      }

      const failedMessage = settled.failureReason ?? "Frame extraction failed"
      setPhase("failed")
      setError(failedMessage)
      toast.error(failedMessage)
    } catch (caught) {
      if (!isCurrent() || isAbortError(caught)) return

      const message =
        caught instanceof ApiError
          ? caught.message
          : caught instanceof Error
            ? caught.message
            : "Upload failed"

      setError(message)
      setPhase("failed")
      toast.error(message)
    } finally {
      if (runIdRef.current === runId) {
        inFlightRef.current = false
      }
    }
  }, [currentClientId, queryClient])

  return { phase, progress, video, error, upload, reset }
}
