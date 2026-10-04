'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import styles from '@/app/landing.module.css'

// The blog needs its own database, so it's only linked where one is set up
const BLOG_ENABLED = process.env.NEXT_PUBLIC_BLOG_ENABLED === 'true'

interface PublicHeaderProps {
  isAuthenticated?: boolean
  /** Darker bar for pages whose hero uses the deeper green */
  dark?: boolean
}

export default function PublicHeader({ isAuthenticated = false, dark = false }: PublicHeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Blog listing pages open on a dark hero too, so the bar blends into it the same way
  const blendIntoHero = dark || pathname === '/blog' || pathname.startsWith('/blog/category/')
  const navClass = [styles.nav, blendIntoHero ? styles.navDark : '', scrolled ? styles.navScrolled : ''].filter(Boolean).join(' ')

  const linkClass = (href: string) =>
    pathname === href || pathname.startsWith(href + '/')
      ? styles.navActive
      : undefined

  const close = () => setMenuOpen(false)

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
          {BLOG_ENABLED && <Link href="/blog" className={linkClass('/blog')}>blog</Link>}
          {isAuthenticated
            ? <Link href="/home" className={styles.navCta}>Go to your space →</Link>
            : <Link href="/login" className={styles.navCta}>Sign in</Link>
          }
        </nav>

        <button
          className={styles.navHamburger}
          type="button"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(p => !p)}
        >
          <span style={menuOpen ? { transform: 'translateY(7px) rotate(45deg)' } : {}} />
          <span style={menuOpen ? { opacity: 0, transform: 'scaleX(0)' } : {}} />
          <span style={menuOpen ? { transform: 'translateY(-7px) rotate(-45deg)' } : {}} />
        </button>
      </div>

      <div
        className={[styles.mobileMenu, menuOpen ? styles.mobileMenuOpen : ''].filter(Boolean).join(' ')}
        aria-hidden={!menuOpen}
      >
        <Link href="/nila" className={linkClass('/nila')} onClick={close}>nila</Link>
        <Link href="/allies" className={linkClass('/allies')} onClick={close}>allies</Link>
        {BLOG_ENABLED && <Link href="/blog" className={linkClass('/blog')} onClick={close}>blog</Link>}
        {isAuthenticated
          ? <Link href="/home" className={styles.navCta} onClick={close}>Go to your space →</Link>
          : <Link href="/login" className={styles.navCta} onClick={close}>Sign in</Link>
        }
      </div>
    </header>
  )
}
