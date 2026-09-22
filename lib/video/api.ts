import { ApiError, parseApiError } from "@/lib/api-error"
import {
  toSearchParams,
  type PaginateParams,
  type Paginated,
} from "@/lib/paginate"
import {
  isTerminalVideoStatus,
  type RequestUploadUrlInput,
  type RequestUploadUrlResponse,
  type Video,
  type VideoListItem,
} from "./types"

export async function listVideos(
  params: PaginateParams = {}
): Promise<Paginated<VideoListItem>> {
  const response = await fetch(`/api/videos${toSearchParams(params)}`, {
    method: "GET",
  })

  if (!response.ok) {
    throw await parseApiError(response, "Failed to list videos")
  }

  return response.json()
}

export async function requestUploadUrl(
  input: RequestUploadUrlInput,
  signal?: AbortSignal
): Promise<RequestUploadUrlResponse> {
  const response = await fetch("/api/videos/upload-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    signal,
  })

  if (!response.ok) {
    throw await parseApiError(response, "Failed to generate upload url")
  }

  return response.json()
}

export async function getVideo(
  id: string,
  signal?: AbortSignal
): Promise<Video> {
  const response = await fetch(`/api/videos/${id}`, { method: "GET", signal })

  if (!response.ok) {
    throw await parseApiError(response, "Failed to fetch video")
  }

  const video = (await response.json()) as Video
  return {
    ...video,
    jobs: video.jobs ?? [],
    frames: video.frames ?? [],
  }
}

export function uploadFileToPresignedUrl(
  file: File,
  presignedUrl: string,
  onProgress?: (progress: number) => void,
  signal?: AbortSignal
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open("PUT", presignedUrl)
    xhr.setRequestHeader(
      "Content-Type",
      file.type || "application/octet-stream"
    )

    const onAbort = () => xhr.abort()
    signal?.addEventListener("abort", onAbort, { once: true })

    const cleanup = () => {
      signal?.removeEventListener("abort", onAbort)
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100))
      }
    }

    xhr.onload = () => {
      cleanup()
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve()
        return
      }

      reject(new Error(`Upload failed: ${xhr.status}`))
    }

    xhr.onerror = () => {
      cleanup()
      reject(new Error("Upload failed"))
    }

    xhr.onabort = () => {
      cleanup()
      reject(new DOMException("Aborted", "AbortError"))
    }

    if (signal?.aborted) {
      cleanup()
      reject(new DOMException("Aborted", "AbortError"))
      return
    }

    xhr.send(file)
  })
}

const POLL_INTERVAL_MS = 2000
const POLL_DEADLINE_MS = 20 * 60 * 1000
const MAX_TRANSIENT_ERRORS = 5

export async function pollVideoUntilSettled(
  id: string,
  signal?: AbortSignal,
  onUpdate?: (video: Video) => void
): Promise<Video> {
  const startedAt = Date.now()
  let transientErrors = 0

  while (!signal?.aborted) {
    if (Date.now() - startedAt > POLL_DEADLINE_MS) {
      throw new Error("Frame extraction is taking too long. Try again later.")
    }

    try {
      const remaining = POLL_DEADLINE_MS - (Date.now() - startedAt)
      const video = await getVideo(
        id,
        mergeSignals(signal, AbortSignal.timeout(Math.max(1, remaining)))
      )
      transientErrors = 0
      onUpdate?.(video)

      if (isTerminalVideoStatus(video.status)) {
        return video
      }
    } catch (error) {
      if (signal?.aborted) {
        throw new DOMException("Aborted", "AbortError")
      }

      if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
        throw error
      }

      transientErrors += 1
      if (transientErrors >= MAX_TRANSIENT_ERRORS) {
        throw error
      }
    }

    await sleep(POLL_INTERVAL_MS, signal)
  }

  throw new DOMException("Aborted", "AbortError")
}

function mergeSignals(
  parent: AbortSignal | undefined,
  timeout: AbortSignal
): AbortSignal {
  if (!parent) return timeout
  if (typeof AbortSignal.any === "function") {
    return AbortSignal.any([parent, timeout])
  }
  return parent
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"))
      return
    }

    const onAbort = () => {
      clearTimeout(timeout)
      reject(new DOMException("Aborted", "AbortError"))
    }
    const timeout = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort)
      resolve()
    }, ms)
    signal?.addEventListener("abort", onAbort, { once: true })
  })
}
