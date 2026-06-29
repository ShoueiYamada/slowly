'use client'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { useLang } from '@/contexts/LangContext'
import { Lang } from '@/lib/i18n'

type Props = {
  userEmail: string
  onSignOut: () => void
  collapsed: boolean
  setCollapsed: (v: boolean) => void
}

const icons = {
  dashboard: (c: string) => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1.5" stroke={c} strokeWidth="1.2"/><rect x="9" y="1" width="6" height="6" rx="1.5" stroke={c} strokeWidth="1.2"/><rect x="1" y="9" width="6" height="6" rx="1.5" stroke={c} strokeWidth="1.2"/><rect x="9" y="9" width="6" height="6" rx="1.5" stroke={c} strokeWidth="1.2"/></svg>,
  clients: (c: string) => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="6" cy="5" r="2.5" stroke={c} strokeWidth="1.2"/><path d="M1 13c0-2.5 2-4 5-4s5 1.5 5 4" stroke={c} strokeWidth="1.2" strokeLinecap="round"/><circle cx="12" cy="5" r="2" stroke={c} strokeWidth="1.2"/><path d="M14 12.5c.5.3.8.9.8 1.5" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></svg>,
  invoice: (c: string) => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="1" width="10" height="14" rx="1.5" stroke={c} strokeWidth="1.2"/><path d="M5 5h6M5 8h6M5 11h4" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></svg>,
  reminders: (c: string) => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5A4.5 4.5 0 0 0 3.5 6v3L2 11h12l-1.5-2V6A4.5 4.5 0 0 0 8 1.5Z" stroke={c} strokeWidth="1.2" strokeLinejoin="round"/><path d="M6.5 11v.5a1.5 1.5 0 0 0 3 0V11" stroke={c} strokeWidth="1.2"/></svg>,
  pomodoro: (c: string) => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke={c} strokeWidth="1.2"/><path d="M8 4.5V8l2.5 2.5" stroke={c} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  goal: (c: string) => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke={c} strokeWidth="1.2"/><circle cx="8" cy="8" r="3" stroke={c} strokeWidth="1.2"/><circle cx="8" cy="8" r="1" fill={c}/></svg>,
  taxreport: (c: string) => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="1" width="10" height="14" rx="1.5" stroke={c} strokeWidth="1.2"/><path d="M5 4h6M5 6.5h6M5 9h4" stroke={c} strokeWidth="1.2" strokeLinecap="round"/><path d="M8 11l1.5 2 2-3" stroke={c} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  pricing: (c: string) => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8.5L8 2l6 6.5V14H2V8.5Z" stroke={c} strokeWidth="1.2" strokeLinejoin="round"/><path d="M6 14v-4h4v4" stroke={c} strokeWidth="1.2" strokeLinejoin="round"/></svg>,
  moon: (c: string) => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M11.5 8A5 5 0 0 1 6 2.5a5 5 0 1 0 5.5 5.5Z" stroke={c} strokeWidth="1.2" strokeLinejoin="round"/></svg>,
  sun: (c: string) => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="2.5" stroke={c} strokeWidth="1.2"/><path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.8 2.8l1 1M10.2 10.2l1 1M11.2 2.8l-1 1M3.8 10.2l-1 1" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></svg>,
  signout: (c: string) => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 2H2.5A1.5 1.5 0 0 0 1 3.5v7A1.5 1.5 0 0 0 2.5 12H5" stroke={c} strokeWidth="1.2" strokeLinecap="round"/><path d="M9.5 4.5L13 7l-3.5 2.5M13 7H5" stroke={c} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  menu: (c: string) => <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 5h14M3 10h14M3 15h14" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></svg>,
  close: (c: string) => <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5L5 15" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></svg>,
}

export default function Sidebar({ userEmail, onSignOut, collapsed, setCollapsed }: Props) {
  const { tokens, theme, toggle } = useTheme()
  const { lang, setLang } = useLang()
  const router = useRouter()
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [pathname])

  const nav = [
    { href: '/dashboard', icon: 'dashboard', label: lang === 'ja' ? 'ダッシュボード' : 'Dashboard' },
    { href: '/clients', icon: 'clients', label: lang === 'ja' ? 'クライアント' : 'Clients' },
    { href: '/invoice', icon: 'invoice', label: lang === 'ja' ? '請求書' : 'Invoices' },
    { href: '/reminders', icon: 'reminders', label: lang === 'ja' ? 'AI督促' : 'AI Reminders', badge: 'AI' },
    { href: '/pomodoro', icon: 'pomodoro', label: lang === 'ja' ? 'ポモドーロ' : 'Pomodoro' },
    { href: '/goal', icon: 'goal', label: lang === 'ja' ? '目標収益' : 'Revenue Goal' },
    { href: '/tax-report', icon: 'taxreport', label: lang === 'ja' ? '確定申告' : 'Tax Report', badge: 'NEW' },
    { href: '/pricing', icon: 'pricing', label: lang === 'ja' ? '料金' : 'Pricing' },
  ]

  const isActive = (href: string) => pathname === href

  const animStyle = `
    @keyframes flowGradient {
      0%   { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    .sidebar-logo {
      background: linear-gradient(90deg, #1e3a5f 0%, #38BDF8 25%, #e0f2fe 50%, #38BDF8 75%, #1e3a5f 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: flowGradient 3s linear infinite;
      font-weight: 800;
      letter-spacing: -0.8px;
    }
    .nav-item {
      display: flex; align-items: center; gap: 10px;
      padding: 9px 12px; border-radius: 8px; border: none;
      cursor: pointer; width: 100%; font-size: 14px;
      font-family: inherit; transition: all 0.15s;
      white-space: nowrap; text-align: left;
    }
    .nav-item:hover { background: ${tokens.bgHover}; }
  `

  const NavContent = () => (
    <>
      <div style={{ padding: '10px', flex: 1, overflowY: 'auto' }}>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
          {nav.map(item => {
            const active = isActive(item.href)
            const iconColor = active ? tokens.accent : tokens.textTertiary
            return (
              <button key={item.href} onClick={() => router.push(item.href)}
                className="nav-item"
                style={{ background: active ? tokens.bgActive : 'transparent', color: active ? tokens.accent : tokens.textSecondary, fontWeight: active ? '600' : '400' }}>
                <span style={{ flexShrink: 0, display: 'flex' }}>{icons[item.icon as keyof typeof icons]?.(iconColor)}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                  {item.label}
                  {item.badge && <span style={{ fontSize: '9px', padding: '2px 5px', background: item.badge === 'AI' ? tokens.accent : tokens.successBg, color: item.badge === 'AI' ? '#080808' : tokens.success, borderRadius: '4px', fontWeight: '700' }}>{item.badge}</span>}
                </span>
              </button>
            )
          })}
        </nav>
      </div>

      <div style={{ padding: '10px', borderTop: '1px solid ' + tokens.border, flexShrink: 0 }}>
        <div style={{ marginBottom: '8px' }}>
          <div style={{ fontSize: '10px', color: tokens.textTertiary, marginBottom: '6px', fontWeight: '600', letterSpacing: '0.08em', paddingLeft: '4px' }}>LANGUAGE</div>
          <div style={{ display: 'flex', gap: '3px' }}>
            {(['en', 'ja', 'zh'] as Lang[]).map(l => (
              <button key={l} onClick={() => setLang(l)}
                style={{ flex: 1, padding: '6px 0', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: '600', fontFamily: 'inherit', background: lang === l ? tokens.accent : tokens.bgHover, color: lang === l ? '#080808' : tokens.textTertiary }}>
                {l === 'en' ? 'EN' : l === 'ja' ? 'JA' : 'ZH'}
              </button>
            ))}
          </div>
        </div>
        <button onClick={toggle}
          style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: '1px solid ' + tokens.border, cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit', background: 'transparent', color: tokens.textSecondary, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          {theme === 'dark' ? icons.moon(tokens.textSecondary) : icons.sun(tokens.textSecondary)}
          <span>{theme === 'dark' ? 'Dark' : 'Light'}</span>
        </button>
        <div style={{ padding: '8px 10px', marginBottom: '6px', background: tokens.bgHover, borderRadius: '8px' }}>
          <p style={{ fontSize: '12px', fontWeight: '600', color: tokens.text, margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userEmail.split('@')[0]}</p>
          <p style={{ fontSize: '11px', color: tokens.textTertiary, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userEmail}</p>
        </div>
        <button onClick={onSignOut}
          style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit', background: 'transparent', color: tokens.danger, fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}
          onMouseEnter={e => (e.currentTarget.style.background = tokens.dangerBg)}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
          {icons.signout(tokens.danger)}
          {lang === 'ja' ? 'ログアウト' : 'Sign out'}
        </button>
      </div>
    </>
  )

  // モバイル
  if (isMobile) {
    return (
      <>
        <style>{animStyle}</style>
        {/* 固定トップバー */}
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '52px', background: tokens.bgSidebar, borderBottom: '1px solid ' + tokens.border, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1rem', zIndex: 30 }}>
          <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <span className="sidebar-logo" style={{ fontSize: '20px' }}>Flowly</span>
          </button>
          <button onClick={() => setMobileOpen(!mobileOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', borderRadius: '8px' }}>
            {mobileOpen ? icons.close(tokens.text) : icons.menu(tokens.text)}
          </button>
        </div>

        {/* オーバーレイ */}
        {mobileOpen && (
          <div onClick={() => setMobileOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 28, backdropFilter: 'blur(4px)' }} />
        )}

        {/* ドロワー */}
        <div style={{ position: 'fixed', top: '52px', left: 0, bottom: 0, width: '260px', background: tokens.bgSidebar, borderRight: '1px solid ' + tokens.border, zIndex: 29, transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <NavContent />
        </div>
      </>
    )
  }

  // デスクトップ
  const w = collapsed ? '56px' : '232px'
  return (
    <div style={{ width: w, minHeight: '100vh', background: tokens.bgSidebar, borderRight: '1px solid ' + tokens.border, display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 20, transition: 'width 0.2s cubic-bezier(0.4,0,0.2,1)', overflow: 'hidden' }}>
      <style>{animStyle}</style>
      <div style={{ padding: '0 14px', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', borderBottom: '1px solid ' + tokens.border, height: '56px', flexShrink: 0 }}>
        {!collapsed && <span className="sidebar-logo" style={{ fontSize: '22px' }}>Flowly</span>}
        {collapsed && (
          <button onClick={() => setCollapsed(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }}>
            <span className="sidebar-logo" style={{ fontSize: '18px' }}>F</span>
          </button>
        )}
        {!collapsed && (
          <button onClick={() => setCollapsed(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex', color: tokens.textTertiary }}
            onMouseEnter={e => (e.currentTarget.style.background = tokens.bgHover)}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke={tokens.textTertiary} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        )}
      </div>

      {!collapsed ? (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <NavContent />
        </div>
      ) : (
        <>
          <div style={{ padding: '10px 8px', flex: 1 }}>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              {nav.map(item => {
                const active = isActive(item.href)
                return (
                  <button key={item.href} onClick={() => router.push(item.href)}
                    title={item.label}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '9px 0', borderRadius: '8px', border: 'none', cursor: 'pointer', width: '100%', background: active ? tokens.bgActive : 'transparent', transition: 'all 0.15s' }}
                    onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = tokens.bgHover }}
                    onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                    {icons[item.icon as keyof typeof icons]?.(active ? tokens.accent : tokens.textTertiary)}
                  </button>
                )
              })}
            </nav>
          </div>
          <div style={{ padding: '10px 8px', borderTop: '1px solid ' + tokens.border, display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
            <button onClick={toggle} style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid ' + tokens.border, cursor: 'pointer', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {theme === 'dark' ? icons.moon(tokens.textSecondary) : icons.sun(tokens.textSecondary)}
            </button>
            <button onClick={onSignOut} style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid ' + tokens.border, cursor: 'pointer', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {icons.signout(tokens.danger)}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
