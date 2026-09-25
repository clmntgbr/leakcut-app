"use client"

import {
  highlightedOcrBoxes,
  type RiskGroupId,
} from "@/lib/video/findings"
import type { VideoFrame } from "@/lib/video/types"
import { useEffect, useState } from "react"

const BOX_COLORS: Record<RiskGroupId, { stroke: string; fill: string }> = {
  personal: {
    stroke: "#3b82f6",
    fill: "rgba(59, 130, 246, 0.28)",
  },
  confidential: {
    stroke: "#ef4444",
    fill: "rgba(239, 68, 68, 0.28)",
  },
  keys: {
    stroke: "#ef4444",
    fill: "rgba(239, 68, 68, 0.28)",
  },
}

export function OcrBoxesOverlay({
  frame,
  imageUrl,
}: {
  frame: VideoFrame | null
  imageUrl: string
}) {
  const [size, setSize] = useState<{ width: number; height: number } | null>(
    null
  )
  const boxes = highlightedOcrBoxes(frame)

  useEffect(() => {
    let cancelled = false
    setSize(null)
    const image = new Image()
    image.onload = () => {
      if (cancelled) return
      setSize({ width: image.naturalWidth, height: image.naturalHeight })
    }
    image.src = imageUrl
    return () => {
      cancelled = true
    }
  }, [imageUrl])

  if (!size || boxes.length === 0) return null

  return (
    <svg
      className="pointer-events-none absolute inset-0 size-full"
      viewBox={`0 0 ${size.width} ${size.height}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      {boxes.map((box) => {
        const colors = BOX_COLORS[box.group]
        return (
          <rect
            key={box.id}
            x={box.x}
            y={box.y}
            width={box.width}
            height={box.height}
            fill={colors.fill}
            stroke={colors.stroke}
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
            rx={2}
          />
        )
      })}
    </svg>
  )
}
