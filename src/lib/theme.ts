export type Theme = 'light' | 'dark'

export const themes = {
  light: {
    bg: '#F5F5F7',
    bgCard: '#FFFFFF',
    bgSidebar: '#FFFFFF',
    bgHover: '#F0F0F5',
    bgActive: '#EEF4FF',
    border: 'rgba(0,0,0,0.08)',
    borderStrong: 'rgba(0,0,0,0.14)',
    text: '#0A0A0F',
    textSecondary: '#6B6B7B',
    textTertiary: '#A0A0B0',
    accent: '#2D7EF8',
    accentHover: '#1A6AE8',
    accentBg: '#EEF4FF',
    accentText: '#1A4FA0',
    danger: '#FF3B30',
    dangerBg: '#FFF0F0',
    success: '#30D158',
    successBg: '#F0FFF4',
    navBg: 'rgba(255,255,255,0.80)',
  },
  dark: {
    bg: '#08080F',
    bgCard: '#111118',
    bgSidebar: '#0D0D16',
    bgHover: '#1A1A28',
    bgActive: '#1A2540',
    border: 'rgba(255,255,255,0.07)',
    borderStrong: 'rgba(255,255,255,0.13)',
    text: '#F0F0FA',
    textSecondary: '#8888A8',
    textTertiary: '#55556A',
    accent: '#2D7EF8',
    accentHover: '#4A8EF8',
    accentBg: '#0D1F40',
    accentText: '#7AB4FF',
    danger: '#FF453A',
    dangerBg: '#2A0F0F',
    success: '#30D158',
    successBg: '#0A2018',
    navBg: 'rgba(8,8,15,0.80)',
  }
}

export type ThemeTokens = typeof themes.light
