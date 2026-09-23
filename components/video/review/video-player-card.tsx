"use client"

import { Card, CardContent } from "@/components/ui/card"
import { AlertBanner } from "@/components/video/review/alert-banner"
import { PlayerControls } from "@/components/video/review/player-controls"
import { formatClock } from "@/lib/video/status"
import type { VideoFrame } from "@/lib/video/types"
import { cn } from "cn"
import { FilmIcon } from "lucide-react"
import type { RefObject } from "react"

export interface VideoPlayerCardProps {
  videoRef: RefObject<HTMLVideoElement | null>
  videoUrl: string | null
  thumbnailUrl: string | null
  currentTimeMs: number
  durationMs: number
  frames: VideoFrame[]
  activeFrame: VideoFrame | null
  playing: boolean
  blur: boolean
  showAlert: boolean
  onTogglePlay: () => void
  onPrevious: () => void
  onNext: () => void
  onBlurChange: (blur: boolean) => void
  onTimeUpdate: () => void
  onDurationChange: (durationMs: number) => void
  onPlayingChange: (playing: boolean) => void
  onEnded: () => void
}

export function VideoPlayerCard({
  videoRef,
  videoUrl,
  thumbnailUrl,
  currentTimeMs,
  durationMs,
  frames,
  activeFrame,
  playing,
  blur,
  showAlert,
  onTogglePlay,
  onPrevious,
  onNext,
  onBlurChange,
  onTimeUpdate,
  onDurationChange,
  onPlayingChange,
  onEnded,
}: VideoPlayerCardProps) {
  const frameNumber = activeFrame
    ? frames.findIndex((frame) => frame.id === activeFrame.id) + 1
    : 0

  return (
    <Card size="sm" className="h-full min-h-0 gap-2 py-2">
      <CardContent className="flex min-h-0 flex-1 flex-col gap-2">
        <div className="relative flex min-h-48 flex-1 items-center justify-center overflow-hidden rounded-md bg-black">
          {videoUrl ? (
            <video
              ref={videoRef}
              src={videoUrl}
              poster={thumbnailUrl ?? undefined}
              className={cn(
                "max-h-full max-w-full transition-all",
                blur && "blur-xl"
              )}
              playsInline
              preload="metadata"
              onTimeUpdate={onTimeUpdate}
              onLoadedMetadata={(event) =>
                onDurationChange(event.currentTarget.duration * 1000)
              }
              onPlay={() => onPlayingChange(true)}
              onPause={() => onPlayingChange(false)}
              onEnded={onEnded}
            />
          ) : (
            <div className="flex flex-col items-center gap-1 text-white/70">
              <FilmIcon className="size-6" />
              <p className="text-xs">Video unavailable</p>
            </div>
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between bg-linear-to-t from-black/70 to-transparent px-2 py-1.5 text-[11px] tabular-nums text-white/90">
            <span>
              {formatClock(currentTimeMs)} / {formatClock(durationMs)}
            </span>
            <span>
              Frame {frameNumber} / {frames.length || "—"}
            </span>
          </div>
        </div>

        <AlertBanner visible={showAlert} />
        <PlayerControls
          playing={playing}
          canGoPrevious={Boolean(activeFrame && frameNumber > 1)}
          canGoNext={Boolean(activeFrame && frameNumber < frames.length)}
          blur={blur}
          onTogglePlay={onTogglePlay}
          onPrevious={onPrevious}
          onNext={onNext}
          onBlurChange={onBlurChange}
        />
      </CardContent>
    </Card>
  )
}
