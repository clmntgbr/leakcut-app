export type VideoStatus =
  | "pending_upload"
  | "uploaded"
  | "extraction_queued"
  | "extracting"
  | "frames_ready"
  | "extraction_failed"
  | "upload_expired"

export interface RequestUploadUrlInput {
  filename: string
  contentType: string
  sizeBytes: number
}

export interface RequestUploadUrlResponse {
  videoId: string
  uploadUrl: string
  expiresAt: string
}

export interface Video {
  id: string
  originalFilename: string | null
  storageKey: string
  sizeBytes: number
  contentType: string | null
  status: VideoStatus
  source: string
  scanJobId: string | null
  scanJobStatus: string | null
  frameCount: number
  failureReason: string | null
  createdAt: string
  updatedAt: string
}

export const VIDEO_TERMINAL_STATUSES: readonly VideoStatus[] = [
  "frames_ready",
  "extraction_failed",
  "upload_expired",
]

export function isTerminalVideoStatus(status: string): status is VideoStatus {
  return (VIDEO_TERMINAL_STATUSES as readonly string[]).includes(status)
}
