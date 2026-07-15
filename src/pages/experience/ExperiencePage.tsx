import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, MetricCard } from '@/components/ui/Card'

export default function ExperiencePage() {
  return (
    <div className="space-y-6">
      <div>
        <Badge>Experience</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--app-text)]">
          Tournament experience foundation
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--app-muted)]">
          This route is reserved for visitor guidance, accessibility, and fan-experience flows.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Wayfinding"
          value="Planned"
          detail="Structure reserved for navigation and venue guidance surfaces."
        />
        <MetricCard
          label="Accessibility"
          value="Planned"
          detail="Structure reserved for accessible journey support and assistive tools."
        />
        <MetricCard
          label="Engagement"
          value="Planned"
          detail="Structure reserved for live fan interaction surfaces."
        />
        <MetricCard
          label="Feedback"
          value="Planned"
          detail="Structure reserved for surveys, satisfaction, and service recovery."
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Future-friendly page shell</CardTitle>
          <CardDescription>
            The layout is intentionally simple so experience modules can expand without reworking navigation or theming.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-solid)] p-5 text-sm leading-6 text-[var(--app-muted)]">
            Accessible semantics and keyboard-friendly controls are already established at the shell level.
          </div>
          <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-solid)] p-5 text-sm leading-6 text-[var(--app-muted)]">
            Future UI blocks can rely on the shared Button, Card, Badge, and loading components.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
