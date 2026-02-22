'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search } from 'lucide-react'
import { useTransition } from 'react'

interface ExploreFiltersProps {
  categories: string[]
  currentCategory?: string
  currentQuery?: string
}

export function ExploreFilters({ categories, currentCategory, currentQuery }: ExploreFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  function setParam(key: string, value: string | undefined) {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search prompts…"
          defaultValue={currentQuery}
          className="pl-9"
          onChange={(e) => {
            const val = e.target.value
            clearTimeout((window as any).__searchTimeout)
            ;(window as any).__searchTimeout = setTimeout(() => setParam('q', val), 400)
          }}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const isActive = (currentCategory ?? 'all') === cat
          return (
            <Badge
              key={cat}
              variant={isActive ? 'default' : 'outline'}
              className="cursor-pointer capitalize"
              onClick={() => setParam('category', cat)}
            >
              {cat}
            </Badge>
          )
        })}
      </div>
    </div>
  )
}
