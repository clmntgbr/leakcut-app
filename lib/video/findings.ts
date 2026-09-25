import type { VideoFrame } from "./types"

export type RiskGroupId = "personal" | "confidential" | "keys"

export const RISK_GROUP_CATEGORIES: Record<RiskGroupId, readonly string[]> = {
  personal: ["email", "phone_number", "phone"],
  confidential: ["password", "connection_string", "other"],
  keys: ["api_key", "iban", "credit_card"],
}

export const RISK_GROUP_META: Record<
  RiskGroupId,
  { label: string; color: string }
> = {
  personal: {
    label: "Données personnelles",
    color: "hsl(217 91% 60%)",
  },
  confidential: {
    label: "Contenu confidentiel",
    color: "hsl(38 92% 50%)",
  },
  keys: {
    label: "Clé, IBAN, carte",
    color: "hsl(0 84% 60%)",
  },
}

export const RISK_GROUP_IDS: readonly RiskGroupId[] = [
  "personal",
  "confidential",
  "keys",
]

export function groupScore(
  categories: { name: string; probability: number }[],
  group: readonly string[]
): number {
  const matches = categories.filter((category) => group.includes(category.name))
  return matches.length
    ? Math.max(...matches.map((category) => category.probability))
    : 0
}

export function isScoredFrame(frame: VideoFrame): boolean {
  if (frame.ocrStatus === "empty") return false
  if (!frame.classification) return false
  return frame.classification.status !== "skipped"
}

export function isConfidentialFrame(frame: VideoFrame): boolean {
  return Boolean(isScoredFrame(frame) && frame.classification?.confidential)
}

export function hasConfidentialClassification(frames: VideoFrame[]): boolean {
  return frames.some(isConfidentialFrame)
}

export function sensitiveFormats(frames: VideoFrame[]): string[] {
  const names = new Set<string>()
  for (const frame of frames) {
    if (!isScoredFrame(frame)) continue
    for (const category of frame.classification?.categories ?? []) {
      names.add(category.name)
    }
  }
  return [...names].sort((a, b) => a.localeCompare(b))
}

export interface RiskGroupScore {
  id: RiskGroupId
  label: string
  color: string
  value: number
}

export function groupScores(frames: VideoFrame[]): RiskGroupScore[] {
  const scored = frames.filter(isScoredFrame)
  return RISK_GROUP_IDS.map((id) => {
    const value = scored.reduce(
      (max, frame) =>
        Math.max(
          max,
          groupScore(
            frame.classification?.categories ?? [],
            RISK_GROUP_CATEGORIES[id]
          )
        ),
      0
    )
    return {
      id,
      ...RISK_GROUP_META[id],
      value: Math.round(value * 100),
    }
  })
}

export interface TimelinePoint {
  timeMs: number
  personal: number
  confidential: number
  keys: number
}

export function timelinePoints(frames: VideoFrame[]): TimelinePoint[] {
  return frames.map((frame) => {
    const categories = isScoredFrame(frame)
      ? (frame.classification?.categories ?? [])
      : []
    return {
      timeMs: frame.timestampMs,
      personal: groupScore(categories, RISK_GROUP_CATEGORIES.personal) * 100,
      confidential:
        groupScore(categories, RISK_GROUP_CATEGORIES.confidential) * 100,
      keys: groupScore(categories, RISK_GROUP_CATEGORIES.keys) * 100,
    }
  })
}

export function sortedFrames(frames: VideoFrame[]): VideoFrame[] {
  return [...frames].sort(
    (left, right) =>
      left.timestampMs - right.timestampMs || left.index - right.index
  )
}

export function frameNumber(frame: VideoFrame): number {
  return frame.index + 1
}

export function frameDisplayName(frame: VideoFrame): string {
  return `Frame ${frameNumber(frame)}`
}

const SEEK_JITTER_MS = 40

export function enclosingFrame(
  frames: VideoFrame[],
  timeMs: number
): VideoFrame | null {
  if (frames.length === 0) return null
  let current: VideoFrame | null = null
  for (const frame of frames) {
    if (frame.timestampMs <= timeMs + SEEK_JITTER_MS) current = frame
    else break
  }
  return current ?? frames[0]
}

export function seekTimeMsForFrame(
  _frames: VideoFrame[],
  frame: VideoFrame
): number {
  return frame.timestampMs
}

export interface HighlightedOcrBox {
  id: string
  group: RiskGroupId
  x: number
  y: number
  width: number
  height: number
}

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i
const PHONE_RE = /(?:\+|00)\d{8,15}|\b0[1-9](?:[\s.-]?\d{2}){4}\b/
const PASSWORD_RE = /password|passwd|pwd[=:]|secret|jwt/i
const CONNECTION_RE =
  /postgres:\/\/|mysql:\/\/|mongodb(\+srv)?:\/\/|redis:\/\/|DATABASE_URL|connection.?string/i
const API_KEY_RE =
  /api[_-]?key|sk_live_|sk_test_|whsec_|whseC_|SG\.[A-Za-z0-9_-]{8,}|AIza[0-9A-Za-z_-]{20,}|SENTRY_DSN/i
const IBAN_RE = /\b[A-Z]{2}\d{2}[A-Z0-9]{10,30}\b/
const CARD_RE = /\b(?:\d[ -]*?){13,19}\b/
const BOX_PAD_PX = 3

function categoriesInLine(text: string): string[] {
  const names: string[] = []
  if (EMAIL_RE.test(text)) names.push("email")
  if (PHONE_RE.test(text)) names.push("phone", "phone_number")
  if (PASSWORD_RE.test(text)) names.push("password")
  if (CONNECTION_RE.test(text)) names.push("connection_string")
  if (API_KEY_RE.test(text)) names.push("api_key")
  if (IBAN_RE.test(text)) names.push("iban")
  if (CARD_RE.test(text) && !PHONE_RE.test(text)) names.push("credit_card")
  return names
}

function groupForMatchedCategories(names: string[]): RiskGroupId | null {
  if (names.some((name) => RISK_GROUP_CATEGORIES.personal.includes(name))) {
    return "personal"
  }
  if (names.some((name) => RISK_GROUP_CATEGORIES.confidential.includes(name))) {
    return "confidential"
  }
  if (names.some((name) => RISK_GROUP_CATEGORIES.keys.includes(name))) {
    return "keys"
  }
  return null
}

function ocrBoxBounds(box: { x: number; y: number }[]) {
  if (box.length === 0) return null
  const xs = box.map((point) => point.x)
  const ys = box.map((point) => point.y)
  const x = Math.min(...xs)
  const y = Math.min(...ys)
  const width = Math.max(...xs) - x
  const height = Math.max(...ys) - y
  if (width <= 0 || height <= 0) return null
  return {
    x: Math.max(0, x - BOX_PAD_PX),
    y: Math.max(0, y - BOX_PAD_PX),
    width: width + BOX_PAD_PX * 2,
    height: height + BOX_PAD_PX * 2,
  }
}

export function highlightedOcrBoxes(
  frame: VideoFrame | null
): HighlightedOcrBox[] {
  if (!frame?.ocrLines?.length || !isScoredFrame(frame)) return []
  const found = new Set(
    (frame.classification?.categories ?? []).map((category) => category.name)
  )
  if (found.size === 0) return []

  const boxes: HighlightedOcrBox[] = []
  frame.ocrLines.forEach((line, index) => {
    const matched = categoriesInLine(line.text).filter((name) => found.has(name))
    const group = groupForMatchedCategories(matched)
    const bounds = ocrBoxBounds(line.box)
    if (!group || !bounds) return
    boxes.push({
      id: `${frame.id}-${index}`,
      group,
      ...bounds,
    })
  })
  return boxes
}
