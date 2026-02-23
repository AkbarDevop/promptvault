'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface FeedTabsProps {
  isAuthenticated: boolean
}

export function FeedTabs({ isAuthenticated }: FeedTabsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const current = searchParams.get('tab')
  const tab = current === 'trending' || current === 'following' ? current : 'latest'

  function handleTabChange(value: string) {
    if (value === 'following' && !isAuthenticated) {
      router.push('/login?next=/feed?tab=following')
      return
    }

    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', value)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <Tabs value={tab} onValueChange={handleTabChange}>
      <TabsList>
        <TabsTrigger value="latest">Latest</TabsTrigger>
        <TabsTrigger value="trending">Trending</TabsTrigger>
        <TabsTrigger value="following">Following</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
