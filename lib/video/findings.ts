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
  if (!frame.finding) return false
  return frame.finding.status !== "skipped"
}

export function isConfidentialFrame(frame: VideoFrame): boolean {
  return Boolean(isScoredFrame(frame) && frame.finding?.confidential)
}

export function hasConfidentialFinding(frames: VideoFrame[]): boolean {
  return frames.some(isConfidentialFrame)
}

export function sensitiveFormats(frames: VideoFrame[]): string[] {
  const names = new Set<string>()
  for (const frame of frames) {
    if (!isScoredFrame(frame)) continue
    for (const category of frame.finding?.categories ?? []) {
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
            frame.finding?.categories ?? [],
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
      ? (frame.finding?.categories ?? [])
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
