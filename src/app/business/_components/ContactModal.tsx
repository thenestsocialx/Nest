'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { FORMSPREE_ENDPOINT } from '@/lib/config'
import styles from '../business.module.css'
import { INTERESTS } from './offers'

const ORG_TYPES = ['Company', 'School', 'College or University', 'Other']
const SIZES = ['Under 50', '50 to 200', '200 to 500', '500 to 1,000', '1,000+']

type Field = 'name' | 'email' | 'designation' | 'organisation' | 'orgType' | 'size' | 'interest' | 'message'
type Status = 'idle' | 'sending' | 'sent' | 'error'

const REQUIRED: Field[] = ['name', 'email', 'designation', 'organisation', 'orgType', 'size', 'interest']
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface Props {
  /** Pre-selects "What are you looking for?" when opened from an offer card */
  initialInterest?: string
  onClose: () => void
}

export default function ContactModal({ initialInterest = '', onClose }: Props) {
  const [values, setValues] = useState<Record<Field, string>>({
    name: '', email: '', designation: '', organisation: '', orgType: '', size: '', interest: initialInterest, message: '',
  })
  const [invalid, setInvalid] = useState<Set<Field>>(new Set())
  const [status, setStatus] = useState<Status>('idle')
  const firstField = useRef<HTMLInputElement>(null)

  useEffect(() => {
    firstField.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const set = (f: Field) => (e: { target: { value: string } }) => {
    const v = e.target.value
    setValues(prev => ({ ...prev, [f]: v }))
    if (invalid.has(f)) setInvalid(prev => { const n = new Set(prev); n.delete(f); return n })
  }

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Bots fill the hidden field; people never see it
    if ((new FormData(e.currentTarget).get('_gotcha') as string)?.length) return

    const bad = new Set(REQUIRED.filter(f => !values[f].trim()))
    if (values.email.trim() && !EMAIL_RE.test(values.email.trim())) bad.add('email')
    setInvalid(bad)
    if (bad.size) return

    if (!FORMSPREE_ENDPOINT) { setStatus('error'); return }
    setStatus('sending')
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          _subject: `Nest for Business enquiry: ${values.organisation.trim()}`,
          form: 'Nest for Business',
          name: values.name.trim(),
          email: values.email.trim(),
          designation: values.designation.trim(),
          organisation: values.organisation.trim(),
          organisation_type: values.orgType,
          number_of_people: values.size,
          looking_for: values.interest,
          message: values.message.trim(),
          page: window.location.href,
        }),
      })
      setStatus(res.ok ? 'sent' : 'error')
    } catch {
      setStatus('error')
    }
  }

  const inputClass = (f: Field, extra = '') => [styles.input, extra, invalid.has(f) ? styles.inputError : ''].filter(Boolean).join(' ')

  return (
    <div className={`${styles.dim} ${styles.overlay}`}>
      <div className={`${styles.pop} ${styles.modal}`} role="dialog" aria-modal="true" aria-labelledby="biz-talk-title">
        <button type="button" onClick={onClose} aria-label="Close" style={{ position: 'absolute', right: 18, top: 16, zIndex: 2, width: 40, height: 40, borderRadius: '50%', background: 'rgba(36,59,46,.06)', border: 0, fontSize: 22, color: '#5A6B5F', cursor: 'pointer' }}>×</button>

        {status !== 'sent' ? (
          <form className={styles.modalBody} onSubmit={submit} noValidate>
            <div className={styles.eyebrow} style={{ color: '#9B6651' }}>Let’s Talk</div>
            <h3 id="biz-talk-title" className={styles.serif} style={{ margin: '12px 0 0', fontSize: 32, fontWeight: 500, lineHeight: 1.2, color: '#243B2E' }}>Tell Us a Little About Your Team.</h3>
            <p style={{ margin: '10px 0 0', fontSize: 15.5, lineHeight: 1.6, color: '#5A6B5F' }}>We’ll get back to you within 2 working days to plan something that fits.</p>

            <div className={styles.fields}>
              <label style={{ display: 'block' }}><span className={styles.fieldLabel}>Your Name</span>
                <input ref={firstField} type="text" name="name" autoComplete="name" maxLength={120} placeholder="Full name" value={values.name} onChange={set('name')} aria-invalid={invalid.has('name')} className={inputClass('name')} />
              </label>
              <label style={{ display: 'block' }}><span className={styles.fieldLabel}>Work Email</span>
                <input type="email" name="email" autoComplete="email" maxLength={200} placeholder="you@company.com" value={values.email} onChange={set('email')} aria-invalid={invalid.has('email')} className={inputClass('email')} />
              </label>
              <label style={{ display: 'block' }}><span className={styles.fieldLabel}>Your Designation</span>
                <input type="text" name="designation" autoComplete="organization-title" maxLength={120} placeholder="HR Manager, Principal, Dean…" value={values.designation} onChange={set('designation')} aria-invalid={invalid.has('designation')} className={inputClass('designation')} />
              </label>
              <label style={{ display: 'block' }}><span className={styles.fieldLabel}>Organisation Name</span>
                <input type="text" name="organisation" autoComplete="organization" maxLength={160} placeholder="Company, school or college" value={values.organisation} onChange={set('organisation')} aria-invalid={invalid.has('organisation')} className={inputClass('organisation')} />
              </label>
              <label style={{ display: 'block' }}><span className={styles.fieldLabel}>Organisation Type</span>
                <select name="organisation_type" value={values.orgType} onChange={set('orgType')} aria-invalid={invalid.has('orgType')} className={inputClass('orgType', styles.select)}>
                  <option value="">Choose one</option>
                  {ORG_TYPES.map(o => <option key={o}>{o}</option>)}
                </select>
              </label>
              <label style={{ display: 'block' }}><span className={styles.fieldLabel}>Number of People</span>
                <select name="number_of_people" value={values.size} onChange={set('size')} aria-invalid={invalid.has('size')} className={inputClass('size', styles.select)}>
                  <option value="">Choose a range</option>
                  {SIZES.map(o => <option key={o}>{o}</option>)}
                </select>
              </label>
              <label className={styles.fieldWide} style={{ display: 'block' }}><span className={styles.fieldLabel}>What Are You Looking For?</span>
                <select name="looking_for" value={values.interest} onChange={set('interest')} aria-invalid={invalid.has('interest')} className={inputClass('interest', styles.select)}>
                  <option value="">Pick what fits best</option>
                  {INTERESTS.map(o => <option key={o}>{o}</option>)}
                </select>
              </label>
              <label className={styles.fieldWide} style={{ display: 'block' }}><span className={styles.fieldLabel}>Anything Else We Should Know? <span style={{ fontWeight: 400, color: '#8A8272' }}>(optional)</span></span>
                <textarea name="message" rows={3} maxLength={2000} placeholder="Dates, goals, what your team is going through…" value={values.message} onChange={set('message')} className={inputClass('message', styles.textarea)} />
              </label>
              <label className={styles.honeypot} aria-hidden="true">Leave this empty<input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" /></label>
            </div>

            {invalid.size > 0 && <p className={styles.formError} role="alert">Please fill in the highlighted fields{invalid.has('email') && values.email.trim() ? ' and check the email address' : ''}.</p>}
            {status === 'error' && (
              <p className={styles.formError} role="alert">
                We couldn’t send that just now. Please try again, or email us at <a href="mailto:care@thenestsocial.com?subject=Nest%20for%20Business">care@thenestsocial.com</a>.
              </p>
            )}

            <button type="submit" className={`${styles.btnClay} ${styles.submit}`} disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending…' : 'Send Request'}
            </button>
            <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 14, fontSize: 13, color: '#8A8272' }}><span style={{ flexGrow: 1, height: 1, background: '#EDE0CD' }} />or<span style={{ flexGrow: 1, height: 1, background: '#EDE0CD' }} /></div>
            <a href="mailto:care@thenestsocial.com?subject=Nest%20for%20Business" style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: '#243B2E', textDecoration: 'none', fontSize: 15, fontWeight: 600 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9B6651" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>
              Email us at care@thenestsocial.com
            </a>
          </form>
        ) : (
          <div style={{ padding: '64px 48px 56px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }} role="status">
            <span style={{ width: 76, height: 76, borderRadius: '50%', background: '#243B2E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#E8C8A0" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path className={styles.tick} d="M5 12.5l4.5 4.5L19 7.5" /></svg>
            </span>
            <h3 className={styles.serif} style={{ margin: '26px 0 0', fontSize: 32, fontWeight: 500, color: '#243B2E' }}>Thank You. We’ll Be in Touch.</h3>
            <p style={{ margin: '12px 0 0', maxWidth: 420, fontSize: 16, lineHeight: 1.65, color: '#5A6B5F' }}>Someone from our team will reach out within 2 working days to understand what your people need.</p>
            <button type="button" onClick={onClose} style={{ marginTop: 30, background: '#243B2E', color: '#F8F0E5', border: 0, borderRadius: 999, padding: '15px 30px', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Back to the Page</button>
          </div>
        )}
      </div>
    </div>
  )
}
