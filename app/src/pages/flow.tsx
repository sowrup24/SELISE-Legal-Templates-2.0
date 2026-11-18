import { useState, type ReactNode } from 'react'
import { ArrowLeft, CheckCircle2, Edit3, SquareUser, UserPlus, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { ContractDoc, DocDesk } from '@/components/contract-paper'
import { Field, Panel, PanelHead, inputClass } from '@/components/common/page'
import { DatePicker } from '@/components/flow/date-picker'
import { SuggestInput, type SuggestItem, type SuggestKind } from '@/components/flow/suggest-input'
import { SignerRow } from '@/components/signer-row'
import { Chip } from '@/components/status-chip'
import { coOf } from '@/data/contacts'
import { missing, names, partyName, syncSigners, tplOf, type Contract } from '@/data/contracts'
import type { TemplateField } from '@/data/templates'
import { ORIGIN, editorNotPorted, exitFlow, go, goStep, openContract, send, state, update, useApp, validateStep } from '@/lib/store'
import { cn } from '@/lib/utils'

/* Port of wizTop, V.edit, V.review and V.sent in preview/new-contract-flow.html.
   The contract builder (document editor) is not ported: its buttons show a toast. */

const STEPS = ['Details', 'Review and send']
/** At 1101px and wider, edit and review fill the window and scroll the form and the contract separately. */
const PIN = 'min-[1101px]:min-h-0 min-[1101px]:flex-1'

function WizTop({ c }: { c: Contract }) {
  const S = useApp()
  return (
    <div className="flex flex-col flex-wrap items-start justify-between gap-4 sm:flex-row sm:items-end">
      <div className="min-w-0">
        <button
          type="button"
          onClick={() => exitFlow(false)}
          className="-ml-1.5 mb-2 inline-flex h-8 items-center gap-1.5 rounded-md pr-2.5 pl-1.5 text-sm text-subtle-foreground hover:bg-accent hover:text-heading"
        >
          <ArrowLeft className="size-4" />
          Back to {(ORIGIN[S.origin] ?? 'Dashboard').toLowerCase()}
        </button>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold text-heading">{c.blank ? c.values.title || 'Untitled contract' : c.title}</h1>
          <Chip>Draft</Chip>
        </div>
        <div className="mt-1 flex items-center gap-3">
          <span className="text-sm text-subtle-foreground">
            Step {c.step + 1} of 2: {STEPS[c.step]}
          </span>
          <span className="flex gap-1.5" aria-hidden="true">
            {STEPS.map((_, i) => (
              <span key={i} className={cn('h-1.5 w-6 rounded-full bg-muted', i === c.step && 'bg-primary')} />
            ))}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" className="h-10 px-4 font-medium" onClick={() => exitFlow(true)}>
          Save as draft
        </Button>
        {c.step < 1 ? (
          <Button
            className="h-10 px-4 font-medium"
            onClick={() => {
              if (!goStep(1)) {
                const k = missing(c)[0]
                const el = k ? document.getElementById('f-' + k) : document.querySelector<HTMLElement>('[role="alert"]')
                el?.scrollIntoView({ block: 'center', behavior: 'smooth' })
                if (k) el?.focus({ preventScroll: true })
              }
            }}
          >
            Next: Review
          </Button>
        ) : (
          <Button className="h-10 px-4 font-medium" disabled={S.sending} onClick={send}>
            {S.sending ? 'Sending to SELISE Signature…' : 'Send for signature'}
          </Button>
        )}
      </div>
    </div>
  )
}

function MissingChip({ m }: { m: string[] }) {
  return m.length ? (
    <Chip kind="warning">
      {m.length} required detail{m.length > 1 ? 's' : ''} missing
    </Chip>
  ) : (
    <span className="flex items-center gap-1.5 text-sm text-success-foreground">
      <CheckCircle2 className="size-4" />
      All required details filled in
    </span>
  )
}

/** Changes the contract being edited and keeps the signatories and party in step. */
function edit(fn: (c: Contract) => void, sync = true) {
  update((s) => {
    const c = s.cur!
    fn(c)
    c.savedAt = 'just now'
    if (sync && !c.blank) {
      syncSigners(c)
      c.party = partyName(c)
    }
    if (s.showErrors) validateStep(c)
  })
}

function applySuggest(kind: SuggestKind, x: SuggestItem, signer?: number) {
  const S = state
  const c = S.cur!
  const has = (k: string) => tplOf(c).fields.some((f) => f.k === k)
  if (kind === 'signer' && x.t === 'p') {
    const p = S.people[x.id]
    edit((c) => {
      c.signersTouched = true
      c.signers[signer!] = { name: p.name, email: p.email, role: p.role, ext: !p.colleague }
    }, false)
    return toast(`${p.name} added as signatory.`)
  }
  if (kind === 'company' && x.t === 'co') {
    const co = coOf(x.id)!
    return edit((c) => {
      c.values.company = co.name
      c.values.companyAddress = co.addr
    })
  }
  if (x.t === 'co') {
    const co = coOf(x.id)!
    const at = S.people.filter((p) => p.co === co.id)
    const rep = at.find((p) => p.signs) ?? at[0]
    edit((c) => {
      c.values.name = co.name
      if (has('address')) c.values.address = co.addr
      if (rep && has('email')) c.values.email = rep.email
    })
    return toast(`Filled in from ${co.name}.`)
  }
  const p = S.people[x.id]
  edit((c) => {
    c.values.name = p.name
    if (has('email')) c.values.email = p.email
    if (has('address') && p.addr) c.values.address = p.addr
  })
  toast(`Filled in from ${p.name}.`)
}

function KeyField({ c, f, show, m, onFocusKey }: { c: Contract; f: TemplateField; show: boolean; m: string[]; onFocusKey: (k: string | null) => void }) {
  const err = show && m.includes(f.k)
  const id = 'f-' + f.k
  const v = c.values[f.k] || ''
  const set = (val: string) => edit((c) => (c.values[f.k] = val))
  const sg: SuggestKind | '' = f.k === 'company' ? 'company' : f.role === 'name' ? (f.label === 'Other party' ? 'party' : 'person') : ''
  const focus = { onFocus: () => onFocusKey(f.k), onBlur: () => onFocusKey(null) }
  let ctl: ReactNode
  if (f.options)
    ctl = (
      <Select value={v || undefined} onValueChange={set}>
        <SelectTrigger id={id} aria-invalid={err || undefined} {...focus} className="h-10 w-full rounded-md border-border px-3 data-[size=default]:h-10">
          <SelectValue placeholder="Choose…" />
        </SelectTrigger>
        <SelectContent>
          {f.options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  else if (f.type === 'date') ctl = <DatePicker id={id} value={v} onChange={set} invalid={err} className={inputClass} {...focus} />
  else if (sg)
    ctl = <SuggestInput id={id} kind={sg} value={v} onChange={set} onPick={(x) => applySuggest(sg, x)} aria-invalid={err || undefined} className={inputClass} {...focus} />
  else ctl = <input id={id} type={f.type === 'email' ? 'email' : 'text'} value={v} onChange={(e) => set(e.target.value)} aria-invalid={err || undefined} className={inputClass} {...focus} />
  return (
    <Field
      label={`${f.label}${f.req ? ' *' : ''}`}
      htmlFor={id}
      error={err ? (f.type === 'email' && v ? 'Enter a valid email address.' : 'Required.') : undefined}
      help={sg ? (sg === 'company' ? 'Type to pick a saved company.' : 'Type to pick a saved contact, or enter a new one.') : undefined}
    >
      {ctl}
    </Field>
  )
}

function Signatories({ c, onFocusKey }: { c: Contract; onFocusKey: (k: string | null) => void }) {
  const S = useApp()
  const E = S.errors
  const show = S.showErrors
  const errs = Object.values(E)
  const setSigner = (i: number, k: 'name' | 'email' | 'role', v: string) =>
    edit((c) => {
      c.signersTouched = true
      c.signers[i] = { ...c.signers[i], [k]: v }
    }, false)
  return (
    <>
      {show && errs.length > 0 && (
        <div role="alert" className="flex items-start gap-3 rounded-md border border-danger-foreground/30 bg-danger p-4 text-sm text-foreground">
          <X className="mt-0.5 size-4 flex-none text-danger-foreground" />
          <div>
            {errs.map((e, i) => (
              <div key={i}>{e}</div>
            ))}
          </div>
        </div>
      )}
      <Panel>
        <PanelHead title="Signatories" />
        <p className="text-sm text-muted-foreground">
          {c.blank ? 'Add the people who sign.' : 'Filled in from the parties.'} Each signatory gets an email from SELISE Signature. Colleagues and external people can sign.
        </p>
        {c.signers.length ? (
          c.signers.map((s, i) => {
            const bad = show && !!E['s' + i]
            const focus = { onFocus: () => onFocusKey('s' + i), onBlur: () => onFocusKey(null) }
            return (
              <div key={i} className="grid items-center gap-2 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1.4fr)_minmax(0,1fr)_auto_auto]">
                <SuggestInput
                  kind="signer"
                  value={s.name}
                  onChange={(v) => setSigner(i, 'name', v)}
                  onPick={(x) => applySuggest('signer', x, i)}
                  aria-label={`Name of signatory ${i + 1}`}
                  placeholder="Full name or pick a contact"
                  data-signer={i}
                  aria-invalid={bad || undefined}
                  className={inputClass}
                  {...focus}
                />
                <input type="email" aria-label={`Email of signatory ${i + 1}`} placeholder="name@company.com" value={s.email} onChange={(e) => setSigner(i, 'email', e.target.value)} aria-invalid={bad || undefined} className={inputClass} {...focus} />
                <input aria-label={`Role of signatory ${i + 1}`} placeholder="Role" value={s.role} onChange={(e) => setSigner(i, 'role', e.target.value)} className={inputClass} {...focus} />
                <span className="min-w-[72px]">{s.email && !s.email.endsWith('@selise.ch') && <Chip>External</Chip>}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9 text-muted-foreground"
                  aria-label={`Remove signatory ${i + 1}`}
                  onClick={() =>
                    edit((c) => {
                      c.signersTouched = true
                      c.signers.splice(i, 1)
                    }, false)
                  }
                >
                  <X className="size-4" />
                </Button>
              </div>
            )
          })
        ) : (
          <p className="py-3 text-center text-sm text-muted-foreground">No signatories yet. Add at least one.</p>
        )}
        <div className="flex flex-wrap gap-1">
          <Button
            variant="ghost"
            className="h-9 px-3 font-medium text-primary hover:text-primary"
            onClick={() => {
              edit((c) => {
                c.signersTouched = true
                c.signers.push({ name: '', email: '', role: '' })
              }, false)
              setTimeout(() => document.querySelector<HTMLInputElement>(`[data-signer="${c.signers.length - 1}"]`)?.focus(), 0)
            }}
          >
            <UserPlus className="size-4" />
            Add signatory
          </Button>
          <Button
            variant="ghost"
            className="h-9 px-3 font-medium text-primary hover:text-primary"
            onClick={() =>
              update((s) => {
                s.pc = { q: '', sel: [] }
                s.dialog = 'pickContacts'
              })
            }
          >
            <SquareUser className="size-4" />
            Add from contacts
          </Button>
        </div>
      </Panel>

      <Panel>
        <PanelHead title="Approval (optional)">
          <Switch aria-label="Needs approval" checked={c.needsApproval} onCheckedChange={(v) => edit((c) => (c.needsApproval = v), false)} />
        </PanelHead>
        <p className="text-sm text-muted-foreground">The approver checks the contract before signatories get their links, for example your unit head or manager.</p>
        {c.needsApproval && c.approver && (
          <div className="grid items-center gap-2 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1.4fr)_minmax(0,1fr)_auto]">
            {(
              [
                ['name', 'Approver name', 'Full name', 'text'],
                ['email', 'Approver email', 'name@selise.ch', 'email'],
                ['role', 'Approver role', 'Role', 'text'],
              ] as const
            ).map(([k, label, ph, type]) => (
              <input
                key={k}
                type={type}
                aria-label={label}
                placeholder={ph}
                value={c.approver![k]}
                aria-invalid={(show && !!E.appr) || undefined}
                onChange={(e) => edit((c) => (c.approver = { ...c.approver!, [k]: e.target.value }), false)}
                className={inputClass}
              />
            ))}
            <Chip kind="info">Colleague</Chip>
          </div>
        )}
      </Panel>

      <Panel>
        <PanelHead title="Message to signatories (optional)" />
        <Textarea
          aria-label="Message to signatories"
          placeholder="For example: Please sign before your first day."
          value={c.message}
          onChange={(e) => edit((c) => (c.message = e.target.value), false)}
          className="min-h-24 rounded-md border-border text-sm"
        />
        <span className="text-xs text-muted-foreground">SELISE Signature also sends automatic reminders.</span>
      </Panel>
    </>
  )
}

/** Clicking a value in the contract moves to its field. */
function focusField(k: string) {
  const el = /^s\d+$/.test(k) ? document.querySelector<HTMLElement>(`[data-signer="${k.slice(1)}"]`) : document.getElementById('f-' + k)
  if (!el) return
  el.scrollIntoView({ block: 'center', behavior: 'smooth' })
  el.focus({ preventScroll: true })
  if (el.getAttribute('aria-haspopup') === 'dialog') el.click()
}

export function Edit() {
  const S = useApp()
  const c = S.cur!
  const [focusKey, setFocusKey] = useState<string | null>(null)
  const m = missing(c)
  const show = S.showErrors

  let form: ReactNode
  if (c.blank) {
    const err = show && m.includes('title')
    form = (
      <>
        <Field label="Contract title *" htmlFor="f-title" error={err ? 'Required.' : undefined}>
          <input
            id="f-title"
            autoFocus
            value={c.values.title || ''}
            placeholder="For example: Consulting agreement with Bluewave AG"
            aria-invalid={err || undefined}
            onChange={(e) =>
              edit((c) => {
                c.values.title = e.target.value
                c.title = e.target.value || 'Untitled contract'
              })
            }
            className={inputClass}
          />
        </Field>
        <p className="text-sm text-muted-foreground">Write the contract text on the right. You add signatories in the next step.</p>
      </>
    )
  } else {
    let g = ''
    form = tplOf(c).fields.map((f) => {
      const head = f.group !== g ? (g = f.group) : null
      return (
        <div key={f.k} className="flex flex-col gap-3">
          {head && <div className="pt-2 text-xs font-medium text-muted-foreground">{head}</div>}
          <KeyField c={c} f={f} show={show} m={m} onFocusKey={setFocusKey} />
        </div>
      )
    })
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 min-[1101px]:h-full min-[1101px]:min-h-0">
      <WizTop c={c} />
      <div className={cn('grid items-start gap-6 min-[1101px]:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] min-[1101px]:grid-rows-[minmax(0,1fr)] min-[1101px]:items-stretch', PIN)}>
        <div className="flex flex-col gap-3 min-[1101px]:min-h-0 min-[1101px]:overflow-y-auto min-[1101px]:pr-1">
          <Panel>
            <PanelHead title={c.blank ? 'Contract' : 'Key details'}>
              <MissingChip m={m} />
            </PanelHead>
            {!c.blank && <p className="text-sm text-muted-foreground">They appear in the contract as you type. Required details are marked with *.</p>}
            {form}
          </Panel>
          <Signatories c={c} onFocusKey={setFocusKey} />
        </div>
        <DocDesk
          title="Contract"
          className="min-[1101px]:min-h-0"
          scrollClassName={PIN + ' min-[1101px]:overflow-y-auto'}
          tools={
            <>
              <span className="text-xs text-muted-foreground">{c.blank ? 'Write the contract in the contract builder.' : 'To change the wording, edit the template.'}</span>
              <Button variant="outline" className="h-9 px-3 font-medium" onClick={editorNotPorted}>
                <Edit3 className="size-4" />
                {c.blank ? 'Open contract builder' : 'Edit template'}
              </Button>
            </>
          }
        >
          {() => <ContractDoc contract={c} focusKey={focusKey} onPick={focusField} />}
        </DocDesk>
      </div>
    </div>
  )
}

export function Review() {
  const c = useApp().cur!
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 min-[1101px]:h-full min-[1101px]:min-h-0">
      <WizTop c={c} />
      <DocDesk
        title="Contract"
        className={PIN}
        scrollClassName={PIN + ' min-[1101px]:overflow-y-auto'}
        tools={
          <Button variant="outline" className="h-9 px-3 font-medium" onClick={() => goStep(0)}>
            <Edit3 className="size-4" />
            Edit details
          </Button>
        }
      >
        {() => <ContractDoc contract={c} />}
      </DocDesk>
    </div>
  )
}

export function Sent() {
  const c = useApp().detail!
  const ap = !!c.approver && c.status === 'Waiting for approval'
  const many = c.signers.length > 1
  return (
    <div className="flex justify-center p-4 py-12 md:p-6 md:py-16">
      <div className="flex w-full max-w-[600px] flex-col items-center gap-4 text-center">
        <CheckCircle2 className="size-14 text-success-foreground" aria-hidden="true" />
        <h1 className="text-2xl font-semibold text-heading">{ap ? 'Sent for approval' : 'Sent for signature'}</h1>
        <p className="text-base text-subtle-foreground">
          {ap
            ? `${c.approver!.name} approves the contract first. Then SELISE Signature sends ${names(c)} their links.`
            : many
              ? `SELISE Signature sent ${c.signers[0].name} the signing link. The next signer${c.signers.length > 2 ? 's follow' : ' follows'} automatically.`
              : `${names(c)} got the signing link from SELISE Signature.`}
        </p>
        <div className="w-full divide-y divide-border-subtle rounded-xl border border-border bg-card px-4 text-left">
          {ap && <SignerRow label="Approval" person={c.approver!} state="Waiting for approval" kind="warning" />}
          {c.signers.map((s, i) => (
            <SignerRow
              key={i}
              label={c.order ? String(i + 1) : 'Signs'}
              person={s}
              state={ap ? 'After approval' : i === 0 || !c.order ? 'Email sent' : `After ${c.signers[i - 1].name}`}
              kind={ap || (i > 0 && c.order) ? 'neutral' : 'info'}
            />
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          The contract moved from Drafts to All contracts. You get an email when it is {ap ? 'approved and when it is ' : ''}fully signed.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button variant="outline" className="h-10 px-4 font-medium" onClick={() => go('dashboard')}>
            Back to dashboard
          </Button>
          <Button className="h-10 px-4 font-medium" onClick={() => openContract(c.id)}>
            View contract
          </Button>
        </div>
      </div>
    </div>
  )
}
