import { createClient } from '@/lib/supabase/server'
import type { PromptCategory, PromptWithProfile } from '@/types/database'

// Supabase requires the explicit FK hint because prompts has multiple
// relationships to profiles (direct, via likes, via bookmarks)
const PROMPT_WITH_PROFILE = `
  id, title, content, description, model, category, tags,
  like_count, bookmark_count, created_at,
  profiles!prompts_user_id_fkey(username, display_name, avatar_url)
` as const

const PROMPT_CATEGORIES = [
  'coding',
  'writing',
  'marketing',
  'design',
  'business',
  'education',
  'productivity',
  'creative',
  'research',
  'other',
] as const satisfies readonly PromptCategory[]

function isPromptCategory(value: string): value is PromptCategory {
  return PROMPT_CATEGORIES.includes(value as PromptCategory)
}

export async function getFeedPrompts({
  tab = 'latest',
  category,
  page = 0,
  limit = 20,
}: {
  tab?: 'latest' | 'trending'
  category?: string
  page?: number
  limit?: number
} = {}): Promise<PromptWithProfile[]> {
  const supabase = await createClient()

  let query = supabase
    .from('prompts')
    .select(PROMPT_WITH_PROFILE)
    .eq('is_public', true)
    .range(page * limit, (page + 1) * limit - 1)

  if (category && category !== 'all' && isPromptCategory(category)) {
    query = query.eq('category', category)
  }

  query =
    tab === 'trending'
      ? query.order('like_count', { ascending: false })
      : query.order('created_at', { ascending: false })

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as unknown as PromptWithProfile[]
}

export async function getPromptById(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('prompts')
    .select(`*, profiles!prompts_user_id_fkey(username, display_name, avatar_url)`)
    .eq('id', id)
    .single()

  if (error) return null
  return data as unknown as PromptWithProfile
}

export async function getUserPrompts(userId: string): Promise<PromptWithProfile[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('prompts')
    .select(PROMPT_WITH_PROFILE)
    .eq('user_id', userId)
    .eq('is_public', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as unknown as PromptWithProfile[]
}

// Returns ALL prompts for the owner (public + private), includes is_public field
export async function getMyPrompts(userId: string): Promise<PromptWithProfile[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('prompts')
    .select(`
      id, title, content, description, model, category, tags,
      is_public, like_count, bookmark_count, created_at,
      profiles!prompts_user_id_fkey(username, display_name, avatar_url)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as unknown as PromptWithProfile[]
}

export async function searchPrompts(query: string, category?: string): Promise<PromptWithProfile[]> {
  const supabase = await createClient()

  let dbQuery = supabase
    .from('prompts')
    .select(PROMPT_WITH_PROFILE)
    .eq('is_public', true)
    .order('like_count', { ascending: false })
    .limit(30)

  if (query) {
    dbQuery = dbQuery.textSearch('title', query, { type: 'websearch' })
  }

  if (category && category !== 'all' && isPromptCategory(category)) {
    dbQuery = dbQuery.eq('category', category)
  }

  const { data, error } = await dbQuery
  if (error) throw error
  return (data ?? []) as unknown as PromptWithProfile[]
}

export async function getBookmarkedPrompts(userId: string): Promise<PromptWithProfile[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('bookmarks')
    .select(
      `prompt_id,
       prompts!bookmarks_prompt_id_fkey(
         id, title, description, model, category, tags,
         like_count, bookmark_count, created_at,
         profiles!prompts_user_id_fkey(username, display_name, avatar_url)
       )`
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  const rows = (data ?? []) as unknown as Array<{ prompts: PromptWithProfile | null }>
  return rows.flatMap((bookmark) => (bookmark.prompts ? [bookmark.prompts] : []))
}

export async function getUserInteractions(userId: string, promptIds: string[]) {
  if (!promptIds.length) return { likes: new Set<string>(), bookmarks: new Set<string>() }

  const supabase = await createClient()

  const [likesResult, bookmarksResult] = await Promise.all([
    supabase.from('likes').select('prompt_id').eq('user_id', userId).in('prompt_id', promptIds),
    supabase.from('bookmarks').select('prompt_id').eq('user_id', userId).in('prompt_id', promptIds),
  ])

  return {
    likes: new Set((likesResult.data ?? []).map((l) => l.prompt_id)),
    bookmarks: new Set((bookmarksResult.data ?? []).map((b) => b.prompt_id)),
  }
}
