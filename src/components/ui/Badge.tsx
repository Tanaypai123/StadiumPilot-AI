import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

type BadgeVariant = 'default' | 'success' | 'warning' | 'outline'

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant
}

const badgeVariants: Record<BadgeVariant, string> = {
  default: 'bg-[var(--app-accent-soft)] text-[var(--app-accent-strong)]',
  success: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300',
  warning: 'bg-amber-500/12 text-amber-700 dark:text-amber-300',
  outline: 'border border-[var(--app-border)] text-[var(--app-muted)]',
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.16em]',
        badgeVariants[variant],
        className,
      )}
      {...props}
    />
  )
}
