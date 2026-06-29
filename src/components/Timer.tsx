'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { Lang, t } from '@/lib/i18n'
import { useTheme } from '@/contexts/ThemeContext'
import FocusMode from './FocusMode'
import CompletionEffect from './CompletionEffect'

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
  const [showEffect, setShowEffect] = useState(false)
  const [completedDuration, setCompletedDuration] = useState('')
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
    else {
      const h = Math.floor(duration / 3600)
      const m = Math.floor((duration % 3600) / 60)
      const s2 = duration % 60
      const label = h > 0 ? `${h}h ${String(m).padStart(2,'0')}m` : m > 0 ? `${m}m ${String(s2).padStart(2,'0')}s` : `${s2}s`
      setCompletedDuration(label)
      setShowEffect(true)
      setDescription(''); setNotes(''); setSeconds(0); setShowNotes(false); onSaved()
    }
  }

  function fmt(s: number) {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  const selectedClient = clients.find(c => c.id === clientId)
  const inp = {
    width: '100%', padding: '9px 12px',
    border: '1px solid ' + tokens.border,
    borderRadius: '8px', fontSize: '13px',
    boxSizing: 'border-box' as const,
    color: tokens.text, outline: 'none',
    fontFamily: 'inherit', background: tokens.bgHover,
    transition: 'border-color 0.15s'
  }

  return (
    <>
      {showEffect && <CompletionEffect duration={completedDuration} onComplete={() => { setShowEffect(false); setMessage(tr.saved) }} />}
      {focusMode && (
        <FocusMode seconds={seconds} description={description} clientName={selectedClient?.name || ''} running={running} onExit={() => setFocusMode(false)} onStop={stop} lang={lang} />
      )}
      <div style={{ background: tokens.bgCard, borderRadius: '12px', padding: '1.25rem', border: '1px solid ' + tokens.border }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '40px', fontWeight: '200', fontVariantNumeric: 'tabular-nums', letterSpacing: '-2px', color: running ? tokens.accent : tokens.text, lineHeight: 1, transition: 'color 0.3s' }}>
            {fmt(seconds)}
          </div>
          <button onClick={() => setFocusMode(true)}
            style={{ padding: '5px 10px', background: 'transparent', border: '1px solid ' + tokens.border, borderRadius: '6px', cursor: 'pointer', fontSize: '11px', color: tokens.textTertiary, fontFamily: 'inherit', fontWeight: '500', letterSpacing: '0.02em', transition: 'all 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = tokens.accent; (e.currentTarget as HTMLElement).style.color = tokens.accent }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = tokens.border; (e.currentTarget as HTMLElement).style.color = tokens.textTertiary }}>
            {lang === 'ja' ? 'フォーカス' : 'Focus'}
          </button>
        </div>

        {selectedClient && (
          <div style={{ marginBottom: '10px' }}>
            <span style={{ fontSize: '11px', background: tokens.accentBg, color: tokens.accentText, padding: '3px 10px', borderRadius: '20px', fontWeight: '600', letterSpacing: '0.02em' }}>
              {selectedClient.name}
            </span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
          <select value={clientId} onChange={e => setClientId(e.target.value)} disabled={running} style={{ ...inp, color: clientId ? tokens.text : tokens.textTertiary }}>
            <option value="">{lang === 'ja' ? 'クライアント（任意）'  : 'Client (optional)'}</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <input type="text" placeholder={tr.placeholder} value={description} onChange={e => setDescription(e.target.value)} disabled={running} style={inp} />

          <button onClick={() => setShowNotes(!showNotes)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: tokens.textTertiary, fontFamily: 'inherit', padding: '0', display: 'flex', alignItems: 'center', gap: '4px', letterSpacing: '0.01em' }}>
            <span style={{ fontSize: '10px' }}>{showNotes ? '▾' : '▸'}</span>
            {lang === 'ja' ? 'メモ' : 'Notes'}
          </button>

          {showNotes && (
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder={lang === 'ja' ? '作業メモ...' : 'Work notes...'}
              style={{ ...inp, minHeight: '72px', resize: 'vertical', lineHeight: '1.5' }} />
          )}
        </div>

        {message && (
          <p style={{ fontSize: '12px', color: message === tr.saved ? tokens.success : tokens.danger, marginBottom: '10px', letterSpacing: '0.01em' }}>
            {message}
          </p>
        )}

        <div style={{ display: 'flex', gap: '8px' }}>
          {!running ? (
            <button onClick={start}
              style={{ flex: 1, padding: '10px', background: tokens.accent, color: '#080808', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '-0.1px', transition: 'opacity 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
              {tr.startTimer}
            </button>
          ) : (
            <button onClick={stop}
              style={{ flex: 1, padding: '10px', background: tokens.danger, color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '-0.1px', transition: 'opacity 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
              {tr.stopTimer}
            </button>
          )}
        </div>
      </div>
    </>
  )
}
