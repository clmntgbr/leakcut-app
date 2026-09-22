"use client"

import { UploadVideoButton } from "@/components/video/upload-video-button"
import { CloudUpload } from "lucide-react"

export default function Page() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-6">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CloudUpload className="size-8" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h1 className="text-lg font-semibold text-foreground">
            Upload your first video
          </h1>
          <p className="text-sm text-muted-foreground">
            Select one video and we will extract the key frames automatically.
          </p>
        </div>
        <UploadVideoButton size="lg" />
      </div>
    </div>
  )
}
