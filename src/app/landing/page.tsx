'use client'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'

type Lang = 'en' | 'ja'

export default function LandingPage() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [lang, setLang] = useState<Lang>('en')
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

    .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.04); border-radius: 16px; overflow: hidden; margin-top: 4rem; } @media (max-width: 768px) { .features-grid { grid-template-columns: 1fr; } .hero-title { letter-spacing: -1px !important; } .stats { gap: 2rem !important; } .pricing-grid { grid-template-columns: 1fr !important; } }
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

    .pricing-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 4rem; }
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
    eyebrow: 'Now in beta',
    h1a: 'Work smarter.', h1b: 'Get paid faster.', h1c: '',
    sub: 'The minimal time tracking tool for freelancers who work globally. Log hours, generate invoices, chase payments — all in one place.',
    cta1: 'Start for free', cta2: 'View pricing',
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
    ff: ['Up to 5 clients', '10 invoices / month', '5 AI reminders / month', 'Timer & dashboard', 'Pomodoro & goals'],
    pf: ['Unlimited clients', 'Unlimited invoices', 'Unlimited AI reminders', 'PDF without branding', 'Priority support'],
    fb: 'Get started', pb: 'Upgrade to Pro',
    ct: 'Stop losing money\nto untracked hours',
    cs: 'Join freelancers who track smarter and get paid faster.',
    cb: 'Start for free — no card required',
    signin: 'Sign in', signup: 'Sign up',
  }

  const ja = {
    eyebrow: 'ベータ版公開中',
    h1a: 'Work smarter.', h1b: 'Get paid faster.', h1c: '',
    sub: 'グローバルに働くフリーランサーのためのミニマルな時間管理ツール。作業記録・請求書・未払い督促をひとつに。',
    cta1: '無料で始める', cta2: '料金を見る',
    s1: '$0', s2: '3', s3: '4+',
    l1: '無料で始められる', l2: '対応言語', l3: '対応通貨',
    fl: '機能', ft: '余計な機能はない\n必要なものだけ',
    features: [
      { n: '01', t: 'ワンクリックタイマー', d: '1秒で記録開始。止めて保存するだけ。' },
      { n: '02', t: 'クライアント紐付き', d: '時給・通貨・税率を一度設定すれば自動適用。' },
      { n: '03', t: '即座に請求書', d: '記録した時間を選んでPDF請求書を数秒で生成。' },
      { n: '04', t: 'AI督促メール', d: '未払いクライアントへのメールをAIが自動生成。' },
      { n: '05', t: '収益インサイト', d: '週次・月次の収益を一目で。' },
      { n: '06', t: 'フォーカスモード', d: '全画面タイマー。深い集中のために。' },
    ],
    hl: '使い方', ht: '最初のクリックから\n入金まで',
    steps: [
      { t: 'クライアントを追加', d: '名前・時給・通貨・税率を設定。30秒で完了。' },
      { t: 'タイマーを開始', d: 'ワンクリック。止めたら自動保存。' },
      { t: '請求書を生成', d: '時間を選んでPDFを即ダウンロード。多言語・多通貨対応。' },
      { t: '入金を受ける', d: '請求書を送信。無反応ならAIが督促メールを作成。' },
    ],
    pl: '料金', pt: 'シンプルな料金体系',
    ps: '隠れた費用なし。いつでもキャンセル可能。',
    ff: ['クライアント5件まで', '請求書10件/月', 'AI督促5回/月', 'タイマー・ダッシュボード', 'ポモドーロ・目標'],
    pf: ['クライアント無制限', '請求書無制限', 'AI督促無制限', 'ブランドなしPDF', '優先サポート'],
    fb: '始める', pb: 'Proにアップグレード',
    ct: '未記録の時間で\n損をするのをやめよう',
    cs: 'スマートに記録して、素早く入金されるフリーランサーに。',
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
      </section>

      <div className="line" />

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
            <div className="plan-price">$7</div>
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

      <footer className="footer">
        <span className="logo" style={{ fontSize: '15px' }}>Flowly</span>
        <div className="footer-links">
          <button className="nav-link" style={{ fontSize: '12px' }} onClick={() => router.push('/login?mode=signin')}>{c.signin}</button>
          <button className="nav-link" style={{ fontSize: '12px' }} onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>{lang === 'ja' ? '料金' : 'Pricing'}</button>
        </div>
        <span className="footer-text">© 2026 Flowly</span>
      </footer>
    </div>
  )
}
