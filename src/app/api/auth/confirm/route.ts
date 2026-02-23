import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { type EmailOtpType } from '@supabase/supabase-js'

const DEFAULT_REDIRECT = '/feed'

function getSafeRedirectPath(nextParam: string | null): string {
  if (!nextParam) return DEFAULT_REDIRECT
  if (!nextParam.startsWith('/')) return DEFAULT_REDIRECT
  if (nextParam.startsWith('//')) return DEFAULT_REDIRECT
  return nextParam
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const token_hash = url.searchParams.get('token_hash')
  const type = url.searchParams.get('type') as EmailOtpType | null
  const next = getSafeRedirectPath(url.searchParams.get('next'))

  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  return NextResponse.redirect(new URL('/login?error=invalid_token', request.url))
}
