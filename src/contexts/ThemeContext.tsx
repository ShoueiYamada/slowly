'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { Theme, ThemeTokens, themes } from '@/lib/theme'

type ThemeCtx = { theme: Theme; tokens: ThemeTokens; toggle: () => void }
const ThemeContext = createContext<ThemeCtx>({ theme: 'light', tokens: themes.light, toggle: () => {} })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    const saved = localStorage.getItem('flowly-theme') as Theme
    if (saved) setTheme(saved)
  }, [])

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('flowly-theme', next)
  }

  return (
    <ThemeContext.Provider value={{ theme, tokens: themes[theme], toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
