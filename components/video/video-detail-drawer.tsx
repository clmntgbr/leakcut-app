"use client"

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  EmptyErrorState,
  EmptyLoadingState,
} from "@/components/ui/empty-state"
import {
  confidentialRisk,
  foundCategoryNames,
  frameMatchesQuestion,
  nearestFrame,
  personalRisk,
} from "@/lib/video/findings"
import { useVideo } from "@/lib/video/hooks"
import {
  formatClock,
  formatProbability,
  getFindingCategoryLabel,
} from "@/lib/video/status"
import type { Video, VideoFrame } from "@/lib/video/types"
import { cn } from "cn"
import { PauseIcon, PlayIcon } from "lucide-react"
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react"

type RiskSeries = "personal" | "confidential"

export interface VideoDetailDrawerProps {
  videoId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VideoDetailDrawer({
  videoId,
  open,
  onOpenChange,
}: VideoDetailDrawerProps) {
  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      direction="right"
      handleOnly
    >
      <DrawerContent
        className="flex h-full w-[92vw]! max-w-[92vw]! flex-col rounded-none border-0 bg-white"
        style={{ width: "92vw", maxWidth: "92vw", backgroundColor: "#ffffff" }}
      >
        <DrawerHeader className="sr-only">
          <DrawerTitle>Video details</DrawerTitle>
          <DrawerDescription>Classified video timeline</DrawerDescription>
        </DrawerHeader>
        {open && videoId ? <VideoDetailBody videoId={videoId} /> : null}
      </DrawerContent>
    </Drawer>
  )
}

function VideoDetailBody({ videoId }: { videoId: string }) {
  const { data: video, isPending, isError, error, refetch } = useVideo(videoId)
  const frames = useMemo(
    () => [...(video?.frames ?? [])].sort((a, b) => a.index - b.index),
    [video?.frames]
  )
  const questions = useMemo(() => foundCategoryNames(frames), [frames])

  const [question, setQuestion] = useState<string | null>(null)
  const [series, setSeries] = useState<RiskSeries | "all">("all")
  const [selectedFrameId, setSelectedFrameId] = useState<string | null>(null)
  const [durationMs, setDurationMs] = useState(0)
  const [playing, setPlaying] = useState(false)

  const playerRef = useRef<HTMLVideoElement | null>(null)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const clockRef = useRef<HTMLSpanElement | null>(null)
  const durationRef = useRef(1)
  const framesRef = useRef(frames)
  const frameIdRef = useRef<string | null>(null)

  framesRef.current = frames

  const lastFrameMs = frames.at(-1)?.timestampMs ?? 0
  const timelineMs = Math.max(durationMs, lastFrameMs, 1)
  durationRef.current = timelineMs

  const selectedFrame =
    frames.find((frame) => frame.id === selectedFrameId) ?? frames[0] ?? null

  const paint = useCallback((ms: number) => {
    const duration = durationRef.current || 1
    const ratio = clamp(ms / duration, 0, 1)
    rootRef.current?.style.setProperty("--playhead", String(ratio))
    if (clockRef.current) clockRef.current.textContent = formatClock(ms)
  }, [])

  const seekTo = useCallback(
    (ms: number) => {
      const player = playerRef.current
      const nextMs = Math.max(0, ms)
      paint(nextMs)
      if (!player) return
      const apply = () => {
        player.currentTime = nextMs / 1000
      }
      if (player.readyState >= 1) {
        apply()
        return
      }
      player.addEventListener("loadedmetadata", apply, { once: true })
    },
    [paint]
  )

  const selectFrame = useCallback(
    (frame: VideoFrame) => {
      frameIdRef.current = frame.id
      setSelectedFrameId(frame.id)
      seekTo(frame.timestampMs)
    },
    [seekTo]
  )

  const syncFrame = useCallback((ms: number) => {
    const closest = nearestFrame(framesRef.current, ms)
    if (!closest || closest.id === frameIdRef.current) return
    frameIdRef.current = closest.id
    setSelectedFrameId(closest.id)
  }, [])

  useEffect(() => {
    setQuestion(null)
    setSeries("all")
    setSelectedFrameId(null)
    setDurationMs(0)
    setPlaying(false)
    frameIdRef.current = null
    paint(0)
  }, [videoId, paint])

  useEffect(() => {
    const player = playerRef.current
    if (!player || !playing) return
    let raf = 0
    const tick = () => {
      const ms = player.currentTime * 1000
      paint(ms)
      syncFrame(ms)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [video?.id, playing, paint, syncFrame])

  function togglePlayback() {
    const player = playerRef.current
    if (!player) return
    if (player.paused) {
      void player.play()
      return
    }
    player.pause()
  }

  if (isPending && !video) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <EmptyLoadingState
          title="Loading video…"
          description="Fetching the classified video and its frames."
        />
      </div>
    )
  }

  if (isError && !video) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <EmptyErrorState
          title="Unable to load video"
          description={
            error instanceof Error
              ? error.message
              : "Please try again in a moment."
          }
        />
        <Button type="button" variant="outline" onClick={() => void refetch()}>
          Try again
        </Button>
      </div>
    )
  }

  if (!video) return null

  return (
    <div
      ref={rootRef}
      className="flex min-h-0 flex-1 flex-col bg-white [--playhead:0]"
      data-vaul-no-drag=""
    >
      <div className="grid min-h-[58vh] flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px]">
        <VideoStage
          video={video}
          playerRef={playerRef}
          onToggle={togglePlayback}
          onDuration={setDurationMs}
          onPlayingChange={setPlaying}
        />
        <CapturePanel
          filename={video.originalFilename}
          frame={selectedFrame}
          durationMs={timelineMs}
          playing={playing}
          clockRef={clockRef}
          onToggle={togglePlayback}
        />
      </div>

      <div className="shrink-0 border-t px-6 pt-4 pb-5">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[13px] text-neutral-600">Risk over time</p>
          <div className="flex flex-wrap items-center gap-4 text-[12px] text-neutral-500">
            <LegendToggle
              color="#7aa2c7"
              active={series === "all" || series === "personal"}
              onClick={() =>
                setSeries((current) =>
                  current === "personal" ? "all" : "personal"
                )
              }
            >
              Personal data
            </LegendToggle>
            <LegendToggle
              color="#c47b7b"
              active={series === "all" || series === "confidential"}
              onClick={() =>
                setSeries((current) =>
                  current === "confidential" ? "all" : "confidential"
                )
              }
            >
              Confidential
            </LegendToggle>
            {questions.map((name) => (
              <LegendToggle
                key={name}
                color="#111111"
                active={question === name}
                onClick={() =>
                  setQuestion((current) => (current === name ? null : name))
                }
              >
                {getFindingCategoryLabel(name)}
              </LegendToggle>
            ))}
          </div>
        </div>

        <RiskChart
          frames={frames}
          durationMs={timelineMs}
          series={series}
          question={question}
          onSelect={selectFrame}
          onSeek={seekTo}
        />

        <Filmstrip
          frames={frames}
          durationMs={timelineMs}
          question={question}
          onSelect={selectFrame}
          onSeek={seekTo}
        />
      </div>
    </div>
  )
}

const VideoStage = memo(function VideoStage({
  video,
  playerRef,
  onToggle,
  onDuration,
  onPlayingChange,
}: {
  video: Video
  playerRef: React.RefObject<HTMLVideoElement | null>
  onToggle: () => void
  onDuration: (ms: number) => void
  onPlayingChange: (playing: boolean) => void
}) {
  return (
    <div className="flex min-h-[280px] items-center justify-center bg-[#111] lg:min-h-0">
      {video.videoUrl ? (
        <video
          ref={playerRef}
          src={video.videoUrl}
          poster={video.thumbnailUrl ?? undefined}
          className="max-h-full w-full object-contain"
          playsInline
          preload="auto"
          onClick={onToggle}
          onLoadedMetadata={(event) =>
            onDuration(event.currentTarget.duration * 1000)
          }
          onPlay={() => onPlayingChange(true)}
          onPause={() => onPlayingChange(false)}
        />
      ) : video.thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={video.thumbnailUrl}
          alt={video.originalFilename ?? "Video thumbnail"}
          className="max-h-full w-full object-contain"
        />
      ) : null}
    </div>
  )
})

const CapturePanel = memo(function CapturePanel({
  filename,
  frame,
  durationMs,
  playing,
  clockRef,
  onToggle,
}: {
  filename: string | null
  frame: VideoFrame | null
  durationMs: number
  playing: boolean
  clockRef: React.RefObject<HTMLSpanElement | null>
  onToggle: () => void
}) {
  const categories = useMemo(
    () =>
      [...(frame?.finding?.categories ?? [])].sort(
        (a, b) => b.probability - a.probability
      ),
    [frame]
  )

  return (
    <aside className="flex flex-col border-t bg-white px-6 py-5 lg:border-t-0 lg:border-l">
      <p className="text-[22px] font-medium tracking-tight tabular-nums">
        <span ref={clockRef}>{formatClock(frame?.timestampMs ?? 0)}</span>
        <span className="text-neutral-400"> / {formatClock(durationMs)}</span>
      </p>
      <p className="mt-5 text-[13px] text-neutral-500">
        Capture{frame ? ` ${frame.index + 1}` : ""}
      </p>
      <p className="truncate text-sm text-neutral-800">
        {filename ?? "Untitled video"}
      </p>
      {frame ? (
        <p className="mt-1 text-[12px] text-neutral-400">
          {formatClock(frame.timestampMs)}
          {frame.finding?.confidential ? " · leak" : ""}
        </p>
      ) : null}

      <ul className="mt-5 space-y-2.5">
        {categories.length > 0 ? (
          categories.map((category) => (
            <li
              key={category.name}
              className="flex items-start justify-between gap-4 text-[13px]"
            >
              <span className="flex items-start gap-2 text-neutral-700">
                <span className="mt-0.5 inline-block size-3.5 rounded-[3px] border border-neutral-300" />
                {getFindingCategoryLabel(category.name)}
              </span>
              <span className="tabular-nums text-neutral-400">
                {formatProbability(category.probability)}
              </span>
            </li>
          ))
        ) : (
          <li className="text-[13px] text-neutral-400">
            No question scored on this frame.
          </li>
        )}
      </ul>

      {frame?.ocrText?.trim() ? (
        <p className="mt-4 line-clamp-5 text-[12px] leading-5 text-neutral-500">
          {frame.ocrText.trim()}
        </p>
      ) : null}

      <button
        type="button"
        onClick={onToggle}
        className="mt-auto flex items-center gap-2 pt-8 text-[13px] text-neutral-700"
      >
        <span className="flex size-7 items-center justify-center rounded-full border border-neutral-300">
          {playing ? (
            <PauseIcon className="size-3.5" />
          ) : (
            <PlayIcon className="size-3.5" />
          )}
        </span>
        {playing ? "Pause" : "Play"}
      </button>
    </aside>
  )
})

function LegendToggle({
  color,
  active,
  onClick,
  children,
}: {
  color: string
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5",
        active ? "text-neutral-700" : "text-neutral-400"
      )}
    >
      <span
        className="size-2 rounded-full"
        style={{ backgroundColor: color, opacity: active ? 1 : 0.35 }}
      />
      {children}
    </button>
  )
}

const RiskChart = memo(function RiskChart({
  frames,
  durationMs,
  series,
  question,
  onSelect,
  onSeek,
}: {
  frames: VideoFrame[]
  durationMs: number
  series: RiskSeries | "all"
  question: string | null
  onSelect: (frame: VideoFrame) => void
  onSeek: (ms: number) => void
}) {
  const [hover, setHover] = useState<VideoFrame | null>(null)
  const personalPath = useMemo(
    () => toLinePath(frames, durationMs, personalRisk),
    [frames, durationMs]
  )
  const confidentialPath = useMemo(
    () => toLinePath(frames, durationMs, confidentialRisk),
    [frames, durationMs]
  )
  const showPersonal = series === "all" || series === "personal"
  const showConfidential = series === "all" || series === "confidential"
  const tipX = hover ? clamp((hover.timestampMs / durationMs) * 100, 0, 100) : 0

  return (
    <div className="relative mb-4">
      <div className="flex gap-3">
        <div className="flex h-[88px] flex-col justify-between py-0.5 text-[10px] text-neutral-400">
          <span>100%</span>
          <span>50%</span>
          <span>0%</span>
        </div>
        <div className="relative min-w-0 flex-1">
          <svg
            viewBox="0 0 1000 100"
            className="h-[88px] w-full cursor-pointer touch-none"
            preserveAspectRatio="none"
            onPointerDown={scrubFromPointer(durationMs, onSeek)}
            onPointerMove={scrubFromPointer(durationMs, onSeek, true)}
          >
            <line x1="0" y1="1" x2="1000" y2="1" stroke="#f0f0f0" />
            <line x1="0" y1="50" x2="1000" y2="50" stroke="#f3f3f3" />
            <line x1="0" y1="99" x2="1000" y2="99" stroke="#ececec" />
            {showPersonal && personalPath ? (
              <path
                d={personalPath}
                fill="none"
                stroke="#7aa2c7"
                strokeWidth="1.25"
                vectorEffect="non-scaling-stroke"
              />
            ) : null}
            {showConfidential && confidentialPath ? (
              <path
                d={confidentialPath}
                fill="none"
                stroke="#c47b7b"
                strokeWidth="1.25"
                vectorEffect="non-scaling-stroke"
              />
            ) : null}
          </svg>
          <div className="pointer-events-none absolute inset-y-0 left-[calc(var(--playhead)*100%)] w-px bg-neutral-300" />

          {frames.map((frame) => {
            const x = (frame.timestampMs / durationMs) * 100
            const yPersonal = 100 - personalRisk(frame) * 100
            const yConfidential = 100 - confidentialRisk(frame) * 100
            const matches = frameMatchesQuestion(frame, question)
            return (
              <button
                key={frame.id}
                type="button"
                className="absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  left: `${x}%`,
                  top: `${Math.min(yPersonal, yConfidential) * 0.88}%`,
                  backgroundColor: frame.finding?.confidential
                    ? "#c47b7b"
                    : "#7aa2c7",
                  opacity: matches ? 1 : 0.2,
                }}
                onMouseEnter={() => setHover(frame)}
                onMouseLeave={() => setHover(null)}
                onClick={() => onSelect(frame)}
                aria-label={`Risk at ${formatClock(frame.timestampMs)}`}
              />
            )
          })}

          {hover ? (
            <div
              className="pointer-events-none absolute z-10 min-w-[150px] rounded-md border border-neutral-200 bg-white px-3 py-2 text-[12px] shadow-sm"
              style={{
                left: `min(${tipX}%, calc(100% - 10rem))`,
                top: 4,
              }}
            >
              <p className="mb-1 font-medium tabular-nums">
                {formatClock(hover.timestampMs)}
              </p>
              <p className="flex justify-between gap-6 text-neutral-600">
                <span>Personal data</span>
                <span>{formatProbability(personalRisk(hover))}</span>
              </p>
              <p className="flex justify-between gap-6 text-neutral-600">
                <span>Confidential</span>
                <span>{formatProbability(confidentialRisk(hover))}</span>
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
})

const Filmstrip = memo(function Filmstrip({
  frames,
  durationMs,
  question,
  onSelect,
  onSeek,
}: {
  frames: VideoFrame[]
  durationMs: number
  question: string | null
  onSelect: (frame: VideoFrame) => void
  onSeek: (ms: number) => void
}) {
  const ticks = useMemo(
    () => [0, 0.25, 0.5, 0.75, 1].map((ratio) => ratio * durationMs),
    [durationMs]
  )

  return (
    <div>
      <div
        className="relative h-[70px] overflow-hidden bg-black touch-none"
        onPointerDown={scrubFromPointer(durationMs, onSeek)}
        onPointerMove={scrubFromPointer(durationMs, onSeek, true)}
      >
        <div className="flex h-full">
          {frames.length === 0 ? (
            <div className="flex-1 bg-neutral-900" />
          ) : (
            frames.map((frame) => (
              <button
                key={frame.id}
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  onSelect(frame)
                }}
                className={cn(
                  "relative h-full min-w-0 flex-1 overflow-hidden",
                  !frameMatchesQuestion(frame, question) && "opacity-30"
                )}
                aria-label={`Frame ${frame.index + 1}`}
              >
                {frame.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={frame.imageUrl}
                    alt=""
                    className="size-full object-cover"
                    draggable={false}
                  />
                ) : (
                  <span className="block size-full bg-neutral-800" />
                )}
              </button>
            ))
          )}
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-neutral-600">
          <div className="absolute top-0 left-0 h-[2px] w-full origin-left bg-rose-600 [transform:scaleX(var(--playhead))]" />
        </div>
        <div className="pointer-events-none absolute top-0 left-[calc(var(--playhead)*100%)] z-10 h-full w-px bg-rose-600">
          <span className="absolute top-0 left-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-600" />
        </div>
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] text-neutral-400">
        {ticks.map((ms) => (
          <span key={ms}>{formatClock(ms)}</span>
        ))}
      </div>
    </div>
  )
})

function scrubFromPointer(
  durationMs: number,
  onSeek: (ms: number) => void,
  onlyWhenDragging = false
) {
  return (event: ReactPointerEvent<SVGSVGElement | HTMLDivElement>) => {
    if (onlyWhenDragging && event.buttons === 0) return
    if (event.pointerType === "mouse" && onlyWhenDragging && event.buttons !== 1) {
      return
    }
    if (!onlyWhenDragging) {
      event.currentTarget.setPointerCapture(event.pointerId)
    }
    const rect = event.currentTarget.getBoundingClientRect()
    const ratio = clamp((event.clientX - rect.left) / rect.width, 0, 1)
    onSeek(ratio * durationMs)
  }
}

function toLinePath(
  frames: VideoFrame[],
  durationMs: number,
  riskOf: (frame: VideoFrame) => number
): string {
  if (frames.length === 0) return ""
  const points = [
    { x: 0, y: 100 },
    ...frames.map((frame) => ({
      x: (frame.timestampMs / durationMs) * 1000,
      y: 100 - riskOf(frame) * 100,
    })),
    { x: 1000, y: 100 - riskOf(frames[frames.length - 1]) * 100 },
  ]
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ")
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}
