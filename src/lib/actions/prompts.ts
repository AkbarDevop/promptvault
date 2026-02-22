'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { promptSchema } from '@/lib/validations/schemas'
import type { FormState } from '@/types/database'

export async function createPrompt(_prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const raw = {
    title: formData.get('title'),
    content: formData.get('content'),
    description: formData.get('description') || undefined,
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

  const { data, error } = await supabase
    .from('prompts')
    .insert({ ...parsed.data, user_id: user.id })
    .select('id')
    .single()

  if (error) return { error: { _form: [error.message] } }

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

  const { error } = await supabase
    .from('prompts')
    .update(parsed.data)
    .eq('id', id)
    .eq('user_id', user.id)

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
