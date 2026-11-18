import { useId, useState, type InputHTMLAttributes } from 'react'
import { Building2 } from 'lucide-react'
import { PersonAvatar } from '@/components/common/person-avatar'
import { COMPANIES, coOf } from '@/data/contacts'
import { state } from '@/lib/store'
import { cn } from '@/lib/utils'

/* Port of suggestItems() and the .suggest combobox in preview/new-contract-flow.html. */

export type SuggestKind = 'company' | 'party' | 'person' | 'signer'
export type SuggestItem =
  | { t: 'co'; id: string; label: string; sub: string }
  | { t: 'p'; id: number; label: string; sub: string; mail: string }

function suggestItems(kind: SuggestKind, q: string): SuggestItem[] {
  const needle = (q || '').trim().toLowerCase()
  const m = (x: string) => !needle || x.toLowerCase().includes(needle)
  const co = (c: (typeof COMPANIES)[number]): SuggestItem => ({ t: 'co', id: c.id, label: c.name, sub: c.addr })
  if (kind === 'company') return COMPANIES.filter((c) => m(c.name + ' ' + c.city)).slice(0, 6).map(co)
  const cos = COMPANIES.filter((c) => !c.own && m(c.name + ' ' + c.city)).map(co)
  const ppl: SuggestItem[] = state.people
    .filter((p) => (kind === 'signer' || !p.colleague) && m(`${p.name} ${p.email} ${coOf(p.co)?.name ?? ''}`))
    .map((p) => ({
      t: 'p',
      id: state.people.indexOf(p),
      label: p.name,
      sub: [p.role, coOf(p.co)?.name].filter(Boolean).join(' · '),
      mail: p.email,
    }))
  return kind === 'party' ? [...cos.slice(0, 3), ...ppl.slice(0, 4)] : ppl.slice(0, 6)
}

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {
  kind: SuggestKind
  value: string
  onChange: (v: string) => void
  onPick: (item: SuggestItem) => void
}

/** Text input that suggests saved contacts and companies while typing. */
export function SuggestInput({ kind, value, onChange, onPick, className, onFocus, onBlur, ...rest }: Props) {
  const [open, setOpen] = useState(false)
  const [hi, setHi] = useState(-1)
  const listId = useId()
  const items = open ? suggestItems(kind, value) : []
  const shown = open && items.length > 0
  const pick = (x: SuggestItem) => {
    setOpen(false)
    setHi(-1)
    onPick(x)
  }
  return (
    <div className="relative">
      <input
        {...rest}
        value={value}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={shown}
        aria-controls={listId}
        aria-activedescendant={shown && hi >= 0 ? `${listId}-${hi}` : undefined}
        autoComplete="off"
        className={className}
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
          setHi(-1)
        }}
        onFocus={(e) => {
          setOpen(true)
          onFocus?.(e)
        }}
        onBlur={(e) => {
          setOpen(false)
          setHi(-1)
          onBlur?.(e)
        }}
        onKeyDown={(e) => {
          if (!shown) return
          const n = items.length
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault()
            setHi((h) => (h + (e.key === 'ArrowDown' ? 1 : -1) + n) % n)
          } else if (e.key === 'Enter' && hi >= 0) {
            e.preventDefault()
            pick(items[hi])
          } else if (e.key === 'Escape') {
            e.stopPropagation()
            setOpen(false)
          }
        }}
      />
      {shown && (
        <div id={listId} role="listbox" className="absolute top-[calc(100%+4px)] right-0 left-0 z-30 max-h-80 overflow-y-auto rounded-lg border border-border bg-popover p-1 shadow-lg">
          <div className="px-2 pt-1.5 pb-1 text-xs text-muted-foreground">{kind === 'company' ? 'Saved companies' : 'Saved contacts'}</div>
          {items.map((x, k) => (
            <div
              key={k}
              id={`${listId}-${k}`}
              role="option"
              aria-selected={k === hi}
              onMouseDown={(e) => {
                e.preventDefault()
                pick(x)
              }}
              onMouseEnter={() => setHi(k)}
              className={cn('flex cursor-pointer items-center gap-3 rounded-md p-2', k === hi && 'bg-accent')}
            >
              {x.t === 'co' ? (
                <span className="grid size-8 flex-none place-items-center rounded-md bg-muted text-muted-foreground">
                  <Building2 className="size-4" />
                </span>
              ) : (
                <PersonAvatar name={x.label} className="size-8" />
              )}
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium text-heading">{x.label}</span>
                {x.sub && <span className="truncate text-xs text-muted-foreground">{x.sub}</span>}
                {x.t === 'p' && <span className="truncate text-xs text-muted-foreground">{x.mail}</span>}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
