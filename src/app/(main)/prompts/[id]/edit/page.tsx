import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPromptById } from '@/lib/queries/prompts'
import { PromptForm } from '@/components/prompt/prompt-form'
import { updatePrompt } from '@/lib/actions/prompts'

export const metadata = { title: 'Edit Prompt — PromptVault' }

export default async function EditPromptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const prompt = await getPromptById(id)
  if (!prompt) notFound()
  if (prompt.user_id !== user.id) redirect(`/prompts/${id}`)

  const boundAction = updatePrompt.bind(null, id)

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Prompt</h1>
        <p className="mt-1 text-sm text-muted-foreground">Update your prompt.</p>
      </div>
      <PromptForm action={boundAction} prompt={prompt} />
    </div>
  )
}
