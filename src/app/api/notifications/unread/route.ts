import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUnreadNotificationCount } from '@/lib/queries/notifications'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ authenticated: false, unread: 0 })
    }

    const unread = await getUnreadNotificationCount(user.id)
    return NextResponse.json({ authenticated: true, unread })
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch unread notifications' },
      { status: 500 }
    )
  }
}
