import type { ReactNode } from 'react'

import { AppErrorBoundary } from '@/errors/AppErrorBoundary'
import { useGlobalErrorHandlers } from '@/hooks/useGlobalErrorHandlers'
import { ThemeProvider } from '@/context/theme/ThemeProvider'
import { PreferencesProvider } from '@/context/preferences/PreferencesProvider'

function GlobalErrorBridge() {
  useGlobalErrorHandlers()
  return null
}

type AppProvidersProps = {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <PreferencesProvider>
        <AppErrorBoundary>
          <GlobalErrorBridge />
          {children}
        </AppErrorBoundary>
      </PreferencesProvider>
    </ThemeProvider>
  )
}
