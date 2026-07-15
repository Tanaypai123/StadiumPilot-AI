import type { ReactNode } from 'react'
import { useEffect, useMemo } from 'react'

import { APP_STORAGE_KEYS } from '@/constants/app'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import {
  ThemeContext,
  type ResolvedTheme,
  type ThemeContextValue,
  type ThemeMode,
} from '@/context/theme/ThemeContext'

function resolveTheme(theme: ThemeMode, prefersDark: boolean): ResolvedTheme {
  if (theme === 'system') {
    return prefersDark ? 'dark' : 'light'
  }

  return theme
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')
  const [theme, setTheme] = useLocalStorage<ThemeMode>(
    APP_STORAGE_KEYS.theme,
    'system',
    (value) => {
      if (value === 'light' || value === 'dark' || value === 'system') {
        return value
      }

      return 'system'
    },
  )

  const resolvedTheme = resolveTheme(theme, prefersDark)

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme
  }, [resolvedTheme])

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      toggleTheme: () => {
        setTheme((currentTheme) =>
          currentTheme === 'dark' ? 'light' : currentTheme === 'light' ? 'system' : 'dark',
        )
      },
    }),
    [resolvedTheme, setTheme, theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
