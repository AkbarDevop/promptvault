import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ProfilePreview } from '@/types/database'

interface FollowListSectionProps {
  id: string
  title: string
  users: ProfilePreview[]
  count: number
  emptyMessage: string
}

export function FollowListSection({ id, title, users, count, emptyMessage }: FollowListSectionProps) {
  return (
    <Card id={id} className="gap-4 py-4">
      <CardHeader className="px-4">
        <CardTitle className="text-base">
          {title} <span className="text-muted-foreground font-normal">({count})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        {users.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          <ul className="space-y-3">
            {users.map((profile) => (
              <li key={profile.id}>
                <Link href={`/profile/${profile.username}`} className="flex items-center gap-3 group">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile.avatar_url ?? undefined} />
                    <AvatarFallback className="text-xs">
                      {(profile.display_name ?? profile.username ?? 'U')[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                      {profile.display_name ?? profile.username}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">@{profile.username}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
