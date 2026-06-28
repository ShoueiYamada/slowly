export type Theme = 'light' | 'dark'

export const themes = {
  light: {
    bg: '#F7F8FA',
    bgCard: '#FFFFFF',
    bgSidebar: '#FFFFFF',
    bgHover: '#F0F2F5',
    bgActive: '#EEF4FF',
    border: 'rgba(0,0,0,0.06)',
    borderStrong: 'rgba(0,0,0,0.10)',
    text: '#0A0A0F',
    textSecondary: '#5A5A72',
    textTertiary: '#9898B0',
    accent: '#2D7EF8',
    accentHover: '#1A6AE8',
    accentBg: '#EEF4FF',
    accentText: '#1A4FA0',
    danger: '#E5383B',
    dangerBg: '#FFF0F0',
    success: '#28A745',
    successBg: '#F0FFF4',
    navBg: 'rgba(255,255,255,0.85)',
  },
  dark: {
    bg: '#060a0f',
    bgCard: '#0c1118',
    bgSidebar: '#080d14',
    bgHover: '#111822',
    bgActive: '#0d1f35',
    border: 'rgba(56,189,248,0.08)',
    borderStrong: 'rgba(56,189,248,0.15)',
    text: '#eef2ff',
    textSecondary: '#7888a8',
    textTertiary: '#445568',
    accent: '#38BDF8',
    accentHover: '#7DD3FC',
    accentBg: '#0a1628',
    accentText: '#7DD3FC',
    danger: '#F87171',
    dangerBg: '#1a0a0a',
    success: '#34D399',
    successBg: '#0a1a12',
    navBg: 'rgba(6,10,15,0.85)',
  }
}

export type ThemeTokens = typeof themes.light
