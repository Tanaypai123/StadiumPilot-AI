import { cn } from '@/lib/cn'

type SwitchProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description?: string
}

export function Switch({ checked, onChange, label, description }: SwitchProps) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-solid)] p-4">
      <div>
        <p className="text-sm font-medium text-[var(--app-text)]">{label}</p>
        {description ? <p className="mt-1 text-sm leading-6 text-[var(--app-muted)]">{description}</p> : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-7 w-12 rounded-full border border-transparent transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-accent)]',
          checked ? 'bg-[var(--app-accent)]' : 'bg-slate-300 dark:bg-slate-600',
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            'absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform',
            checked ? 'translate-x-5' : 'translate-x-0.5',
          )}
        />
      </button>
    </div>
  )
}
