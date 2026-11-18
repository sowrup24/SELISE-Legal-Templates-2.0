import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Page title row: title, optional description and actions on the right. */
export function PageHeading({ title, description, actions, children }: { title: ReactNode; description?: ReactNode; actions?: ReactNode; children?: ReactNode }) {
  return (
    <div className="flex flex-col flex-wrap items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div className="min-w-0">
        {children}
        {typeof title === 'string' ? <h1 className="text-2xl font-semibold text-heading">{title}</h1> : title}
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  )
}

/** "Back to …" link above a page title. */
export function BackLink({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="-ml-1.5 inline-flex h-8 items-center gap-1.5 rounded-md pr-2.5 pl-1.5 text-sm text-subtle-foreground hover:bg-accent hover:text-heading focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <ArrowLeft className="size-4" />
      {children}
    </button>
  )
}

/** Bordered white box with padding, the prototype's .panel. */
export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cn('flex flex-col gap-3 rounded-xl border border-border bg-card p-5', className)}>{children}</section>
}

export function PanelHead({ title, children }: { title: ReactNode; children?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-base font-semibold text-heading">{title}</h2>
      {children}
    </div>
  )
}

/** Bordered box without padding, for tables and lists (the prototype's .card). */
export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('overflow-hidden rounded-xl border border-border bg-card', className)}>{children}</div>
}

export function LinkButton({ onClick, className, children }: { onClick: () => void; className?: string; children: ReactNode }) {
  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onClick()
      }}
      className={cn('text-sm font-medium text-primary hover:underline', className)}
    >
      {children}
    </a>
  )
}

/** Label, control and help or error text. */
export function Field({ label, htmlFor, help, error, className, children }: { label?: ReactNode; htmlFor?: string; help?: ReactNode; error?: ReactNode; className?: string; children: ReactNode }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={htmlFor} className="text-sm font-medium text-heading">
          {label}
        </label>
      )}
      {children}
      {error ? (
        <span className="text-xs text-danger-foreground">{error}</span>
      ) : help ? (
        <span className="text-xs text-muted-foreground">{help}</span>
      ) : null}
    </div>
  )
}

/** Shared input look: 40px, brand focus ring. */
export const inputClass =
  'h-10 w-full rounded-md border border-border bg-card px-3 text-sm text-foreground outline-none placeholder:text-placeholder focus:border-primary focus:ring-3 focus:ring-selected aria-invalid:border-danger-foreground'

export function SearchBox({ value, onChange, placeholder, className, autoFocus }: { value: string; onChange: (v: string) => void; placeholder: string; className?: string; autoFocus?: boolean }) {
  return (
    <label className={cn('flex h-10 items-center gap-2 rounded-md border border-border bg-card px-3 text-muted-foreground focus-within:border-primary', className)}>
      <svg viewBox="0 0 24 24" className="size-4 flex-none" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-placeholder"
      />
    </label>
  )
}
