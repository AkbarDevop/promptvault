import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Globe } from 'lucide-react'
import Link from 'next/link'
import type { Profile } from '@/types/database'

interface ProfileHeaderProps {
  profile: Profile
  promptCount: number
  isOwner: boolean
}

export function ProfileHeader({ profile, promptCount, isOwner }: ProfileHeaderProps) {
  return (
    <div className="flex items-start gap-4">
      <Avatar className="h-16 w-16">
        <AvatarImage src={profile.avatar_url ?? undefined} />
        <AvatarFallback className="text-xl">
          {(profile.display_name ?? profile.username)[0].toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">{profile.display_name ?? profile.username}</h1>
          {isOwner && (
            <Button asChild variant="outline" size="sm">
              <Link href="/profile/settings">Edit profile</Link>
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">@{profile.username}</p>
        {profile.bio && <p className="text-sm">{profile.bio}</p>}
        <div className="flex items-center gap-4 pt-1">
          <span className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{promptCount}</span> prompts
          </span>
          {profile.website_url && (
            <a
              href={profile.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <Globe className="h-3 w-3" />
              {new URL(profile.website_url).hostname}
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
