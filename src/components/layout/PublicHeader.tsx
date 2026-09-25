'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import styles from '@/app/landing.module.css'

interface PublicHeaderProps {
  isAuthenticated?: boolean
}

export default function PublicHeader({ isAuthenticated = false }: PublicHeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navClass = [styles.nav, scrolled ? styles.navScrolled : ''].filter(Boolean).join(' ')

  const linkClass = (href: string) =>
    pathname === href || pathname.startsWith(href + '/')
      ? [styles.navActive].join(' ')
      : undefined

  return (
    <header className={navClass} role="banner">
      <div className={styles.navInner}>
        <Link href="/" className={styles.navLogo} aria-label="nest home">
          <svg width="26" height="24" viewBox="0 0 30 28" fill="none" aria-hidden="true">
            <path d="M 3,16 Q 15,26 27,16" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
            <circle cx="15" cy="8" r="3.2" fill="currentColor" />
          </svg>
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: '22px', fontWeight: 400, letterSpacing: '-0.01em', lineHeight: 1, color: 'currentColor' }}>
            nest
          </span>
        </Link>

        <nav className={styles.navLinks} aria-label="Main navigation">
          <Link href="/nila" className={linkClass('/nila')}>nila</Link>
          <Link href="/allies" className={linkClass('/allies')}>allies</Link>
          {isAuthenticated
            ? <Link href="/home" className={styles.navCta}>Go to your space →</Link>
            : <Link href="/login" className={styles.navCta}>Sign in</Link>
          }
        </nav>
      </div>
    </header>
  )
}
