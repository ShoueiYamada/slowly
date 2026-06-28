'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Lang, t } from '@/lib/i18n'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [lang, setLang] = useState<Lang>('en')
  const router = useRouter()
  const supabase = createClient()
  const tr = t[lang]

  async function handleSubmit() {
    setLoading(true)
    setMessage('')
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setMessage(error.message)
      else setMessage(lang === 'ja' ? '確認メールを送りました。メールを確認してください。' : lang === 'zh' ? '确认邮件已发送，请查收邮件。' : 'Confirmation email sent. Please check your inbox.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage(error.message)
      else router.push('/')
    }
    setLoading(false)
  }

  const input = {
    width: '100%', padding: '12px 16px', border: '1px solid #d2d2d7',
    borderRadius: '12px', fontSize: '15px', boxSizing: 'border-box' as const,
    color: '#1d1d1f', outline: 'none', fontFamily: 'inherit', background: '#fff'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f7', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', borderBottom: '0.5px solid #d2d2d7' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '52px' }}>
          <span style={{ fontSize: '17px', fontWeight: '700', color: '#1d1d1f', letterSpacing: '-0.3px' }}>Flowly</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            {(['en', 'ja', 'zh'] as Lang[]).map(l => (
              <button key={l} onClick={() => setLang(l)}
                style={{ padding: '4px 12px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '500', background: lang === l ? '#1d1d1f' : '#e8e8ed', color: lang === l ? '#fff' : '#6e6e73' }}>
                {l === 'en' ? 'EN' : l === 'ja' ? '日本語' : '中文'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ width: '56px', height: '56px', background: '#1d1d1f', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '24px' }}>
              ⏱
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1d1d1f', margin: '0 0 6px', letterSpacing: '-0.5px' }}>Flowly</h1>
            <p style={{ fontSize: '15px', color: '#6e6e73', margin: 0 }}>
              {isSignUp
                ? (lang === 'ja' ? 'アカウントを作成' : lang === 'zh' ? '创建账户' : 'Create your account')
                : (lang === 'ja' ? 'ログイン' : lang === 'zh' ? '登录账户' : 'Sign in to your account')}
            </p>
          </div>

          <div style={{ background: '#fff', borderRadius: '18px', padding: '2rem', border: '0.5px solid #d2d2d7' }}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#6e6e73', marginBottom: '6px', fontWeight: '500' }}>
                {lang === 'ja' ? 'メールアドレス' : lang === 'zh' ? '邮箱地址' : 'Email address'}
              </label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="you@example.com" style={input} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#6e6e73', marginBottom: '6px', fontWeight: '500' }}>
                {lang === 'ja' ? 'パスワード' : lang === 'zh' ? '密码' : 'Password'}
              </label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="••••••••" style={input} />
            </div>
            {message && (
              <div style={{ background: message.includes('sent') || message.includes('送り') || message.includes('已发') ? '#f0fff4' : '#fff0f0', borderRadius: '10px', padding: '10px 14px', marginBottom: '1rem' }}>
                <p style={{ fontSize: '13px', color: message.includes('sent') || message.includes('送り') || message.includes('已发') ? '#34c759' : '#ff3b30', margin: 0 }}>{message}</p>
              </div>
            )}
            <button onClick={handleSubmit} disabled={loading}
              style={{ width: '100%', padding: '13px', background: loading ? '#6e6e73' : '#1d1d1f', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
              {loading
                ? (lang === 'ja' ? '処理中...' : lang === 'zh' ? '处理中...' : 'Processing...')
                : isSignUp
                  ? (lang === 'ja' ? 'アカウントを作成' : lang === 'zh' ? '创建账户' : 'Create account')
                  : (lang === 'ja' ? 'ログイン' : lang === 'zh' ? '登录' : 'Sign in')}
            </button>
          </div>

          <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '14px', color: '#6e6e73' }}>
            {isSignUp
              ? (lang === 'ja' ? 'すでにアカウントをお持ちの方は' : lang === 'zh' ? '已有账户？' : 'Already have an account? ')
              : (lang === 'ja' ? 'アカウントをお持ちでない方は' : lang === 'zh' ? '还没有账户？' : "Don't have an account? ")}
            <button onClick={() => { setIsSignUp(!isSignUp); setMessage('') }}
              style={{ background: 'none', border: 'none', color: '#0071e3', cursor: 'pointer', fontSize: '14px', fontWeight: '500', fontFamily: 'inherit' }}>
              {isSignUp
                ? (lang === 'ja' ? 'ログイン' : lang === 'zh' ? '立即登录' : 'Sign in')
                : (lang === 'ja' ? '新規登録' : lang === 'zh' ? '立即注册' : 'Sign up')}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
