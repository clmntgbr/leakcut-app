export type VideoStatus =
  | "pending_upload"
  | "uploaded"
  | "extraction_queued"
  | "extracting"
  | "frames_ready"
  | "ocr_processing"
  | "ocr_ready"
  | "classifying"
  | "classified"
  | "extraction_failed"
  | "ocr_failed"
  | "classify_failed"
  | "upload_expired"

export type VideoJobType = "extract_frames" | "ocr" | "classify"

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

export interface VideoListItem {
  id: string
  originalFilename: string | null
  thumbnailUrl: string | null
  status: VideoStatus
  createdAt: string
}

export interface VideoJob {
  id: string
  type: VideoJobType | string
  status: string
  frameCount: number
  expectedFrameCount: number
  ocrCompletedCount: number
  failureReason?: string | null
}

export interface FindingCategory {
  name: string
  probability: number
}

export interface FrameFinding {
  id: string
  confidential: boolean
  probability: number
  categories: FindingCategory[]
  status: string
  errorReason?: string | null
}

export interface VideoFrame {
  id: string
  index: number
  timestampMs: number
  storageKey: string
  imageUrl: string | null
  selectionReason: string
  diffScore: number
  ocrText: string
  ocrStatus: string | null
  ocrConfidence: number
  ocrErrorReason: string | null
  finding: FrameFinding | null
}

export interface Video {
  id: string
  originalFilename: string | null
  storageKey: string
  thumbnailKey: string | null
  thumbnailUrl: string | null
  videoUrl: string | null
  sizeBytes: number
  contentType: string | null
  status: VideoStatus
  jobId: string | null
  jobStatus: string | null
  frameCount: number
  expectedFrameCount: number
  ocrCompletedCount: number
  failureReason: string | null
  jobs: VideoJob[]
  frames: VideoFrame[]
  createdAt: string
  updatedAt: string
}

export function videoHasThumbnail(
  video: Pick<VideoListItem, "thumbnailUrl">
): boolean {
  return Boolean(video.thumbnailUrl)
}

export function isClassifiedVideoStatus(status: string): boolean {
  return status === "classified"
}

export const VIDEO_TERMINAL_STATUSES: readonly VideoStatus[] = [
  "classified",
  "extraction_failed",
  "ocr_failed",
  "classify_failed",
  "upload_expired",
]

export const VIDEO_FAILED_STATUSES: readonly VideoStatus[] = [
  "extraction_failed",
  "ocr_failed",
  "classify_failed",
  "upload_expired",
]

export function isTerminalVideoStatus(status: string): status is VideoStatus {
  return (VIDEO_TERMINAL_STATUSES as readonly string[]).includes(status)
}

export function isFailedVideoStatus(status: string): boolean {
  return (VIDEO_FAILED_STATUSES as readonly string[]).includes(status)
}

export function jobByType(
  jobs: VideoJob[] | undefined,
  type: VideoJobType
): VideoJob | undefined {
  return jobs?.find((job) => job.type === type)
}
