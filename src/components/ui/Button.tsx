import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive'
type ButtonSize = 'sm' | 'md' | 'lg'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  leadingIcon?: ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--app-accent)] text-white shadow-sm hover:bg-[var(--app-accent-strong)] focus-visible:outline-[var(--app-accent)]',
  secondary:
    'border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)] hover:border-[color:var(--app-accent)] hover:bg-[var(--app-accent-soft)]',
  ghost:
    'bg-transparent text-[var(--app-text)] hover:bg-[var(--app-accent-soft)]',
  destructive:
    'bg-[var(--app-danger)] text-white hover:opacity-90 focus-visible:outline-[var(--app-danger)]',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
}

export function Button({
  className,
  children,
  variant = 'primary',
  size = 'md',
  leadingIcon,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {leadingIcon ? <span aria-hidden="true">{leadingIcon}</span> : null}
      {children}
    </button>
  )
}
