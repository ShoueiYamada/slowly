'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { Lang, t } from '@/lib/i18n'

export default function Timer({ userId, onSaved, lang }: { userId: string, onSaved: () => void, lang: Lang }) {
  const [running, setRunning] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [description, setDescription] = useState('')
  const [message, setMessage] = useState('')
  const startedAt = useRef<Date | null>(null)
  const interval = useRef<any>(null)
  const supabase = createClient()
  const tr = t[lang]

  useEffect(() => { return () => clearInterval(interval.current) }, [])

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
    const endedAt = new Date()
    const duration = Math.floor((endedAt.getTime() - startedAt.current!.getTime()) / 1000)
    const { error } = await supabase.from('time_entries').insert({
      user_id: userId, description,
      started_at: startedAt.current!.toISOString(),
      ended_at: endedAt.toISOString(),
      duration_seconds: duration,
    })
    if (error) setMessage(tr.saveFailed + ': ' + error.message)
    else { setMessage(tr.saved); setDescription(''); setSeconds(0); onSaved() }
  }

  function fmt(s: number) {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  return (
    <div style={{ background: '#fff', borderRadius: '18px', padding: '2rem', marginBottom: '1.5rem', border: '0.5px solid #d2d2d7' }}>
      <div style={{ fontSize: '52px', fontWeight: '300', textAlign: 'center', marginBottom: '1.5rem', fontVariantNumeric: 'tabular-nums', letterSpacing: '-2px', color: '#1d1d1f' }}>
        {fmt(seconds)}
      </div>
      <input type="text" placeholder={tr.placeholder} value={description} onChange={e => setDescription(e.target.value)} disabled={running}
        style={{ width: '100%', padding: '12px 16px', border: '1px solid #d2d2d7', borderRadius: '12px', fontSize: '15px', marginBottom: '12px', boxSizing: 'border-box', color: '#1d1d1f', outline: 'none', fontFamily: 'inherit' }} />
      {message && <p style={{ fontSize: '13px', color: '#34c759', marginBottom: '12px', textAlign: 'center' }}>{message}</p>}
      {!running ? (
        <button onClick={start}
          style={{ width: '100%', padding: '13px', background: '#1d1d1f', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
          {tr.startTimer}
        </button>
      ) : (
        <button onClick={stop}
          style={{ width: '100%', padding: '13px', background: '#ff3b30', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
          {tr.stopTimer}
        </button>
      )}
    </div>
  )
}
