'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { Lang, t } from '@/lib/i18n'
import { useTheme } from '@/contexts/ThemeContext'
import FocusMode from './FocusMode'

type Client = { id: string; name: string; hourly_rate: number; currency: string }

export default function Timer({ userId, onSaved, lang }: { userId: string, onSaved: () => void, lang: Lang }) {
  const [running, setRunning] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [description, setDescription] = useState('')
  const [notes, setNotes] = useState('')
  const [showNotes, setShowNotes] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [clientId, setClientId] = useState('')
  const [message, setMessage] = useState('')
  const [focusMode, setFocusMode] = useState(false)
  const startedAt = useRef<Date | null>(null)
  const interval = useRef<any>(null)
  const supabase = createClient()
  const tr = t[lang]
  const { tokens } = useTheme()

  useEffect(() => { loadClients(); return () => clearInterval(interval.current) }, [])

  async function loadClients() {
    const { data } = await supabase.from('clients').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    if (data) setClients(data)
  }

  function start() {
    if (!description.trim()) { setMessage(tr.enterDesc); return }
    setMessage('')
    startedAt.current = new Date()
    setRunning(true)
    interval.current = setInterval(() => setSeconds(s => s + 1), 1000)
  }

  async function stop() {
    clearInterval(interval.current)
    setRunning(false)
    setFocusMode(false)
    const endedAt = new Date()
    const duration = Math.floor((endedAt.getTime() - startedAt.current!.getTime()) / 1000)
    const selectedClient = clients.find(c => c.id === clientId)
    const { error } = await supabase.from('time_entries').insert({
      user_id: userId, description, notes: notes || null,
      started_at: startedAt.current!.toISOString(),
      ended_at: endedAt.toISOString(),
      duration_seconds: duration,
      client_id: clientId || null,
      hourly_rate: selectedClient?.hourly_rate || 0,
    })
    if (error) setMessage(tr.saveFailed)
    else { setMessage(tr.saved); setDescription(''); setNotes(''); setSeconds(0); setShowNotes(false); onSaved() }
  }

  function fmt(s: number) {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  const selectedClient = clients.find(c => c.id === clientId)
  const inp = { width: '100%', padding: '11px 14px', border: '1px solid ' + tokens.border, borderRadius: '12px', fontSize: '14px', boxSizing: 'border-box' as const, color: tokens.text, outline: 'none', fontFamily: 'inherit', background: tokens.bgHover }

  return (
    <>
      {focusMode && (
        <FocusMode
          seconds={seconds}
          description={description}
          clientName={selectedClient?.name || ''}
          running={running}
          onExit={() => setFocusMode(false)}
          onStop={stop}
          lang={lang}
        />
      )}

      <div style={{ background: tokens.bgCard, borderRadius: '16px', padding: '1.75rem', marginBottom: '1.25rem', border: '1px solid ' + tokens.border }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ fontSize: '56px', fontWeight: '200', fontVariantNumeric: 'tabular-nums', letterSpacing: '-3px', color: running ? tokens.accent : tokens.text, lineHeight: 1 }}>
            {fmt(seconds)}
          </div>
          <button onClick={() => setFocusMode(true)} title={lang === 'ja' ? 'フォーカスモード' : 'Focus mode'}
            style={{ padding: '8px 14px', background: tokens.bgHover, border: '1px solid ' + tokens.border, borderRadius: '10px', cursor: 'pointer', fontSize: '12px', color: tokens.textSecondary, fontFamily: 'inherit', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
            ⛶ {lang === 'ja' ? 'フォーカス' : 'Focus'}
          </button>
        </div>

        {selectedClient && (
          <div style={{ textAlign: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', background: tokens.accentBg, color: tokens.accentText, padding: '4px 12px', borderRadius: '20px', fontWeight: '600' }}>
              {selectedClient.name} · {selectedClient.currency === 'JPY' ? '¥' : selectedClient.currency === 'EUR' ? '€' : selectedClient.currency === 'GBP' ? '£' : '$'}{selectedClient.hourly_rate}/h
            </span>
          </div>
        )}

        <select value={clientId} onChange={e => setClientId(e.target.value)} disabled={running} style={{ ...inp, marginBottom: '10px', color: clientId ? tokens.text : tokens.textTertiary }}>
          <option value="">{lang === 'ja' ? 'クライアントを選択（任意）' : lang === 'zh' ? '选择客户（可选）' : 'Select client (optional)'}</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <input type="text" placeholder={tr.placeholder} value={description} onChange={e => setDescription(e.target.value)} disabled={running}
          style={{ ...inp, marginBottom: '10px' }} />

        <div style={{ marginBottom: '12px' }}>
          <button onClick={() => setShowNotes(!showNotes)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: tokens.textTertiary, fontFamily: 'inherit', padding: '0', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: showNotes ? '8px' : '0' }}>
            <span style={{ fontSize: '14px' }}>{showNotes ? '▾' : '▸'}</span>
            {lang === 'ja' ? 'メモを追加' : lang === 'zh' ? '添加备注' : 'Add notes'}
          </button>
          {showNotes && (
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder={lang === 'ja' ? '作業の詳細・次回への引き継ぎなど...' : 'Work details, handover notes...'}
              style={{ ...inp, minHeight: '80px', resize: 'vertical', lineHeight: '1.5' }} />
          )}
        </div>

        {message && <p style={{ fontSize: '13px', color: tokens.success, marginBottom: '12px', textAlign: 'center' }}>{message}</p>}

        {!running ? (
          <button onClick={start} style={{ width: '100%', padding: '13px', background: tokens.accent, color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
            {tr.startTimer}
          </button>
        ) : (
          <button onClick={stop} style={{ width: '100%', padding: '13px', background: tokens.danger, color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
            {tr.stopTimer}
          </button>
        )}
      </div>
    </>
  )
}
