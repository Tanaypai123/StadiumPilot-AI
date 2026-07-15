import { useMemo, useState } from 'react'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { StadiumMap, type StadiumZone } from '@/components/stadium/StadiumMap'

type RouteOption = {
  id: string
  name: string
  eta: string
  crowdLevel: 'Low' | 'Medium' | 'High'
  accessible: boolean
  description: string
}

const routes: RouteOption[] = [
  {
    id: 'gate-a',
    name: 'Gate A to Lower Bowl',
    eta: '4 min',
    crowdLevel: 'Low',
    accessible: true,
    description: 'Best for shorter lines and direct lower-bowl access.',
  },
  {
    id: 'concourse',
    name: 'Main Concourse Route',
    eta: '6 min',
    crowdLevel: 'Medium',
    accessible: true,
    description: 'Balanced route with moderate crowd pressure.',
  },
  {
    id: 'north',
    name: 'North Stand Corridor',
    eta: '8 min',
    crowdLevel: 'High',
    accessible: false,
    description: 'Longer but useful when east-side access is restricted.',
  },
]

const destinations = [
  { id: 'tickets', label: 'Ticketing', eta: '3 min', note: 'Near Gate A', status: 'Recommended' },
  { id: 'food', label: 'Food Court', eta: '5 min', note: 'Upper concourse', status: 'Busy' },
  { id: 'medical', label: 'Medical Point', eta: '4 min', note: 'South stand', status: 'Accessible' },
  { id: 'fan-zone', label: 'Fan Zone', eta: '7 min', note: 'Outside plaza', status: 'Popular' },
]

const zones: StadiumZone[] = [
  { id: 'north', label: 'North', status: 'busy' },
  { id: 'east', label: 'East', status: 'clear' },
  { id: 'south', label: 'South', status: 'crowded' },
  { id: 'west', label: 'West', status: 'busy' },
]

export default function SmartNavigationPage() {
  const [selectedRoute, setSelectedRoute] = useState<RouteOption>(routes[0])
  const selectedDestination = useMemo(() => destinations.find((destination) => destination.id === 'medical') ?? destinations[0], [])

  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)]">
        <Card>
          <CardHeader>
            <Badge>Navigation</Badge>
            <CardTitle className="text-3xl">Smart Navigation</CardTitle>
            <CardDescription>
              Stadium map, route selection, and destination cards with dummy route intelligence.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StadiumMap zones={zones} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Selected route</CardTitle>
            <CardDescription>Current route selection with accessibility and crowd details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-solid)] p-4">
              <p className="text-sm font-semibold text-[var(--app-text)]">{selectedRoute.name}</p>
              <p className="mt-1 text-sm leading-6 text-[var(--app-muted)]">{selectedRoute.description}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant={selectedRoute.crowdLevel === 'Low' ? 'success' : selectedRoute.crowdLevel === 'Medium' ? 'warning' : 'outline'}>
                  Crowd: {selectedRoute.crowdLevel}
                </Badge>
                <Badge variant={selectedRoute.accessible ? 'success' : 'outline'}>
                  {selectedRoute.accessible ? 'Accessible' : 'Limited access'}
                </Badge>
                <Badge>{selectedRoute.eta}</Badge>
              </div>
            </div>

            <div className="grid gap-2">
              {routes.map((route) => (
                <Button
                  key={route.id}
                  variant={selectedRoute.id === route.id ? 'primary' : 'secondary'}
                  className="justify-start rounded-2xl px-4 py-3"
                  onClick={() => setSelectedRoute(route)}
                  aria-pressed={selectedRoute.id === route.id}
                >
                  <span className="flex w-full items-center justify-between gap-3 text-left">
                    <span>
                      <span className="block text-sm font-semibold">{route.name}</span>
                      <span className="mt-1 block text-xs font-normal opacity-90">{route.description}</span>
                    </span>
                    <span className="text-xs font-semibold">{route.eta}</span>
                  </span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {destinations.map((destination) => (
          <Card key={destination.id} className={destination.id === selectedDestination.id ? 'ring-2 ring-[var(--app-accent)]' : ''}>
            <CardHeader>
              <CardTitle>{destination.label}</CardTitle>
              <CardDescription>{destination.note}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-[var(--app-muted)]">ETA</span>
                <span className="font-semibold text-[var(--app-text)]">{destination.eta}</span>
              </div>
              <Badge variant={destination.status === 'Accessible' ? 'success' : destination.status === 'Busy' ? 'warning' : 'default'}>
                {destination.status}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  )
}
