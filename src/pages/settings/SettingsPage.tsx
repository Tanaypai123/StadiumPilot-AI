import { useMemo } from 'react'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { SelectField } from '@/components/ui/Field'
import { Switch } from '@/components/ui/Switch'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { appEnvironment } from '@/config/env'
import { usePreferences } from '@/hooks/usePreferences'

export default function SettingsPage() {
  const {
    language,
    reducedMotion,
    highContrast,
    textSize,
    setLanguage,
    setReducedMotion,
    setHighContrast,
    setTextSize,
  } = usePreferences()

  const languageOptions = useMemo(
    () => [
      { value: 'en', label: 'English' },
      { value: 'es', label: 'Spanish' },
      { value: 'fr', label: 'French' },
      { value: 'ar', label: 'Arabic' },
    ],
    [],
  )

  return (
    <div className="space-y-6">
      <div>
        <Badge>Settings</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--app-text)]">
          Settings
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--app-muted)]">
          Theme, language, and accessibility options are controlled locally with safe dummy state.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Theme</CardTitle>
            <CardDescription>Switch between light, dark, and system modes.</CardDescription>
          </CardHeader>
          <CardContent>
            <ThemeToggle />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Language</CardTitle>
            <CardDescription>Dummy language preference for the frontend shell.</CardDescription>
          </CardHeader>
          <CardContent>
            <SelectField
              id="language"
              label="Interface language"
              description="Choose the preferred UI language."
              value={language}
              onChange={(value) => setLanguage(value as typeof language)}
              options={languageOptions}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Accessibility options</CardTitle>
            <CardDescription>Store preferences locally to support clearer, calmer interactions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Switch
              checked={reducedMotion}
              onChange={setReducedMotion}
              label="Reduced motion"
              description="Limit transitions and animations where possible."
            />
            <Switch
              checked={highContrast}
              onChange={setHighContrast}
              label="High contrast"
              description="Boost contrast and sharpen visible surfaces."
            />
            <Switch
              checked={textSize === 'large'}
              onChange={(value) => setTextSize(value ? 'large' : 'normal')}
              label="Larger text"
              description="Increase the global text size for readability."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Environment</CardTitle>
            <CardDescription>Typed runtime values remain safely isolated from the UI.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-6 text-[var(--app-muted)]">
            <p>Mode: {appEnvironment.appMode}</p>
            <p>Version: {appEnvironment.appVersion}</p>
            <p>API base URL: {appEnvironment.apiBaseUrl}</p>
            <p>Mock mode: {appEnvironment.enableMocks ? 'Enabled' : 'Disabled'}</p>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setLanguage('en')
                setReducedMotion(false)
                setHighContrast(false)
                setTextSize('normal')
              }}
            >
              Reset preferences
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
