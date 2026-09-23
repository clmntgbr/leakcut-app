"use client"

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { isConfidentialFrame } from "@/lib/video/findings"
import type { VideoFrame } from "@/lib/video/types"
import { cn } from "cn"
import { useEffect, useRef } from "react"

export interface FrameFilmstripProps {
  frames: VideoFrame[]
  activeFrameId: string | null
  onSelect: (frame: VideoFrame) => void
}

export function FrameFilmstrip({
  frames,
  activeFrameId,
  onSelect,
}: FrameFilmstripProps) {
  const activeRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    activeRef.current?.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: "smooth",
    })
  }, [activeFrameId])

  return (
    <ScrollArea className="w-full whitespace-nowrap rounded-md border">
      <div className="flex w-max gap-1.5 p-2">
        {frames.map((frame) => (
          <button
            key={frame.id}
            ref={activeFrameId === frame.id ? activeRef : undefined}
            type="button"
            onClick={() => onSelect(frame)}
            className={cn(
              "relative h-14 w-24 shrink-0 overflow-hidden rounded-sm ring-offset-background transition-all",
              activeFrameId === frame.id
                ? "ring-2 ring-primary"
                : "opacity-70 hover:opacity-100"
            )}
          >
            {frame.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={frame.imageUrl}
                alt={`Frame ${frame.index + 1}`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-muted text-[10px] text-muted-foreground">
                {frame.index + 1}
              </span>
            )}
            {isConfidentialFrame(frame) ? (
              <span className="absolute inset-0 ring-1 ring-inset ring-destructive/70" />
            ) : null}
            <span className="absolute right-1 bottom-0.5 text-[10px] text-white/90 drop-shadow">
              {Math.round(frame.timestampMs / 1000)}s
            </span>
          </button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
