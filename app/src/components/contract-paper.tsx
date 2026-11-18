import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { Scan, ZoomIn, ZoomOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fmt, previewContract, tplOf, type Contract } from '@/data/contracts'
import type { Template } from '@/data/templates'

/* Port of docHtml() in preview/new-contract-flow.html: the contract as an A4 page with
   letterhead, title, parties, numbered clauses, signatures and footer.
   The paper stays white in dark mode, like the prototype. */

type DocProps = {
  contract: Contract
  /** Field key to highlight, for example "name" or "s0" for the first signatory */
  focusKey?: string | null
  /** Called when a filled or missing value in the page is clicked */
  onPick?: (key: string) => void
  /** Shows missing values in blue instead of orange, as in the template preview */
  quiet?: boolean
}

const hl = 'shadow-[0_0_0_2px_#008af1]'

function Value({ k, children, missing, p }: { k: string; children: ReactNode; missing?: boolean; p: DocProps }) {
  const on = p.focusKey === k
  const click = p.onPick ? () => p.onPick!(k) : undefined
  return (
    <span
      data-vk={k}
      onClick={click}
      className={cn(
        'rounded-[2px] px-0.5',
        missing
          ? p.quiet
            ? 'bg-[#f0f6fc] text-[#008af1]'
            : 'bg-[#ffefe3] font-sans text-xs text-[#b54d00]'
          : 'border-b border-[#008af1] bg-[#f0f6fc]',
        click && 'cursor-pointer hover:' + hl,
        on && hl,
      )}
    >
      {children}
    </span>
  )
}

function Fill({ text, p }: { text: string; p: DocProps }) {
  const c = p.contract
  const t = tplOf(c)
  return (
    <>
      {text.split(/(\{\w+\})/g).map((part, i) => {
        const m = part.match(/^\{(\w+)\}$/)
        if (!m) return part
        const k = m[1]
        const f = t.fields.find((x) => x.k === k)
        const v = c.values[k]
        return v ? (
          <Value key={i} k={k} p={p}>
            {fmt(f, v)}
          </Value>
        ) : (
          <Value key={i} k={k} p={p} missing>
            [{f?.label ?? k}]
          </Value>
        )
      })}
    </>
  )
}

function Clause({ raw, p }: { raw: string; p: DocProps }) {
  const m = raw.match(/^(\d+)\.\s+([^.]+)\.\s*([\s\S]*)$/)
  if (!m)
    return (
      <p className="whitespace-pre-wrap">
        <Fill text={raw} p={p} />
      </p>
    )
  return (
    <section>
      <h3 className="mb-1 text-left text-sm font-semibold">
        <span className="inline-block min-w-[22px]">{m[1]}.</span> <Fill text={m[2]} p={p} />
      </h3>
      <p className="pl-[22px]">
        <Fill text={m[3]} p={p} />
      </p>
    </section>
  )
}

const Small = ({ children }: { children: ReactNode }) => <span className="text-xs text-[#6a6f73] italic">{children}</span>

export function ContractDoc(p: DocProps & { className?: string }) {
  const c = p.contract
  const vals = c.values
  const company = vals.company || 'SELISE AG'
  const caddr = vals.companyAddress || 'Seestrasse 1, 8002 Zurich'
  const t = tplOf(c)
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const signers = c.signers.length
    ? c.signers.map((x, i) => ({ who: x.name || 'Signatory', role: x.role || '', k: 's' + i }))
    : [
        { who: company, role: '', k: c.blank ? '' : 'company' },
        { who: c.blank ? 'Other party' : vals.name || 'Other party', role: c.blank ? '' : t.partyRole, k: c.blank ? '' : 'name' },
      ]
  const roleA = t.id === 'emp' ? 'Employer' : 'Company'

  return (
    <article
      className={cn(
        'mx-auto flex aspect-[210/297] w-[794px] max-w-none flex-col rounded-[2px] border border-[#E4E9EC] bg-white px-[84px] pt-[72px] pb-12 font-serif text-[15px] leading-[1.65] text-[#1f2123] shadow-[0_1px_2px_rgba(16,24,40,.05),0_6px_20px_rgba(16,24,40,.06)]',
        p.className,
      )}
    >
      <header className="flex justify-between gap-4 border-b border-[#d5d9dc] pb-3 font-sans text-[11px] tracking-[.02em] text-[#6a6f73]">
        <span className="font-semibold tracking-[.08em] text-[#1f2123] uppercase">{company}</span>
        <span>{caddr}</span>
      </header>
      <h2 className="mt-10 mb-7 text-center text-[22px] leading-[1.3] font-semibold tracking-[.01em] text-[#131314]">
        {c.blank ? vals.title || 'Untitled contract' : t.name}
      </h2>
      <div className="flex flex-col gap-3.5 text-justify hyphens-auto">
        {c.blank ? (
          <p className="text-[#909599]">
            Write your contract in the document editor. Number the clauses like “1. Purpose. …” and they are formatted for you.
          </p>
        ) : (
          <>
            <div className="mb-3 flex flex-col gap-1.5 text-center">
              <Small>between</Small>
              <p>
                <b>
                  <Fill text="{company}" p={p} />
                </b>
                <br />
                <Fill text="{companyAddress}" p={p} />
                <br />
                <Small>hereinafter “the {roleA}”</Small>
              </p>
              <Small>and</Small>
              <p>
                <b>
                  <Fill text="{name}" p={p} />
                </b>
                {t.fields.some((f) => f.k === 'address') && (
                  <>
                    <br />
                    <Fill text="{address}" p={p} />
                  </>
                )}
                <br />
                <Small>hereinafter “the {t.partyRole}”</Small>
              </p>
            </div>
            {t.text.slice(1).map((raw, i) => (
              <Clause key={i} raw={raw} p={p} />
            ))}
          </>
        )}
      </div>
      <section className="mt-10">
        <p className="mb-7 font-semibold">Signatures</p>
        <div className="grid grid-cols-2 gap-x-12 gap-y-9">
          {signers.map((s, i) => (
            <div
              key={i}
              data-vk={s.k || undefined}
              onClick={s.k && p.onPick ? () => p.onPick!(s.k) : undefined}
              className={cn('flex flex-col gap-0.5 rounded', s.k && p.onPick && 'cursor-pointer hover:' + hl, s.k && p.focusKey === s.k && hl)}
            >
              <span className="mb-1.5 block h-px bg-[#8a8f93]" />
              <span className="font-semibold">{s.who}</span>
              {s.role && <span className="text-xs text-[#6a6f73]">{s.role}</span>}
              <span className="mt-[22px] mb-1.5 block h-px w-3/5 bg-[#8a8f93]" />
              <span className="text-xs text-[#6a6f73]">Place and date</span>
            </div>
          ))}
        </div>
        <p className="mt-6 font-sans text-[11px] text-[#6a6f73]">Signed electronically with SELISE Signature.</p>
      </section>
      <footer className="mt-auto flex justify-between gap-4 pt-6 font-sans text-[10px] text-[#8a8f93]">
        <span>{c.blank ? `Draft, ${today}` : `${t.name} · Template reviewed by SELISE Legal, ${t.upd}`}</span>
        <span>Page 1 of 1</span>
      </footer>
    </article>
  )
}

/** Template preview without the A4 page: title and the first clauses. */
export function TemplateSnippet({ template: t }: { template: Template }) {
  const p: DocProps = { contract: previewContract(t), quiet: true }
  return (
    <div className="flex flex-col gap-3 rounded-md bg-white p-6 font-serif text-sm leading-relaxed text-[#1f2123]">
      <h4 className="text-center text-base font-semibold">{t.name}</h4>
      {t.text.slice(1, 4).map((raw, i) => (
        <Clause key={i} raw={raw} p={p} />
      ))}
      <p className="text-center font-sans text-xs text-[#6a6f73]">…</p>
    </div>
  )
}

const PAGE_W = 794

/** Zoom controls: zoom out, percentage, zoom in, fit to width. */
export function ZoomBar({ zoom, fit, onZoom }: { zoom: number | null; fit: number; onZoom: (z: number | null) => void }) {
  const cur = zoom ?? fit
  const btn =
    'grid size-9 place-items-center rounded-md border border-border bg-card text-foreground hover:bg-accent hover:text-heading disabled:cursor-default disabled:opacity-40 disabled:hover:bg-card'
  return (
    <div className="inline-flex h-9 items-center gap-1" role="group" aria-label="Zoom">
      <button type="button" className={btn} aria-label="Zoom out" title="Zoom out" disabled={zoom !== null && zoom <= 0.5} onClick={() => onZoom(Math.max(0.5, Math.round((cur - 0.1) * 10) / 10))}>
        <ZoomOut className="size-4" />
      </button>
      <span className="min-w-11 text-center text-sm text-subtle-foreground tabular-nums" aria-live="polite">
        {Math.round(cur * 100)}%
      </span>
      <button type="button" className={btn} aria-label="Zoom in" title="Zoom in" disabled={zoom !== null && zoom >= 2} onClick={() => onZoom(Math.min(2, Math.round((cur + 0.1) * 10) / 10))}>
        <ZoomIn className="size-4" />
      </button>
      <span className="mx-2 h-5 w-px bg-border" />
      <button
        type="button"
        aria-pressed={zoom === null}
        aria-label="Fit to width"
        title="Fit to width"
        onClick={() => onZoom(null)}
        className={cn(btn, zoom === null && 'border-primary bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground')}
      >
        <Scan className="size-4" />
      </button>
    </div>
  )
}

/** Keeps the page fitted to the scroll area's width, unless the user picked a zoom. */
function useFitZoom() {
  const ref = useRef<HTMLDivElement>(null)
  const [fit, setFit] = useState(1)
  const [zoom, setZoom] = useState<number | null>(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setFit(Math.max(0.3, Math.min(1.5, (el.clientWidth - 8) / PAGE_W)))
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return { ref, fit, zoom, setZoom, scale: zoom ?? fit }
}

/** Grey desk with the zoomable page. Toolbar items go on the left of the zoom controls. */
export function DocDesk({ title, tools, className, scrollClassName, children }: { title?: ReactNode; tools?: ReactNode; className?: string; scrollClassName?: string; children: (scale: number) => ReactNode }) {
  const z = useFitZoom()
  const scrollRef = z.ref
  return (
    <section className={cn('flex flex-col rounded-xl border border-border bg-[var(--canvas)] p-3 md:p-8', className)}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        {title ? <span className="text-sm font-medium text-heading">{title}</span> : <span />}
        <div className="flex flex-wrap items-center justify-end gap-4">
          {tools}
          <ZoomBar zoom={z.zoom} fit={z.fit} onZoom={z.setZoom} />
        </div>
      </div>
      <div ref={scrollRef} className={cn('overflow-x-auto pt-1 pb-2', scrollClassName)}>
        <div style={{ zoom: z.scale }}>{children(z.scale)}</div>
      </div>
    </section>
  )
}
