import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

// Only pages a logged-out visitor (and so a search engine) can actually open.
// Pages that redirect to login, and query-string copies of a page, are left out.
const PAGES: { path: string; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number }[] = [
  { path: '',                           changeFrequency: 'weekly',  priority: 1 },
  { path: '/allies',                    changeFrequency: 'weekly',  priority: 0.9 },
  { path: '/nila',                      changeFrequency: 'weekly',  priority: 0.9 },
  { path: '/plans',                     changeFrequency: 'monthly', priority: 0.8 },
  { path: '/kanmani',                   changeFrequency: 'monthly', priority: 0.7 },
  { path: '/register',                  changeFrequency: 'yearly',  priority: 0.4 },
  { path: '/login',                     changeFrequency: 'yearly',  priority: 0.3 },
  { path: '/legal/privacy',             changeFrequency: 'yearly',  priority: 0.2 },
  { path: '/legal/terms',               changeFrequency: 'yearly',  priority: 0.2 },
  { path: '/legal/cancellation-refund', changeFrequency: 'yearly',  priority: 0.2 },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  return PAGES.map(({ path, changeFrequency, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }))
}
