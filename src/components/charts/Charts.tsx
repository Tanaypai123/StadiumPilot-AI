import { useMemo } from 'react'

import { cn } from '@/lib/cn'

export type LineSeries = {
  label: string
  value: number
}

export function LineChart({
  data,
  color = 'var(--app-accent)',
  ariaLabel,
}: {
  data: LineSeries[]
  color?: string
  ariaLabel: string
}) {
  const points = useMemo(() => {
    const maxValue = Math.max(...data.map((item) => item.value), 1)
    return data
      .map((item, index) => {
        const x = (index / Math.max(data.length - 1, 1)) * 100
        const y = 100 - (item.value / maxValue) * 100
        return `${x},${y}`
      })
      .join(' ')
  }, [data])

  return (
    <svg viewBox="0 0 100 100" role="img" aria-label={ariaLabel} className="h-44 w-full">
      <defs>
        <linearGradient id="line-chart-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={points}
      />
      <polyline fill="url(#line-chart-fill)" points={`0,100 ${points} 100,100`} />
      {data.map((item, index) => {
        const maxValue = Math.max(...data.map((entry) => entry.value), 1)
        const x = (index / Math.max(data.length - 1, 1)) * 100
        const y = 100 - (item.value / maxValue) * 100
        return <circle key={item.label} cx={x} cy={y} r="1.8" fill={color} />
      })}
    </svg>
  )
}

export function BarChart({
  data,
  ariaLabel,
}: {
  data: Array<{ label: string; value: number; tone?: 'default' | 'success' | 'warning' }>
  ariaLabel: string
}) {
  const maxValue = Math.max(...data.map((item) => item.value), 1)

  return (
    <div role="img" aria-label={ariaLabel} className="flex h-44 items-end gap-3">
      {data.map((item) => {
        const height = (item.value / maxValue) * 100
        const barColor =
          item.tone === 'success'
            ? 'bg-emerald-500'
            : item.tone === 'warning'
              ? 'bg-amber-500'
              : 'bg-[var(--app-accent)]'

        return (
          <div key={item.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
            <div className="w-full rounded-t-2xl bg-black/5 p-1 dark:bg-white/10">
              <div className={cn('rounded-t-xl', barColor)} style={{ height: `${Math.max(height, 8)}%` }} />
            </div>
            <span className="text-xs font-medium text-[var(--app-muted)]">{item.label}</span>
          </div>
        )
      })}
    </div>
  )
}

export function DonutChart({
  segments,
  centerLabel,
  centerValue,
  ariaLabel,
}: {
  segments: Array<{ label: string; value: number; color: string }>
  centerLabel: string
  centerValue: string
  ariaLabel: string
}) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0) || 1
  let accumulated = 25

  return (
    <div className="flex flex-col items-center gap-4" role="img" aria-label={ariaLabel}>
      <svg viewBox="0 0 120 120" className="h-44 w-44">
        <circle cx="60" cy="60" r="34" fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="14" />
        {segments.map((segment) => {
          const dash = (segment.value / total) * 188.5
          const offset = 188.5 - accumulated
          accumulated += dash
          return (
            <circle
              key={segment.label}
              cx="60"
              cy="60"
              r="34"
              fill="none"
              stroke={segment.color}
              strokeWidth="14"
              strokeDasharray={`${dash} ${188.5 - dash}`}
              strokeDashoffset={offset}
              transform="rotate(-90 60 60)"
            />
          )
        })}
        <text x="60" y="57" textAnchor="middle" className="fill-current text-[10px] font-medium text-[var(--app-muted)]">
          {centerLabel}
        </text>
        <text x="60" y="72" textAnchor="middle" className="fill-current text-[18px] font-semibold text-[var(--app-text)]">
          {centerValue}
        </text>
      </svg>
      <div className="flex flex-wrap justify-center gap-3 text-xs font-medium text-[var(--app-muted)]">
        {segments.map((segment) => (
          <span key={segment.label} className="inline-flex items-center gap-2 rounded-full border border-[var(--app-border)] px-3 py-1">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: segment.color }} />
            {segment.label}
          </span>
        ))}
      </div>
    </div>
  )
}
