import { cn } from '@/lib/cn'

export type StadiumZone = {
  id: string
  label: string
  status: 'clear' | 'busy' | 'crowded'
}

const zoneClasses: Record<StadiumZone['status'], string> = {
  clear: 'fill-emerald-400/30 stroke-emerald-500',
  busy: 'fill-amber-400/30 stroke-amber-500',
  crowded: 'fill-rose-400/30 stroke-rose-500',
}

export function StadiumMap({ zones }: { zones: StadiumZone[] }) {
  return (
    <div className="rounded-[var(--app-radius)] border border-[var(--app-border)] bg-[var(--app-surface-solid)] p-4">
      <svg viewBox="0 0 480 320" className="h-72 w-full" role="img" aria-label="Stadium map with selectable zones">
        <rect x="24" y="24" width="432" height="272" rx="32" className="fill-transparent stroke-current text-[var(--app-border)]" strokeWidth="2" />
        <circle cx="240" cy="160" r="56" fill="none" className="stroke-current text-[var(--app-border)]" strokeWidth="2" />
        <rect x="70" y="62" width="124" height="86" rx="18" className="fill-current text-[var(--app-accent-soft)] stroke-current text-[var(--app-accent)]" strokeWidth="2" />
        <rect x="286" y="62" width="124" height="86" rx="18" className="fill-current text-[var(--app-accent-soft)] stroke-current text-[var(--app-accent)]" strokeWidth="2" />
        <rect x="70" y="172" width="124" height="86" rx="18" className="fill-current text-[var(--app-accent-soft)] stroke-current text-[var(--app-accent)]" strokeWidth="2" />
        <rect x="286" y="172" width="124" height="86" rx="18" className="fill-current text-[var(--app-accent-soft)] stroke-current text-[var(--app-accent)]" strokeWidth="2" />

        {zones.map((zone, index) => {
          const x = index % 2 === 0 ? 110 : 330
          const y = index < 2 ? 105 : 215
          return (
            <g key={zone.id}>
              <circle cx={x} cy={y} r="18" className={cn(zoneClasses[zone.status], 'stroke-2')} />
              <text x={x} y={y + 34} textAnchor="middle" className="fill-current text-[10px] font-semibold text-[var(--app-text)]">
                {zone.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
