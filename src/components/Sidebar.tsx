'use client'
import { useRouter, usePathname } from 'next/navigation'
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
  dashboard: (color: string) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1.5" stroke={color} strokeWidth="1.2"/>
      <rect x="9" y="1" width="6" height="6" rx="1.5" stroke={color} strokeWidth="1.2"/>
      <rect x="1" y="9" width="6" height="6" rx="1.5" stroke={color} strokeWidth="1.2"/>
      <rect x="9" y="9" width="6" height="6" rx="1.5" stroke={color} strokeWidth="1.2"/>
    </svg>
  ),
  clients: (color: string) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="6" cy="5" r="2.5" stroke={color} strokeWidth="1.2"/>
      <path d="M1 13c0-2.5 2-4 5-4s5 1.5 5 4" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
      <circle cx="12" cy="5" r="2" stroke={color} strokeWidth="1.2"/>
      <path d="M14 12.5c.5.3.8.9.8 1.5" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  ),
  invoice: (color: string) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="1" width="10" height="14" rx="1.5" stroke={color} strokeWidth="1.2"/>
      <path d="M5 5h6M5 8h6M5 11h4" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  ),
  reminders: (color: string) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1.5A4.5 4.5 0 0 0 3.5 6v3L2 11h12l-1.5-2V6A4.5 4.5 0 0 0 8 1.5Z" stroke={color} strokeWidth="1.2" strokeLinejoin="round"/>
      <path d="M6.5 11v.5a1.5 1.5 0 0 0 3 0V11" stroke={color} strokeWidth="1.2"/>
    </svg>
  ),
  pomodoro: (color: string) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke={color} strokeWidth="1.2"/>
      <path d="M8 4.5V8l2.5 2.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  goal: (color: string) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke={color} strokeWidth="1.2"/>
      <circle cx="8" cy="8" r="3" stroke={color} strokeWidth="1.2"/>
      <circle cx="8" cy="8" r="1" fill={color}/>
    </svg>
  ),
  pricing: (color: string) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 8.5L8 2l6 6.5V14H2V8.5Z" stroke={color} strokeWidth="1.2" strokeLinejoin="round"/>
      <path d="M6 14v-4h4v4" stroke={color} strokeWidth="1.2" strokeLinejoin="round"/>
    </svg>
  ),
  collapse: (color: string) => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M9 2L4 7l5 5" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  expand: (color: string) => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M5 2l5 5-5 5" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  moon: (color: string) => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M11.5 8A5 5 0 0 1 6 2.5a5 5 0 1 0 5.5 5.5Z" stroke={color} strokeWidth="1.2" strokeLinejoin="round"/>
    </svg>
  ),
  sun: (color: string) => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="2.5" stroke={color} strokeWidth="1.2"/>
      <path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.8 2.8l1 1M10.2 10.2l1 1M11.2 2.8l-1 1M3.8 10.2l-1 1" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  ),
  signout: (color: string) => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M5 2H2.5A1.5 1.5 0 0 0 1 3.5v7A1.5 1.5 0 0 0 2.5 12H5" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M9.5 4.5L13 7l-3.5 2.5M13 7H5" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
}

export default function Sidebar({ userEmail, onSignOut, collapsed, setCollapsed }: Props) {
  const { tokens, theme, toggle } = useTheme()
  const { lang, setLang } = useLang()
  const router = useRouter()
  const pathname = usePathname()

  const nav = [
    { href: '/dashboard', icon: 'dashboard', label: lang === 'ja' ? 'ダッシュボード' : lang === 'zh' ? '工作台' : 'Dashboard' },
    { href: '/clients', icon: 'clients', label: lang === 'ja' ? 'クライアント' : lang === 'zh' ? '客户' : 'Clients' },
    { href: '/invoice', icon: 'invoice', label: lang === 'ja' ? '請求書' : lang === 'zh' ? '发票' : 'Invoices' },
    { href: '/reminders', icon: 'reminders', label: lang === 'ja' ? 'AI督促' : lang === 'zh' ? 'AI催款' : 'AI Reminders', badge: 'AI' },
    { href: '/pomodoro', icon: 'pomodoro', label: lang === 'ja' ? 'ポモドーロ' : lang === 'zh' ? '番茄钟' : 'Pomodoro' },
    { href: '/goal', icon: 'goal', label: lang === 'ja' ? '目標収益' : lang === 'zh' ? '收益目标' : 'Revenue Goal' },
    { href: '/tax-report', icon: 'taxreport', label: lang === 'ja' ? '確定申告レポート' : 'Tax Report', badge: 'NEW' },
    { href: '/pricing', icon: 'pricing', label: lang === 'ja' ? 'プランと料金' : lang === 'zh' ? '套餐价格' : 'Pricing' },
  ]

  const isActive = (href: string) => pathname === href
  const w = collapsed ? '56px' : '232px'

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
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.8px;
      white-space: nowrap;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: ${collapsed ? '9px 0' : '8px 12px'};
      justify-content: ${collapsed ? 'center' : 'flex-start'};
      border-radius: 8px;
      border: none;
      cursor: pointer;
      width: 100%;
      font-size: 13px;
      font-family: inherit;
      transition: all 0.15s;
      white-space: nowrap;
      letter-spacing: -0.1px;
    }
    .nav-item:hover { background: ${tokens.bgHover}; }
  `

  return (
    <div style={{ width: w, minHeight: '100vh', background: tokens.bgSidebar, borderRight: '1px solid ' + tokens.border, display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 20, transition: 'width 0.2s cubic-bezier(0.4,0,0.2,1)', overflow: 'hidden' }}>
      <style>{animStyle}</style>

      <div style={{ padding: '0 14px', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', borderBottom: '1px solid ' + tokens.border, height: '56px', flexShrink: 0 }}>
        {!collapsed && <span className="sidebar-logo">Flowly</span>}
        {collapsed && (
          <button onClick={() => setCollapsed(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }}>
            <span className="sidebar-logo" style={{ fontSize: '18px' }}>F</span>
          </button>
        )}
        {!collapsed && (
          <button onClick={() => setCollapsed(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center', color: tokens.textTertiary, transition: 'background 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.background = tokens.bgHover)}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
            {icons.collapse(tokens.textTertiary)}
          </button>
        )}
      </div>

      <div style={{ padding: collapsed ? '10px 8px' : '10px 10px', flex: 1, overflowY: 'auto' }}>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
          {nav.map(item => {
            const active = isActive(item.href)
            const iconColor = active ? tokens.accent : tokens.textTertiary
            return (
              <button key={item.href} onClick={() => router.push(item.href)}
                title={collapsed ? item.label : ''}
                className="nav-item"
                style={{ background: active ? tokens.bgActive : 'transparent', color: active ? tokens.accent : tokens.textSecondary, fontWeight: active ? '600' : '400' }}>
                <span style={{ flexShrink: 0, display: 'flex' }}>{icons[item.icon as keyof typeof icons]?.(iconColor)}</span>
                {!collapsed && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                    {item.label}
                    {item.badge && (
                      <span style={{ fontSize: '9px', padding: '2px 5px', background: tokens.accent, color: tokens.bg, borderRadius: '4px', fontWeight: '700', letterSpacing: '0.04em' }}>
                        {item.badge}
                      </span>
                    )}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {!collapsed && (
        <div style={{ padding: '10px', borderTop: '1px solid ' + tokens.border, flexShrink: 0 }}>
          <div style={{ marginBottom: '8px' }}>
            <div style={{ fontSize: '10px', color: tokens.textTertiary, marginBottom: '6px', fontWeight: '600', letterSpacing: '0.08em', paddingLeft: '4px' }}>LANGUAGE</div>
            <div style={{ display: 'flex', gap: '3px' }}>
              {(['en', 'ja', 'zh'] as Lang[]).map(l => (
                <button key={l} onClick={() => setLang(l)}
                  style={{ flex: 1, padding: '5px 0', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: '600', fontFamily: 'inherit', background: lang === l ? tokens.accent : tokens.bgHover, color: lang === l ? tokens.bg : tokens.textTertiary, transition: 'all 0.15s' }}>
                  {l === 'en' ? 'EN' : l === 'ja' ? 'JA' : 'ZH'}
                </button>
              ))}
            </div>
          </div>

          <button onClick={toggle}
            style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: '1px solid ' + tokens.border, cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit', background: 'transparent', color: tokens.textSecondary, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', transition: 'all 0.15s' }}>
            {theme === 'dark' ? icons.moon(tokens.textSecondary) : icons.sun(tokens.textSecondary)}
            <span>{theme === 'dark' ? 'Dark' : 'Light'}</span>
          </button>

          <div style={{ padding: '8px 10px', marginBottom: '6px', background: tokens.bgHover, borderRadius: '8px' }}>
            <p style={{ fontSize: '12px', fontWeight: '600', color: tokens.text, margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userEmail.split('@')[0]}</p>
            <p style={{ fontSize: '11px', color: tokens.textTertiary, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userEmail}</p>
          </div>

          <button onClick={onSignOut}
            style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit', background: 'transparent', color: tokens.danger, fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.background = tokens.dangerBg)}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            {icons.signout(tokens.danger)}
            {lang === 'ja' ? 'ログアウト' : lang === 'zh' ? '退出登录' : 'Sign out'}
          </button>
        </div>
      )}

      {collapsed && (
        <div style={{ padding: '10px 8px', borderTop: '1px solid ' + tokens.border, display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
          <button onClick={toggle}
            style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid ' + tokens.border, cursor: 'pointer', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.background = tokens.bgHover)}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            {theme === 'dark' ? icons.moon(tokens.textSecondary) : icons.sun(tokens.textSecondary)}
          </button>
          <button onClick={onSignOut}
            style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid ' + tokens.border, cursor: 'pointer', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.background = tokens.dangerBg)}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            {icons.signout(tokens.danger)}
          </button>
        </div>
      )}
    </div>
  )
}
