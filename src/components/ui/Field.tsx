import type { HTMLInputTypeAttribute, ReactNode, TextareaHTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

type BaseFieldProps = {
  label: string
  description?: string
  error?: string
  id: string
}

const baseControlClasses =
  'w-full rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-solid)] px-4 py-3 text-sm text-[var(--app-text)] shadow-sm outline-none transition-colors placeholder:text-[var(--app-muted)] focus:border-[var(--app-accent)] focus:ring-2 focus:ring-[var(--app-accent-soft)]'

export function FieldLabel({ label, htmlFor }: { label: string; htmlFor: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-[var(--app-text)]">
      {label}
    </label>
  )
}

export function FieldDescription({ children }: { children?: ReactNode }) {
  if (!children) {
    return null
  }

  return <p className="mt-1 text-sm leading-6 text-[var(--app-muted)]">{children}</p>
}

export function FieldError({ children }: { children?: ReactNode }) {
  if (!children) {
    return null
  }

  return (
    <p role="alert" className="mt-1 text-sm font-medium text-[var(--app-danger)]">
      {children}
    </p>
  )
}

type InputProps = BaseFieldProps & {
  type?: HTMLInputTypeAttribute
  value: string
  onChange: (value: string) => void
  placeholder?: string
  autoComplete?: string
}

export function TextField({ label, description, error, id, value, onChange, ...props }: InputProps) {
  const descriptionId = description ? `${id}-description` : undefined
  const errorId = error ? `${id}-error` : undefined

  return (
    <div>
      <FieldLabel htmlFor={id} label={label} />
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={baseControlClasses}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId || descriptionId}
        {...props}
      />
      {description ? (
        <p id={descriptionId} className="mt-1 text-sm leading-6 text-[var(--app-muted)]">
          {description}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="mt-1 text-sm font-medium text-[var(--app-danger)]">
          {error}
        </p>
      ) : null}
    </div>
  )
}

type TextAreaProps = BaseFieldProps &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'> & {
    value: string
    onChange: (value: string) => void
  }

export function TextAreaField({ label, description, error, id, value, onChange, ...props }: TextAreaProps) {
  const descriptionId = description ? `${id}-description` : undefined
  const errorId = error ? `${id}-error` : undefined

  return (
    <div>
      <FieldLabel htmlFor={id} label={label} />
      <textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(baseControlClasses, 'min-h-32 resize-y')}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId || descriptionId}
        {...props}
      />
      {description ? (
        <p id={descriptionId} className="mt-1 text-sm leading-6 text-[var(--app-muted)]">
          {description}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="mt-1 text-sm font-medium text-[var(--app-danger)]">
          {error}
        </p>
      ) : null}
    </div>
  )
}

type SelectProps = BaseFieldProps & {
  value: string
  onChange: (value: string) => void
  options: Array<{ label: string; value: string }>
}

export function SelectField({ label, description, error, id, value, onChange, options }: SelectProps) {
  const descriptionId = description ? `${id}-description` : undefined
  const errorId = error ? `${id}-error` : undefined

  return (
    <div>
      <FieldLabel htmlFor={id} label={label} />
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={baseControlClasses}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId || descriptionId}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {description ? (
        <p id={descriptionId} className="mt-1 text-sm leading-6 text-[var(--app-muted)]">
          {description}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="mt-1 text-sm font-medium text-[var(--app-danger)]">
          {error}
        </p>
      ) : null}
    </div>
  )
}
