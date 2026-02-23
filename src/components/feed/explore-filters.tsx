'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, X } from 'lucide-react'
import { useEffect, useRef, useTransition } from 'react'

const MODELS = [
  { value: 'all',     label: 'All models' },
  { value: 'claude',  label: 'Claude' },
  { value: 'chatgpt', label: 'ChatGPT' },
  { value: 'gemini',  label: 'Gemini' },
  { value: 'grok',    label: 'Grok' },
  { value: 'llama',   label: 'Llama' },
  { value: 'mistral', label: 'Mistral' },
  { value: 'other',   label: 'Other' },
]

interface ExploreFiltersProps {
  categories: string[]
  currentCategory?: string
  currentQuery?: string
  currentTag?: string
  currentModel?: string
}

export function ExploreFilters({
  categories,
  currentCategory,
  currentQuery,
  currentTag,
  currentModel,
}: ExploreFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current)
      }
    }
  }, [])

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

  function clearTag() {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('tag')
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
            if (searchDebounceRef.current) {
              clearTimeout(searchDebounceRef.current)
            }
            searchDebounceRef.current = setTimeout(() => setParam('q', val), 400)
          }}
        />
      </div>

      {/* Active tag chip */}
      {currentTag && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filtering by tag:</span>
          <Badge variant="secondary" className="gap-1">
            #{currentTag}
            <button onClick={clearTag} className="ml-1 hover:text-foreground">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        </div>
      )}

      {/* Category filter */}
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

      {/* Model filter */}
      <div className="flex flex-wrap gap-2">
        {MODELS.map(({ value, label }) => {
          const isActive = (currentModel ?? 'all') === value
          return (
            <Badge
              key={value}
              variant={isActive ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setParam('model', value)}
            >
              {label}
            </Badge>
          )
        })}
      </div>
    </div>
  )
}
