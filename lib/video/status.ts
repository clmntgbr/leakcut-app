import type { VideoStatus } from "./types"

export const VIDEO_STATUS_LABELS: Record<VideoStatus, string> = {
  pending_upload: "Waiting for S3 PUT",
  uploaded: "Uploaded",
  extraction_queued: "Extracting frames",
  extracting: "Extracting frames",
  frames_ready: "Done",
  extraction_failed: "Failed",
  upload_expired: "Upload expired",
}

export function getVideoStatusLabel(status: string): string {
  return VIDEO_STATUS_LABELS[status as VideoStatus] ?? status
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "—"
  if (bytes < 1024) return `${bytes} B`
  const units = ["KB", "MB", "GB", "TB"]
  let value = bytes / 1024
  let unitIndex = 0
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }
  return `${value.toLocaleString("en-US", { maximumFractionDigits: value < 10 ? 1 : 0 })} ${units[unitIndex]}`
}
