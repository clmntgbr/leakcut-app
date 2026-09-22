"use client"

import { Centrifuge } from "centrifuge"
import { useEffect, useRef } from "react"
import { getRealtimeConnection } from "./api"

/**
 * Connects to Centrifugo using GET /api/realtime/connection and subscribes
 * to the user channel (`users:{id}`).
 * No-ops quietly when realtime is unavailable.
 */
export function useCentrifuge(
  userId: string | null,
  onPublication: (data: unknown) => void
) {
  const onPublicationRef = useRef(onPublication)

  useEffect(() => {
    onPublicationRef.current = onPublication
  }, [onPublication])

  useEffect(() => {
    if (!userId) return

    let centrifuge: Centrifuge | null = null
    let cancelled = false

    const connect = async () => {
      const connection = await getRealtimeConnection()
      if (cancelled || !connection) {
        console.warn("[Centrifugo] connection unavailable")
        return
      }

      const expectedChannel = `users:${userId}`
      const channel =
        connection.channel === expectedChannel
          ? connection.channel
          : expectedChannel

      centrifuge = new Centrifuge(connection.wsUrl, {
        token: connection.token,
        getToken: async () => {
          const next = await getRealtimeConnection()
          if (!next?.token) {
            throw new Error("Realtime token refresh failed")
          }
          return next.token
        },
      })

      const subscription = centrifuge.newSubscription(channel)

      subscription.on("publication", (ctx) => {
        onPublicationRef.current(ctx.data)
      })

      subscription.on("error", (ctx) => {
        console.warn("[Centrifugo] subscription error", channel, ctx)
      })

      subscription.subscribe()
      centrifuge.connect()
    }

    void connect()

    return () => {
      cancelled = true
      centrifuge?.disconnect()
    }
  }, [userId])
}
