"use client"

import { DashboardOverview } from "@/components/dashboard/dashboard-overview"
import { VideosList } from "@/components/video/videos-list"

export default function Page() {
  return (
    <div className="flex flex-1 flex-col">
      <DashboardOverview />
      <VideosList />
    </div>
  )
}
