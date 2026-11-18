/* Contracts: types, seed data and helpers, ported from preview/new-contract-flow.html. */
import { TEMPLATES, type Template, type TemplateField } from '@/data/templates'

export type ContractStatus =
  | 'Draft'
  | 'Waiting for approval'
  | 'Out for signature'
  | 'Completed'
  | 'Declined'
  | 'Expired'
  | 'Cancelled'

export type SignerState = 'waiting' | 'sent' | 'opened' | 'signed' | 'declined'

export type Signer = { name: string; email: string; role: string; ext?: boolean; state?: SignerState; when?: string }

export type Approver = {
  name: string
  email: string
  role: string
  state?: 'pending' | 'approved' | 'rejected'
  when?: string
}

export type Contract = {
  id: number
  title: string
  party: string
  status: ContractStatus
  updated: string
  /** Sample contract from the seed list; it can't go through the flow. */
  seed?: boolean
  /** Seed drafts only: how many fields are filled, for example "8 of 12 fields". */
  draftNote?: string
  signed?: number
  total?: number
  due?: string
  note?: string
  /** Contracts made in the app */
  tpl?: string
  blank?: boolean
  values: Record<string, string>
  step: number
  order: boolean
  needsApproval: boolean
  approver: Approver | null
  message: string
  signers: Signer[]
  signersTouched: boolean
  activity: [string, string][]
  sentAt?: string
  remindedToday?: boolean
  lastRemind?: string
  rejected?: string | null
  savedAt?: string
  fromLib?: boolean
}

export const ME = { name: 'Lea Fischer', email: 'lea.fischer@selise.ch', role: 'HR manager', access: 'Admin' }

export const emailOk = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e || '')

/** Date and time like "17 Nov, 14:05". */
export function now() {
  const d = new Date()
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ', ' + d.toTimeString().slice(0, 5)
}

let nid = 100
export const nextId = () => ++nid

const seed = (title: string, party: string, status: ContractStatus, o: Partial<Contract> = {}): Contract => ({
  id: nextId(),
  title,
  party,
  status,
  updated: 'Today',
  values: {},
  step: 0,
  order: true,
  needsApproval: false,
  approver: null,
  message: '',
  signers: [],
  signersTouched: false,
  activity: [],
  seed: true,
  ...o,
})

export const seedContracts = (): Contract[] => [
  seed('Employment contract', 'Anna Meier', 'Draft', { updated: '1 hour ago', draftNote: '8 of 12 fields' }),
  seed('Consulting agreement', 'Jonas Brandt', 'Out for signature', { updated: 'Yesterday', signed: 2, total: 3 }),
  seed('Employment contract', 'Tom Weber', 'Out for signature', { updated: '2 days ago', signed: 1, total: 2, due: 'Due in 2 days' }),
  seed('Freelance agreement', 'Luca Rossi', 'Waiting for approval', { updated: 'Yesterday', signed: 0, total: 2 }),
  seed('NDA', 'Luca Frei', 'Out for signature', { updated: '3 days ago', signed: 0, total: 2, due: 'Due tomorrow' }),
  seed('Consulting agreement', 'Mia Schmid', 'Out for signature', { updated: 'Today', signed: 1, total: 3 }),
  seed('Employment contract', 'Sara Keller', 'Draft', { updated: 'Yesterday', draftNote: '10 of 12 fields' }),
  seed('Service agreement', 'Bluewave AG', 'Out for signature', { updated: '4 days ago', signed: 2, total: 3 }),
  seed('Internship contract', 'Elena Frei', 'Waiting for approval', { updated: 'Today', signed: 0, total: 2 }),
  seed('Shareholder agreement', 'Nordlicht Ventures AG', 'Out for signature', { updated: '1 week ago', signed: 3, total: 4 }),
  seed('Employment contract', 'David Graf', 'Completed', { updated: '3 Nov', signed: 2, total: 2 }),
  seed('NDA', 'Helix Labs GmbH', 'Completed', { updated: '30 Oct', signed: 2, total: 2 }),
  seed('Employment contract', 'Ben Huber', 'Declined', { updated: '1 Nov', note: 'Ben Huber declined. Cancelled for everyone.' }),
  seed('NDA', 'Globex GmbH', 'Expired', { updated: '31 Oct', note: 'Signing deadline passed, 1 of 2 signed.' }),
  seed('Employment contract', 'Jonas Keller', 'Completed', { updated: '5 Nov', signed: 2, total: 2 }),
  seed('Data processing agreement', 'Cloudhost GmbH', 'Cancelled', { updated: '28 Oct', note: 'Cancelled by Lea Fischer.' }),
]

export type StatusKind = 'neutral' | 'info' | 'warning' | 'success' | 'error'

export const KIND: Record<ContractStatus, StatusKind> = {
  Draft: 'neutral',
  'Waiting for approval': 'warning',
  'Out for signature': 'info',
  Completed: 'success',
  Declined: 'error',
  Expired: 'warning',
  Cancelled: 'neutral',
}

export const isLive = (c: Contract) => c.status === 'Out for signature' || c.status === 'Waiting for approval'

export const tplOf = (c: Contract): Template => TEMPLATES.find((t) => t.id === c.tpl) ?? TEMPLATES[0]

/** Keys of required fields that are empty, plus email fields that are invalid. */
export function missing(c: Contract): string[] {
  if (c.blank) return c.values.title ? [] : ['title']
  const t = tplOf(c)
  const empty = t.fields.filter((f) => f.req && !String(c.values[f.k] || '').trim()).map((f) => f.k)
  const badMail = t.fields.filter((f) => f.type === 'email' && c.values[f.k] && !emailOk(c.values[f.k])).map((f) => f.k)
  return [...empty, ...badMail]
}

/** Formats date fields as "17 November 2026". */
export const fmt = (f: TemplateField | { type?: string } | undefined, v: string) =>
  f && f.type === 'date' && v
    ? new Date(v + 'T00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : v

export const partyName = (c: Contract) =>
  c.blank ? c.signers[0]?.name || 'No signatory yet' : c.values.name || 'New party'

export function newContract(tplId: string, blank: boolean): Contract {
  const t = TEMPLATES.find((x) => x.id === tplId) ?? TEMPLATES[0]
  const values: Record<string, string> = {}
  if (!blank) for (const f of t.fields) if (f.v) values[f.k] = f.v
  return {
    id: nextId(),
    tpl: t.id,
    blank,
    title: blank ? 'Untitled contract' : t.name,
    party: '',
    values,
    step: 0,
    order: true,
    needsApproval: false,
    approver: { name: 'Sara Meier', email: 'sara.meier@selise.ch', role: 'Admin manager' },
    message: '',
    signers: [],
    signersTouched: false,
    status: 'Draft',
    updated: 'Just now',
    activity: [[now(), blank ? 'Created as a blank contract.' : `Created from the template ${t.name}.`]],
  }
}

/** Template contracts fill the signatories from the parties until the user edits them. */
export function syncSigners(c: Contract) {
  if (c.blank || c.signersTouched) return
  const t = tplOf(c)
  c.signers = [
    { name: c.values.name || '', email: c.values.email || '', role: t.partyRole, ext: true },
    { name: ME.name, email: ME.email, role: ME.role, ext: false },
  ]
}

/** Progress label and fraction (0 to 1) shown in tables. */
export function progressOf(c: Contract): [string, number] {
  if (c.status === 'Draft') {
    if (c.seed) {
      const m = (c.draftNote ?? '').match(/(\d+) of (\d+)/)
      return [c.draftNote ?? 'Draft', m ? Number(m[1]) / Number(m[2]) : 0.5]
    }
    const total = c.blank ? 1 : tplOf(c).fields.filter((f) => f.req).length
    const m = missing(c).length
    return [`${total - m} of ${total} fields`, (total - m) / total]
  }
  const total = c.signers.length || c.total || 1
  const signed = c.signers.length ? c.signers.filter((s) => s.state === 'signed').length : (c.signed ?? 0)
  return [`${signed} of ${total} signed`, signed / total]
}

export type ContractAction = 'continue' | 'review-again' | 'resend'

/** The one action a row offers, if any. */
export function actionOf(c: Contract): [string, ContractAction] | null {
  if (c.status === 'Draft') return ['Continue', 'continue']
  if (c.status === 'Declined') return ['Review', 'review-again']
  if (c.status === 'Expired') return ['Resend', 'resend']
  return null
}

/** "Anna, Ben and Carla" */
export function names(c: Contract) {
  const n = c.signers.map((s) => s.name)
  return n.length < 2 ? n.join('') : n.slice(0, -1).join(', ') + ' and ' + n[n.length - 1]
}

/** An empty contract for previewing a template. */
export function previewContract(t: Template): Contract {
  return {
    id: 0, tpl: t.id, title: t.name, party: '', status: 'Draft', updated: '', values: {}, step: 0, order: true,
    needsApproval: false, approver: null, message: '', signers: [], signersTouched: false, activity: [],
  }
}
