// The public address of the site, for search engines and link previews (sitemap, robots.txt,
// canonical and Open Graph URLs). Kept separate from NEXT_PUBLIC_APP_URL, which drives auth
// redirects and can point at a preview or local URL.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://thenestsocial.com').replace(/\/$/, '')
