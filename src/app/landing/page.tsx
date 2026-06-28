'use client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

type Lang = 'en' | 'ja'

const copy = {
  en: {
    badge: 'Now in beta · Free to start',
    hero1: 'Time tracking',
    hero2: 'that pays you back',
    heroSub: 'Log hours, generate invoices, and chase late payments — all in one tool built for freelancers who work globally.',
    startFree: 'Start for free',
    howItWorks: 'See how it works',
    getStartedFree: 'Get started free',
    signIn: 'Sign in',
    signUp: 'Sign up',
    featuresLabel: 'Features',
    featuresTitle1: 'Everything a freelancer',
    featuresTitle2: 'actually needs',
    howLabel: 'How it works',
    howTitle1: 'From first click',
    howTitle2: 'to paid invoice',
    pricingLabel: 'Pricing',
    pricingTitle: 'Simple, honest pricing',
    pricingSub: 'No hidden fees. No per-seat nonsense. Cancel anytime.',
    ctaTitle1: 'Stop losing money',
    ctaTitle2: 'to missed hours',
    ctaSub: 'Join freelancers who track smarter and get paid faster.',
    ctaBtn: 'Start for free — no card required',
    forever: 'forever',
    perMonth: 'per month',
    getStarted: 'Get started',
    startTrial: 'Start free trial',
    footerRights: '© 2026 Flowly. All rights reserved.',
    features: [
      { icon: '⏱', title: 'One-click timer', desc: 'Start tracking in under a second. Stop and save. Your hours log themselves while you focus on the work.' },
      { icon: '◈', title: 'Client-aware tracking', desc: 'Attach every session to a client. Rates, currencies, and tax set once, applied everywhere.' },
      { icon: '◻', title: 'Invoices in seconds', desc: 'Select your logged hours and generate a polished, multi-currency PDF invoice. No templates to fiddle with.' },
      { icon: '◎', title: 'AI payment reminders', desc: 'Late invoice? Let AI draft the awkward email — gentle, firm, or final warning. You just hit send.' },
      { icon: '⊞', title: 'Revenue dashboard', desc: 'See your weekly and monthly earnings at a glance. Know exactly which clients drive your income.' },
      { icon: '◐', title: 'Dark & light mode', desc: 'A tool you use every day should look the way you want. Switch modes anytime.' },
    ],
    steps: [
      { step: 'Add your client', desc: 'Set their name, email, hourly rate, currency, and tax rate. Done in 30 seconds.' },
      { step: 'Start the timer', desc: 'One click starts tracking. Stop when you are done — the session is saved automatically.' },
      { step: 'Generate the invoice', desc: 'Select your logged hours, pick the client, and download a clean PDF invoice. Multi-currency, multi-language.' },
      { step: 'Get paid', desc: 'Send the invoice. If they go quiet, let AI draft the reminder email while you focus on the next project.' },
    ],
    freeFeatures: ['3 clients', '5 invoices / month', '3 AI reminders / month', 'Time tracking', 'Revenue dashboard'],
    proFeatures: ['Unlimited clients', 'Unlimited invoices', 'Unlimited AI reminders', 'Multi-currency PDF', 'Priority support'],
    stats: [{ n: '$0', label: 'TO GET STARTED' }, { n: '3', label: 'LANGUAGES SUPPORTED' }, { n: '4+', label: 'CURRENCIES' }],
  },
  ja: {
    badge: 'ベータ版公開中 · 無料で始める',
    hero1: '時間を記録して',
    hero2: '収益に変えよう',
    heroSub: '作業時間の記録・請求書作成・未払い督促まで。世界中のフリーランサーのためのオールインワンツール。',
    startFree: '無料で始める',
    howItWorks: '使い方を見る',
    getStartedFree: '無料で始める',
    signIn: 'ログイン',
    signUp: '新規登録',
    featuresLabel: '機能',
    featuresTitle1: 'フリーランサーに',
    featuresTitle2: '必要な全てが揃う',
    howLabel: '使い方',
    howTitle1: '最初のクリックから',
    howTitle2: '入金まで',
    pricingLabel: '料金',
    pricingTitle: 'シンプルな料金体系',
    pricingSub: '隠れた費用なし。いつでもキャンセル可能。',
    ctaTitle1: '未記録の時間で',
    ctaTitle2: '損をするのをやめよう',
    ctaSub: 'スマートに記録して、素早く入金されるフリーランサーに。',
    ctaBtn: '無料で始める — カード不要',
    forever: '永久無料',
    perMonth: '月額',
    getStarted: '始める',
    startTrial: '無料トライアル開始',
    footerRights: '© 2026 Flowly. All rights reserved.',
    features: [
      { icon: '⏱', title: 'ワンクリックタイマー', desc: '1秒で記録開始。止めて保存するだけ。作業に集中している間も時間が自動で記録されます。' },
      { icon: '◈', title: 'クライアント紐付き記録', desc: 'セッションをクライアントに紐付け。時給・通貨・税率を一度設定すれば自動適用。' },
      { icon: '◻', title: '数秒で請求書作成', desc: '記録した時間を選んでワンクリック。多通貨対応のきれいなPDF請求書が即完成。' },
      { icon: '◎', title: 'AI督促メール', desc: '未払いのクライアントへのメールをAIが代わりに作成。トーンを選んで送るだけ。' },
      { icon: '⊞', title: '収益ダッシュボード', desc: '週次・月次の収益を一目で確認。どのクライアントが収益を生んでいるか把握できます。' },
      { icon: '◐', title: 'ダーク/ライトモード', desc: '毎日使うツールだから、見た目も自分好みに。いつでも切り替え可能。' },
    ],
    steps: [
      { step: 'クライアントを追加', desc: '名前・メール・時給・通貨・税率を設定。30秒で完了します。' },
      { step: 'タイマーを開始', desc: 'ワンクリックで記録開始。終わったら止めるだけ。自動で保存されます。' },
      { step: '請求書を作成', desc: '記録した時間を選んでクライアントを選択。多言語・多通貨のきれいなPDFが即完成。' },
      { step: '入金を受ける', desc: '請求書を送信。支払いが遅れたらAIが督促メールを作成。次の仕事に集中できます。' },
    ],
    freeFeatures: ['クライアント3件まで', '請求書5件/月', 'AI督促メール3回/月', 'タイマー機能', '収益ダッシュボード'],
    proFeatures: ['クライアント無制限', '請求書無制限', 'AI督促メール無制限', '多通貨PDF対応', '優先サポート'],
    stats: [{ n: '$0', label: '無料で始められる' }, { n: '3', label: '対応言語数' }, { n: '4+', label: '対応通貨数' }],
  },
}

export default function LandingPage() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [lang, setLang] = useState<Lang>('en')
  const c = copy[lang]

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const animStyle = `
    @keyframes flowGradient {
      0%   { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #08080F; }
    .logo-anim {
      background: linear-gradient(90deg, #1e3a5f 0%, #38BDF8 25%, #e0f2fe 50%, #38BDF8 75%, #1e3a5f 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: flowGradient 3s linear infinite;
    }
    .hero-title {
      background: linear-gradient(135deg, #ffffff 0%, #e0f2fe 40%, #38BDF8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .fade-up-1 { animation: fadeUp 0.7s 0.1s ease both; }
    .fade-up-2 { animation: fadeUp 0.7s 0.25s ease both; }
    .fade-up-3 { animation: fadeUp 0.7s 0.4s ease both; }
    .fade-up-4 { animation: fadeUp 0.7s 0.55s ease both; }
    .cta-btn {
      background: #38BDF8;
      color: #08080F;
      border: none;
      padding: 14px 32px;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.2s;
    }
    .cta-btn:hover { background: #7DD3FC; transform: translateY(-1px); }
    .cta-btn-outline {
      background: transparent;
      color: #94A3B8;
      border: 1px solid rgba(255,255,255,0.12);
      padding: 14px 32px;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.2s;
    }
    .cta-btn-outline:hover { border-color: #38BDF8; color: #38BDF8; }
    .feature-card {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 16px;
      padding: 2rem;
      transition: all 0.2s;
    }
    .feature-card:hover {
      background: rgba(56,189,248,0.05);
      border-color: rgba(56,189,248,0.2);
      transform: translateY(-2px);
    }
    .pricing-card {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 20px;
      padding: 2.5rem;
    }
    .pricing-card.featured {
      background: rgba(56,189,248,0.08);
      border-color: rgba(56,189,248,0.35);
    }
    .nav-link {
      background: none;
      border: none;
      color: #94A3B8;
      font-size: 14px;
      cursor: pointer;
      font-family: inherit;
      transition: color 0.2s;
      padding: 0;
    }
    .nav-link:hover { color: #fff; }
    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(56,189,248,0.2), transparent);
    }
    .badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      padding: 4px 12px;
      border-radius: 20px;
      background: rgba(56,189,248,0.12);
      color: #38BDF8;
      border: 1px solid rgba(56,189,248,0.25);
    }
    .check { color: #38BDF8; font-size: 15px; margin-right: 10px; }
    .lang-btn {
      background: none;
      border: 1px solid rgba(255,255,255,0.12);
      color: #94A3B8;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
      padding: 4px 10px;
      border-radius: 8px;
      transition: all 0.2s;
    }
    .lang-btn.active {
      background: rgba(56,189,248,0.15);
      border-color: rgba(56,189,248,0.4);
      color: #38BDF8;
    }
    .lang-btn:hover { color: #fff; border-color: rgba(255,255,255,0.3); }
    .signin-btn {
      background: none;
      border: 1px solid rgba(255,255,255,0.15);
      color: #E2E8F0;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      font-family: inherit;
      padding: 7px 16px;
      border-radius: 10px;
      transition: all 0.2s;
    }
    .signin-btn:hover { border-color: #38BDF8; color: #38BDF8; }
  `

  return (
    <div style={{ minHeight: '100vh', background: '#08080F', fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif', color: '#fff' }}>
      <style>{animStyle}</style>

      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, padding: '0 2rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: scrolled ? 'rgba(8,8,15,0.9)' : 'transparent', backdropFilter: scrolled ? 'blur(20px)' : 'none', borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none', transition: 'all 0.3s' }}>
        <span className="logo-anim" style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px' }}>Flowly</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="nav-link" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} style={{ marginRight: '16px' }}>
            {lang === 'ja' ? '機能' : 'Features'}
          </button>
          <button className="nav-link" onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} style={{ marginRight: '16px' }}>
            {lang === 'ja' ? '料金' : 'Pricing'}
          </button>
          <div style={{ display: 'flex', gap: '4px', marginRight: '16px' }}>
            <button className={'lang-btn' + (lang === 'en' ? ' active' : '')} onClick={() => setLang('en')}>EN</button>
            <button className={'lang-btn' + (lang === 'ja' ? ' active' : '')} onClick={() => setLang('ja')}>JA</button>
          </div>
          <button className="signin-btn" onClick={() => router.push('/login?mode=signin')}>{c.signIn}</button>
          <button className="cta-btn" style={{ padding: '8px 18px', fontSize: '14px' }} onClick={() => router.push('/login?mode=signup')}>{c.signUp}</button>
        </div>
      </nav>

      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '8rem 2rem 6rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ marginBottom: '1.5rem' }}><span className="badge">{c.badge}</span></div>
        <h1 className="hero-title fade-up-1" style={{ fontSize: 'clamp(48px, 8vw, 88px)', fontWeight: '800', lineHeight: '1.0', letterSpacing: '-3px', marginBottom: '1.5rem', maxWidth: '800px' }}>
          {c.hero1}<br />{c.hero2}
        </h1>
        <p className="fade-up-2" style={{ fontSize: '20px', color: '#64748B', maxWidth: '520px', lineHeight: '1.6', marginBottom: '2.5rem' }}>{c.heroSub}</p>
        <div className="fade-up-3" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '4rem' }}>
          <button className="cta-btn" onClick={() => router.push('/login?mode=signup')}>{c.startFree}</button>
          <button className="cta-btn-outline" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>{c.howItWorks}</button>
        </div>
        <div className="fade-up-4" style={{ display: 'flex', gap: '48px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {c.stats.map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', fontWeight: '700', color: '#38BDF8', fontVariantNumeric: 'tabular-nums', letterSpacing: '-2px' }}>{s.n}</div>
              <div style={{ fontSize: '13px', color: '#475569', marginTop: '4px', letterSpacing: '0.04em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="divider" />

      <section id="features" style={{ padding: '6rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <span className="badge" style={{ marginBottom: '1rem', display: 'inline-block' }}>{c.featuresLabel}</span>
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: '700', letterSpacing: '-1.5px', color: '#F1F5F9', lineHeight: '1.1' }}>
            {c.featuresTitle1}<br />{c.featuresTitle2}
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          {c.features.map((f, i) => (
            <div key={i} className="feature-card">
              <div style={{ fontSize: '28px', marginBottom: '1rem' }}>{f.icon}</div>
              <h3 style={{ fontSize: '17px', fontWeight: '600', color: '#F1F5F9', marginBottom: '8px', letterSpacing: '-0.3px' }}>{f.title}</h3>
              <p style={{ fontSize: '14px', color: '#64748B', lineHeight: '1.6' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="divider" />

      <section style={{ padding: '6rem 2rem', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <span className="badge" style={{ marginBottom: '1rem', display: 'inline-block' }}>{c.howLabel}</span>
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: '700', letterSpacing: '-1.5px', color: '#F1F5F9', lineHeight: '1.1' }}>
            {c.howTitle1}<br />{c.howTitle2}
          </h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {c.steps.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '24px', padding: '2rem 0', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: '#38BDF8', flexShrink: 0, marginTop: '2px' }}>
                {i + 1}
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#F1F5F9', marginBottom: '6px', letterSpacing: '-0.3px' }}>{item.step}</h3>
                <p style={{ fontSize: '15px', color: '#64748B', lineHeight: '1.6' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="divider" />

      <section id="pricing" style={{ padding: '6rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <span className="badge" style={{ marginBottom: '1rem', display: 'inline-block' }}>{c.pricingLabel}</span>
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: '700', letterSpacing: '-1.5px', color: '#F1F5F9', lineHeight: '1.1' }}>{c.pricingTitle}</h2>
          <p style={{ fontSize: '16px', color: '#64748B', marginTop: '1rem' }}>{c.pricingSub}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="pricing-card">
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#64748B', letterSpacing: '0.06em', marginBottom: '1rem' }}>FREE</div>
            <div style={{ fontSize: '48px', fontWeight: '800', color: '#F1F5F9', letterSpacing: '-2px', marginBottom: '0.25rem' }}>$0</div>
            <div style={{ fontSize: '13px', color: '#475569', marginBottom: '2rem' }}>{c.forever}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '2rem' }}>
              {c.freeFeatures.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', fontSize: '14px', color: '#94A3B8' }}>
                  <span className="check">✓</span>{f}
                </div>
              ))}
            </div>
            <button className="cta-btn-outline" style={{ width: '100%' }} onClick={() => router.push('/login?mode=signup')}>{c.getStarted}</button>
          </div>
          <div className="pricing-card featured" style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', fontSize: '11px', fontWeight: '700', padding: '4px 14px', borderRadius: '20px', background: '#38BDF8', color: '#08080F', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>MOST POPULAR</span>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#38BDF8', letterSpacing: '0.06em', marginBottom: '1rem' }}>PRO</div>
            <div style={{ fontSize: '48px', fontWeight: '800', color: '#F1F5F9', letterSpacing: '-2px', marginBottom: '0.25rem' }}>$7</div>
            <div style={{ fontSize: '13px', color: '#475569', marginBottom: '2rem' }}>{c.perMonth}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '2rem' }}>
              {c.proFeatures.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', fontSize: '14px', color: '#E2E8F0' }}>
                  <span className="check">✓</span>{f}
                </div>
              ))}
            </div>
            <button className="cta-btn" style={{ width: '100%' }} onClick={() => router.push('/login?mode=signup')}>{c.startTrial}</button>
          </div>
        </div>
      </section>

      <div className="divider" />

      <section style={{ padding: '8rem 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(56,189,248,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <h2 style={{ fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: '800', letterSpacing: '-2px', color: '#F1F5F9', lineHeight: '1.05', marginBottom: '1.5rem', maxWidth: '600px', margin: '0 auto 1.5rem' }}>
          {c.ctaTitle1}<br />{c.ctaTitle2}
        </h2>
        <p style={{ fontSize: '18px', color: '#64748B', marginBottom: '2.5rem' }}>{c.ctaSub}</p>
        <button className="cta-btn" style={{ fontSize: '17px', padding: '16px 40px' }} onClick={() => router.push('/login?mode=signup')}>{c.ctaBtn}</button>
      </section>

      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <span className="logo-anim" style={{ fontSize: '16px', fontWeight: '800', letterSpacing: '-0.3px' }}>Flowly</span>
        <div style={{ display: 'flex', gap: '24px' }}>
          <button className="nav-link" style={{ fontSize: '13px' }} onClick={() => router.push('/login?mode=signin')}>{c.signIn}</button>
          <button className="nav-link" style={{ fontSize: '13px' }} onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>{lang === 'ja' ? '料金' : 'Pricing'}</button>
        </div>
        <span style={{ fontSize: '13px', color: '#334155' }}>{c.footerRights}</span>
      </footer>
    </div>
  )
}
