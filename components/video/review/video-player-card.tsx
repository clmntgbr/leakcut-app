"use client"

import { Card, CardContent } from "@/components/ui/card"
import { AlertBanner } from "@/components/video/review/alert-banner"
import { OcrBoxesOverlay } from "@/components/video/review/ocr-boxes-overlay"
import { PlayerControls } from "@/components/video/review/player-controls"
import { frameNumber } from "@/lib/video/findings"
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
  const position = activeFrame
    ? frames.findIndex((frame) => frame.id === activeFrame.id)
    : -1
  const currentFrameNumber = activeFrame ? frameNumber(activeFrame) : 0

  return (
    <Card size="sm" className="h-full min-h-0 gap-2 py-2">
      <CardContent className="flex min-h-0 flex-1 flex-col gap-2">
        <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-md bg-black">
          {videoUrl ? (
            <video
              ref={videoRef}
              src={videoUrl}
              poster={thumbnailUrl ?? undefined}
              className={cn(
                "max-h-full max-w-full transition-all",
                !playing && activeFrame?.imageUrl && "invisible",
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
          ) : !activeFrame?.imageUrl ? (
            <div className="flex flex-col items-center gap-1 text-white/70">
              <FilmIcon className="size-6" />
              <p className="text-xs">Video unavailable</p>
            </div>
          ) : null}
          {!playing && activeFrame?.imageUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeFrame.imageUrl}
                alt={
                  currentFrameNumber
                    ? `Frame ${currentFrameNumber}`
                    : "Active frame"
                }
                className={cn(
                  "absolute inset-0 size-full object-contain",
                  blur && "blur-xl"
                )}
              />
              {!blur ? (
                <OcrBoxesOverlay
                  frame={activeFrame}
                  imageUrl={activeFrame.imageUrl}
                />
              ) : null}
            </>
          ) : null}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between bg-linear-to-t from-black/70 to-transparent px-2 py-1.5 text-[11px] tabular-nums text-white/90">
            <span>
              {formatClock(
                !playing && activeFrame
                  ? activeFrame.timestampMs
                  : currentTimeMs
              )}{" "}
              / {formatClock(durationMs)}
            </span>
            <span>
              Frame {currentFrameNumber} / {frames.length || "—"}
            </span>
          </div>
        </div>

        <AlertBanner visible={showAlert} />
        <PlayerControls
          playing={playing}
          canGoPrevious={position > 0}
          canGoNext={position >= 0 && position < frames.length - 1}
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
