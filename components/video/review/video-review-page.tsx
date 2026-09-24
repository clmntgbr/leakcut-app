"use client"

import { FrameFilmstrip } from "@/components/video/review/frame-filmstrip"
import { RiskPanel } from "@/components/video/review/risk-panel"
import { RiskTimelineChart } from "@/components/video/review/risk-timeline-chart"
import { VideoHeader } from "@/components/video/review/video-header"
import { VideoPlayerCard } from "@/components/video/review/video-player-card"
import {
  enclosingFrame,
  frameDisplayName,
  groupScores,
  hasConfidentialFinding,
  seekTimeMsForFrame,
  sensitiveFormats,
  sortedFrames,
  timelinePoints,
} from "@/lib/video/findings"
import type { Video, VideoFrame } from "@/lib/video/types"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

export function VideoReviewPage({ video }: { video: Video }) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const currentTimeMsRef = useRef(0)
  const playingRef = useRef(false)
  const pinnedFrameIdRef = useRef<string | null>(null)
  const [pinnedFrameId, setPinnedFrameId] = useState<string | null>(null)
  const [currentTimeMs, setCurrentTimeMs] = useState(0)
  const [durationMs, setDurationMs] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [blur, setBlur] = useState(false)

  const frames = useMemo(() => sortedFrames(video.frames), [video.frames])
  const chartData = useMemo(() => timelinePoints(frames), [frames])
  const showAlert = useMemo(() => hasConfidentialFinding(frames), [frames])
  const playheadFrame = useMemo(
    () => enclosingFrame(frames, currentTimeMs),
    [frames, currentTimeMs]
  )
  const pinnedFrame = useMemo(
    () => frames.find((frame) => frame.id === pinnedFrameId) ?? null,
    [frames, pinnedFrameId]
  )
  const activeFrame = !playing && pinnedFrame ? pinnedFrame : playheadFrame
  const activeFrames = useMemo(
    () => (activeFrame ? [activeFrame] : []),
    [activeFrame]
  )
  const scores = useMemo(() => groupScores(activeFrames), [activeFrames])
  const formats = useMemo(() => sensitiveFormats(activeFrames), [activeFrames])

  const seekTo = useCallback((timeMs: number) => {
    pinnedFrameIdRef.current = null
    setPinnedFrameId(null)
    const next = Math.max(0, timeMs)
    const element = videoRef.current
    if (element) element.currentTime = next / 1000
    currentTimeMsRef.current = next
    setCurrentTimeMs(next)
  }, [])

  const seekToFrame = useCallback((frame: VideoFrame) => {
    pinnedFrameIdRef.current = frame.id
    setPinnedFrameId(frame.id)
    const next = Math.max(0, seekTimeMsForFrame(frames, frame))
    const element = videoRef.current
    if (element) element.currentTime = next / 1000
    currentTimeMsRef.current = next
    setCurrentTimeMs(next)
  }, [frames])

  const handleTimeUpdate = useCallback(() => {
    if (rafRef.current != null) return
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null
      const element = videoRef.current
      if (!element) return
      const next = element.currentTime * 1000
      if (
        pinnedFrameIdRef.current &&
        !playingRef.current &&
        Math.abs(next - currentTimeMsRef.current) < 120
      ) {
        return
      }
      currentTimeMsRef.current = next
      setCurrentTimeMs(next)
    })
  }, [])

  const handleDurationChange = useCallback((nextDurationMs: number) => {
    setDurationMs(nextDurationMs)
    const element = videoRef.current
    if (!element) return
    const restoreAt = currentTimeMsRef.current / 1000
    if (restoreAt > 0 && Math.abs(element.currentTime - restoreAt) > 0.05) {
      element.currentTime = restoreAt
    }
    if (playingRef.current && element.paused) {
      void element.play()
    }
  }, [])

  const handlePlayingChange = useCallback((nextPlaying: boolean) => {
    setPlaying(nextPlaying)
  }, [])

  useEffect(() => {
    return () => {
      if (rafRef.current != null) window.cancelAnimationFrame(rafRef.current)
    }
  }, [])

  useEffect(() => {
    currentTimeMsRef.current = 0
    playingRef.current = false
    pinnedFrameIdRef.current = null
    setPinnedFrameId(null)
    setCurrentTimeMs(0)
    setDurationMs(0)
    setPlaying(false)
    setBlur(false)
  }, [video.id])

  const activeIndex = activeFrame
    ? frames.findIndex((frame) => frame.id === activeFrame.id)
    : -1

  const togglePlay = useCallback(() => {
    const element = videoRef.current
    if (!element) return
    if (element.paused) {
      playingRef.current = true
      void element.play()
      return
    }
    playingRef.current = false
    element.pause()
  }, [])

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <VideoHeader video={video} />

      <div className="grid min-w-0 grid-cols-1 gap-2 lg:grid-cols-[7fr_3fr]">
        <VideoPlayerCard
          videoRef={videoRef}
          videoUrl={video.videoUrl}
          thumbnailUrl={video.thumbnailUrl}
          currentTimeMs={currentTimeMs}
          durationMs={durationMs}
          frames={frames}
          activeFrame={activeFrame}
          playing={playing}
          blur={blur}
          showAlert={showAlert}
          onTogglePlay={togglePlay}
          onPrevious={() => {
            if (activeIndex > 0) seekToFrame(frames[activeIndex - 1])
          }}
          onNext={() => {
            if (activeIndex >= 0 && activeIndex < frames.length - 1) {
              seekToFrame(frames[activeIndex + 1])
            }
          }}
          onBlurChange={setBlur}
          onTimeUpdate={handleTimeUpdate}
          onDurationChange={handleDurationChange}
          onPlayingChange={handlePlayingChange}
          onEnded={() => {
            playingRef.current = false
            setPlaying(false)
          }}
        />
        <RiskPanel
          scores={scores}
          formats={formats}
          ocrText={activeFrame?.ocrText ?? ""}
          frameName={activeFrame ? frameDisplayName(activeFrame) : null}
        />
      </div>

      <section className="min-w-0 space-y-2">
        <RiskTimelineChart
          data={chartData}
          currentTimeMs={currentTimeMs}
          durationMs={durationMs}
          onSeek={seekTo}
        />
        {frames.length > 0 ? (
          <FrameFilmstrip
            frames={frames}
            activeFrameId={activeFrame?.id ?? null}
            onSelect={seekToFrame}
          />
        ) : (
          <p className="rounded-md border px-3 py-4 text-center text-xs text-muted-foreground">
            Aucune frame disponible.
          </p>
        )}
      </section>
    </div>
  )
}
