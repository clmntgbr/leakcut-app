"use client"

import { UploadVideoButton } from "@/components/video/upload-video-button"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { cn } from "cn"
import Link from "next/link"
import { usePathname } from "next/navigation"

function NavLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isActive =
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`)

  return (
    <Button
      variant="ghost"
      size="sm"
      asChild
      className={cn(isActive && "bg-muted text-foreground")}
    >
      <Link href={href}>{children}</Link>
    </Button>
  )
}

export interface AppHeaderProps {
  /** Sidebar collapse control (private app shell only). */
  showSidebarControls?: boolean
  /**
   * When false, workspace actions stay mounted (same width) but are invisible
   * so Home / Pricing keep the same screen position.
   */
  showWorkspaceActions?: boolean
  /**
   * When false, Subscription stays mounted (same width) but is invisible.
   */
  showSubscription?: boolean
  /** Header bottom border. */
  showBorder?: boolean
}

export function AppHeader({
  showSidebarControls = false,
  showWorkspaceActions = true,
  showSubscription = true,
  showBorder = true,
}: AppHeaderProps) {
  return (
    <header
      className={cn(
        "flex h-(--header-height) shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)",
        showBorder && "border-b"
      )}
    >
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        {showSidebarControls ? (
          <>
            <SidebarTrigger className="-ms-1" />
            <Separator
              orientation="vertical"
              className="mx-2 data-[orientation=vertical]:h-4"
            />
          </>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center justify-end gap-2 px-4 lg:px-6">
        <NavLink href="/">Home</NavLink>
        <div
          className={cn(
            "flex items-center gap-2",
            !showWorkspaceActions && "pointer-events-none invisible"
          )}
          aria-hidden={!showWorkspaceActions}
        >
          <UploadVideoButton />
        </div>
      </div>
    </header>
  )
}
