"use client"

import { AppHeader } from "@/components/app-header"
import { SubscriptionDrawerHost } from "@/components/billing/subscription-drawer-host"

/**
 * Mirrors the private `SidebarInset` chrome so nav links keep the same position,
 * with a white frame (no gray gutter / header border) for the pricing page.
 */
export default function PricingLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div
      className="flex min-h-svh w-full flex-col bg-background md:p-2"
      style={
        {
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <div className="flex min-h-0 flex-1 flex-col bg-background md:rounded-xl">
        <AppHeader
          showWorkspaceActions={false}
          showSubscription={false}
          showBorder={false}
        />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            {children}
          </div>
        </div>
      </div>
      <SubscriptionDrawerHost />
    </div>
  )
}
