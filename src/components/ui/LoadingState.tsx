import { cn } from '@/lib/cn'

type LoadingStateProps = {
  label?: string
  description?: string
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-block h-5 w-5 animate-spin rounded-full border-2 border-[var(--app-accent-soft)] border-t-[var(--app-accent)]',
        className,
      )}
    />
  )
}

export function InlineLoader({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="inline-flex items-center gap-3 text-sm text-[var(--app-muted)]">
      <Spinner />
      <span>{label}</span>
    </div>
  )
}

export function PageLoader({
  label = 'Loading',
  description = 'Preparing the dashboard shell.',
}: LoadingStateProps) {
  return (
    <div className="grid min-h-[100vh] place-items-center px-6">
      <div className="w-full max-w-md rounded-[var(--app-radius)] border border-[var(--app-border)] bg-[var(--app-surface)] p-8 text-center shadow-[var(--app-shadow)] backdrop-blur-xl">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--app-accent-soft)] text-[var(--app-accent)]">
          <Spinner />
        </div>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-[var(--app-text)]">{label}</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--app-muted)]">{description}</p>
      </div>
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-2xl bg-black/5 dark:bg-white/10', className)} />
}

export function LoadingCardGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={`skeleton-${index}`}
          className="space-y-4 rounded-[var(--app-radius)] border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-[var(--app-shadow)]"
        >
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-4 w-40" />
        </div>
      ))}
    </div>
  )
}

export function InlineSkeletonRow({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={`row-${index}`} className="h-4 w-full" />
      ))}
    </div>
  )
}
