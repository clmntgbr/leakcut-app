"use client"

import { FrameFilmstrip } from "@/components/video/review/frame-filmstrip"
import { RiskPanel } from "@/components/video/review/risk-panel"
import { RiskTimelineChart } from "@/components/video/review/risk-timeline-chart"
import { VideoHeader } from "@/components/video/review/video-header"
import { VideoPlayerCard } from "@/components/video/review/video-player-card"
import {
  enclosingFrame,
  groupScores,
  hasConfidentialFinding,
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
  const [currentTimeMs, setCurrentTimeMs] = useState(0)
  const [durationMs, setDurationMs] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [blur, setBlur] = useState(false)

  const frames = useMemo(() => sortedFrames(video.frames), [video.frames])
  const scores = useMemo(() => groupScores(frames), [frames])
  const formats = useMemo(() => sensitiveFormats(frames), [frames])
  const chartData = useMemo(() => timelinePoints(frames), [frames])
  const showAlert = useMemo(() => hasConfidentialFinding(frames), [frames])
  const activeFrame = useMemo(
    () => enclosingFrame(frames, currentTimeMs),
    [frames, currentTimeMs]
  )

  const seekTo = useCallback((timeMs: number) => {
    const next = Math.max(0, timeMs)
    const element = videoRef.current
    if (element) element.currentTime = next / 1000
    currentTimeMsRef.current = next
    setCurrentTimeMs(next)
  }, [])

  const seekToFrame = useCallback(
    (frame: VideoFrame) => {
      seekTo(frame.timestampMs)
    },
    [seekTo]
  )

  const handleTimeUpdate = useCallback(() => {
    if (rafRef.current != null) return
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null
      const element = videoRef.current
      if (!element) return
      const next = element.currentTime * 1000
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
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <VideoHeader video={video} />

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 lg:grid-cols-[7fr_3fr]">
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
        <RiskPanel scores={scores} formats={formats} />
      </div>

      <section className="space-y-2">
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
