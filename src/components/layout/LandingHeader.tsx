'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import NestLogo from '@/components/ui/NestLogo'

interface LandingHeaderProps {
  isLoggedIn?: boolean
}

export default function LandingHeader({ isLoggedIn = false }: LandingHeaderProps) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const ctaHref = isLoggedIn ? '/home' : '/login'
  const ctaLabel = isLoggedIn ? 'go to your space →' : 'go to your space →'

  const links = [
    { href: '/nila',   label: 'nila' },
    { href: '/allies', label: 'allies' },
  ]

  return (
    <header
      style={{
        background: '#2F4C3A',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 72,
          padding: '0 80px',
        }}
        className="ns-lhdr__inner"
      >
        {/* Logo */}
        <a href="/" aria-label="Nest home" style={{ textDecoration: 'none', flexShrink: 0 }}>
          <NestLogo size={20} color="#F8F0E5" />
        </a>

        {/* Desktop nav */}
        <nav
          className="ns-lhdr__nav"
          style={{ display: 'flex', alignItems: 'center', gap: 36 }}
        >
          {links.map(({ href, label }) => {
            const isActive = pathname === href
            return (
              <a
                key={href}
                href={href}
                style={{
                  fontSize: 14,
                  fontWeight: isActive ? 500 : 400,
                  color: isActive ? '#E8C8A0' : '#F8F0E5',
                  opacity: isActive ? 1 : 0.72,
                  textDecoration: 'none',
                  transition: 'opacity 120ms ease',
                }}
              >
                {label}
              </a>
            )
          })}

          {/* CTA */}
          <a
            href={ctaHref}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '11px 24px',
              borderRadius: 999,
              fontSize: 14,
              fontWeight: 500,
              background: '#F8F0E5',
              color: '#2F4C3A',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {ctaLabel}
          </a>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="ns-lhdr__burger"
          type="button"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((p) => !p)}
          style={{
            display: 'none',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 4,
            color: '#F8F0E5',
          }}
        >
          {menuOpen ? (
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              <path d="M5 5 L17 17 M17 5 L5 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              <path d="M4 7 H18 M4 11 H18 M4 15 H18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          className="ns-lhdr__mobile"
          style={{
            background: '#243E30',
            borderTop: '1px solid rgba(232,200,160,0.12)',
            padding: '16px 24px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          {links.map(({ href, label }) => {
            const isActive = pathname === href
            return (
              <a
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                style={{
                  fontSize: 16,
                  fontWeight: isActive ? 500 : 400,
                  color: isActive ? '#E8C8A0' : '#F8F0E5',
                  opacity: isActive ? 1 : 0.8,
                  textDecoration: 'none',
                  padding: '10px 0',
                  borderBottom: '1px solid rgba(232,200,160,0.08)',
                }}
              >
                {label}
              </a>
            )
          })}
          <a
            href={ctaHref}
            onClick={() => setMenuOpen(false)}
            style={{
              marginTop: 12,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '13px 24px',
              borderRadius: 999,
              fontSize: 14,
              fontWeight: 500,
              background: '#F8F0E5',
              color: '#2F4C3A',
              textDecoration: 'none',
            }}
          >
            {ctaLabel}
          </a>
        </div>
      )}

      <style>{`
        @media (max-width: 767px) {
          .ns-lhdr__inner { padding: 0 20px !important; }
          .ns-lhdr__nav { display: none !important; }
          .ns-lhdr__burger { display: flex !important; }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .ns-lhdr__inner { padding: 0 32px !important; }
        }
      `}</style>
    </header>
  )
}
