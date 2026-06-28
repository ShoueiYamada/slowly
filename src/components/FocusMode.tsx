'use client'
import { useEffect, useState } from 'react'
import { Lang } from '@/lib/i18n'

type Props = {
  seconds: number
  description: string
  clientName: string
  running: boolean
  onExit: () => void
  onStop: () => void
  lang: Lang
}

export default function FocusMode({ seconds, description, clientName, running, onExit, onStop, lang }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(true)
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  function fmt(s: number) {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  const animStyle = `
    @keyframes flowGradient {
      0%   { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes pulse-ring {
      0% { transform: scale(0.95); opacity: 0.6; }
      50% { transform: scale(1.05); opacity: 0.2; }
      100% { transform: scale(0.95); opacity: 0.6; }
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.97); }
      to   { opacity: 1; transform: scale(1); }
    }
    .focus-timer {
      font-size: clamp(72px, 16vw, 160px);
      font-weight: 200;
      letter-spacing: -4px;
      font-variant-numeric: tabular-nums;
      background: linear-gradient(90deg, #1e3a5f 0%, #38BDF8 25%, #e0f2fe 50%, #38BDF8 75%, #1e3a5f 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: flowGradient 4s linear infinite;
      line-height: 1;
    }
    .focus-wrap {
      animation: fadeIn 0.4s ease both;
    }
    .focus-exit-btn {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      color: rgba(255,255,255,0.4);
      padding: 8px 20px;
      border-radius: 20px;
      font-size: 13px;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.2s;
    }
    .focus-exit-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
    .focus-stop-btn {
      background: rgba(239,68,68,0.15);
      border: 1px solid rgba(239,68,68,0.3);
      color: #F87171;
      padding: 12px 32px;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.2s;
    }
    .focus-stop-btn:hover { background: rgba(239,68,68,0.25); }
  `

  return (
    <div className="focus-wrap" style={{ position: 'fixed', inset: 0, background: '#08080F', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif' }}>
      <style>{animStyle}</style>

      <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}>
        <button className="focus-exit-btn" onClick={onExit}>
          {lang === 'ja' ? '通常表示に戻る' : 'Exit focus mode'}
        </button>
      </div>

      {running && (
        <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', border: '1px solid rgba(56,189,248,0.1)', animation: 'pulse-ring 3s ease-in-out infinite', pointerEvents: 'none' }} />
      )}

      <div style={{ textAlign: 'center', padding: '2rem' }}>
        {clientName && (
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#38BDF8', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem', opacity: 0.7 }}>
            {clientName}
          </div>
        )}

        <div className="focus-timer">{fmt(seconds)}</div>

        {description && (
          <div style={{ fontSize: '20px', color: 'rgba(255,255,255,0.3)', marginTop: '1.5rem', fontWeight: '300', maxWidth: '600px' }}>
            {description}
          </div>
        )}

        <div style={{ marginTop: '3rem', display: 'flex', gap: '12px', justifyContent: 'center' }}>
          {running ? (
            <button className="focus-stop-btn" onClick={onStop}>
              {lang === 'ja' ? 'ストップ＆保存' : 'Stop & Save'}
            </button>
          ) : (
            <div style={{ fontSize: '16px', color: 'rgba(255,255,255,0.3)' }}>
              {lang === 'ja' ? 'タイマーが停止しています' : 'Timer is stopped'}
            </div>
          )}
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', fontSize: '12px', color: 'rgba(255,255,255,0.15)', letterSpacing: '0.1em' }}>
        FLOWLY · FOCUS MODE
      </div>
    </div>
  )
}
