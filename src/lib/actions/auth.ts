'use server'

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { loginSchema, signupSchema } from '@/lib/validations/schemas'
import type { FormState } from '@/types/database'

async function getSiteUrl() {
  const headersList = await headers()
  const host = headersList.get('host') ?? 'localhost:3000'
  const proto = headersList.get('x-forwarded-proto') ?? 'http'
  return `${proto}://${host}`
}

export async function signIn(_prevState: FormState, formData: FormData): Promise<FormState> {
  const raw = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const parsed = loginSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) {
    return { error: { _form: [error.message] } }
  }

  redirect('/feed')
}

export async function signUp(_prevState: FormState, formData: FormData): Promise<FormState> {
  const raw = {
    email: formData.get('email'),
    password: formData.get('password'),
    username: formData.get('username'),
  }

  const parsed = signupSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('profiles')
    .select('username')
    .eq('username', parsed.data.username)
    .single()

  if (existing) {
    return { error: { username: ['Username is already taken'] } }
  }

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { preferred_username: parsed.data.username },
    },
  })

  if (error) {
    return { error: { _form: [error.message] } }
  }

  return { success: 'Check your email to confirm your account.' }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/feed')
}

export async function signInWithGoogle(): Promise<void> {
  const siteUrl = await getSiteUrl()
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${siteUrl}/callback`,
    },
  })

  if (error) throw new Error(error.message)
  if (data.url) redirect(data.url)
}
