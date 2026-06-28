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
    const ok = window.confirm(lang === 'ja' ? 'この作業ログを削除しますか？' : lang === 'zh' ? '确认删除此记录？' : 'Delete this time entry?')
    if (!ok) return
    await supabase.from('time_entries').delete().eq('id', id)
    load()
  }

  function toggleNotes(id: string) {
    setExpandedNotes(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  function fmt(s: number) { const h = Math.floor(s / 3600); const m = Math.floor((s % 3600) / 60); return h > 0 ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m` }
  function fmtDate(iso: string) { const d = new Date(iso); return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` }
  const clientName = (id: string | null) => clients.find(c => c.id === id)?.name || null
  const inp = { width: '100%', padding: '9px 12px', border: '1px solid ' + tokens.border, borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box' as const, color: tokens.text, outline: 'none', fontFamily: 'inherit', background: tokens.bgHover }

  return (
    <div style={{ background: tokens.bgCard, borderRadius: '16px', border: '1px solid ' + tokens.border, overflow: 'hidden' }}>
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid ' + tokens.border }}>
        <h2 style={{ fontSize: '16px', fontWeight: '600', color: tokens.text, margin: 0 }}>{tr.workLog}</h2>
      </div>

      {editTarget && (
        <div style={{ padding: '1.25rem 1.5rem', background: tokens.bgHover, borderBottom: '1px solid ' + tokens.border }}>
          <p style={{ fontSize: '11px', color: tokens.textTertiary, marginBottom: '12px', fontWeight: '600', letterSpacing: '0.05em' }}>
            {lang === 'ja' ? '編集中' : 'EDITING'}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <input style={inp} value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder={lang === 'ja' ? '作業内容' : 'Description'} />
            </div>
            <input style={inp} type="number" value={editDuration} onChange={e => setEditDuration(Number(e.target.value))} placeholder={lang === 'ja' ? '時間（分）' : 'Minutes'} />
            <select style={inp} value={editClientId} onChange={e => setEditClientId(e.target.value)}>
              <option value="">{lang === 'ja' ? 'クライアントなし' : 'No client'}</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <div style={{ gridColumn: '1 / -1' }}>
              <textarea style={{ ...inp, minHeight: '64px', resize: 'vertical' }} value={editNotes} onChange={e => setEditNotes(e.target.value)} placeholder={lang === 'ja' ? 'メモ（任意）' : 'Notes (optional)'} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={saveEdit} disabled={saving}
              style={{ flex: 1, padding: '9px', background: saving ? tokens.textTertiary : tokens.accent, color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
              {saving ? '...' : lang === 'ja' ? '保存' : 'Save'}
            </button>
            <button onClick={() => setEditTarget(null)}
              style={{ flex: 1, padding: '9px', background: 'transparent', border: '1px solid ' + tokens.border, borderRadius: '10px', fontSize: '13px', cursor: 'pointer', color: tokens.textSecondary, fontFamily: 'inherit' }}>
              {lang === 'ja' ? 'キャンセル' : 'Cancel'}
            </button>
          </div>
        </div>
      )}

      {entries.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center' }}>
          <p style={{ color: tokens.textTertiary, fontSize: '14px' }}>{tr.noLog}</p>
        </div>
      ) : entries.map((entry, i) => (
        <div key={entry.id} style={{ borderBottom: i < entries.length - 1 ? '1px solid ' + tokens.border : 'none', background: editTarget?.id === entry.id ? tokens.bgActive : 'transparent' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 1.5rem' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '14px', fontWeight: '500', color: tokens.text }}>{entry.description}</div>
              <div style={{ fontSize: '12px', color: tokens.textTertiary, marginTop: '3px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span>{fmtDate(entry.started_at)}</span>
                {clientName(entry.client_id) && (
                  <span style={{ background: tokens.accentBg, color: tokens.accentText, padding: '1px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>
                    {clientName(entry.client_id)}
                  </span>
                )}
                {entry.notes && (
                  <button onClick={() => toggleNotes(entry.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: tokens.textTertiary, fontFamily: 'inherit', padding: '1px 6px', borderRadius: '6px', background: tokens.bgHover } as any}>
                    📝 {expandedNotes.includes(entry.id) ? (lang === 'ja' ? 'メモを隠す' : 'Hide notes') : (lang === 'ja' ? 'メモを見る' : 'Show notes')}
                  </button>
                )}
              </div>
            </div>
            <div style={{ fontSize: '13px', color: tokens.textSecondary, fontWeight: '500', flexShrink: 0 }}>{fmt(entry.duration_seconds)}</div>
            <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
              <button onClick={() => openEdit(entry)}
                style={{ padding: '5px 12px', background: tokens.bgHover, border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '12px', fontWeight: '500', color: tokens.textSecondary, fontFamily: 'inherit' }}>
                {lang === 'ja' ? '編集' : 'Edit'}
              </button>
              <button onClick={() => deleteEntry(entry.id)}
                style={{ padding: '5px 12px', background: tokens.dangerBg, border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '12px', fontWeight: '500', color: tokens.danger, fontFamily: 'inherit' }}>
                {lang === 'ja' ? '削除' : 'Delete'}
              </button>
            </div>
          </div>
          {entry.notes && expandedNotes.includes(entry.id) && (
            <div style={{ padding: '0 1.5rem 12px', marginTop: '-4px' }}>
              <div style={{ background: tokens.bgHover, borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: tokens.textSecondary, lineHeight: '1.6', borderLeft: '3px solid ' + tokens.accent }}>
                {entry.notes}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
