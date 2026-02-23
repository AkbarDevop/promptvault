'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { promptSchema } from '@/lib/validations/schemas'
import type { FormState } from '@/types/database'

function isMissingRichPromptColumnsError(message?: string) {
  if (!message) return false
  return message.includes('usage_tips') || message.includes('example_output')
}

function stripRichPromptFields<T extends Record<string, unknown>>(payload: T) {
  const legacyPayload = { ...payload }
  delete legacyPayload.usage_tips
  delete legacyPayload.example_output
  return legacyPayload
}

export async function createPrompt(_prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const raw = {
    title: formData.get('title'),
    content: formData.get('content'),
    description: formData.get('description') || undefined,
    usage_tips: formData.get('usage_tips') || undefined,
    example_output: formData.get('example_output') || undefined,
    model: formData.get('model'),
    category: formData.get('category'),
    tags: (formData.get('tags') as string)
      ?.split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean) ?? [],
    is_public: formData.get('is_public') !== 'false',
  }

  const parsed = promptSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const payload = {
    ...parsed.data,
    description: parsed.data.description?.trim() ? parsed.data.description : null,
    usage_tips: parsed.data.usage_tips?.trim() ? parsed.data.usage_tips : null,
    example_output: parsed.data.example_output?.trim() ? parsed.data.example_output : null,
  }

  let { data, error } = await supabase
    .from('prompts')
    .insert({ ...payload, user_id: user.id })
    .select('id')
    .single()

  // Backward compatibility for environments where DB migration for rich fields has not run yet.
  if (error && isMissingRichPromptColumnsError(error.message)) {
    const legacyPayload = stripRichPromptFields(payload)
    const retry = await supabase
      .from('prompts')
      .insert({ ...legacyPayload, user_id: user.id })
      .select('id')
      .single()

    data = retry.data
    error = retry.error
  }

  if (error || !data) return { error: { _form: [error?.message ?? 'Failed to create prompt'] } }

  revalidatePath('/feed')
  redirect(`/prompts/${data.id}`)
}

export async function updatePrompt(id: string, _prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const raw = {
    title: formData.get('title'),
    content: formData.get('content'),
    description: formData.get('description') || undefined,
    usage_tips: formData.get('usage_tips') || undefined,
    example_output: formData.get('example_output') || undefined,
    model: formData.get('model'),
    category: formData.get('category'),
    tags: (formData.get('tags') as string)
      ?.split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean) ?? [],
    is_public: formData.get('is_public') !== 'false',
  }

  const parsed = promptSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const payload = {
    ...parsed.data,
    description: parsed.data.description?.trim() ? parsed.data.description : null,
    usage_tips: parsed.data.usage_tips?.trim() ? parsed.data.usage_tips : null,
    example_output: parsed.data.example_output?.trim() ? parsed.data.example_output : null,
  }

  let { error } = await supabase
    .from('prompts')
    .update(payload)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error && isMissingRichPromptColumnsError(error.message)) {
    const legacyPayload = stripRichPromptFields(payload)
    const retry = await supabase
      .from('prompts')
      .update(legacyPayload)
      .eq('id', id)
      .eq('user_id', user.id)

    error = retry.error
  }

  if (error) return { error: { _form: [error.message] } }

  revalidatePath(`/prompts/${id}`)
  revalidatePath('/feed')
  redirect(`/prompts/${id}`)
}

export async function deletePrompt(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { error } = await supabase
    .from('prompts')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/feed')
  redirect('/feed')
}
