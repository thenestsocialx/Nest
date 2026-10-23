import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/api',
        '/home',
        // /nila itself is a public landing page; only the chat's sub-pages are private
        '/nila/',
        '/profile',
        '/resources',
        '/sessions',
        '/events',
        '/assessment',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
