'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Lang, t } from '@/lib/i18n'
import { useTheme } from '@/contexts/ThemeContext'

type Entry = { id: string; description: string; started_at: string; duration_seconds: number; client_id: string | null; hourly_rate: number | null; notes: string | null }
type Client = { id: string; name: string }

export default function TimeEntryList({ userId, refresh, lang }: { userId: string, refresh: number, lang: Lang }) {
  const [entries, setEntries] = useState<Entry[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [editTarget, setEditTarget] = useState<Entry | null>(null)
  const [editDesc, setEditDesc] = useState('')
  const [editDuration, setEditDuration] = useState(0)
  const [editClientId, setEditClientId] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [expandedNotes, setExpandedNotes] = useState<string[]>([])
  const supabase = createClient()
  const tr = t[lang]
  const { tokens } = useTheme()

  async function load() {
    const { data } = await supabase.from('time_entries').select('*').eq('user_id', userId).order('started_at', { ascending: false }).limit(50)
    if (data) setEntries(data)
  }

  async function loadClients() {
    const { data } = await supabase.from('clients').select('id, name').eq('user_id', userId)
    if (data) setClients(data)
  }

  useEffect(() => { load(); loadClients() }, [refresh])

  function openEdit(e: Entry) {
    setEditTarget(e); setEditDesc(e.description)
    setEditDuration(Math.round(e.duration_seconds / 60)); setEditClientId(e.client_id || '')
    setEditNotes(e.notes || '')
  }

  async function saveEdit() {
    if (!editTarget) return
    setSaving(true)
    const { error } = await supabase.from('time_entries').update({ description: editDesc, duration_seconds: editDuration * 60, client_id: editClientId || null, notes: editNotes || null }).eq('id', editTarget.id)
    if (!error) { setEditTarget(null); load() }
    setSaving(false)
  }

  async function deleteEntry(id: string) {
    const ok = window.confirm(lang === 'ja' ? 'この作業ログを削除しますか？' : 'Delete this entry?')
    if (!ok) return
    await supabase.from('time_entries').delete().eq('id', id)
    load()
  }

  function fmt(s: number) { const h = Math.floor(s / 3600); const m = Math.floor((s % 3600) / 60); return h > 0 ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m` }
  function fmtDate(iso: string) { const d = new Date(iso); return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` }
  const clientName = (id: string | null) => clients.find(c => c.id === id)?.name || null

  const inp = { width: '100%', padding: '8px 12px', border: '1px solid ' + tokens.border, borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' as const, color: tokens.text, outline: 'none', fontFamily: 'inherit', background: tokens.bgHover }

  return (
    <div style={{ background: tokens.bgCard, borderRadius: '12px', border: '1px solid ' + tokens.border, overflow: 'hidden' }}>
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid ' + tokens.border, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '14px', fontWeight: '600', color: tokens.text, margin: 0, letterSpacing: '-0.2px' }}>{tr.workLog}</h2>
        <span style={{ fontSize: '12px', color: tokens.textTertiary }}>{entries.length} {lang === 'ja' ? '件' : 'entries'}</span>
      </div>

      {editTarget && (
        <div style={{ padding: '1rem 1.25rem', background: tokens.bgHover, borderBottom: '1px solid ' + tokens.border }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <input style={inp} value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder={lang === 'ja' ? '作業内容' : 'Description'} />
            </div>
            <input style={inp} type="number" value={editDuration} onChange={e => setEditDuration(Number(e.target.value))} placeholder={lang === 'ja' ? '分' : 'Minutes'} />
            <select style={inp} value={editClientId} onChange={e => setEditClientId(e.target.value)}>
              <option value="">{lang === 'ja' ? 'クライアントなし' : 'No client'}</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <div style={{ gridColumn: '1 / -1' }}>
              <textarea style={{ ...inp, minHeight: '60px', resize: 'vertical' }} value={editNotes} onChange={e => setEditNotes(e.target.value)} placeholder={lang === 'ja' ? 'メモ' : 'Notes'} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={saveEdit} disabled={saving}
              style={{ flex: 1, padding: '8px', background: tokens.accent, color: '#080808', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
              {saving ? '...' : lang === 'ja' ? '保存' : 'Save'}
            </button>
            <button onClick={() => setEditTarget(null)}
              style={{ flex: 1, padding: '8px', background: 'transparent', border: '1px solid ' + tokens.border, borderRadius: '8px', fontSize: '13px', cursor: 'pointer', color: tokens.textSecondary, fontFamily: 'inherit' }}>
              {lang === 'ja' ? 'キャンセル' : 'Cancel'}
            </button>
          </div>
        </div>
      )}

      {entries.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center' }}>
          <p style={{ color: tokens.textTertiary, fontSize: '13px' }}>{tr.noLog}</p>
        </div>
      ) : entries.map((entry, i) => (
        <div key={entry.id} style={{ borderBottom: i < entries.length - 1 ? '1px solid ' + tokens.border : 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 1.25rem', background: editTarget?.id === entry.id ? tokens.bgActive : 'transparent', transition: 'background 0.15s' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: '500', color: tokens.text, marginBottom: '3px', letterSpacing: '-0.1px' }}>{entry.description}</div>
              <div style={{ fontSize: '11px', color: tokens.textTertiary, display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span>{fmtDate(entry.started_at)}</span>
                {clientName(entry.client_id) && (
                  <span style={{ background: tokens.accentBg, color: tokens.accentText, padding: '1px 7px', borderRadius: '4px', fontSize: '10px', fontWeight: '600' }}>
                    {clientName(entry.client_id)}
                  </span>
                )}
                {entry.notes && (
                  <button onClick={() => setExpandedNotes(prev => prev.includes(entry.id) ? prev.filter(x => x !== entry.id) : [...prev, entry.id])}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: tokens.textTertiary, fontFamily: 'inherit', padding: '0', textDecoration: 'underline' }}>
                    {expandedNotes.includes(entry.id) ? (lang === 'ja' ? 'メモを隠す' : 'hide') : (lang === 'ja' ? 'メモ' : 'note')}
                  </button>
                )}
              </div>
            </div>
            <div style={{ fontSize: '12px', color: tokens.textSecondary, fontWeight: '500', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>{fmt(entry.duration_seconds)}</div>
            <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
              <button onClick={() => openEdit(entry)}
                style={{ padding: '4px 10px', background: 'transparent', border: '1px solid ' + tokens.border, borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '500', color: tokens.textTertiary, fontFamily: 'inherit', transition: 'all 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = tokens.textSecondary; (e.currentTarget as HTMLElement).style.color = tokens.text }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = tokens.border; (e.currentTarget as HTMLElement).style.color = tokens.textTertiary }}>
                {lang === 'ja' ? '編集' : 'Edit'}
              </button>
              <button onClick={() => deleteEntry(entry.id)}
                style={{ padding: '4px 10px', background: 'transparent', border: '1px solid transparent', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '500', color: tokens.textTertiary, fontFamily: 'inherit', transition: 'all 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = tokens.danger; (e.currentTarget as HTMLElement).style.borderColor = tokens.danger }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = tokens.textTertiary; (e.currentTarget as HTMLElement).style.borderColor = 'transparent' }}>
                {lang === 'ja' ? '削除' : 'Del'}
              </button>
            </div>
          </div>
          {entry.notes && expandedNotes.includes(entry.id) && (
            <div style={{ padding: '0 1.25rem 10px', marginTop: '-4px' }}>
              <div style={{ background: tokens.bgHover, borderRadius: '6px', padding: '8px 12px', fontSize: '12px', color: tokens.textSecondary, lineHeight: '1.6', borderLeft: '2px solid ' + tokens.accent }}>
                {entry.notes}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
