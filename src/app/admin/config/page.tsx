'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { saveAdminConfig } from './actions'

interface ConfigRow {
  key: string
  value: string
  description: string | null
  updated_at: string
}

function formatUpdated(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function AdminConfigPage() {
  const [rows, setRows]   = useState<ConfigRow[]>([])
  const [edits, setEdits] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [msgs, setMsgs]   = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('nest_config')
      .select('key, value, description, updated_at')
      .order('key')
      .then(({ data }) => {
        if (data) {
          setRows(data as ConfigRow[])
          const initial: Record<string, string> = {}
          ;(data as ConfigRow[]).forEach((r) => { initial[r.key] = r.value })
          setEdits(initial)
        }
        setLoading(false)
      })
  }, [])

  async function handleSave(key: string) {
    setSaving((p) => ({ ...p, [key]: true }))
    const { error } = await saveAdminConfig(key, edits[key] ?? '')
    setSaving((p) => ({ ...p, [key]: false }))
    if (!error) {
      setRows((prev) =>
        prev.map((r) =>
          r.key === key ? { ...r, value: edits[key], updated_at: new Date().toISOString() } : r,
        ),
      )
      setMsgs((p) => ({ ...p, [key]: 'Saved.' }))
    } else {
      setMsgs((p) => ({ ...p, [key]: error }))
    }
    setTimeout(() => setMsgs((p) => { const n = { ...p }; delete n[key]; return n }), 3000)
  }

  if (loading) {
    return (
      <div style={{ padding: 40, color: 'var(--moss)', fontSize: 14 }}>Loading config…</div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 400, color: 'var(--deep-pine)', margin: '0 0 6px', letterSpacing: '-0.01em' }}>
          App Config
        </h1>
        <p style={{ fontSize: 13, color: 'var(--moss)', opacity: 0.75, margin: 0 }}>
          Edit live configuration values. Changes take effect within 5 minutes across all active sessions.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {rows.map((row) => (
          <div key={row.key} className="ns-card" style={{ padding: '16px 20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 16, alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--deep-pine)', fontWeight: 500, marginBottom: 3 }}>
                  {row.key}
                </div>
                <div style={{ fontSize: 11, color: 'var(--moss)', opacity: 0.7 }}>
                  {row.description ?? '—'}
                </div>
                <div style={{ fontSize: 10, color: 'var(--moss)', opacity: 0.5, marginTop: 3 }}>
                  Updated {formatUpdated(row.updated_at)}
                </div>
              </div>
              <div>
                {row.value.includes('|') ? (
                  <textarea
                    value={edits[row.key] ?? row.value}
                    onChange={(e) => setEdits((p) => ({ ...p, [row.key]: e.target.value }))}
                    rows={3}
                    style={{
                      fontFamily: 'inherit',
                      fontSize: 13,
                      color: 'var(--deep-pine)',
                      background: 'var(--cream)',
                      border: '1.5px solid var(--honey-mute)',
                      borderRadius: 6,
                      padding: '8px 12px',
                      width: '100%',
                      outline: 'none',
                      resize: 'vertical',
                      lineHeight: 1.5,
                    }}
                  />
                ) : (
                  <input
                    type="text"
                    value={edits[row.key] ?? row.value}
                    onChange={(e) => setEdits((p) => ({ ...p, [row.key]: e.target.value }))}
                    style={{
                      fontFamily: 'inherit',
                      fontSize: 13,
                      color: 'var(--deep-pine)',
                      background: 'var(--cream)',
                      border: '1.5px solid var(--honey-mute)',
                      borderRadius: 6,
                      padding: '9px 12px',
                      width: '100%',
                      outline: 'none',
                    }}
                  />
                )}
                {msgs[row.key] && (
                  <div style={{ fontSize: 11, color: msgs[row.key] === 'Saved.' ? 'var(--moss)' : 'var(--terracotta)', marginTop: 4 }}>
                    {msgs[row.key]}
                  </div>
                )}
              </div>
              <button
                type="button"
                className="ns-btn ns-btn--secondary ns-btn--sm"
                disabled={saving[row.key] || edits[row.key] === row.value}
                onClick={() => handleSave(row.key)}
              >
                {saving[row.key] ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
