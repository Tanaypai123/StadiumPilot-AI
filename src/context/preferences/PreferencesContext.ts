import { createContext } from 'react'

export type AppLanguage = 'en' | 'es' | 'fr' | 'ar'
export type TextSize = 'normal' | 'large'

export type PreferencesState = {
  language: AppLanguage
  reducedMotion: boolean
  highContrast: boolean
  textSize: TextSize
}

export type PreferencesContextValue = PreferencesState & {
  setLanguage: (language: AppLanguage) => void
  setReducedMotion: (value: boolean) => void
  setHighContrast: (value: boolean) => void
  setTextSize: (value: TextSize) => void
  updatePreferences: (nextState: Partial<PreferencesState>) => void
}

export const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined)
