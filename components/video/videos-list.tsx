"use client"

import { Button } from "@/components/ui/button"
import {
  EmptyErrorState,
  EmptyLoadingState,
  EmptyState,
} from "@/components/ui/empty-state"
import { UploadVideoButton } from "@/components/video/upload-video-button"
import { VideoAttachment } from "@/components/video/video-attachment"
import { useVideos } from "@/lib/video/hooks"
import { CloudUpload } from "lucide-react"
import { useEffect, useState } from "react"

const PAGE_LIMIT = 20

export function VideosList() {
  const [page, setPage] = useState(1)
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null)
  const { data, isPending, isError, error, isFetching, refetch } = useVideos({
    page,
    limit: PAGE_LIMIT,
    sortBy: "created_at",
    orderBy: "desc",
  })

  const totalPages = data?.totalPages ?? 0

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  if (isPending && !data) {
    return (
      <EmptyLoadingState
        title="Loading videos…"
        description="Fetching your latest uploads."
      />
    )
  }

  if (isError && !data) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
        <EmptyErrorState
          title="Unable to load videos"
          description={
            error instanceof Error
              ? error.message
              : "Please try again in a moment."
          }
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setPage(1)
            void refetch()
          }}
        >
          Try again
        </Button>
      </div>
    )
  }

  const videos = data?.members ?? []

  if (videos.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6">
        <EmptyState
          icon={<CloudUpload className="size-5" />}
          title="Upload your first video"
          description="Select one video and we will extract the key frames automatically."
        />
        <UploadVideoButton size="lg" className="mt-4" />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <ul className="flex flex-col gap-3">
        {videos.map((video) => (
          <li key={video.id}>
            <VideoAttachment
              video={video}
              onSelect={(item) => setSelectedVideoId(item.id)}
            />
          </li>
        ))}
      </ul>

      {totalPages > 1 ? (
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1 || isFetching}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages || isFetching}
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
