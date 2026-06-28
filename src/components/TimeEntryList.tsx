'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Lang, t } from '@/lib/i18n'

type Entry = { id: string; description: string; started_at: string; duration_seconds: number }

export default function TimeEntryList({ userId, refresh, lang }: { userId: string, refresh: number, lang: Lang }) {
  const [entries, setEntries] = useState<Entry[]>([])
  const supabase = createClient()
  const tr = t[lang]

  async function load() {
    const { data } = await supabase.from('time_entries').select('*').eq('user_id', userId).order('started_at', { ascending: false }).limit(20)
    if (data) setEntries(data)
  }

  useEffect(() => { load() }, [refresh])

  function fmt(s: number) { const h = Math.floor(s / 3600); const m = Math.floor((s % 3600) / 60); return h > 0 ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m` }
  function fmtDate(iso: string) { const d = new Date(iso); return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` }

  return (
    <div style={{ background: '#fff', borderRadius: '18px', padding: '2rem', border: '0.5px solid #d2d2d7' }}>
      <h2 style={{ fontSize: '17px', fontWeight: '600', color: '#1d1d1f', margin: '0 0 1.25rem' }}>{tr.workLog}</h2>
      {entries.length === 0 ? (
        <p style={{ color: '#6e6e73', fontSize: '14px', textAlign: 'center', padding: '2rem 0' }}>{tr.noLog}</p>
      ) : entries.map(entry => (
        <div key={entry.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '0.5px solid #f0f0f5' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '500', color: '#1d1d1f' }}>{entry.description}</div>
            <div style={{ fontSize: '12px', color: '#6e6e73', marginTop: '3px' }}>{fmtDate(entry.started_at)}</div>
          </div>
          <div style={{ fontSize: '14px', color: '#6e6e73', fontWeight: '500' }}>{fmt(entry.duration_seconds)}</div>
        </div>
      ))}
    </div>
  )
}
