import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { formatBytes, getVideoStatusLabel } from "@/lib/video/status"
import type { Video } from "@/lib/video/types"
import { isClassifiedVideoStatus } from "@/lib/video/types"

export function VideoHeader({ video }: { video: Video }) {
  const expected = video.expectedFrameCount
  const completed = video.ocrCompletedCount
  const showProgress = !isClassifiedVideoStatus(video.status) && expected > 0

  return (
    <header className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <h2 className="min-w-0 truncate text-sm font-medium">
        {video.originalFilename ?? "Untitled video"}
      </h2>
      <Badge variant="outline" className="capitalize">
        <span className="size-1.5 rounded-full bg-foreground/70" />
        {getVideoStatusLabel(video.status)}
      </Badge>
      <span className="ms-auto text-xs tabular-nums text-muted-foreground">
        {formatBytes(video.sizeBytes)}
      </span>
      {showProgress ? (
        <div className="flex w-full items-center gap-2">
          <Progress
            value={Math.round((completed / expected) * 100)}
            className="h-1"
          />
          <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
            {completed}/{expected}
          </span>
        </div>
      ) : null}
    </header>
  )
}
