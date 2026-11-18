import { FileText, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ContractDoc, TemplateSnippet } from '@/components/contract-paper'
import { previewContract } from '@/data/contracts'
import { startBlank, update, useApp, startFromTemplate } from '@/lib/store'
import { CATEGORIES, TEMPLATES, type Template } from '@/data/templates'
import { cn } from '@/lib/utils'

/* Port of V.library in preview/new-contract-flow.html. */

const hay = (t: Template) => `${t.name} ${t.alias ?? ''} ${t.cat} ${t.desc}`.toLowerCase()

function TemplateRow({ template: t, selected, onSelect }: { template: Template; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={onSelect}
      className={cn(
        'flex w-full items-center gap-3 border-b border-border-subtle bg-card px-4 py-3 text-left transition-colors hover:bg-accent',
        selected && 'bg-selected hover:bg-selected',
      )}
    >
      <span className="grid size-8 flex-none place-items-center rounded-md bg-selected text-primary">
        <FileText className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn('block truncate text-sm font-medium text-heading', selected && 'text-primary')}>{t.name}</span>
        <span className="text-xs text-muted-foreground">
          {t.cat} · Updated {t.upd}
        </span>
      </span>
      {t.used && (
        <Badge className="h-6 rounded-full bg-secondary px-2 text-xs font-medium text-secondary-foreground">{t.used}</Badge>
      )}
    </button>
  )
}

/** The prototype's previewPane(): details, then the first page or a snippet. */
export function TemplatePreview({ template: t, className }: { template: Template; className?: string }) {
  const required = t.fields.filter((f) => f.req).map((f) => f.label)
  return (
    <div className={cn('flex flex-col gap-4 overflow-auto p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-heading">{t.name}</h3>
          <p className="mt-1.5 text-sm text-subtle-foreground">{t.desc}</p>
        </div>
        <Button className="h-10 px-4 font-medium" onClick={() => startFromTemplate(t.id)}>
          Use template
        </Button>
      </div>
      <dl className="grid grid-cols-[100px_1fr] gap-x-3 gap-y-1.5 text-xs leading-4">
        <dt className="text-muted-foreground">Category</dt>
        <dd>{t.cat}</dd>
        <dt className="text-muted-foreground">You will fill in</dt>
        <dd>{required.join(', ')}</dd>
        <dt className="text-muted-foreground">Time to fill in</dt>
        <dd>About {t.time} minutes</dd>
        <dt className="text-muted-foreground">Last reviewed</dt>
        <dd>By Legal, {t.upd}</dd>
      </dl>
      <div className="rounded-md bg-muted p-4">
        {t.id === TEMPLATES[0].id ? (
          /* The prototype shrinks the A4 page with CSS zoom; Chrome supports it. */
          <div style={{ zoom: 0.62 }}>
            <ContractDoc contract={previewContract(t)} quiet />
          </div>
        ) : (
          <TemplateSnippet template={t} />
        )}
      </div>
    </div>
  )
}

export function Templates() {
  const { q, cat, sel } = useApp().lib
  const setQ = (v: string) => update((s) => (s.lib.q = v))
  const setCat = (v: string) => update((s) => (s.lib.cat = v))
  const setSel = (v: string) => update((s) => (s.lib.sel = v))

  const needle = q.trim().toLowerCase()
  const list = TEMPLATES.filter((t) => (cat === 'All templates' || t.cat === cat) && hay(t).includes(needle))
  const selected = list.find((t) => t.id === sel) ?? list[0]

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-heading">Choose a template</h1>
          <p className="mt-1 text-sm text-muted-foreground">Start from a reviewed template. You can change everything later.</p>
        </div>
        <Button variant="outline" className="h-10 px-4 font-medium" onClick={startBlank}>
          Start blank contract
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex h-10 w-full items-center gap-2 rounded-md border border-border px-3 text-muted-foreground focus-within:border-primary sm:w-[360px]">
          <Search className="size-4 flex-none" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search templates"
            aria-label="Search templates"
            className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-placeholder"
          />
        </label>
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger aria-label="Category" className="h-10 w-full rounded-md border-border px-3 data-[size=default]:h-10 sm:w-[220px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="ml-auto text-sm text-muted-foreground">{list.length} templates</span>
      </div>

      <div className="grid min-h-[560px] overflow-hidden rounded-xl border border-border bg-card lg:grid-cols-[420px_minmax(0,1fr)]">
        <div role="listbox" aria-label="Templates" className="flex flex-col border-border-subtle lg:border-r">
          {list.length ? (
            list.map((t) => (
              <TemplateRow key={t.id} template={t} selected={t.id === selected?.id} onSelect={() => setSel(t.id)} />
            ))
          ) : (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">No templates match your search.</p>
          )}
        </div>
        {selected && <TemplatePreview template={selected} className="hidden lg:flex" />}
      </div>
    </div>
  )
}
