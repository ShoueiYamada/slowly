'use client'
import { useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'

type Lang = 'en' | 'ja'

function LoginContent() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(searchParams.get('mode') === 'signup')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [lang, setLang] = useState<Lang>('ja')
  const router = useRouter()
  const supabase = createClient()

  const copy = {
    en: {
      signin: 'Welcome back', signup: 'Create account',
      sub_signin: 'Sign in to your Flowly account',
      sub_signup: 'Start tracking time and getting paid faster',
      email: 'Email address', password: 'Password',
      btn_signin: 'Sign in', btn_signup: 'Create account',
      loading: 'Processing...',
      switch_to_signup: "Don't have an account?", switch_signup_link: 'Sign up',
      switch_to_signin: 'Already have an account?', switch_signin_link: 'Sign in',
      confirm: 'Confirmation email sent. Please check your inbox.',
      back: '← Back to home',
    },
    ja: {
      signin: 'おかえりなさい', signup: 'アカウントを作成',
      sub_signin: 'Flowlyにログイン',
      sub_signup: '無料で始めて、素早く入金を受けましょう',
      email: 'メールアドレス', password: 'パスワード',
      btn_signin: 'ログイン', btn_signup: 'アカウントを作成',
      loading: '処理中...',
      switch_to_signup: 'アカウントをお持ちでない方は', switch_signup_link: '新規登録',
      switch_to_signin: 'すでにアカウントをお持ちの方は', switch_signin_link: 'ログイン',
      confirm: '確認メールを送りました。メールを確認してください。',
      back: '← ホームに戻る',
    },
  }
  const c = copy[lang]

  async function handleSubmit() {
    setLoading(true); setMessage('')
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setMessage(error.message)
      else setMessage(c.confirm)
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage(error.message)
      else router.push('/dashboard')
    }
    setLoading(false)
  }

  const isSuccess = message === c.confirm

  const animStyle = `
    @keyframes flowGradient {
      0%   { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    .logo-anim {
      background: linear-gradient(90deg, #1e3a5f 0%, #38BDF8 25%, #e0f2fe 50%, #38BDF8 75%, #1e3a5f 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: flowGradient 3s linear infinite;
    }
    .inp:focus { border-color: #38BDF8 !important; outline: none; }
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
  `

  return (
    <div style={{ minHeight: '100vh', background: '#08080F', fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif', display: 'flex', flexDirection: 'column' }}>
      <style>{animStyle}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={() => router.push('/landing')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <span className="logo-anim" style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.5px' }}>Flowly</span>
        </button>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button className={'lang-btn' + (lang === 'en' ? ' active' : '')} onClick={() => setLang('en')}>EN</button>
          <button className={'lang-btn' + (lang === 'ja' ? ' active' : '')} onClick={() => setLang('ja')}>JA</button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span className="logo-anim" style={{ fontSize: '42px', fontWeight: '800', letterSpacing: '-1.5px', display: 'block', marginBottom: '1rem' }}>Flowly</span>
            <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#F1F5F9', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
              {isSignUp ? c.signup : c.signin}
            </h1>
            <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>{isSignUp ? c.sub_signup : c.sub_signin}</p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '18px', padding: '1.75rem', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#64748B', marginBottom: '6px', fontWeight: '600' }}>{c.email}</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="you@example.com"
                className="inp"
                style={{ width: '100%', padding: '12px 16px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '15px', boxSizing: 'border-box', color: '#F1F5F9', background: 'rgba(255,255,255,0.05)', fontFamily: 'inherit' }} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#64748B', marginBottom: '6px', fontWeight: '600' }}>{c.password}</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="••••••••"
                className="inp"
                style={{ width: '100%', padding: '12px 16px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '15px', boxSizing: 'border-box', color: '#F1F5F9', background: 'rgba(255,255,255,0.05)', fontFamily: 'inherit' }} />
            </div>
            {message && (
              <div style={{ background: isSuccess ? 'rgba(56,189,248,0.1)' : 'rgba(239,68,68,0.1)', borderRadius: '10px', padding: '10px 14px', marginBottom: '1rem', border: '1px solid ' + (isSuccess ? 'rgba(56,189,248,0.2)' : 'rgba(239,68,68,0.2)') }}>
                <p style={{ fontSize: '13px', color: isSuccess ? '#38BDF8' : '#F87171', margin: 0 }}>{message}</p>
              </div>
            )}
            <button onClick={handleSubmit} disabled={loading}
              style={{ width: '100%', padding: '13px', background: loading ? '#1e3a5f' : '#38BDF8', color: loading ? '#64748B' : '#08080F', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
              {loading ? c.loading : isSignUp ? c.btn_signup : c.btn_signin}
            </button>
          </div>

          <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '14px', color: '#475569' }}>
            {isSignUp ? c.switch_to_signin : c.switch_to_signup}{' '}
            <button onClick={() => { setIsSignUp(!isSignUp); setMessage('') }}
              style={{ background: 'none', border: 'none', color: '#38BDF8', cursor: 'pointer', fontSize: '14px', fontWeight: '600', fontFamily: 'inherit' }}>
              {isSignUp ? c.switch_signin_link : c.switch_signup_link}
            </button>
          </p>

          <p style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button onClick={() => router.push('/landing')}
              style={{ background: 'none', border: 'none', color: '#334155', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}>
              {c.back}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}
