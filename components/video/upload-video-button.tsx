"use client"

import { Button } from "@/components/ui/button"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import {
  UploadVideoDrawer,
  type SelectedVideo,
} from "@/components/video/upload-video-drawer"
import { useQuota } from "@/lib/quota/hooks"
import { FileVideo } from "lucide-react"
import * as React from "react"
import type { ComponentProps } from "react"
import { toast } from "sonner"

const VIDEO_ACCEPT = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  ".mp4",
  ".webm",
  ".mov",
] as const

function isVideoFile(file: File) {
  if (file.type.startsWith("video/")) return true
  return /\.(mp4|mov|webm|mkv|avi|m4v)$/i.test(file.name)
}

export function UploadVideoButton({
  className,
  disabled,
  title,
  variant = "outline",
  size = "sm",
}: {
  className?: string
  disabled?: boolean
  title?: string
  variant?: ComponentProps<typeof Button>["variant"]
  size?: ComponentProps<typeof Button>["size"]
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const { data: quota } = useQuota()
  const [open, setOpen] = React.useState(false)
  const [video, setVideo] = React.useState<SelectedVideo | null>(null)
  const [pickError, setPickError] = React.useState<string | null>(null)

  const maxFileSizeMb = quota?.limits.maxFileSizeMb ?? null

  React.useEffect(() => {
    return () => {
      if (video) URL.revokeObjectURL(video.previewUrl)
    }
  }, [video])

  function handlePick() {
    if (disabled) return
    setPickError(null)
    inputRef.current?.click()
  }

  function handleFilesSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const raw = Array.from(event.target.files ?? [])
    event.target.value = ""

    if (raw.length !== 1) {
      if (raw.length > 1) {
        const message = "Please upload one video at a time."
        setPickError(message)
        toast.error(message)
      }
      return
    }

    const file = raw[0]
    if (!file || !isVideoFile(file)) {
      const message = "Please choose a video file."
      setPickError(message)
      toast.error(message)
      return
    }

    const maxBytes =
      maxFileSizeMb != null && maxFileSizeMb > 0
        ? maxFileSizeMb * 1024 * 1024
        : null
    if (maxBytes && file.size > maxBytes) {
      const message = `Files must be under ${maxFileSizeMb} MB on your plan.`
      setPickError(message)
      toast.error(message)
      return
    }

    if (video) URL.revokeObjectURL(video.previewUrl)

    setPickError(null)
    setVideo({
      id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
      file,
      previewUrl: URL.createObjectURL(file),
    })
    setOpen(true)
  }

  return (
    <>
      <HoverCard openDelay={10} closeDelay={100}>
        <HoverCardTrigger asChild>
          <Button
            type="button"
            size={size}
            variant={variant}
            className={className}
            onClick={handlePick}
            disabled={disabled}
          >
            <FileVideo className="size-4" aria-hidden="true" />
            {title ?? "Upload video"}
          </Button>
        </HoverCardTrigger>
        <HoverCardContent align="end" className="flex w-64 flex-col gap-0.5">
          <div className="font-semibold">{title ?? "Upload video"}</div>
          <div>
            Select one video. We will extract the key frames automatically.
            {maxFileSizeMb ? ` Max ${maxFileSizeMb} MB.` : null}
          </div>
          {pickError ? (
            <div className="mt-1 text-destructive">{pickError}</div>
          ) : null}
        </HoverCardContent>
      </HoverCard>
      <input
        ref={inputRef}
        type="file"
        accept={VIDEO_ACCEPT.join(",")}
        className="pointer-events-none absolute size-0 overflow-hidden opacity-0"
        tabIndex={-1}
        onChange={handleFilesSelected}
      />
      <UploadVideoDrawer
        open={open}
        onOpenChange={setOpen}
        video={video}
        onVideoChange={setVideo}
      />
    </>
  )
}
