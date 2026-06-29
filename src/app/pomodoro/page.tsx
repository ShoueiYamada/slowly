'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'
import { useLang } from '@/contexts/LangContext'
import Sidebar from '@/components/Sidebar'
import FocusMode from '@/components/FocusMode'

type Client = { id: string; name: string; hourly_rate: number; currency: string }

export default function PomodoroPage() {
  const [user, setUser] = useState<any>(null)
  const [collapsed, setCollapsed] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [clientId, setClientId] = useState('')
  const [description, setDescription] = useState('')
  const [notes, setNotes] = useState('')
  const [showNotes, setShowNotes] = useState(false)
  const [focusMode, setFocusMode] = useState(false)
  const [running, setRunning] = useState(false)
  const [phase, setPhase] = useState<'work' | 'break'>('work')
  const [seconds, setSeconds] = useState(25 * 60)
  const [sessionCount, setSessionCount] = useState(0)
  const [workMins, setWorkMins] = useState(25)
  const [breakMins, setBreakMins] = useState(5)
  const [message, setMessage] = useState('')
  const interval = useRef<any>(null)
  const workStart = useRef<Date | null>(null)
  const totalWorkSeconds = useRef(0)
  const { tokens } = useTheme()
  const { lang } = useLang()
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/login')
      else { setUser(user); loadClients(user.id) }
    })
    return () => clearInterval(interval.current)
  }, [])

  async function loadClients(uid: string) {
    const { data } = await supabase.from('clients').select('*').eq('user_id', uid)
    if (data) setClients(data)
  }

  function startTimer() {
    if (!description.trim()) { setMessage(lang === 'ja' ? '作業内容を入力してください' : 'Please enter a description'); return }
    setMessage('')
    setPhase('work')
    setSeconds(workMins * 60)
    setRunning(true)
    workStart.current = new Date()
    totalWorkSeconds.current = 0
    interval.current = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          setPhase(p => {
            if (p === 'work') {
              totalWorkSeconds.current += workMins * 60
              setSessionCount(c => c + 1)
              setSeconds(breakMins * 60)
              return 'break'
            } else {
              workStart.current = new Date()
              setSeconds(workMins * 60)
              return 'work'
            }
          })
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  async function stopTimer() {
    clearInterval(interval.current)
    setRunning(false)
    setFocusMode(false)
    if (phase === 'work' && workStart.current) {
      const elapsed = Math.floor((new Date().getTime() - workStart.current.getTime()) / 1000)
      totalWorkSeconds.current += elapsed
    }
    if (totalWorkSeconds.current > 0 && user) {
      const selectedClient = clients.find(c => c.id === clientId)
      await supabase.from('time_entries').insert({
        user_id: user.id, description, notes: notes || null,
        started_at: new Date(Date.now() - totalWorkSeconds.current * 1000).toISOString(),
        ended_at: new Date().toISOString(),
        duration_seconds: totalWorkSeconds.current,
        client_id: clientId || null,
        hourly_rate: selectedClient?.hourly_rate || 0,
      })
      setMessage(lang === 'ja' ? `${sessionCount + 1}セッション分を保存しました！` : `Saved ${sessionCount + 1} session(s)!`)
    }
    setPhase('work')
    setSeconds(workMins * 60)
    setSessionCount(0)
    setDescription('')
    setNotes('')
    setShowNotes(false)
    totalWorkSeconds.current = 0
  }

  function fmt(s: number) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  const selectedClient = clients.find(c => c.id === clientId)
  const inp = { width: '100%', padding: '11px 14px', border: '1px solid ' + tokens.border, borderRadius: '12px', fontSize: '14px', boxSizing: 'border-box' as const, color: tokens.text, outline: 'none', fontFamily: 'inherit', background: tokens.bgHover }

  const animStyle = `
    @keyframes flowGradient {
      0%   { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    .pomo-time {
      font-size: 96px;
      font-weight: 200;
      letter-spacing: -4px;
      font-variant-numeric: tabular-nums;
      line-height: 1;
      background: linear-gradient(90deg, #1e3a5f 0%, #38BDF8 25%, #e0f2fe 50%, #38BDF8 75%, #1e3a5f 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: flowGradient 4s linear infinite;
    }
  `

  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  const sidebarW = isMobile ? 0 : (collapsed ? 56 : 232)
  if (!user) return null

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: tokens.bg }}>
      <style>{animStyle}</style>
      {focusMode && (
        <FocusMode seconds={seconds} description={description} clientName={selectedClient?.name || ''} running={running} onExit={() => setFocusMode(false)} onStop={stopTimer} lang={lang} />
      )}
      <Sidebar userEmail={user.email || ''} onSignOut={async () => { await supabase.auth.signOut(); router.push('/login') }} collapsed={collapsed} setCollapsed={setCollapsed} />
      <div style={{ marginLeft: sidebarW + 'px', flex: 1, padding: isMobile ? '4.5rem 1rem 1rem' : '2.5rem 3rem', transition: 'margin-left 0.22s cubic-bezier(0.4,0,0.2,1)' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: tokens.text, margin: '0 0 6px', letterSpacing: '-0.6px' }}>
              {lang === 'ja' ? 'ポモドーロタイマー' : 'Pomodoro Timer'}
            </h1>
            <p style={{ fontSize: '15px', color: tokens.textSecondary, margin: 0 }}>
              {lang === 'ja' ? '集中→休憩を繰り返して生産性を最大化' : 'Maximize productivity with focused work intervals'}
            </p>
          </div>

          <div style={{ background: tokens.bgCard, borderRadius: '18px', padding: '2.5rem', border: '1px solid ' + tokens.border, marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '11px', padding: '4px 12px', borderRadius: '20px', background: phase === 'work' ? tokens.accentBg : tokens.successBg, color: phase === 'work' ? tokens.accentText : tokens.success, fontWeight: '700', letterSpacing: '0.06em' }}>
                {phase === 'work' ? (lang === 'ja' ? '作業中' : 'WORK') : (lang === 'ja' ? '休憩中' : 'BREAK')}
              </span>
              <span style={{ fontSize: '13px', color: tokens.textTertiary }}>
                {lang === 'ja' ? `完了: ${sessionCount}セッション` : `${sessionCount} session${sessionCount !== 1 ? 's' : ''} done`}
              </span>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div className="pomo-time">{fmt(seconds)}</div>
            </div>

            {!running && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: tokens.textTertiary, marginBottom: '6px', fontWeight: '600' }}>
                    {lang === 'ja' ? '作業時間（分）' : 'Work (minutes)'}
                  </label>
                  <input style={inp} type="number" value={workMins} onChange={e => { setWorkMins(Number(e.target.value)); setSeconds(Number(e.target.value) * 60) }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: tokens.textTertiary, marginBottom: '6px', fontWeight: '600' }}>
                    {lang === 'ja' ? '休憩時間（分）' : 'Break (minutes)'}
                  </label>
                  <input style={inp} type="number" value={breakMins} onChange={e => setBreakMins(Number(e.target.value))} />
                </div>
              </div>
            )}

            <select value={clientId} onChange={e => setClientId(e.target.value)} disabled={running} style={{ ...inp, marginBottom: '10px', color: clientId ? tokens.text : tokens.textTertiary }}>
              <option value="">{lang === 'ja' ? 'クライアントを選択（任意）' : 'Select client (optional)'}</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <input type="text" placeholder={lang === 'ja' ? '何の作業をしていますか？' : 'What are you working on?'} value={description} onChange={e => setDescription(e.target.value)} disabled={running} style={{ ...inp, marginBottom: '10px' }} />

            <div style={{ marginBottom: '14px' }}>
              <button onClick={() => setShowNotes(!showNotes)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: tokens.textTertiary, fontFamily: 'inherit', padding: '0', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: showNotes ? '8px' : '0' }}>
                <span>{showNotes ? '▾' : '▸'}</span>
                {lang === 'ja' ? 'メモを追加' : 'Add notes'}
              </button>
              {showNotes && (
                <textarea value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder={lang === 'ja' ? '作業の詳細・次回への引き継ぎなど...' : 'Work details, handover notes...'}
                  style={{ ...inp, minHeight: '80px', resize: 'vertical', lineHeight: '1.5' }} />
              )}
            </div>

            {message && <p style={{ fontSize: '13px', color: tokens.success, marginBottom: '12px', textAlign: 'center' }}>{message}</p>}

            <div style={{ display: 'flex', gap: '10px' }}>
              {!running ? (
                <button onClick={startTimer} style={{ flex: 1, padding: '14px', background: tokens.accent, color: '#08080F', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
                  {lang === 'ja' ? 'スタート' : 'Start'}
                </button>
              ) : (
                <button onClick={stopTimer} style={{ flex: 1, padding: '14px', background: tokens.danger, color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
                  {lang === 'ja' ? 'ストップ＆保存' : 'Stop & Save'}
                </button>
              )}
              <button onClick={() => setFocusMode(true)}
                style={{ padding: '14px 20px', background: tokens.bgHover, border: '1px solid ' + tokens.border, borderRadius: '12px', cursor: 'pointer', fontSize: '14px', color: tokens.textSecondary, fontFamily: 'inherit', fontWeight: '500' }}>
                ⛶ {lang === 'ja' ? 'フォーカス' : 'Focus'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
