import type { ReactNode } from 'react'
import { useEffect, useMemo } from 'react'

import { useLocalStorage } from '@/hooks/useLocalStorage'
import { PreferencesContext, type AppLanguage, type PreferencesState, type TextSize } from '@/context/preferences/PreferencesContext'

const defaultState: PreferencesState = {
  language: 'en',
  reducedMotion: false,
  highContrast: false,
  textSize: 'normal',
}

function applyDocumentPreferences(state: PreferencesState) {
  const root = document.documentElement
  root.lang = state.language
  root.dataset.motion = state.reducedMotion ? 'reduced' : 'full'
  root.dataset.contrast = state.highContrast ? 'high' : 'normal'
  root.dataset.textSize = state.textSize
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useLocalStorage<PreferencesState>(
    'stadiumpilot.preferences',
    defaultState,
    (value) => {
      try {
        const parsed = JSON.parse(value) as Partial<PreferencesState>
        return {
          language: parsed.language === 'en' || parsed.language === 'es' || parsed.language === 'fr' || parsed.language === 'ar' ? parsed.language : 'en',
          reducedMotion: typeof parsed.reducedMotion === 'boolean' ? parsed.reducedMotion : false,
          highContrast: typeof parsed.highContrast === 'boolean' ? parsed.highContrast : false,
          textSize: parsed.textSize === 'large' ? 'large' : 'normal',
        }
      } catch {
        return defaultState
      }
    },
  )

  useEffect(() => {
    applyDocumentPreferences(preferences)
  }, [preferences])

  const value = useMemo(
    () => ({
      ...preferences,
      setLanguage: (language: AppLanguage) => setPreferences((current) => ({ ...current, language })),
      setReducedMotion: (reducedMotion: boolean) =>
        setPreferences((current) => ({ ...current, reducedMotion })),
      setHighContrast: (highContrast: boolean) =>
        setPreferences((current) => ({ ...current, highContrast })),
      setTextSize: (textSize: TextSize) => setPreferences((current) => ({ ...current, textSize })),
      updatePreferences: (nextState: Partial<PreferencesState>) =>
        setPreferences((current) => ({ ...current, ...nextState })),
    }),
    [preferences, setPreferences],
  )

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}
