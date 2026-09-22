import type { FindingCategory, VideoFrame } from "./types"

export const FOUND_CATEGORY_THRESHOLD = 0.5

export function isCategoryFound(category: FindingCategory): boolean {
  return category.probability >= FOUND_CATEGORY_THRESHOLD
}

export function foundCategoryNames(frames: VideoFrame[]): string[] {
  const names = new Set<string>()
  for (const frame of frames) {
    for (const category of frame.finding?.categories ?? []) {
      if (isCategoryFound(category)) names.add(category.name)
    }
  }
  return [...names].sort((a, b) => a.localeCompare(b))
}

export function frameMatchesQuestion(
  frame: VideoFrame,
  question: string | null
): boolean {
  if (!question) return true
  return (frame.finding?.categories ?? []).some(
    (category) => category.name === question && isCategoryFound(category)
  )
}

export function confidentialFrameCount(frames: VideoFrame[]): number {
  return frames.filter((frame) => frame.finding?.confidential).length
}

export function frameRisk(
  frame: VideoFrame,
  question: string | null
): number {
  if (question) {
    return (
      frame.finding?.categories.find((category) => category.name === question)
        ?.probability ?? 0
    )
  }
  return frame.finding?.probability ?? 0
}

const PERSONAL_CATEGORIES = new Set([
  "email",
  "phone",
  "person_name",
  "personal_id",
  "postal_address",
])

export function maxCategoryRisk(
  frame: VideoFrame,
  predicate: (name: string) => boolean
): number {
  return (frame.finding?.categories ?? []).reduce((max, category) => {
    if (!predicate(category.name)) return max
    return Math.max(max, category.probability)
  }, 0)
}

export function personalRisk(frame: VideoFrame): number {
  return maxCategoryRisk(frame, (name) => PERSONAL_CATEGORIES.has(name))
}

export function confidentialRisk(frame: VideoFrame): number {
  if (frame.finding?.confidential) return frame.finding.probability
  return maxCategoryRisk(frame, (name) => !PERSONAL_CATEGORIES.has(name))
}

export function nearestFrame(
  frames: VideoFrame[],
  timeMs: number
): VideoFrame | null {
  if (frames.length === 0) return null
  return frames.reduce((closest, frame) =>
    Math.abs(frame.timestampMs - timeMs) < Math.abs(closest.timestampMs - timeMs)
      ? frame
      : closest
  )
}
