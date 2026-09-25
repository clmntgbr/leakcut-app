"use client"

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
import { ScrollArea } from "@/components/ui/scroll-area"
import { VideoReviewPage } from "@/components/video/review/video-review-page"
import { useVideo } from "@/lib/video/hooks"

export interface VideoDetailDrawerProps {
  videoId: string | null
  onOpenChange: (open: boolean) => void
}

export function VideoDetailDrawer({
  videoId,
  onOpenChange,
}: VideoDetailDrawerProps) {
  const { data: video, isPending, isError, error } = useVideo(videoId)

  return (
    <Drawer
      open={Boolean(videoId)}
      onOpenChange={onOpenChange}
      direction="right"
    >
      <DrawerContent
        className="flex h-full w-[80vw]! max-w-[80vw]! flex-col"
        style={{ width: "80vw", maxWidth: "80vw", backgroundColor: "#f9f9f9" }}
      >
        <DrawerHeader className="hidden">
          <DrawerTitle>
            Video review
          </DrawerTitle>
          <DrawerDescription>
            Review classified frames and detected risk over time.
          </DrawerDescription>
        </DrawerHeader>

        <ScrollArea
          className="min-h-0 min-w-0 flex-1 overflow-x-hidden overscroll-contain"
          viewportClassName="overflow-x-hidden! [&>div]:block! [&>div]:min-w-0 [&>div]:w-full"
        >
          <div className="min-w-0 p-3">
            {isPending && !video ? (
              <EmptyLoadingState
                title="Loading review…"
                description="Fetching the video, frames and classification."
              />
            ) : isError && !video ? (
              <EmptyErrorState
                title="Unable to load this video"
                description={
                  error instanceof Error
                    ? error.message
                    : "Please try again in a moment."
                }
              />
            ) : video ? (
              <VideoReviewPage video={video} />
            ) : null}
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  )
}
