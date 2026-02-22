'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Share2, Check } from 'lucide-react'
import { toast } from 'sonner'

export function ShareButton({ promptId }: { promptId: string }) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const url = `${window.location.origin}/prompts/${promptId}`

    if (navigator.share) {
      try {
        await navigator.share({ url })
        return
      } catch {
        // user cancelled native share — fall through to clipboard
      }
    }

    await navigator.clipboard.writeText(url)
    setCopied(true)
    toast.success('Link copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button variant="outline" size="sm" onClick={handleShare}>
      {copied ? (
        <Check className="mr-1 h-4 w-4 text-green-500" />
      ) : (
        <Share2 className="mr-1 h-4 w-4" />
      )}
      {copied ? 'Copied!' : 'Share'}
    </Button>
  )
}
