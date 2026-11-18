import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { fmt } from '@/data/contracts'
import { cn } from '@/lib/utils'

/* Port of calHtml() in preview/new-contract-flow.html: a month grid with Today and Clear. */

const WD = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
const pad = (n: number) => String(n).padStart(2, '0')
const isoOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export function DatePicker({ id, value, onChange, invalid, className, onFocus, onBlur }: { id: string; value: string; onChange: (v: string) => void; invalid?: boolean; className?: string; onFocus?: () => void; onBlur?: () => void }) {
  const [open, setOpen] = useState(false)
  const [ym, setYm] = useState(() => (value || isoOf(new Date())).slice(0, 7))
  const [y, m] = ym.split('-').map(Number)
  const first = new Date(y, m - 1, 1)
  const off = (first.getDay() + 6) % 7
  const days = new Date(y, m, 0).getDate()
  const today = isoOf(new Date())
  const nav = (d: number) => {
    const n = new Date(y, m - 1 + d, 1)
    setYm(`${n.getFullYear()}-${pad(n.getMonth() + 1)}`)
  }
  const pick = (v: string) => {
    onChange(v)
    setOpen(false)
  }
  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (o) setYm((value || today).slice(0, 7))
      }}
    >
      <PopoverAnchor asChild>
        <input
          id={id}
          readOnly
          placeholder="Pick a date"
          value={fmt({ type: 'date' }, value)}
          aria-invalid={invalid || undefined}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
              e.preventDefault()
              setOpen(true)
            }
          }}
          onFocus={onFocus}
          onBlur={onBlur}
          className={cn('cursor-pointer', className)}
        />
      </PopoverAnchor>
      <PopoverContent align="start" className="w-[296px] gap-2 p-3" aria-label="Choose a date" onOpenAutoFocus={(e) => e.preventDefault()}>
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" className="size-8" aria-label="Previous month" onClick={() => nav(-1)}>
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-sm font-medium text-heading">{first.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</span>
          <Button variant="ghost" size="icon" className="size-8" aria-label="Next month" onClick={() => nav(1)}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <div className="grid grid-cols-7 text-center text-xs text-muted-foreground">
          {WD.map((w) => (
            <span key={w} className="py-1">
              {w}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {Array.from({ length: off }, (_, i) => (
            <span key={'o' + i} />
          ))}
          {Array.from({ length: days }, (_, i) => {
            const v = `${y}-${pad(m)}-${pad(i + 1)}`
            const sel = v === value
            return (
              <button
                key={v}
                type="button"
                aria-label={v}
                aria-current={sel ? 'date' : undefined}
                onClick={() => pick(v)}
                className={cn(
                  'h-9 rounded-md text-sm text-foreground hover:bg-accent',
                  v === today && 'font-semibold text-primary',
                  sel && 'bg-primary text-primary-foreground hover:bg-primary',
                )}
              >
                {i + 1}
              </button>
            )
          })}
        </div>
        <div className="flex justify-between border-t border-border-subtle pt-2">
          <Button variant="ghost" className="h-8 px-3 font-medium text-primary hover:text-primary" onClick={() => pick(today)}>
            Today
          </Button>
          <Button variant="ghost" className="h-8 px-3 font-medium text-primary hover:text-primary" onClick={() => pick('')}>
            Clear
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
