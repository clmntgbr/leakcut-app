"use client"

import { AppHeader } from "@/components/app-header"

/** Private shell header — sidebar controls + workspace actions. */
export function SidebarHeader() {
  return (
    <AppHeader showSidebarControls showWorkspaceActions />
  )
}
