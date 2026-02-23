'use client'

import { useCallback, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

type UnreadResponse = {
  authenticated?: boolean
  unread?: number
}

export function UnreadNotificationsBadge({ className }: { className?: string }) {
  const pathname = usePathname()
  const [unread, setUnread] = useState(0)

  const fetchUnread = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/unread', { cache: 'no-store' })
      if (!response.ok) return

      const data = (await response.json()) as UnreadResponse
      if (!data.authenticated) {
        setUnread(0)
        return
      }

      setUnread(Number.isFinite(data.unread) ? Number(data.unread) : 0)
    } catch {
      // Ignore fetch errors in nav badge; page remains functional.
    }
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchUnread()
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [fetchUnread, pathname])

  useEffect(() => {
    const onFocus = () => {
      void fetchUnread()
    }
    const onNotificationsUpdated = () => {
      void fetchUnread()
    }

    window.addEventListener('focus', onFocus)
    window.addEventListener('promptvault:notifications-updated', onNotificationsUpdated)

    return () => {
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('promptvault:notifications-updated', onNotificationsUpdated)
    }
  }, [fetchUnread])

  if (unread <= 0) return null

  return (
    <span
      className={cn(
        'inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold leading-none text-primary-foreground',
        className
      )}
      aria-label={`${unread} unread notifications`}
    >
      {unread > 99 ? '99+' : unread}
    </span>
  )
}
