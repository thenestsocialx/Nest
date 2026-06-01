export const APP_MODE = process.env.NEXT_PUBLIC_APP_MODE ?? 'live'
export const IS_WAITLIST = APP_MODE === 'waitlist'
export const FORMSPREE_ENDPOINT = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT ?? ''
