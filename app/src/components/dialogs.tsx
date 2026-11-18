import { useRef, type ReactNode } from 'react'
import {
  Briefcase, Building2, ChevronLeft, ChevronRight, Copy, DollarSign, Eye, FilePlus, FileText, Heart, House, ImageIcon, LayoutTemplate,
  Lightbulb, MoreHorizontal, Shield, Upload, User, Users, X, type LucideIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ContractDoc, DocDesk } from '@/components/contract-paper'
import { Field, SearchBox, inputClass } from '@/components/common/page'
import { PersonAvatar } from '@/components/common/person-avatar'
import { Chip } from '@/components/status-chip'
import { COMPANIES, coOf } from '@/data/contacts'
import { names } from '@/data/contracts'
import { TEMPLATES, type Template } from '@/data/templates'
import { TemplatePreview } from '@/pages/templates'
import { cancelContract, openDialog, startBlank, startFromTemplate, update, useApp, type DialogId } from '@/lib/store'
import { cn } from '@/lib/utils'

/* Port of the D dialogs in preview/new-contract-flow.html. */

const dangerBtn = 'bg-[#c9362b] text-white hover:bg-[#b02e24] focus-visible:ring-[#c9362b]/40'
const close = () => openDialog(null)

function Title({ children, onClose = close }: { children: ReactNode; onClose?: () => void }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <DialogTitle className="text-xl font-semibold text-heading">{children}</DialogTitle>
      <Button variant="ghost" size="icon" className="-mt-1 -mr-2 size-9 text-muted-foreground" aria-label="Close" onClick={onClose}>
        <X className="size-5" />
      </Button>
    </div>
  )
}

function Actions({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap justify-end gap-3">{children}</div>
}

const btn = 'h-10 px-4 font-medium'

/* ---------- Start and pick a template ---------- */

function Start() {
  const choices: [string, LucideIcon, string, string, () => void][] = [
    ['template', LayoutTemplate, 'From a template', 'Use a reviewed template. Best for most contracts.', () => toPick()],
    ['blank', FilePlus, 'Blank contract', 'Start empty and write the contract yourself.', startBlank],
  ]
  return (
    <>
      <Title>Start a new contract</Title>
      <div className="grid gap-3 sm:grid-cols-2">
        {choices.map(([k, Icon, t, d, run]) => (
          <button
            key={k}
            type="button"
            onClick={run}
            className={cn(
              'flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-colors hover:border-primary hover:bg-selected',
              k === 'template' ? 'border-primary bg-selected' : 'border-border',
            )}
          >
            <span className="grid size-10 place-items-center rounded-md bg-selected text-primary">
              <Icon className="size-5" />
            </span>
            <span className="text-base font-semibold text-heading">{t}</span>
            <span className="text-sm text-subtle-foreground">{d}</span>
          </button>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        Want to sign a file you already have?{' '}
        <a
          href="#"
          className="font-medium text-primary hover:underline"
          onClick={(e) => {
            e.preventDefault()
            toast('This would open SELISE Signature in a new tab.')
          }}
        >
          Open SELISE Signature
        </a>
      </p>
      <Actions>
        <Button variant="outline" className={btn} onClick={close}>
          Cancel
        </Button>
        <Button className={btn} onClick={() => toPick()}>
          Continue
        </Button>
      </Actions>
    </>
  )
}

const toPick = (reset = true) =>
  update((s) => {
    s.dialog = 'pick'
    if (reset) {
      s.pick.cat = 'All templates'
      s.pick.q = ''
    }
  })

const PCATS: [string, LucideIcon][] = [
  ['All templates', FileText],
  ['Business', Briefcase],
  ['Employment', Users],
  ['Real estate', House],
  ['Personal', User],
  ['Intellectual property', Lightbulb],
  ['Finance', DollarSign],
  ['Corporate', Building2],
  ['Compliance', Shield],
  ['Family', Heart],
  ['Others', MoreHorizontal],
]

const hay = (t: Template) => `${t.name} ${t.alias ?? ''} ${t.cat} ${t.desc}`.toLowerCase()

const preview = (id: string) =>
  update((s) => {
    s.pick.sel = id
    s.dialog = 'preview'
  })

function Tile({ t }: { t: Template }) {
  return (
    <div
      tabIndex={0}
      role="button"
      aria-label={`Preview ${t.name}`}
      onClick={() => preview(t.id)}
      onKeyDown={(e) => {
        if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          preview(t.id)
        }
      }}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-primary"
    >
      <div className="relative grid h-[168px] place-items-center bg-muted">
        {t.used && <Chip className="absolute top-2 left-2 bg-card">{t.used}</Chip>}
        <div className="flex h-[132px] w-[104px] flex-col gap-1.5 rounded-sm bg-white p-2.5 shadow-sm" aria-hidden="true">
          <i className="mx-auto mb-1 h-1.5 w-12 rounded-full bg-[#c7d0d6]" />
          {[92, 88, 92, 70, 92, 84, 60, 90].map((w, i) => (
            <i key={i} className="h-[3px] rounded-full bg-[#e3e8eb]" style={{ width: `${w}%` }} />
          ))}
        </div>
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-[#131314]/40 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
          <Button
            variant="outline"
            className="h-9 px-3 font-medium"
            onClick={(e) => {
              e.stopPropagation()
              preview(t.id)
            }}
          >
            <Eye className="size-4" />
            Preview
          </Button>
          <Button
            className="h-9 px-3 font-medium"
            onClick={(e) => {
              e.stopPropagation()
              startFromTemplate(t.id)
            }}
          >
            Use template
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-0.5 p-3">
        <span className="truncate text-sm font-medium text-heading">{t.name}</span>
        <span className="text-xs text-muted-foreground">
          {t.cat} · {t.time} min
        </span>
      </div>
    </div>
  )
}

function Pick() {
  const p = useApp().pick
  const list = TEMPLATES.filter((t) => (p.cat === 'All templates' || t.cat === p.cat) && hay(t).includes(p.q.trim().toLowerCase())).sort(
    (a, b) => (b.used ? 1 : 0) - (a.used ? 1 : 0),
  )
  return (
    <div className="grid h-full min-h-0 md:grid-cols-[264px_minmax(0,1fr)]">
      <div className="flex flex-col gap-3 border-border-subtle bg-muted/50 p-4 md:border-r">
        <SearchBox autoFocus value={p.q} onChange={(v) => update((s) => (s.pick.q = v))} placeholder="Search templates" />
        <Button className={cn(btn, 'w-full')} onClick={startBlank}>
          <FilePlus className="size-4" />
          Start blank contract
        </Button>
        <nav aria-label="Categories" className="hidden flex-col gap-0.5 overflow-y-auto md:flex">
          {PCATS.map(([c, Icon]) => {
            const on = c === p.cat
            return (
              <button
                key={c}
                type="button"
                aria-pressed={on}
                onClick={() => update((s) => (s.pick.cat = c))}
                className={cn('flex h-10 items-center gap-3 rounded-md px-3 text-left text-sm text-subtle-foreground hover:bg-accent', on && 'bg-selected font-medium text-primary hover:bg-selected')}
              >
                <Icon className={cn('size-5 flex-none', on ? 'text-primary' : 'text-muted-foreground')} />
                {c}
              </button>
            )
          })}
        </nav>
      </div>
      <div className="flex min-h-0 flex-col">
        <div className="px-6 pt-5 md:px-8">
          <Title>{p.cat}</Title>
          <DialogDescription className="sr-only">Choose a template for the new contract.</DialogDescription>
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-6 py-4 md:px-8">
          <div className="flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
            <span>
              {list.length} template{list.length === 1 ? '' : 's'} · Recently used first
            </span>
            <span>Reviewed by SELISE Legal</span>
          </div>
          {list.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((t) => (
                <Tile key={t.id} t={t} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-12 text-sm text-muted-foreground">
              <p>{p.q ? `No templates match “${p.q}”.` : 'No templates here yet.'}</p>
              <div className="flex gap-2">
                {p.q && (
                  <Button variant="outline" className="h-9 px-3 font-medium" onClick={() => update((s) => (s.pick.q = ''))}>
                    Clear search
                  </Button>
                )}
                <Button variant="outline" className="h-9 px-3 font-medium" onClick={startBlank}>
                  Start blank contract
                </Button>
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle px-6 py-4 text-sm text-subtle-foreground md:px-8">
          <span>Items per page: 9</span>
          <div className="flex items-center gap-3">
            <span>
              Showing {list.length ? 1 : 0}–{list.length} of {list.length}
            </span>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" className="size-9" aria-label="Previous page" disabled>
                <ChevronLeft className="size-4" />
              </Button>
              <Button size="icon" className="size-9" aria-current="page">
                1
              </Button>
              <Button variant="outline" size="icon" className="size-9" aria-label="Next page" disabled>
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Preview() {
  const sel = useApp().pick.sel
  const t = TEMPLATES.find((x) => x.id === sel) ?? TEMPLATES[0]
  return (
    <>
      <div className="flex items-center justify-between gap-3 border-b border-border-subtle px-3 py-2">
        <Button variant="ghost" className="h-9 px-3 font-medium" onClick={() => toPick(false)}>
          <ChevronLeft className="size-4" />
          Back to templates
        </Button>
        <Button variant="ghost" size="icon" className="size-9 text-muted-foreground" aria-label="Close" onClick={close}>
          <X className="size-5" />
        </Button>
      </div>
      <DialogTitle className="sr-only">{t.name}</DialogTitle>
      <TemplatePreview template={t} />
    </>
  )
}

/* ---------- Contract details ---------- */

function Cancel() {
  const c = useApp().detail!
  return (
    <>
      <Title>Cancel this contract?</Title>
      <DialogDescription className="text-sm text-subtle-foreground">
        {names(c)} get an email that the contract has been cancelled{c.needsApproval && c.approver ? `, and ${c.approver.name} is told too` : ''}. You can’t undo this.
      </DialogDescription>
      <Actions>
        <Button variant="outline" className={btn} onClick={close}>
          Keep contract
        </Button>
        <Button className={cn(btn, dangerBtn)} onClick={cancelContract}>
          Cancel contract
        </Button>
      </Actions>
    </>
  )
}

function Doc() {
  const c = useApp().detail!
  return (
    <>
      <div className="flex items-center justify-between gap-3 border-b border-border-subtle px-6 py-3">
        <DialogTitle className="text-xl font-semibold text-heading">{c.title}</DialogTitle>
        <Button variant="ghost" size="icon" className="size-9 text-muted-foreground" aria-label="Close" onClick={close}>
          <X className="size-5" />
        </Button>
      </div>
      <DocDesk className="m-4 mt-0 rounded-lg border-0 md:p-4">{() => <ContractDoc contract={c} />}</DocDesk>
    </>
  )
}

/* ---------- Contacts ---------- */

function Contact() {
  const S = useApp()
  const n = S.nc!
  const E = n.err
  const set = (k: 'first' | 'last' | 'email' | 'role' | 'co', v: string) =>
    update((s) => {
      const nc = s.nc!
      nc[k] = v
      if (k === 'co') nc.colleague = v === 'selise'
      delete nc.err[k]
    })
  const input = (k: 'first' | 'last' | 'email' | 'role', label: string, ph: string, type = 'text', help?: string) => (
    <Field label={label} htmlFor={'nc-' + k} error={E[k]} help={help}>
      <input id={'nc-' + k} type={type} value={n[k]} placeholder={ph} aria-invalid={!!E[k] || undefined} onChange={(e) => set(k, e.target.value)} className={inputClass} autoFocus={k === 'first'} />
    </Field>
  )
  const save = () => {
    const err: Record<string, string> = {}
    if (!n.first.trim()) err.first = 'Required.'
    if (!n.last.trim()) err.last = 'Required.'
    if (!/^\S+@\S+\.\S+$/.test(n.email.trim())) err.email = 'Enter a valid email address.'
    if (Object.keys(err).length) {
      update((s) => (s.nc!.err = err))
      document.getElementById('nc-' + Object.keys(err)[0])?.focus()
      return
    }
    const name = n.first.trim() + ' ' + n.last.trim()
    update((s) => {
      s.people.unshift({ name, email: n.email.trim(), co: n.co, role: n.role.trim() || 'Contact', colleague: n.colleague, contracts: 0, used: 'Never', signs: false })
      s.dialog = null
      s.nc = null
    })
    toast(`${name} is saved to your contacts.`)
  }
  return (
    <>
      <Title>Add contact</Title>
      <DialogDescription className="text-sm text-subtle-foreground">Saved contacts show up when you add parties and signatories to a contract.</DialogDescription>
      <div className="grid gap-4 sm:grid-cols-2">
        {input('first', 'First name *', 'For example: Anna')}
        {input('last', 'Last name *', 'For example: Weber')}
      </div>
      {input('email', 'Email *', 'name@company.ch', 'email', 'Contracts are sent to this address.')}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Company" htmlFor="nc-co" help="Pick a saved company.">
          <Select value={n.co || 'none'} onValueChange={(v) => set('co', v === 'none' ? '' : v)}>
            <SelectTrigger id="nc-co" className="h-10 w-full rounded-md border-border px-3 data-[size=default]:h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No company</SelectItem>
              {COMPANIES.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        {input('role', 'Role', 'For example: Legal counsel')}
      </div>
      <Field label="Type">
        <div role="radiogroup" aria-label="Type" className="inline-flex w-fit rounded-md border border-border bg-muted p-0.5">
          {(
            [
              [false, 'External'],
              [true, 'Colleague'],
            ] as const
          ).map(([v, l]) => (
            <button
              key={l}
              type="button"
              role="radio"
              aria-checked={n.colleague === v}
              onClick={() =>
                update((s) => {
                  s.nc!.colleague = v
                  if (v) s.nc!.co = 'selise'
                })
              }
              className={cn('h-9 rounded-[6px] px-4 text-sm text-subtle-foreground', n.colleague === v && 'bg-card font-medium text-heading shadow-sm')}
            >
              {l}
            </button>
          ))}
        </div>
      </Field>
      <Actions>
        <Button variant="outline" className={btn} onClick={close}>
          Cancel
        </Button>
        <Button className={btn} onClick={save}>
          Save contact
        </Button>
      </Actions>
    </>
  )
}

function PickContacts() {
  const S = useApp()
  const P = S.pc
  const q = P.q.trim().toLowerCase()
  const used = new Set(S.cur?.signers.map((s) => s.email))
  const list = S.people.filter((p) => !q || `${p.name} ${p.email} ${coOf(p.co)?.name ?? ''}`.toLowerCase().includes(q))
  const n = P.sel.length
  const add = () => {
    update((s) => {
      const c = s.cur!
      c.signersTouched = true
      c.signers = c.signers.filter((x) => x.name || x.email)
      for (const i of s.pc.sel) {
        const p = s.people[i]
        c.signers.push({ name: p.name, email: p.email, role: p.role, ext: !p.colleague })
      }
      s.dialog = null
    })
    toast(`${n} signator${n > 1 ? 'ies' : 'y'} added from contacts.`)
  }
  return (
    <>
      <Title>Add signatories from contacts</Title>
      <DialogDescription className="sr-only">Pick saved contacts to add as signatories.</DialogDescription>
      <SearchBox autoFocus value={P.q} onChange={(v) => update((s) => (s.pc.q = v))} placeholder="Search by name, email or company" />
      <div role="group" aria-label="Contacts" className="-mx-2 flex max-h-[360px] flex-col overflow-y-auto">
        {list.length ? (
          list.map((p) => {
            const i = S.people.indexOf(p)
            const dis = used.has(p.email)
            const on = P.sel.includes(i)
            return (
              <label key={i} className={cn('flex items-center gap-3 rounded-md p-2', dis ? 'cursor-default opacity-60' : 'cursor-pointer hover:bg-accent')}>
                <Checkbox
                  checked={on || dis}
                  disabled={dis}
                  onCheckedChange={(v) => update((s) => (s.pc.sel = v ? [...s.pc.sel, i] : s.pc.sel.filter((x) => x !== i)))}
                />
                <PersonAvatar name={p.name} className="size-8" />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium text-heading">{p.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{[p.role, coOf(p.co)?.name].filter(Boolean).join(' · ')}</span>
                  <span className="truncate text-xs text-muted-foreground">{p.email}</span>
                </span>
                {dis ? <span className="text-xs text-muted-foreground">Already added</span> : <Chip kind={p.colleague ? 'info' : 'neutral'}>{p.colleague ? 'Colleague' : 'External'}</Chip>}
              </label>
            )
          })
        ) : (
          <p className="py-6 text-center text-sm text-muted-foreground">No contacts match.</p>
        )}
      </div>
      <Actions>
        <Button variant="outline" className={btn} onClick={close}>
          Cancel
        </Button>
        <Button className={btn} disabled={!n} onClick={add}>
          {n ? `Add ${n} signator${n > 1 ? 'ies' : 'y'}` : 'Add signatories'}
        </Button>
      </Actions>
    </>
  )
}

/* ---------- Organizations ---------- */

function NewOrg() {
  const N = useApp().no
  const file = useRef<HTMLInputElement>(null)
  const create = () => {
    const name = N.name.trim()
    if (!name) return
    update((s) => {
      s.orgs.push({ n: name, plan: 'Free plan', left: 10, bg: 'var(--primary)', img: s.no.img || undefined })
      s.dialog = null
    })
    toast(`${name} created. Switching to it isn’t part of this prototype.`)
  }
  return (
    <>
      <Title>Create organization</Title>
      <DialogDescription className="sr-only">Add a picture and a name for the new organization.</DialogDescription>
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-heading">Company picture</span>
        <div className="flex items-center gap-4">
          <span className="grid size-16 flex-none place-items-center overflow-hidden rounded-lg border border-border bg-muted text-muted-foreground">
            {N.img ? <img src={N.img} alt="Company picture preview" className="size-full object-contain" /> : <ImageIcon className="size-6" />}
          </span>
          <div className="flex flex-col gap-1.5">
            <div className="flex gap-2">
              <Button variant="outline" className="h-9 px-3 font-medium" aria-describedby="no-pic-h" onClick={() => file.current?.click()}>
                <Upload className="size-4" />
                {N.img ? 'Change picture' : 'Upload picture'}
              </Button>
              {N.img && (
                <Button variant="ghost" className="h-9 px-3 font-medium" onClick={() => update((s) => (s.no.img = ''))}>
                  Remove
                </Button>
              )}
            </div>
            <span id="no-pic-h" className="text-xs text-muted-foreground">
              PNG, JPG or SVG. A square logo works best.
            </span>
          </div>
        </div>
        <input
          ref={file}
          type="file"
          accept="image/png,image/jpeg,image/svg+xml"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (!f) return
            const r = new FileReader()
            r.onload = () => update((s) => (s.no.img = String(r.result)))
            r.readAsDataURL(f)
            e.target.value = ''
          }}
        />
      </div>
      <Field label="Organization name" htmlFor="no-name" help="Shown across the app and in emails to signatories.">
        <input
          id="no-name"
          autoFocus
          autoComplete="organization"
          placeholder="For example, SELISE AG"
          value={N.name}
          onChange={(e) => update((s) => (s.no.name = e.target.value))}
          onKeyDown={(e) => e.key === 'Enter' && create()}
          className={inputClass}
        />
      </Field>
      <Actions>
        <Button variant="outline" className={btn} onClick={close}>
          Cancel
        </Button>
        <Button className={btn} disabled={!N.name.trim()} onClick={create}>
          Create organization
        </Button>
      </Actions>
    </>
  )
}

function DelOrg() {
  const G = useApp().set
  const ok = G.del.trim() === G.name
  return (
    <>
      <Title>Delete {G.name}?</Title>
      <div className="text-sm text-foreground">
        <DialogDescription className="text-sm text-foreground">This permanently deletes, for everyone in the organization:</DialogDescription>
        <ul className="mt-2 list-disc pl-5 text-subtle-foreground">
          <li>All templates and contracts</li>
          <li>All letterheads</li>
          <li>Team access and pending invitations</li>
          <li>Saved SELISE Signature credentials</li>
        </ul>
      </div>
      <p className="rounded-md bg-danger p-3 text-sm text-danger-foreground">This can’t be undone, and the data can’t be recovered.</p>
      <Field label={`Type ${G.name} to confirm`} htmlFor="del-confirm">
        <input id="del-confirm" autoFocus autoComplete="off" placeholder={G.name} value={G.del} onChange={(e) => update((s) => (s.set.del = e.target.value))} className={inputClass} />
      </Field>
      <Actions>
        <Button variant="outline" className={btn} onClick={close}>
          Cancel
        </Button>
        <Button
          className={cn(btn, dangerBtn)}
          disabled={!ok}
          onClick={() => {
            close()
            toast('Prototype only: the organization was not deleted.')
          }}
        >
          Delete organization
        </Button>
      </Actions>
    </>
  )
}

function McpToken() {
  const G = useApp().set
  const name = G.tkName.trim()
  const create = () => {
    if (!name) return
    const abc = 'abcdefghijkmnpqrstuvwxyz23456789'
    const v = 'lt_mcp_' + Array.from({ length: 32 }, () => abc[Math.floor(Math.random() * abc.length)]).join('')
    update((s) => {
      s.set.tkVal = v
      s.set.mcp.tokens.unshift({ name, meta: 'Created today · Never used' })
    })
  }
  if (G.tkVal)
    return (
      <>
        <Title>Copy your token</Title>
        <Field label={name} htmlFor="tk-val" help="Copy it now. You won’t be able to see this token again.">
          <div className="flex gap-2">
            <input id="tk-val" autoFocus readOnly value={G.tkVal} className={cn(inputClass, 'min-w-0 flex-1')} />
            <Button
              variant="outline"
              className={btn}
              onClick={() => {
                navigator.clipboard?.writeText(G.tkVal).catch(() => {})
                toast('Token copied.')
              }}
            >
              <Copy className="size-4" />
              Copy
            </Button>
          </div>
        </Field>
        <Actions>
          <Button className={btn} onClick={close}>
            Done
          </Button>
        </Actions>
      </>
    )
  return (
    <>
      <Title>Create access token</Title>
      <Field label="Token name" htmlFor="tk-name" help="Helps you recognize where the token is used.">
        <input
          id="tk-name"
          autoFocus
          autoComplete="off"
          placeholder="For example, Contract automation"
          value={G.tkName}
          onChange={(e) => update((s) => (s.set.tkName = e.target.value))}
          onKeyDown={(e) => e.key === 'Enter' && create()}
          className={inputClass}
        />
      </Field>
      <Actions>
        <Button variant="outline" className={btn} onClick={close}>
          Cancel
        </Button>
        <Button className={btn} disabled={!name} onClick={create}>
          Create token
        </Button>
      </Actions>
    </>
  )
}

const DIALOGS: Record<DialogId, { body: () => ReactNode; className: string; role?: 'alertdialog'; desc?: boolean }> = {
  start: { body: Start, className: 'sm:max-w-[560px] gap-5 p-6' },
  pick: { body: Pick, className: 'h-[min(760px,calc(100svh-48px))] sm:max-w-[1080px] gap-0 overflow-hidden p-0', desc: true },
  preview: { body: Preview, className: 'max-h-[calc(100svh-48px)] sm:max-w-[720px] gap-0 overflow-y-auto p-0' },
  cancel: { body: Cancel, className: 'sm:max-w-[480px] gap-5 p-6', role: 'alertdialog', desc: true },
  contact: { body: Contact, className: 'sm:max-w-[560px] gap-5 p-6', desc: true },
  pickContacts: { body: PickContacts, className: 'sm:max-w-[560px] gap-4 p-6', desc: true },
  doc: { body: Doc, className: 'max-h-[calc(100svh-48px)] sm:max-w-[820px] gap-0 overflow-y-auto p-0' },
  neworg: { body: NewOrg, className: 'sm:max-w-[480px] gap-5 p-6', desc: true },
  delorg: { body: DelOrg, className: 'sm:max-w-[480px] gap-5 p-6', role: 'alertdialog', desc: true },
  mcptoken: { body: McpToken, className: 'sm:max-w-[480px] gap-5 p-6' },
}

/** Renders the open dialog. Escape and a click outside close it, like the prototype. */
export function DialogHost() {
  const S = useApp()
  const d = S.dialog ? DIALOGS[S.dialog] : null
  const Body = d?.body
  return (
    <Dialog open={!!d} onOpenChange={(o) => !o && close()}>
      {d && Body && (
        <DialogContent showCloseButton={false} role={d.role} {...(d.desc ? {} : { 'aria-describedby': undefined })} className={cn('text-foreground', d.className)}>
          <Body />
        </DialogContent>
      )}
    </Dialog>
  )
}

