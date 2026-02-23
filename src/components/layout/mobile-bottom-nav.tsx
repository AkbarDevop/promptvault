'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Compass, Home, LogIn, PlusSquare, User, UserPlus, Bookmark } from 'lucide-react'

interface MobileBottomNavProps {
  isAuthenticated: boolean
  username?: string
}

type NavItem = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  active: (pathname: string) => boolean
}

function navItemClass(isActive: boolean) {
  return cn(
    'flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-md px-1 py-2 text-[11px] transition-colors',
    isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
  )
}

export function MobileBottomNav({ isAuthenticated, username }: MobileBottomNavProps) {
  const pathname = usePathname()
  const profileHref = username ? `/profile/${username}` : '/profile/settings'

  const authItems: NavItem[] = [
    { href: '/feed', label: 'Feed', icon: Home, active: (p) => p.startsWith('/feed') },
    { href: '/explore', label: 'Explore', icon: Compass, active: (p) => p.startsWith('/explore') },
    { href: '/prompts/new', label: 'New', icon: PlusSquare, active: (p) => p === '/prompts/new' },
    { href: '/bookmarks', label: 'Saved', icon: Bookmark, active: (p) => p.startsWith('/bookmarks') },
    { href: profileHref, label: 'Profile', icon: User, active: (p) => p.startsWith('/profile') },
  ]

  const guestItems: NavItem[] = [
    { href: '/feed', label: 'Feed', icon: Home, active: (p) => p.startsWith('/feed') },
    { href: '/explore', label: 'Explore', icon: Compass, active: (p) => p.startsWith('/explore') },
    { href: '/login', label: 'Sign in', icon: LogIn, active: (p) => p.startsWith('/login') },
    { href: '/signup', label: 'Sign up', icon: UserPlus, active: (p) => p.startsWith('/signup') },
  ]

  const items = isAuthenticated ? authItems : guestItems

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:hidden">
      <div className="mx-auto flex max-w-5xl items-center gap-1 px-2 pb-[calc(env(safe-area-inset-bottom)+0.35rem)] pt-2">
        {items.map((item) => {
          const Icon = item.icon
          const active = item.active(pathname)

          return (
            <Link key={item.href} href={item.href} className={navItemClass(active)}>
              <Icon className={cn('h-4 w-4', active && 'text-primary')} />
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
