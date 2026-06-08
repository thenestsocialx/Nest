'use client'

import { getAvatarGradient, getInitials } from '@/lib/findAllies'
import type { AllyPublicProfile, MatchQuality } from '@/types/findAllies'

interface Props {
  ally: AllyPublicProfile
  quality: MatchQuality
  onNext: () => void
  onConnect: (ally: AllyPublicProfile) => void
}

export default function ProfileCard({ ally, quality, onNext, onConnect }: Props) {
  const initials  = getInitials(ally.display_name)
  const gradient  = getAvatarGradient(ally.id)
  const isGreat   = quality === 'great'

  // Tags: up to 3 modalities + first 2 specialties, capped at 5
  const tags = [
    ...ally.modalities.slice(0, 3),
    ...ally.specialties.slice(0, 2),
  ].slice(0, 5)

  const detailLine = ally.tagline ?? ally.approach_style ?? 'Flexible, personalised approach'
  const roleLine   = ally.primary_role
    ? `${ally.primary_role}${ally.years_experience > 0 ? ` · ${ally.years_experience} yrs` : ''}`
    : null

  return (
    <div className="fa-profile-card" key={ally.id}>

      {/* Header */}
      <div className="fa-card-header">
        <div className={`fa-match-badge fa-match-badge--${isGreat ? 'great' : 'good'}`}>
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M6 1l1.3 3.5L11 5.5l-2.5 2.5.5 3.5L6 10 2 11.5l.5-3.5L0 5.5l3.7-1z" fill="currentColor"/>
          </svg>
          {isGreat ? 'Great match' : 'Good match'}
        </div>

        <div className="fa-card-avatar" style={{ background: ally.photo_url ? undefined : gradient }}>
          {ally.photo_url
            ? <img src={ally.photo_url} alt={ally.display_name} />
            : initials}
        </div>

        <div className="fa-card-name">{ally.display_name}</div>
        {roleLine && <div className="fa-card-role">{roleLine}</div>}
      </div>

      {/* Body */}
      <div className="fa-card-body">
        {ally.bio && <p className="fa-card-bio">{ally.bio}</p>}

        {tags.length > 0 && (
          <div className="fa-card-tags">
            {tags.map(tag => (
              <span key={tag} className="fa-card-tag">{tag}</span>
            ))}
          </div>
        )}

        <div className="fa-detail-row">
          <svg width="14" height="14" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M6 11c.5.5 1.5 1 3 1s2.5-.5 3-1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <span>{detailLine}</span>
        </div>

        <div className="fa-detail-row">
          <svg width="14" height="14" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M9 6v3.5l2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <span>Available Mon – Sat</span>
        </div>
      </div>

      {/* Actions */}
      <div className="fa-card-actions">
        <button type="button" className="fa-btn-skip" onClick={onNext} aria-label="See next ally">
          <svg width="15" height="15" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M7 4l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
          Next
        </button>
        <button type="button" className="fa-btn-connect" onClick={() => onConnect(ally)}>
          <svg width="15" height="15" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M9 3s-5 3.5-5 7a5 5 0 0010 0c0-3.5-5-7-5-7z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
          </svg>
          Connect
        </button>
      </div>

    </div>
  )
}
