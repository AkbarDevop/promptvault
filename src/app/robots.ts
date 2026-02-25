import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://promptvaultt.netlify.app'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/profile/settings', '/prompts/new', '/prompts/*/edit'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
