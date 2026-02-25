import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 3600 // regenerate hourly

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://promptvaultt.netlify.app'

const STATIC_ROUTES: MetadataRoute.Sitemap = [
  { url: SITE_URL, priority: 1.0, changeFrequency: 'daily' },
  { url: `${SITE_URL}/feed`, priority: 0.9, changeFrequency: 'always' },
  { url: `${SITE_URL}/explore`, priority: 0.8, changeFrequency: 'always' },
  { url: `${SITE_URL}/creators`, priority: 0.7, changeFrequency: 'daily' },
]

async function getPromptUrls(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const urls: MetadataRoute.Sitemap = []
  const PAGE_SIZE = 1000
  let page = 0

  while (true) {
    const { data, error } = await supabase
      .from('prompts')
      .select('id, updated_at')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

    if (error || !data?.length) break

    for (const prompt of data) {
      urls.push({
        url: `${SITE_URL}/prompts/${prompt.id}`,
        lastModified: new Date(prompt.updated_at),
        changeFrequency: 'weekly',
        priority: 0.6,
      })
    }

    if (data.length < PAGE_SIZE) break
    page++
  }

  return urls
}

async function getProfileUrls(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const urls: MetadataRoute.Sitemap = []
  const PAGE_SIZE = 1000
  let page = 0

  while (true) {
    const { data, error } = await supabase
      .from('profiles')
      .select('username, updated_at')
      .order('follower_count', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

    if (error || !data?.length) break

    for (const profile of data) {
      urls.push({
        url: `${SITE_URL}/profile/${profile.username}`,
        lastModified: new Date(profile.updated_at),
        changeFrequency: 'weekly',
        priority: 0.5,
      })
    }

    if (data.length < PAGE_SIZE) break
    page++
  }

  return urls
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [promptUrls, profileUrls] = await Promise.all([getPromptUrls(), getProfileUrls()])
  return [...STATIC_ROUTES, ...promptUrls, ...profileUrls]
}
