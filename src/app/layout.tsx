import type { Metadata } from 'next'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { LangProvider } from '@/contexts/LangContext'

export const metadata: Metadata = {
  title: 'Flowly — Time Tracking & Invoicing',
  description: 'Professional time tracking and invoicing for freelancers worldwide',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "SF Pro Display", sans-serif', background: '#060a0f' }}>
        <ThemeProvider>
          <LangProvider>{children}</LangProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
