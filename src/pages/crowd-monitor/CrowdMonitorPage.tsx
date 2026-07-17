import { useEffect, useMemo, useState } from 'react'

import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, MetricCard } from '@/components/ui/Card'
import { BarChart, DonutChart, LineChart } from '@/components/charts/Charts'
import { InlineLoader } from '@/components/ui/LoadingState'

type CrowdSnapshot = {
  occupancy: number
  throughput: number
  waitTime: number
  alerts: number
  density: Array<{ label: string; value: number }>
  zoneStatus: Array<{ label: string; value: number; tone?: 'default' | 'success' | 'warning' }>
}

const initialSnapshot: CrowdSnapshot = {
  occupancy: 68,
  throughput: 24,
  waitTime: 9,
  alerts: 3,
  density: [
    { label: '08:00', value: 42 },
    { label: '09:00', value: 48 },
    { label: '10:00', value: 56 },
    { label: '11:00', value: 63 },
    { label: '12:00', value: 69 },
    { label: '13:00', value: 72 },
  ],
  zoneStatus: [
    { label: 'Gate A', value: 14, tone: 'success' },
    { label: 'Gate B', value: 22, tone: 'warning' },
    { label: 'Concourse', value: 18 },
    { label: 'North stand', value: 26 },
  ],
}

function getStatus(occupancy: number) {
  if (occupancy < 55) return { label: 'Stable', variant: 'success' as const }
  if (occupancy < 80) return { label: 'Busy', variant: 'warning' as const }
  return { label: 'High density', variant: 'warning' as const }
}

function shiftTrend(data: CrowdSnapshot['density'], nextValue: number) {
  const next = [...data.slice(1), { label: `${(data.length + 1).toString().padStart(2, '0')}:00`, value: nextValue }]
  return next
}

export default function CrowdMonitorPage() {
  const [snapshot, setSnapshot] = useState<CrowdSnapshot>(initialSnapshot)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setSnapshot((current) => {
        const occupancyDelta = Math.random() > 0.5 ? 2 : -2
        const throughputDelta = Math.random() > 0.5 ? 1 : -1
        const waitDelta = Math.random() > 0.5 ? 1 : -1
        const occupancy = Math.max(38, Math.min(94, current.occupancy + occupancyDelta))
        const throughput = Math.max(12, Math.min(42, current.throughput + throughputDelta))
        const waitTime = Math.max(2, Math.min(18, current.waitTime + waitDelta))
        const alerts = Math.max(0, Math.min(6, current.alerts + (Math.random() > 0.7 ? 1 : 0) - (Math.random() > 0.5 ? 1 : 0)))
        const density = shiftTrend(current.density, occupancy)

        return {
          ...current,
          occupancy,
          throughput,
          waitTime,
          alerts,
          density,
          zoneStatus: current.zoneStatus.map((zone, index) => ({
            ...zone,
            value: Math.max(8, Math.min(30, zone.value + (index % 2 === 0 ? 1 : -1) * (Math.random() > 0.5 ? 1 : 0))),
          })),
        }
      })
      setLastUpdated(new Date())
    }, 3500)

    return () => window.clearInterval(intervalId)
  }, [])

  const status = getStatus(snapshot.occupancy)

  const chartCards = useMemo(
    () => [
      { label: 'Queue pressure', value: snapshot.waitTime, tone: 'warning' as const },
      { label: 'Entry throughput', value: snapshot.throughput, tone: 'success' as const },
      { label: 'Active alerts', value: snapshot.alerts, tone: snapshot.alerts > 3 ? ('warning' as const) : ('default' as const) },
    ],
    [snapshot.alerts, snapshot.throughput, snapshot.waitTime],
  )

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge variant={status.variant}>{status.label}</Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--app-text)]">Crowd Monitor</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--app-muted)]">
            Simulated live telemetry, zone status cards, and charts for stadium occupancy monitoring.
          </p>
        </div>
        <div className="text-sm text-[var(--app-muted)]">
          Last updated <span className="font-medium text-[var(--app-text)]">{lastUpdated.toLocaleTimeString()}</span>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Occupancy" value={`${snapshot.occupancy}%`} detail="Current stadium fill rate based on simulated live data." />
        {chartCards.map((card) => (
          <MetricCard key={card.label} label={card.label} value={card.value} detail="Updated every few seconds." tone={card.tone} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Occupancy trend</CardTitle>
            <CardDescription>Time-series trend using simulated live crowd density.</CardDescription>
          </CardHeader>
          <CardContent>
            <LineChart data={snapshot.density} ariaLabel="Crowd occupancy trend chart" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status overview</CardTitle>
            <CardDescription>Live snapshot of current crowd conditions.</CardDescription>
          </CardHeader>
          <CardContent>
            <DonutChart
              ariaLabel="Crowd distribution chart"
              centerLabel="Occupancy"
              centerValue={`${snapshot.occupancy}%`}
              segments={[
                { label: 'Active', value: snapshot.occupancy, color: '#0f766e' },
                { label: 'Spare', value: 100 - snapshot.occupancy, color: '#cbd5e1' },
              ]}
            />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Crowd cards</CardTitle>
            <CardDescription>Summary cards for the main operational zones.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {snapshot.zoneStatus.map((zone, index) => (
              <div key={zone.label} className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-solid)] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[var(--app-text)]">{zone.label}</p>
                  <Badge variant={index % 3 === 0 ? 'success' : index % 3 === 1 ? 'warning' : 'outline'}>
                    {index % 3 === 0 ? 'Clear' : index % 3 === 1 ? 'Busy' : 'Monitoring'}
                  </Badge>
                </div>
                <p className="mt-3 text-2xl font-semibold text-[var(--app-text)]">{zone.value}</p>
                <div className="mt-2 h-2 rounded-full bg-black/5 dark:bg-white/10">
                  <div className="h-2 rounded-full bg-[var(--app-accent)]" style={{ width: `${Math.max(20, zone.value * 3)}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Zone pressure chart</CardTitle>
            <CardDescription>Active status indicators showing relative crowd pressure by zone.</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart ariaLabel="Crowd pressure bar chart" data={snapshot.zoneStatus} />
            <div className="mt-4 flex items-center gap-3 text-sm text-[var(--app-muted)]">
              <InlineLoader label="Refreshing live crowd data" />
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
