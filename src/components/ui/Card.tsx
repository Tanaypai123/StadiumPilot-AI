import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/cn'

type CardProps = HTMLAttributes<HTMLDivElement> & {
  padding?: 'sm' | 'md' | 'lg'
}

const paddingClasses = {
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
} as const

export function Card({ className, padding = 'md', ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-[var(--app-radius)] border border-[var(--app-border)] bg-[var(--app-surface)] shadow-[var(--app-shadow)] backdrop-blur-xl',
        paddingClasses[padding],
        className,
      )}
      {...props}
    />
  )
}

export function CardHeader({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mb-4 space-y-1', className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-lg font-semibold tracking-tight text-[var(--app-text)]', className)} {...props}>
      {children}
    </h3>
  )
}

export function CardDescription({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-sm leading-6 text-[var(--app-muted)]', className)} {...props}>
      {children}
    </p>
  )
}

export function CardContent({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('space-y-4', className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mt-4 flex items-center justify-between gap-3', className)} {...props}>
      {children}
    </div>
  )
}

type MetricCardProps = {
  label: string
  value: string | number
  detail: string
  tone?: 'default' | 'success' | 'warning'
  icon?: ReactNode
}

export function MetricCard({ label, value, detail, tone = 'default', icon }: MetricCardProps) {
  const toneClassName =
    tone === 'success'
      ? 'text-emerald-600 dark:text-emerald-400'
      : tone === 'warning'
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-[var(--app-accent-strong)]'

  return (
    <Card className="flex flex-col justify-between gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--app-muted)]">
            {label}
          </p>
          <p className={cn('mt-2 text-3xl font-semibold tracking-tight', toneClassName)}>{value}</p>
        </div>
        {icon ? <div className="text-[var(--app-accent)]">{icon}</div> : null}
      </div>
      <p className="text-sm leading-6 text-[var(--app-muted)]">{detail}</p>
    </Card>
  )
}
