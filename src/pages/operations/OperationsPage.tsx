import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, MetricCard } from '@/components/ui/Card'

export default function OperationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <Badge>Operations</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--app-text)]">
          Stadium operations foundation
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--app-muted)]">
          This route is reserved for staffing, logistics, venue coordination, and incident-management surfaces.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Access control"
          value="Planned"
          detail="Structure reserved for entry, security, and queue management data."
        />
        <MetricCard
          label="Venue flow"
          value="Planned"
          detail="Structure reserved for crowd and mobility coordination surfaces."
        />
        <MetricCard
          label="Staffing"
          value="Planned"
          detail="Structure reserved for task assignment and scheduling surfaces."
        />
        <MetricCard
          label="Alerts"
          value="Planned"
          detail="Structure reserved for incident and escalation handling."
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Architecture placeholder</CardTitle>
          <CardDescription>
            Components in this section will consume the service layer without coupling to future AI work.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-solid)] p-5 text-sm leading-6 text-[var(--app-muted)]">
            The page layout is responsive and ready for table, chart, or form modules.
          </div>
          <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-solid)] p-5 text-sm leading-6 text-[var(--app-muted)]">
            Future data-fetching hooks can be introduced behind the existing API service abstraction.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
