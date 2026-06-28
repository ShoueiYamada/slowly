'use client'
import { useEffect, useState } from 'react'

type Props = {
  onComplete: () => void
  duration: string
}

export default function CompletionEffect({ onComplete, duration }: Props) {
  const [bgOpacity, setBgOpacity] = useState(0)
  const [durationOpacity, setDurationOpacity] = useState(0)
  const [completeOpacity, setCompleteOpacity] = useState(0)

  useEffect(() => {
    // 背景フェードイン
    const t1 = setTimeout(() => setBgOpacity(1), 50)
    // 時間テキストフェードイン
    const t2 = setTimeout(() => setDurationOpacity(1), 200)
    // 時間テキストフェードアウト（4秒後）
    const t3 = setTimeout(() => setDurationOpacity(0), 4200)
    // COMPLETEフェードイン（時間テキストが消え始めたら）
    const t4 = setTimeout(() => setCompleteOpacity(1), 4600)
    // COMPLETEフェードアウト（3秒後）
    const t5 = setTimeout(() => setCompleteOpacity(0), 7600)
    // 背景フェードアウト
    const t6 = setTimeout(() => setBgOpacity(0), 7800)
    // 完了
    const t7 = setTimeout(() => onComplete(), 8400)

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3)
      clearTimeout(t4); clearTimeout(t5); clearTimeout(t6); clearTimeout(t7)
    }
  }, [])

  const css = `
    @keyframes flowGradient {
      0%   { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes completePulse {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.75; }
    }
    .duration-text {
      font-size: clamp(48px, 8vw, 80px);
      font-weight: 800;
      letter-spacing: -2px;
      font-variant-numeric: tabular-nums;
      background: linear-gradient(90deg, #1e3a5f 0%, #38BDF8 25%, #e0f2fe 55%, #38BDF8 75%, #1e3a5f 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: flowGradient 3s linear infinite;
      position: absolute;
      pointer-events: none;
    }
    .complete-text {
      font-size: clamp(40px, 7vw, 72px);
      font-weight: 800;
      letter-spacing: 0.12em;
      background: linear-gradient(90deg, #059669 0%, #34D399 40%, #6EE7B7 60%, #34D399 80%, #059669 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: flowGradient 2s linear infinite;
      position: absolute;
      pointer-events: none;
    }
  `

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9998,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(6,10,15,0.85)',
      backdropFilter: 'blur(8px)',
      opacity: bgOpacity,
      transition: 'opacity 0.6s ease',
      pointerEvents: 'none',
    }}>
      <style>{css}</style>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '120px' }}>
        <span className="duration-text" style={{ opacity: durationOpacity, transition: 'opacity 0.5s ease' }}>
          {duration}
        </span>
        <span className="complete-text" style={{ opacity: completeOpacity, transition: 'opacity 0.5s ease' }}>
          COMPLETE
        </span>
      </div>
    </div>
  )
}
