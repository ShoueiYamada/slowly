'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { Lang } from '@/lib/i18n'

type LangCtx = { lang: Lang; setLang: (l: Lang) => void }
const LangContext = createContext<LangCtx>({ lang: 'en', setLang: () => {} })

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    const saved = localStorage.getItem('flowly-lang') as Lang
    if (saved && ['en', 'ja'].includes(saved)) setLangState(saved)
  }, [])

  function setLang(l: Lang) {
    setLangState(l)
    localStorage.setItem('flowly-lang', l)
  }

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>
}

export const useLang = () => useContext(LangContext)
