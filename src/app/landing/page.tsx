'use client'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'

type Lang = 'en' | 'ja'

export default function LandingPage() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [lang, setLang] = useState<Lang>('ja')
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    const onMouse = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY })
    window.addEventListener('scroll', onScroll)
    window.addEventListener('mousemove', onMouse)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('mousemove', onMouse) }
  }, [])

  const css = `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { background: #060a0f; color: #eef2ff; font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'SF Pro Display', sans-serif; -webkit-font-smoothing: antialiased; }
    ::selection { background: rgba(56,189,248,0.2); }

    @keyframes flowLogo {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes gridMove {
      from { transform: translateY(0); }
      to { transform: translateY(40px); }
    }

    .logo { background: linear-gradient(90deg, #1e3a5f 0%, #38BDF8 30%, #e0f2fe 55%, #38BDF8 75%, #1e3a5f 100%); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; animation: flowLogo 4s linear infinite; font-size: 26px; font-weight: 800; letter-spacing: -1px; }

    .nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; height: 56px; display: flex; align-items: center; justify-content: space-between; padding: 0 2rem; transition: all 0.3s; }
    .nav.scrolled { background: rgba(8,8,8,0.9); border-bottom: 1px solid rgba(255,255,255,0.06); backdrop-filter: blur(20px); }

    .nav-links { display: flex; align-items: center; gap: 2rem; }
    .nav-link { background: none; border: none; color: rgba(255,255,255,0.55); font-size: 13px; cursor: pointer; font-family: inherit; transition: color 0.2s; letter-spacing: 0.01em; }
    .nav-link:hover { color: rgba(255,255,255,0.85); }

    .nav-actions { display: flex; align-items: center; gap: 10px; }
    .lang-btn { background: none; border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.35); font-size: 11px; font-weight: 600; cursor: pointer; font-family: inherit; padding: 4px 10px; border-radius: 6px; transition: all 0.2s; letter-spacing: 0.05em; }
    .lang-btn:hover, .lang-btn.active { border-color: rgba(56,189,248,0.4); color: #38BDF8; }
    .btn-ghost { background: none; border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.6); font-size: 13px; cursor: pointer; font-family: inherit; padding: 7px 16px; border-radius: 8px; transition: all 0.2s; }
    .btn-ghost:hover { border-color: rgba(255,255,255,0.25); color: #fff; }
    .btn-primary { background: #fff; color: #080808; border: none; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; padding: 7px 18px; border-radius: 8px; transition: all 0.2s; letter-spacing: -0.1px; }
    .btn-primary:hover { background: rgba(255,255,255,0.88); }

    .hero { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 8rem 2rem 6rem; position: relative; overflow: hidden; }

    .grid-bg { position: absolute; inset: 0; background-image: linear-gradient(rgba(56,189,248,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.04) 1px, transparent 1px); background-size: 60px 60px; mask-image: radial-gradient(ellipse 80% 60% at 50% 50%, black 20%, transparent 100%); animation: gridMove 8s linear infinite; }
    .glow { position: absolute; top: 30%; left: 50%; transform: translate(-50%, -50%); width: 700px; height: 400px; background: radial-gradient(ellipse, rgba(56,189,248,0.18) 0%, transparent 70%); pointer-events: none; }
    .mouse-glow { position: fixed; pointer-events: none; z-index: 0; width: 400px; height: 400px; background: radial-gradient(circle, rgba(56,189,248,0.07) 0%, transparent 70%); border-radius: 50%; transform: translate(-50%, -50%); transition: opacity 0.3s; }

    .eyebrow { display: inline-flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 600; letter-spacing: 0.1em; color: rgba(56,189,248,0.8); text-transform: uppercase; margin-bottom: 2rem; padding: 6px 14px; border: 1px solid rgba(56,189,248,0.15); border-radius: 100px; background: rgba(56,189,248,0.05); animation: fadeUp 0.6s ease both; }
    .eyebrow-dot { width: 5px; height: 5px; border-radius: 50%; background: #38BDF8; }

    .hero-title { font-size: clamp(44px, 8vw, 84px); font-weight: 800; line-height: 1.05; letter-spacing: -3px; color: #fff; margin-bottom: 1.5rem; max-width: 820px; animation: fadeUp 0.6s 0.1s ease both; }
    .hero-title-grad { background: linear-gradient(90deg, #1e3a5f 0%, #38BDF8 25%, #e0f2fe 55%, #38BDF8 75%, #7DD3FC 100%); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; animation: flowLogo 4s linear infinite; display: inline; }
    .hero-title span { color: rgba(255,255,255,0.25); }
    .hero-sub { font-size: 17px; color: rgba(255,255,255,0.55); max-width: 480px; line-height: 1.7; margin-bottom: 2.5rem; font-weight: 400; animation: fadeUp 0.6s 0.2s ease both; text-align: center; margin-left: auto; margin-right: auto; }

    .hero-actions { display: flex; gap: 10px; justify-content: center; margin-bottom: 4rem; animation: fadeUp 0.6s 0.3s ease both; }
    .btn-hero { background: #fff; color: #080808; border: none; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; padding: 11px 24px; border-radius: 10px; transition: all 0.2s; letter-spacing: -0.2px; }
    .btn-hero:hover { background: rgba(255,255,255,0.88); transform: translateY(-1px); }
    .btn-hero-ghost { background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.6); border: 1px solid rgba(255,255,255,0.08); font-size: 14px; cursor: pointer; font-family: inherit; padding: 11px 24px; border-radius: 10px; transition: all 0.2s; }
    .btn-hero-ghost:hover { background: rgba(255,255,255,0.07); color: #fff; }

    .stats { display: flex; gap: 4rem; justify-content: center; animation: fadeUp 0.6s 0.4s ease both; }
    .stat-num { font-size: 36px; font-weight: 700; color: #fff; letter-spacing: -1.5px; font-variant-numeric: tabular-nums; }
    .stat-label { font-size: 11px; color: rgba(255,255,255,0.35); letter-spacing: 0.08em; text-transform: uppercase; margin-top: 4px; }

    .section { padding: 7rem 2rem; max-width: 1100px; margin: 0 auto; }
    .section-center { text-align: center; }
    .section-label { font-size: 11px; font-weight: 600; letter-spacing: 0.12em; color: rgba(56,189,248,0.7); text-transform: uppercase; margin-bottom: 1.25rem; }
    .section-title { font-size: clamp(28px, 4vw, 46px); font-weight: 700; color: #fff; letter-spacing: -1.5px; line-height: 1.1; margin-bottom: 1rem; }
    .section-sub { font-size: 16px; color: rgba(255,255,255,0.45); max-width: 480px; margin: 0 auto; line-height: 1.7; }

    .line { height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent); }

    .features-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.04); border-radius: 16px; overflow: hidden; margin-top: 4rem; } @media (max-width: 768px) { .features-grid { grid-template-columns: 1fr; } .hero-title { letter-spacing: -1px !important; } .stats { gap: 2rem !important; } .pricing-grid { grid-template-columns: 1fr !important; } }
    .feature { background: #060a0f; padding: 2rem; transition: background 0.2s; }
    .feature:hover { background: #0a1020; }
    .feature-num { font-size: 11px; color: rgba(255,255,255,0.15); font-weight: 600; letter-spacing: 0.08em; margin-bottom: 1.5rem; font-variant-numeric: tabular-nums; }
    .feature-title { font-size: 15px; font-weight: 600; color: #fff; margin-bottom: 8px; letter-spacing: -0.3px; }
    .feature-desc { font-size: 13px; color: rgba(255,255,255,0.45); line-height: 1.65; }

    .steps { display: flex; flex-direction: column; gap: 0; margin-top: 4rem; border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; overflow: hidden; }
    .step { display: flex; gap: 2rem; padding: 2rem 2.5rem; border-bottom: 1px solid rgba(255,255,255,0.04); transition: background 0.2s; }
    .step:last-child { border-bottom: none; }
    .step:hover { background: rgba(255,255,255,0.015); }
    .step-num { font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.12); letter-spacing: 0.05em; flex-shrink: 0; padding-top: 3px; font-variant-numeric: tabular-nums; min-width: 24px; }
    .step-title { font-size: 16px; font-weight: 600; color: #fff; margin-bottom: 6px; letter-spacing: -0.3px; }
    .step-desc { font-size: 14px; color: rgba(255,255,255,0.45); line-height: 1.6; }

    .pricing-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 4rem; } @media (max-width: 900px) { .features-grid { grid-template-columns: repeat(2, 1fr) !important; } } @media (max-width: 640px) { .pricing-grid { grid-template-columns: 1fr; } .features-grid { grid-template-columns: 1fr !important; } .stats { gap: 1.5rem !important; } .hero-title { font-size: clamp(36px, 10vw, 84px) !important; letter-spacing: -1px !important; } .hero-actions { flex-direction: column; align-items: center; } }
    .pricing-card { border-radius: 16px; padding: 2.5rem; border: 1px solid rgba(56,189,248,0.08); background: rgba(56,189,248,0.02); }
    .pricing-card.pro { border-color: rgba(56,189,248,0.2); background: rgba(56,189,248,0.03); }
    .plan-name { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; color: rgba(255,255,255,0.3); margin-bottom: 1.5rem; }
    .plan-name.pro { color: #38BDF8; }
    .plan-price { font-size: 52px; font-weight: 800; color: #fff; letter-spacing: -2px; line-height: 1; margin-bottom: 6px; }
    .plan-period { font-size: 13px; color: rgba(255,255,255,0.25); margin-bottom: 2rem; }
    .plan-feature { display: flex; align-items: center; gap: 10px; font-size: 13px; color: rgba(255,255,255,0.5); margin-bottom: 10px; }
    .plan-feature-check { width: 14px; height: 14px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.12); display: flex; align-items: center; justifycontent: center; flex-shrink: 0; font-size: 9px; color: rgba(255,255,255,0.2); }
    .plan-feature-check.pro { border-color: rgba(56,189,248,0.4); color: #38BDF8; }
    .plan-feature.pro { color: rgba(255,255,255,0.7); }
    .btn-plan { width: 100%; padding: 12px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; margin-top: 2rem; transition: all 0.2s; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.5); }
    .btn-plan:hover { background: rgba(255,255,255,0.07); color: #fff; }
    .btn-plan.pro { background: #38BDF8; color: #080808; border: none; }
    .btn-plan.pro:hover { background: #7DD3FC; }

    .cta-section { padding: 8rem 2rem; text-align: center; position: relative; }
    .cta-title { font-size: clamp(36px, 5vw, 60px); font-weight: 800; color: #fff; letter-spacing: -2px; line-height: 1.05; margin-bottom: 1.25rem; }
    .cta-sub { font-size: 16px; color: rgba(255,255,255,0.45); margin-bottom: 2.5rem; }

    .footer { border-top: 1px solid rgba(255,255,255,0.05); padding: 1.5rem 2rem; display: flex; justify-content: space-between; align-items: center; }
    .footer-text { font-size: 12px; color: rgba(255,255,255,0.18); }
    .footer-links { display: flex; gap: 1.5rem; }
  `

  const en = {
    eyebrow: 'Beta pricing — $19/mo locked in for early users',
    h1a: 'Invoice overseas clients.', h1b: 'Get paid faster.', h1c: '',
    sub: 'The only time tracking tool built for Japanese freelancers with global clients. English invoices, Japanese records, tax reports — all in one place.',
    cta1: 'Start free — no card needed', cta2: 'View pricing',
    s1: '0', s2: '3', s3: '4+',
    l1: 'to get started', l2: 'languages', l3: 'currencies',
    fl: 'Features', ft: 'Built for focus,\nnot feature bloat',
    features: [
      { n: '01', t: 'One-click timer', d: 'Start tracking in under a second. Stop and save. Your hours log themselves.' },
      { n: '02', t: 'Client-aware', d: 'Attach sessions to clients. Hourly rates, currencies, and tax configured once.' },
      { n: '03', t: 'Instant invoices', d: 'Select logged hours and generate a polished PDF invoice in seconds.' },
      { n: '04', t: 'AI reminders', d: 'Let AI draft the payment reminder email. Gentle, firm, or final warning.' },
      { n: '05', t: 'Revenue insights', d: 'Weekly and monthly earnings at a glance. Know which clients drive growth.' },
      { n: '06', t: 'Focus mode', d: 'Full-screen timer with nothing else. Designed for deep work sessions.' },
    ],
    hl: 'How it works', ht: 'From first click\nto paid invoice',
    steps: [
      { t: 'Add your client', d: 'Name, email, hourly rate, currency, tax rate. Thirty seconds.' },
      { t: 'Start the timer', d: 'One click. Stop when done. The session saves automatically.' },
      { t: 'Generate the invoice', d: 'Select hours, pick client, download PDF. Multi-currency, multi-language.' },
      { t: 'Get paid', d: 'Send the invoice. If they go quiet, AI writes the follow-up.' },
    ],
    pl: 'Pricing', pt: 'Simple pricing',
    ps: 'No hidden fees. Cancel anytime.',
    ff: ['Up to 3 clients', '5 invoices / month', '3 AI reminders / month', 'Timer & dashboard', 'Pomodoro & goals'],
    pf: ['Unlimited clients', 'Unlimited invoices', 'Unlimited AI reminders', 'Live exchange rates', 'Tax report export', 'PDF without branding', 'Priority support'],
    fb: 'Get started', pb: 'Upgrade to Pro',
    ct: 'Stop losing money\nto untracked hours',
    cs: 'Join freelancers who track smarter and get paid faster.',
    cb: 'Start for free — no card required',
    signin: 'Sign in', signup: 'Sign up',
  }

  const ja = {
    eyebrow: '海外案件特化 · 無料で始める',
    h1a: '海外クライアントへの請求書を', h1b: '日本語で管理する', h1c: '',
    sub: '英語の請求書を自動生成しながら、自分用の記録は日本語で。為替・税金・未払い督促まで、海外案件に特化したツール。',
    cta1: '今すぐ無料で始める', cta2: '機能を見る',
    s1: '完全無料', s2: '4通貨', s3: 'AI搭載',
    l1: 'クレジットカード不要', l2: 'USD/EUR/GBP/JPY', l3: '督促メール自動生成',
    fl: '機能', ft: '余計な機能はない\n必要なものだけ',
    features: [
      { n: '01', t: '英語請求書を自動生成', d: '作業時間を記録するだけで、英語のPDF請求書が完成。海外クライアントにそのまま送れる。' },
      { n: '02', t: '日本語で自分用メモ', d: '請求書は英語、記録は日本語。自分用のメモを残しながら、確定申告にも対応。' },
      { n: '03', t: '為替を自動換算', d: 'USD・EUR・GBPを円に自動換算。実際にいくら稼いだか一目でわかる。' },
      { n: '04', t: 'AI督促メール', d: '未払いのクライアントへの英語メールをAIが自動生成。催促の心理的負担をゼロに。' },
      { n: '05', t: '確定申告レポート', d: '年間の海外収入をまとめてPDF出力。税理士に渡すだけでOK。' },
      { n: '06', t: '送金手数料を考慮', d: 'WiseやPayPalの手数料を引いた実収入を表示。本当に手元に残る金額がわかる。' },
    ],
    hl: '使い方', ht: '最初のクリックから\n入金まで',
    steps: [
      { t: 'クライアントと通貨を登録', d: '海外クライアントの情報と時給をドルやユーロで設定。為替レートは自動取得。' },
      { t: '作業時間を記録', d: 'ワンクリックでタイマー開始。日本語でメモを残しながら作業。' },
      { t: '英語請求書を送付', d: '記録した時間からPDF請求書を自動生成。そのままクライアントに送れる。' },
      { t: '確定申告の準備', d: '年間収入レポートを出力。円換算・手数料控除済みで税理士にそのまま渡せる。' },
    ],
    pl: '料金', pt: 'シンプルな料金体系',
    ps: '隠れた費用なし。いつでもキャンセル可能。',
    ff: ['クライアント3件まで', '請求書5件/月', 'AI督促3回/月', 'タイマー・ダッシュボード', 'ポモドーロ・目標'],
    pf: ['クライアント無制限', '請求書無制限', 'AI督促無制限', 'リアルタイム為替レート', '確定申告レポート', 'ブランドなしPDF', '優先サポート'],
    fb: '始める', pb: 'Proにアップグレード',
    ct: 'Manage overseas work\nsmarter.',
    cs: '英語の請求書も、日本の確定申告も、Flowlyひとつで完結。',
    cb: '無料で始める — カード不要',
    signin: 'ログイン', signup: '新規登録',
  }

  const c = lang === 'ja' ? ja : en

  return (
    <div style={{ minHeight: '100vh', background: '#080808' }}>
      <style>{css}</style>

      <div className="mouse-glow" style={{ left: mousePos.x, top: mousePos.y }} />

      <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
        <span className="logo">Flowly</span>
        <div />
        <div className="nav-actions">
          <div style={{ display: 'flex', gap: '4px' }}>
            <button className={`lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => setLang('en')}>EN</button>
            <button className={`lang-btn ${lang === 'ja' ? 'active' : ''}`} onClick={() => setLang('ja')}>JA</button>
          </div>
          <button className="btn-ghost" onClick={() => router.push('/login?mode=signin')}>{c.signin}</button>
          <button className="btn-primary" onClick={() => router.push('/login?mode=signup')}>{c.signup}</button>
        </div>
      </nav>

      <section className="hero" ref={heroRef}>
        <div className="grid-bg" />
        <div className="glow" />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="eyebrow">
            <span className="eyebrow-dot" />
            {c.eyebrow}
          </div>
          <h1 className="hero-title">
            {c.h1a}<br />
            <span className="hero-title-grad">{c.h1b}</span>
          </h1>
          <p className="hero-sub">{c.sub}</p>
          <div className="hero-actions">
            <button className="btn-hero" onClick={() => router.push('/login?mode=signup')}>{c.cta1}</button>
            <button className="btn-hero-ghost" onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>{c.cta2}</button>
          </div>
          <div className="stats">
            {[
              { n: c.s1, l: c.l1 },
              { n: c.s2, l: c.l2 },
              { n: c.s3, l: c.l3 },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div className="stat-num">{s.n}</div>
                <div className="stat-label">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
        <p style={{ textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.3)', marginTop: '2rem' }}>
          {lang === 'ja' ? '+ ポモドーロタイマー・収益目標トラッカーも標準搭載' : '+ Pomodoro timer & revenue goal tracker included'}
        </p>
      </section>

      <div className="line" />


      <section style={{ padding: '0 2rem 6rem', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(56,189,248,0.15)', boxShadow: '0 40px 100px -20px rgba(56,189,248,0.15)' }}>
          <img src="/screenshots/dashboard-preview.png" alt="Flowly dashboard" style={{ width: '100%', display: 'block' }} />
        </div>
      </section>

      <section id="features" className="section section-center">
        <div className="section-label">{c.fl}</div>
        <h2 className="section-title" style={{ whiteSpace: 'pre-line' }}>{c.ft}</h2>
        <div className="features-grid">
          {c.features.map((f, i) => (
            <div key={i} className="feature">
              <div className="feature-num">{f.n}</div>
              <div className="feature-title">{f.t}</div>
              <div className="feature-desc">{f.d}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="line" />

      <section className="section" style={{ maxWidth: '720px' }}>
        <div className="section-center">
          <div className="section-label">{c.hl}</div>
          <h2 className="section-title" style={{ whiteSpace: 'pre-line' }}>{c.ht}</h2>
        </div>
        <div className="steps">
          {c.steps.map((s, i) => (
            <div key={i} className="step">
              <div className="step-num">0{i + 1}</div>
              <div>
                <div className="step-title">{s.t}</div>
                <div className="step-desc">{s.d}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="line" />



      <div className="divider" />
      {lang === 'en' && null}
      <section style={{ padding: '5rem 2rem', maxWidth: '860px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div className="section-label">{lang === 'ja' ? 'なぜFlowlyか' : 'Why Flowly'}</div>
          <h2 className="section-title">
            Built for Japanese freelancers.<br />Not for teams.
          </h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {(lang === 'ja' ? [
            { icon: '✗', problem: '既存ツールは確定申告に対応していない', solution: 'Flowlyは年間収入レポートをPDF出力' },
            { icon: '✗', problem: '為替換算を手動でやっている', solution: 'USD・EUR・GBPをリアルタイムで円換算' },
            { icon: '✗', problem: '未払いの催促メールが書けない', solution: 'AIが英語の督促メールを自動生成' },
            { icon: '✗', problem: '日本語UIのツールがない', solution: '日本語・英語を切り替え可能' },
            { icon: '✗', problem: '送金手数料を考慮できていない', solution: 'Wise・PayPal手数料を引いた実収入を表示' },
            { icon: '✗', problem: '高すぎる・機能が多すぎる', solution: 'フリーランサーに必要な機能だけ $19/月' },
          ] : [
            { icon: '✗', problem: 'No tax report for Japan', solution: 'Flowly exports annual income report as PDF' },
            { icon: '✗', problem: 'Manual currency conversion', solution: 'USD, EUR, GBP auto-converted to JPY in real time' },
            { icon: '✗', problem: 'Chasing payments is awkward', solution: 'AI drafts the perfect follow-up email for you' },
            { icon: '✗', problem: 'No Japanese UI available', solution: 'Switch between Japanese and English anytime' },
            { icon: '✗', problem: 'Transfer fees not accounted for', solution: 'Wise & PayPal fees deducted from your net income' },
            { icon: '✗', problem: 'Too expensive or too complex', solution: 'Only what freelancers need — $19/month' },
          ]).map((item, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ padding: '1rem 1.25rem', background: 'rgba(239,68,68,0.05)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: 'rgba(239,68,68,0.5)', fontSize: '16px', flexShrink: 0 }}>✗</span>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: '1.5' }}>{item.problem}</span>
              </div>
              <div style={{ padding: '1rem 1.25rem', background: 'rgba(56,189,248,0.04)', display: 'flex', alignItems: 'center', gap: '10px', borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ color: '#38BDF8', fontSize: '16px', flexShrink: 0 }}>✓</span>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.5' }}>{item.solution}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="divider" />


      <section style={{ padding: '5rem 2rem', maxWidth: '760px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div className="section-label">{lang === 'ja' ? 'AI督促メール' : 'AI Reminders'}</div>
          <h2 className="section-title">
            {lang === 'ja' ? <>催促メールを、AIが<br />数秒で書いてくれる。</> : <>Let AI write the<br />awkward email for you.</>}
          </h2>
        </div>
        <div style={{ borderRadius: '14px', border: '1px solid rgba(56,189,248,0.15)', background: 'rgba(255,255,255,0.02)', overflow: 'hidden' }}>
          <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FF5F57' }} />
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FEBC2E' }} />
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#28C840' }} />
            <span style={{ marginLeft: '8px', fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
              {lang === 'ja' ? '生成された督促メール' : 'Generated reminder email'}
            </span>
          </div>
          <div style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '11px', color: 'rgba(56,189,248,0.7)', fontWeight: '600', letterSpacing: '0.06em', marginBottom: '6px' }}>SUBJECT</div>
            <div style={{ fontSize: '14px', color: '#fff', fontWeight: '600', marginBottom: '1.25rem' }}>
              Payment Reminder – Invoice #1002 – 14 Days Overdue
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', lineHeight: '1.8' }}>
              Dear Acme Corp Team,<br/><br/>
              I hope this message finds you well. I am writing to bring to your attention that Invoice #1002, issued for $1,200.00, remains outstanding as of today. The payment was due 14 days ago.<br/><br/>
              I understand oversights can occur, and I appreciate your team manages many responsibilities. As this is now two weeks past due, I kindly ask that you prioritize this matter.<br/><br/>
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>...</span>
            </div>
          </div>
        </div>
        <p style={{ textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.3)', marginTop: '1.5rem' }}>
          {lang === 'ja' ? '3段階のトーン（やわらか・毅然・最終警告）から選べます' : 'Choose from 3 tones: gentle, firm, or final warning'}
        </p>
      </section>

      <div className="divider" />

      <section style={{ padding: '5rem 2rem', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div className="section-label">{lang === 'ja' ? '安心して使える理由' : 'Built to be trusted'}</div>
          <h2 className="section-title">
            {lang === 'ja' ? '財務データを扱うからこそ、\n透明性にこだわる。' : 'Handling financial data,\nso transparency matters.'}
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '14px', overflow: 'hidden' }}>
          {(lang === 'ja' ? [
            { t: 'データの保存場所', d: 'Supabase（米国・シンガポールのデータセンター）にRow Level Securityで保護して保存。あなたのデータは他のユーザーから完全に隔離されています。' },
            { t: '決済情報', d: 'カード情報はStripeが直接処理し、Flowlyのサーバーには一切保存されません。PCI DSS準拠の決済基盤を使用しています。' },
            { t: '為替レートの取得元', d: 'open.er-api.comのリアルタイムレートを使用。確定申告には国税庁が定めるTTMレート等での確認を推奨しています。' },
            { t: '確定申告について', d: '白色・青色申告どちらにも使える年間収入の集計データを出力します。インボイス制度の適格請求書発行には対応していません（今後対応予定）。最終判断は税理士にご確認ください。' },
          ] : [
            { t: 'Where your data lives', d: 'Stored on Supabase (US/Singapore data centers) with Row Level Security. Your data is fully isolated from other users.' },
            { t: 'Payment information', d: 'Card details are processed entirely by Stripe and never touch Flowly\'s servers. PCI DSS compliant payment infrastructure.' },
            { t: 'Exchange rate source', d: 'Real-time rates from open.er-api.com. For official tax filing, we recommend verifying against your country\'s official rates.' },
            { t: 'Tax filing scope', d: 'Income summary works for both simplified and blue-form tax returns in Japan. Does not yet support Invoice System (Qualified Invoice) issuance — coming soon. Always confirm with a licensed accountant.' },
          ]).map((item, i) => (
            <div key={i} style={{ background: '#080808', padding: '1.75rem' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '8px' }}>{item.t}</h3>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: '1.65' }}>{item.d}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="divider" />

      <section id="pricing" className="section section-center">
        <div className="section-label">{c.pl}</div>
        <h2 className="section-title">{c.pt}</h2>
        <p className="section-sub">{c.ps}</p>
        <div className="pricing-grid" style={{ maxWidth: '680px', margin: '4rem auto 0' }}>
          <div className="pricing-card">
            <div className="plan-name">FREE</div>
            <div className="plan-price">$0</div>
            <div className="plan-period">{lang === 'ja' ? '永久無料' : 'forever'}</div>
            {c.ff.map((f, i) => (
              <div key={i} className="plan-feature">
                <div className="plan-feature-check" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</div>
                {f}
              </div>
            ))}
            <button className="btn-plan" onClick={() => router.push('/login?mode=signup')}>{c.fb}</button>
          </div>
          <div className="pricing-card pro">
            <div className="plan-name pro">PRO</div>
            <div className="plan-price">$19</div>
            <div className="plan-period">{lang === 'ja' ? '月額' : 'per month'}</div>
            {c.pf.map((f, i) => (
              <div key={i} className="plan-feature pro">
                <div className="plan-feature-check pro" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</div>
                {f}
              </div>
            ))}
            <button className="btn-plan pro" onClick={() => router.push('/login?mode=signup')}>{c.pb}</button>
          </div>
        </div>
      </section>

      <div className="line" />

      <section className="cta-section">
        <div className="glow" style={{ top: '50%' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 className="cta-title" style={{ whiteSpace: 'pre-line' }}>{c.ct}</h2>
          <p className="cta-sub">{c.cs}</p>
          <button className="btn-hero" onClick={() => router.push('/login?mode=signup')}>{c.cb}</button>
        </div>
      </section>

      <footer className="footer" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <span className="logo" style={{ fontSize: '15px' }}>Flowly</span>
        <div className="footer-links">
          <button className="nav-link" style={{ fontSize: '12px' }} onClick={() => router.push('/login?mode=signin')}>{c.signin}</button>
          <button className="nav-link" style={{ fontSize: '12px' }} onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>{lang === 'ja' ? '料金' : 'Pricing'}</button>
          <button className="nav-link" style={{ fontSize: '12px' }} onClick={() => router.push('/privacy')}>{lang === 'ja' ? 'プライバシーポリシー' : 'Privacy'}</button>
          <button className="nav-link" style={{ fontSize: '12px' }} onClick={() => router.push('/terms')}>{lang === 'ja' ? '利用規約' : 'Terms'}</button>
        </div>
        <span className="footer-text">© 2026 Flowly</span>
      </footer>
    </div>
  )
}
