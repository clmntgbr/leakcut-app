"use client"

import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment"
import { Spinner } from "@/components/ui/spinner"
import { getVideoStatusLabel } from "@/lib/video/status"
import {
  videoHasThumbnail,
  type VideoListItem,
  type VideoStatus,
} from "@/lib/video/types"
import {
  CheckIcon,
  ClockIcon,
  FileWarningIcon,
  FilmIcon,
} from "lucide-react"
import { useState } from "react"

function toAttachmentState(
  status: VideoStatus
): "idle" | "uploading" | "processing" | "error" | "done" {
  switch (status) {
    case "pending_upload":
      return "idle"
    case "uploaded":
    case "extraction_queued":
    case "extracting":
      return "processing"
    case "extraction_failed":
    case "upload_expired":
      return "error"
    case "frames_ready":
      return "done"
    default:
      return "idle"
  }
}

function StatusIcon({ status }: { status: VideoStatus }) {
  switch (status) {
    case "pending_upload":
      return <ClockIcon />
    case "uploaded":
    case "extraction_queued":
    case "extracting":
      return <Spinner />
    case "extraction_failed":
    case "upload_expired":
      return <FileWarningIcon />
    case "frames_ready":
      return <CheckIcon />
    default:
      return <FilmIcon />
  }
}

export interface VideoAttachmentProps {
  video: VideoListItem
  onSelect?: (video: VideoListItem) => void
}

export function VideoAttachment({ video, onSelect }: VideoAttachmentProps) {
  const [thumbnailFailed, setThumbnailFailed] = useState(false)
  const state = toAttachmentState(video.status)
  const showThumbnail = videoHasThumbnail(video) && !thumbnailFailed
  const isFailed =
    video.status === "extraction_failed" || video.status === "upload_expired"

  return (
    <Attachment
      state={state}
      className={
        onSelect ? "w-full cursor-pointer items-center" : "w-full items-center"
      }
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={onSelect ? () => onSelect(video) : undefined}
      onKeyDown={
        onSelect
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault()
                onSelect(video)
              }
            }
          : undefined
      }
    >
      <AttachmentMedia variant={showThumbnail ? "image" : "icon"}>
        {showThumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={video.thumbnailUrl!}
            alt={video.originalFilename ?? "Video thumbnail"}
            onError={() => setThumbnailFailed(true)}
          />
        ) : (
          <StatusIcon status={video.status} />
        )}
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>
          {video.originalFilename ?? "Untitled video"}
        </AttachmentTitle>
        <AttachmentDescription>
          {isFailed ? (
            <span className="text-red-500">
              {getVideoStatusLabel(video.status)}
            </span>
          ) : (
            getVideoStatusLabel(video.status)
          )}
        </AttachmentDescription>
      </AttachmentContent>
    </Attachment>
  )
}
