import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/api',
        '/home',
        '/nila',
        '/profile',
        '/resources',
        '/sessions',
        '/assessment',
      ],
    },
    sitemap: 'https://thenest.social/sitemap.xml',
  }
}
