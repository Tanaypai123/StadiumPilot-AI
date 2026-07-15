import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, MetricCard } from '@/components/ui/Card'
import { BarChart, DonutChart, LineChart } from '@/components/charts/Charts'
import { APP_DESCRIPTION, APP_NAME } from '@/constants/app'
import { APP_ROUTES } from '@/constants/routes'

const trendData = [
  { label: '08:00', value: 42 },
  { label: '09:00', value: 49 },
  { label: '10:00', value: 58 },
  { label: '11:00', value: 66 },
  { label: '12:00', value: 72 },
  { label: '13:00', value: 68 },
]

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(22rem,0.9fr)]">
        <Card className="overflow-hidden">
          <CardHeader>
            <Badge>Production foundation</Badge>
            <CardTitle className="text-3xl sm:text-4xl">{APP_NAME}</CardTitle>
            <CardDescription className="max-w-2xl text-base">
              {APP_DESCRIPTION} This frontend phase focuses on a fully accessible, dummy-data-driven stadium operations interface.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-solid)] p-4">
              <p className="text-sm font-medium text-[var(--app-muted)]">Current scope</p>
              <p className="mt-2 text-base font-semibold text-[var(--app-text)]">Frontend only. No AI API integration yet.</p>
            </div>
            <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-solid)] p-4">
              <p className="text-sm font-medium text-[var(--app-muted)]">Architecture</p>
              <p className="mt-2 text-base font-semibold text-[var(--app-text)]">Routes, state, layout, and reusable components are ready.</p>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-[var(--app-muted)]">Responsive, keyboard accessible, and built for future feature slices.</p>
            <Link
              to={APP_ROUTES.crowdMonitor}
              className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-4 text-sm font-medium text-[var(--app-text)] transition-colors hover:bg-[var(--app-accent-soft)]"
            >
              Open live dashboard
            </Link>
          </CardFooter>
        </Card>

        <Card className="space-y-4">
          <CardHeader>
            <CardTitle>Foundation metrics</CardTitle>
            <CardDescription>Dummy coverage of the core frontend surfaces.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-6 text-[var(--app-muted)]">
            <p>5 user-facing routes plus the dashboard shell.</p>
            <p>Shared chart, form, switch, and chat UI primitives.</p>
            <p>Theme, language, and accessibility preferences persisted locally.</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Pages" value="6" detail="Dashboard, crowd monitor, navigation, incidents, assistant, and settings." />
        <MetricCard label="Live data" value="Dummy" detail="Crowd monitor updates periodically with local simulated data." tone="success" />
        <MetricCard label="Charts" value="3" detail="Trend, bar, and donut visualizations are reusable across the app." tone="warning" />
        <MetricCard label="Accessibility" value="On" detail="Keyboard support, focus states, and semantic controls are prioritized." />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Crowd trend preview</CardTitle>
            <CardDescription>Example occupancy trend that the live crowd monitor page builds on.</CardDescription>
          </CardHeader>
          <CardContent>
            <LineChart data={trendData} ariaLabel="Occupancy trend preview" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Zone mix</CardTitle>
            <CardDescription>Dummy stadium distribution by zone.</CardDescription>
          </CardHeader>
          <CardContent>
            <DonutChart
              ariaLabel="Stadium zone mix preview"
              centerLabel="Capacity"
              centerValue="72%"
              segments={[
                { label: 'Lower bowl', value: 38, color: '#0f766e' },
                { label: 'Upper bowl', value: 22, color: '#0284c7' },
                { label: 'Concourses', value: 12, color: '#f59e0b' },
              ]}
            />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Live widgets</CardTitle>
            <CardDescription>Predictable dummy data blocks for future integrations.</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              ariaLabel="Dashboard support chart"
              data={[
                { label: 'Queue', value: 16, tone: 'warning' },
                { label: 'Staff', value: 24, tone: 'success' },
                { label: 'Transit', value: 18 },
                { label: 'Fan help', value: 28 },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Next routes</CardTitle>
            <CardDescription>Jump directly into the feature surfaces.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Link className="rounded-2xl border border-[var(--app-border)] p-4 transition-colors hover:bg-[var(--app-accent-soft)]" to={APP_ROUTES.crowdMonitor}>
              <span className="text-sm font-semibold text-[var(--app-text)]">Crowd Monitor</span>
              <span className="mt-1 block text-sm text-[var(--app-muted)]">Occupancy, status, charts</span>
            </Link>
            <Link className="rounded-2xl border border-[var(--app-border)] p-4 transition-colors hover:bg-[var(--app-accent-soft)]" to={APP_ROUTES.smartNavigation}>
              <span className="text-sm font-semibold text-[var(--app-text)]">Smart Navigation</span>
              <span className="mt-1 block text-sm text-[var(--app-muted)]">Map, routes, destinations</span>
            </Link>
            <Link className="rounded-2xl border border-[var(--app-border)] p-4 transition-colors hover:bg-[var(--app-accent-soft)]" to={APP_ROUTES.incidentReporter}>
              <span className="text-sm font-semibold text-[var(--app-text)]">Incident Reporter</span>
              <span className="mt-1 block text-sm text-[var(--app-muted)]">Validated form and tracking</span>
            </Link>
            <Link className="rounded-2xl border border-[var(--app-border)] p-4 transition-colors hover:bg-[var(--app-accent-soft)]" to={APP_ROUTES.aiAssistant}>
              <span className="text-sm font-semibold text-[var(--app-text)]">AI Assistant</span>
              <span className="mt-1 block text-sm text-[var(--app-muted)]">Chat UI with suggestions</span>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
