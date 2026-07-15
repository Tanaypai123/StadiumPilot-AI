import { useMemo, useState } from 'react'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { FieldDescription, FieldLabel, SelectField, TextAreaField, TextField } from '@/components/ui/Field'

type IncidentPriority = 'low' | 'medium' | 'high' | 'critical'
type IncidentCategory = 'crowd' | 'security' | 'medical' | 'accessibility' | 'operations'
type IncidentStatus = 'draft' | 'submitted' | 'triaged' | 'resolved'

type IncidentReport = {
  id: string
  title: string
  location: string
  priority: IncidentPriority
  category: IncidentCategory
  description: string
  status: IncidentStatus
}

const priorityOptions: Array<{ value: IncidentPriority; label: string }> = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
]

const categoryOptions: Array<{ value: IncidentCategory; label: string }> = [
  { value: 'crowd', label: 'Crowd' },
  { value: 'security', label: 'Security' },
  { value: 'medical', label: 'Medical' },
  { value: 'accessibility', label: 'Accessibility' },
  { value: 'operations', label: 'Operations' },
]

const statusLabels: Record<IncidentStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  triaged: 'Triaged',
  resolved: 'Resolved',
}

const statusTone: Record<IncidentStatus, 'default' | 'success' | 'warning' | 'outline'> = {
  draft: 'outline',
  submitted: 'default',
  triaged: 'warning',
  resolved: 'success',
}

const initialReports: IncidentReport[] = [
  {
    id: 'INC-204',
    title: 'Queue congestion at Gate B',
    location: 'North entrance',
    priority: 'high',
    category: 'crowd',
    description: 'A longer-than-usual queue is forming near screening lanes.',
    status: 'triaged',
  },
  {
    id: 'INC-205',
    title: 'Wheelchair route blocked',
    location: 'South concourse',
    priority: 'critical',
    category: 'accessibility',
    description: 'Temporary barrier needs immediate adjustment for accessible access.',
    status: 'submitted',
  },
]

const initialForm = {
  title: '',
  location: '',
  description: '',
  priority: 'medium' as IncidentPriority,
  category: 'operations' as IncidentCategory,
}

const initialErrors = {
  title: '',
  location: '',
  description: '',
}

function validateForm(values: typeof initialForm) {
  return {
    title: values.title.trim() ? '' : 'Title is required.',
    location: values.location.trim() ? '' : 'Location is required.',
    description: values.description.trim().length >= 12 ? '' : 'Describe the incident in at least 12 characters.',
  }
}

export default function IncidentReporterPage() {
  const [form, setForm] = useState(initialForm)
  const [reports, setReports] = useState(initialReports)
  const [errors, setErrors] = useState(initialErrors)
  const [focusPriority, setFocusPriority] = useState<IncidentPriority>('medium')

  const currentStatus = useMemo(() => {
    if (!reports.length) {
      return 'No incidents yet'
    }

    return `${reports.filter((report) => report.status !== 'resolved').length} open incidents`
  }, [reports])

  const submitReport = () => {
    const nextErrors = validateForm(form)
    setErrors(nextErrors)

    const hasError = Object.values(nextErrors).some(Boolean)
    if (hasError) {
      return
    }

    setReports((currentReports) => [
      {
        id: `INC-${String(currentReports.length + 206).padStart(3, '0')}`,
        ...form,
        status: 'submitted',
      },
      ...currentReports,
    ])
    setForm(initialForm)
    setFocusPriority('medium')
    setErrors(initialErrors)
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge>Reporting</Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--app-text)]">Incident Reporter</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--app-muted)]">
            Keyboard-friendly form controls, validation, priority selection, category selection, and status tracking.
          </p>
        </div>
        <Badge variant="outline">{currentStatus}</Badge>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(22rem,0.9fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Incident form</CardTitle>
            <CardDescription>Report operational issues using dummy form state only.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <TextField
              id="incident-title"
              label="Incident title"
              description="A concise summary of the issue."
              value={form.title}
              onChange={(value) => setForm((current) => ({ ...current, title: value }))}
              error={errors.title}
              placeholder="Crowd congestion near Gate B"
            />

            <TextField
              id="incident-location"
              label="Location"
              description="Where the issue is happening."
              value={form.location}
              onChange={(value) => setForm((current) => ({ ...current, location: value }))}
              error={errors.location}
              placeholder="North entrance"
            />

            <TextAreaField
              id="incident-description"
              label="Description"
              description="Provide enough detail for triage and escalation."
              value={form.description}
              onChange={(value) => setForm((current) => ({ ...current, description: value }))}
              error={errors.description}
              placeholder="Describe the incident, impact, and immediate needs."
            />

            <div>
              <FieldLabel htmlFor="priority-group" label="Priority selection" />
              <FieldDescription>Choose the severity of the issue.</FieldDescription>
              <div id="priority-group" className="mt-3 grid gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Incident priority">
                {priorityOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={focusPriority === option.value}
                    onClick={() => {
                      setForm((current) => ({ ...current, priority: option.value }))
                      setFocusPriority(option.value)
                    }}
                    className={`rounded-2xl border px-4 py-3 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-accent)] ${
                      focusPriority === option.value
                        ? 'border-[var(--app-accent)] bg-[var(--app-accent-soft)] text-[var(--app-accent-strong)]'
                        : 'border-[var(--app-border)] bg-[var(--app-surface-solid)] text-[var(--app-text)] hover:bg-[var(--app-accent-soft)]'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <SelectField
              id="incident-category"
              label="Category selection"
              description="Route the issue into the right response bucket."
              value={form.category}
              onChange={(value) => setForm((current) => ({ ...current, category: value as IncidentCategory }))}
              options={categoryOptions}
            />

            <div className="flex flex-wrap gap-3">
              <Button onClick={submitReport}>Submit incident</Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setForm(initialForm)
                  setErrors(initialErrors)
                  setFocusPriority('medium')
                }}
              >
                Reset form
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status tracking</CardTitle>
            <CardDescription>Track submitted incidents through the response pipeline.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {reports.map((report) => (
              <div key={report.id} className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-solid)] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[var(--app-text)]">{report.title}</p>
                    <p className="mt-1 text-sm text-[var(--app-muted)]">{report.location}</p>
                  </div>
                  <Badge variant={statusTone[report.status]}>{statusLabels[report.status]}</Badge>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-[var(--app-muted)]">
                  <div>
                    <span className="block text-xs uppercase tracking-[0.16em]">Priority</span>
                    <span className="font-medium text-[var(--app-text)]">{report.priority}</span>
                  </div>
                  <div>
                    <span className="block text-xs uppercase tracking-[0.16em]">Category</span>
                    <span className="font-medium text-[var(--app-text)]">{report.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
