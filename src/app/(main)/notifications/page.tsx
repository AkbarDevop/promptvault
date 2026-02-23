import Link from 'next/link'
import { redirect } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { createClient } from '@/lib/supabase/server'
import { getNotifications } from '@/lib/queries/notifications'
import {
  MarkAllNotificationsReadButton,
  MarkNotificationReadButton,
} from '@/components/notifications/notification-read-actions'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Bell, Heart, UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'

export const metadata = { title: 'Notifications — PromptVault' }

function ActorName({
  username,
  displayName,
}: {
  username?: string | null
  displayName?: string | null
}) {
  const name = displayName ?? username ?? 'Someone'

  if (!username) {
    return <span className="font-medium">{name}</span>
  }

  return (
    <Link href={`/profile/${username}`} className="font-medium hover:text-primary">
      {name}
    </Link>
  )
}

export default async function NotificationsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/notifications')

  const notifications = await getNotifications(user.id, { limit: 50 })
  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}.`
              : 'You are all caught up.'}
          </p>
        </div>
        <MarkAllNotificationsReadButton disabled={unreadCount === 0} />
      </div>

      <Separator />

      {notifications.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <Bell className="mx-auto h-8 w-8 text-muted-foreground" />
          <h2 className="mt-3 text-lg font-semibold">No notifications yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Likes and follows will show up here.
          </p>
          <div className="mt-4">
            <Button asChild variant="outline">
              <Link href="/feed">Browse feed</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const actor = notification.actor
            const prompt = notification.prompt
            const actorName = actor?.display_name ?? actor?.username ?? 'Someone'
            const promptHref = prompt ? `/prompts/${prompt.id}` : null
            const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })

            return (
              <div
                key={notification.id}
                className={cn(
                  'rounded-xl border p-4 transition-colors',
                  notification.is_read ? 'bg-background' : 'border-primary/30 bg-primary/5'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="relative shrink-0">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={actor?.avatar_url ?? undefined} />
                      <AvatarFallback>{actorName[0]?.toUpperCase() ?? 'U'}</AvatarFallback>
                    </Avatar>
                    <span className="absolute -bottom-1 -right-1 rounded-full border bg-background p-1">
                      {notification.type === 'like' ? (
                        <Heart className="h-3 w-3 text-pink-500" />
                      ) : (
                        <UserPlus className="h-3 w-3 text-primary" />
                      )}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-relaxed">
                      <ActorName username={actor?.username} displayName={actor?.display_name} />{' '}
                      {notification.type === 'like' ? (
                        <>
                          liked your{' '}
                          {promptHref ? (
                            <Link href={promptHref} className="font-medium hover:text-primary">
                              prompt
                            </Link>
                          ) : (
                            <span className="font-medium">prompt</span>
                          )}
                          {prompt?.title ? (
                            <span className="text-muted-foreground"> &ldquo;{prompt.title}&rdquo;</span>
                          ) : null}
                          <span className="text-muted-foreground">.</span>
                        </>
                      ) : (
                        <>started following you.</>
                      )}
                    </p>

                    <div className="mt-2 flex items-center gap-3">
                      <p className="text-xs text-muted-foreground">{timeAgo}</p>
                      {!notification.is_read && (
                        <>
                          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                          <MarkNotificationReadButton notificationId={notification.id} />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
