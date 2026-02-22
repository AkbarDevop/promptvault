import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PromptForm } from '@/components/prompt/prompt-form'
import { createPrompt } from '@/lib/actions/prompts'

export const metadata = { title: 'New Prompt — PromptVault' }

export default async function NewPromptPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/prompts/new')

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Share a Prompt</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Share your best AI prompt with the community.
        </p>
      </div>
      <PromptForm action={createPrompt} />
    </div>
  )
}
