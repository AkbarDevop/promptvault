import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

export function TagBadge({ tag }: { tag: string }) {
  return (
    <Link href={`/explore?tag=${encodeURIComponent(tag)}`}>
      <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
        #{tag}
      </Badge>
    </Link>
  )
}
