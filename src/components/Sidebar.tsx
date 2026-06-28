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

export default function Sidebar({ userEmail, onSignOut, collapsed, setCollapsed }: Props) {
  const { tokens, theme, toggle } = useTheme()
  const { lang, setLang } = useLang()
  const router = useRouter()
  const pathname = usePathname()

  const nav = [
    { href: '/dashboard', icon: '⊞', label: lang === 'ja' ? 'ダッシュボード' : lang === 'zh' ? '工作台' : 'Dashboard' },
    { href: '/clients', icon: '◈', label: lang === 'ja' ? 'クライアント' : lang === 'zh' ? '客户' : 'Clients' },
    { href: '/invoice', icon: '◻', label: lang === 'ja' ? '請求書' : lang === 'zh' ? '发票' : 'Invoices' },
    { href: '/reminders', icon: '◎', label: lang === 'ja' ? 'AI督促' : lang === 'zh' ? 'AI催款' : 'AI Reminders', badge: 'AI' },
    { href: '/pomodoro', icon: '⏱', label: lang === 'ja' ? 'ポモドーロ' : lang === 'zh' ? '番茄钟' : 'Pomodoro', badge: 'NEW' },
    { href: '/goal', icon: '◉', label: lang === 'ja' ? '目標収益' : lang === 'zh' ? '收益目标' : 'Revenue Goal', badge: 'NEW' },
  ]

  const isActive = (href: string) => pathname === href
  const w = collapsed ? '64px' : '240px'

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
  `

  return (
    <div style={{ width: w, minHeight: '100vh', background: tokens.bgSidebar, borderRight: '1px solid ' + tokens.border, display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 20, transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1)', overflow: 'hidden' }}>
      <style>{animStyle}</style>

      <div style={{ padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', borderBottom: '1px solid ' + tokens.border, height: '64px' }}>
        {!collapsed && (
          <>
            <span className="logo-anim" style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.8px', whiteSpace: 'nowrap' }}>Flowly</span>
            <button onClick={() => setCollapsed(true)}
              style={{ background: tokens.bgHover, border: 'none', borderRadius: '8px', cursor: 'pointer', color: tokens.textSecondary, fontSize: '16px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'inherit' }}>
              ‹
            </button>
          </>
        )}
        {collapsed && (
          <button onClick={() => setCollapsed(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0' }}>
            <span className="logo-anim" style={{ fontSize: '22px', fontWeight: '800' }}>F</span>
          </button>
        )}
      </div>

      <div style={{ padding: collapsed ? '12px 8px' : '12px 10px', flex: 1, overflowY: 'auto' }}>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {nav.map(item => (
            <button key={item.href} onClick={() => router.push(item.href)}
              title={collapsed ? item.label : ''}
              style={{ display: 'flex', alignItems: 'center', gap: collapsed ? '0' : '10px', padding: collapsed ? '10px 0' : '9px 12px', justifyContent: collapsed ? 'center' : 'flex-start', borderRadius: '10px', border: 'none', cursor: 'pointer', width: '100%', background: isActive(item.href) ? tokens.bgActive : 'transparent', color: isActive(item.href) ? tokens.accent : tokens.textSecondary, fontSize: '14px', fontWeight: isActive(item.href) ? '600' : '400', fontFamily: 'inherit', transition: 'all 0.15s', whiteSpace: 'nowrap' }}
              onMouseEnter={e => { if (!isActive(item.href)) (e.currentTarget as HTMLElement).style.background = tokens.bgHover }}
              onMouseLeave={e => { if (!isActive(item.href)) (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
              <span style={{ fontSize: '18px', flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                  {item.label}
                  {item.badge && (
                    <span style={{ fontSize: '9px', padding: '2px 6px', background: item.badge === 'AI' ? tokens.accent : tokens.successBg, color: item.badge === 'AI' ? '#fff' : tokens.success, borderRadius: '20px', fontWeight: '700' }}>{item.badge}</span>
                  )}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {!collapsed && (
        <div style={{ padding: '12px 10px', borderTop: '1px solid ' + tokens.border }}>
          <div style={{ marginBottom: '10px' }}>
            <p style={{ fontSize: '10px', color: tokens.textTertiary, marginBottom: '6px', fontWeight: '600', letterSpacing: '0.06em', paddingLeft: '4px' }}>LANGUAGE</p>
            <div style={{ display: 'flex', gap: '4px' }}>
              {(['en', 'ja', 'zh'] as Lang[]).map(l => (
                <button key={l} onClick={() => setLang(l)}
                  style={{ flex: 1, padding: '5px 0', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: '600', fontFamily: 'inherit', background: lang === l ? tokens.accent : tokens.bgHover, color: lang === l ? '#fff' : tokens.textSecondary }}>
                  {l === 'en' ? 'EN' : l === 'ja' ? 'JA' : 'ZH'}
                </button>
              ))}
            </div>
          </div>
          <button onClick={toggle}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1px solid ' + tokens.border, cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit', background: tokens.bgHover, color: tokens.textSecondary, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span>{theme === 'dark' ? '◐ Dark' : '○ Light'}</span>
            <span style={{ fontSize: '10px', opacity: 0.5 }}>toggle</span>
          </button>
          <div style={{ background: tokens.bgHover, borderRadius: '12px', padding: '10px 12px', marginBottom: '8px' }}>
            <p style={{ fontSize: '12px', fontWeight: '600', color: tokens.text, margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userEmail.split('@')[0]}</p>
            <p style={{ fontSize: '11px', color: tokens.textTertiary, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userEmail}</p>
          </div>
          <button onClick={onSignOut}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1px solid ' + tokens.border, cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit', background: 'transparent', color: tokens.danger, fontWeight: '500' }}>
            {lang === 'ja' ? 'ログアウト' : lang === 'zh' ? '退出登录' : 'Sign out'}
          </button>
        </div>
      )}

      {collapsed && (
        <div style={{ padding: '12px 8px', borderTop: '1px solid ' + tokens.border, display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
          <button onClick={toggle}
            style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid ' + tokens.border, cursor: 'pointer', background: tokens.bgHover, color: tokens.textSecondary, fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {theme === 'dark' ? '○' : '◐'}
          </button>
          <button onClick={onSignOut}
            style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid ' + tokens.border, cursor: 'pointer', background: tokens.dangerBg, color: tokens.danger, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ⏏
          </button>
        </div>
      )}
    </div>
  )
}
