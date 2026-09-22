import { AppShell } from "@/components/app-shell"
import { UserCentrifugeListener } from "@/lib/centrifugo/user-centrifuge-listener"
import { cookies } from "next/headers"

/** Must match `SIDEBAR_COOKIE_NAME` in `components/ui/sidebar.tsx`. */
const SIDEBAR_COOKIE_NAME = "sidebar_state"

export default async function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const sidebarState = cookieStore.get(SIDEBAR_COOKIE_NAME)?.value
  const defaultSidebarOpen = sidebarState !== "false"

  return (
    <>
      <UserCentrifugeListener />
      <AppShell defaultSidebarOpen={defaultSidebarOpen}>{children}</AppShell>
    </>
  )
}
