import type { VideoStatus } from "./types"

export const VIDEO_STATUS_LABELS: Record<VideoStatus, string> = {
  pending_upload: "Waiting for upload",
  uploaded: "Uploaded",
  extraction_queued: "Queued",
  extracting: "Extracting frames",
  frames_ready: "Frames ready",
  ocr_processing: "Reading text",
  ocr_ready: "Text ready",
  classifying: "Classifying",
  classified: "Classified",
  extraction_failed: "Extraction failed",
  ocr_failed: "OCR failed",
  classify_failed: "Classification failed",
  upload_expired: "Upload expired",
}

export const FINDING_CATEGORY_LABELS: Record<string, string> = {
  email: "Email",
  iban: "IBAN",
  api_key: "API key",
  password: "Password",
  credit_card: "Credit card",
  phone: "Phone",
  private_key: "Private key",
  personal_id: "Personal ID",
  connection_string: "Connection string",
  jwt: "JWT",
  wallet_secret: "Wallet secret",
  webhook_secret: "Webhook secret",
  postal_address: "Postal address",
  person_name: "Person name",
}

export function getVideoStatusLabel(status: string): string {
  return VIDEO_STATUS_LABELS[status as VideoStatus] ?? status
}

export function getFindingCategoryLabel(name: string): string {
  return FINDING_CATEGORY_LABELS[name] ?? name.replaceAll("_", " ")
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

export function formatTimestamp(ms: number): string {
  return formatClock(ms)
}

export function formatClock(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return "00:00"
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
}

export function formatProbability(value: number): string {
  if (!Number.isFinite(value)) return "—"
  return `${Math.round(value * 100)}%`
}
