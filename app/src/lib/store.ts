/* App state, ported from the prototype's global S object and its act handlers.
   The state is one mutable object, like in preview/new-contract-flow.html. Call update()
   after changing it; every component that uses useApp() then renders again. */
import { useSyncExternalStore } from 'react'
import { toast } from 'sonner'
import {
  ME, emailOk, missing, newContract, now, partyName, seedContracts, syncSigners,
  type Contract,
} from '@/data/contracts'
import { seedPeople, type Person } from '@/data/contacts'
import { seedNotifications } from '@/data/notifications'
import { CATEGORIES } from '@/data/templates'

export type View =
  | 'dashboard' | 'contracts' | 'library' | 'contacts' | 'companies' | 'company' | 'settings'
  | 'edit' | 'review' | 'sent' | 'details'

export type DialogId =
  | 'start' | 'pick' | 'preview' | 'cancel' | 'contact' | 'pickContacts' | 'doc' | 'neworg' | 'delorg' | 'mcptoken'

export type McpPerm = 'read' | 'draft' | 'send' | 'contacts'
export type SettingsSection = 'general' | 'letterheads' | 'integrations' | 'signature' | 'mcp'

export type Org = { n: string; plan: string; left: number; bg: string; img?: string }

export const FLOW: View[] = ['edit', 'review', 'sent']
/** Screens you can link to; the others need state, so a reload goes to the dashboard. */
const LINKABLE: View[] = ['dashboard', 'contracts', 'library', 'contacts', 'companies', 'settings']

export const ORIGIN: Partial<Record<View, string>> = {
  dashboard: 'Dashboard', contracts: 'Contracts', library: 'Templates', details: 'Contracts',
}

const S = {
  view: 'dashboard' as View,
  dialog: null as DialogId | null,
  /** Screen the new contract flow was started from */
  origin: 'dashboard' as View,
  listTab: 'all',
  contracts: seedContracts(),
  people: seedPeople(),
  notifications: seedNotifications(),
  orgs: [] as Org[],
  lang: 'en' as 'en' | 'de',
  /** Contract being created or edited */
  cur: null as Contract | null,
  /** Contract shown on the details and sent screens */
  detail: null as Contract | null,
  errors: {} as Record<string, string>,
  showErrors: false,
  sending: false,
  pick: { cat: 'All templates', q: '', sel: 'nda' },
  lib: { sel: 'nda', q: '', cat: CATEGORIES[0] },
  ct: { q: '', tab: 'all', co: '' },
  co: { q: '', sel: 'bluewave' },
  nc: null as null | {
    first: string; last: string; email: string; co: string; role: string; colleague: boolean
    err: Record<string, string>
  },
  pc: { q: '', sel: [] as number[] },
  no: { name: '', img: '' },
  set: {
    sec: 'general' as SettingsSection,
    name: 'SELISE AG', slug: 'selise-ag', dName: 'SELISE AG', dSlug: 'selise-ag',
    acct: 'default' as 'default' | 'own', own: false, cid: '', csec: '', cidLast: '',
    lh: [] as { name: string; meta: string; def: boolean }[],
    del: '',
    mcp: {
      on: true,
      perms: { read: true, draft: true, send: false, contacts: false } as Record<McpPerm, boolean>,
      tokens: [{ name: 'Contract automation', meta: 'Created 2 Nov 2026 · Last used yesterday' }],
      clients: [
        { n: 'Claude', meta: 'Connected 10 Nov 2026 · Last used 2 hours ago' },
        { n: 'Cursor', meta: 'Connected 14 Nov 2026 · Last used 3 days ago' },
      ],
    },
    tkName: '', tkVal: '',
  },
}
export type AppState = typeof S

S.orgs = [
  { n: S.set.name, plan: 'Team plan', left: 500, bg: 'var(--primary)', img: 'selise' },
  { n: 'Wish Fest', plan: 'Starter plan', left: 40, bg: '#4a1d3f' },
]

let version = 0
const listeners = new Set<() => void>()
const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

/** Changes the state (optionally) and renders again. */
export function update(fn?: (s: AppState) => void) {
  fn?.(S)
  version++
  listeners.forEach((l) => l())
}

export function useApp() {
  useSyncExternalStore(subscribe, () => version)
  return S
}

export const state = S

/* ---------- Navigation ---------- */

function readHash() {
  const [view, tab] = window.location.hash.replace(/^#\/?/, '').split('/')
  if (LINKABLE.includes(view as View)) {
    S.view = view as View
    if (view === 'contracts') S.listTab = tab ? decodeURIComponent(tab) : 'all'
    if (view === 'settings' && tab) S.set.sec = tab as SettingsSection
  } else S.view = 'dashboard'
}
readHash()
window.addEventListener('hashchange', () => update(readHash))

function writeHash() {
  if (!LINKABLE.includes(S.view)) return
  const tab = S.view === 'contracts' && S.listTab !== 'all' ? S.listTab : S.view === 'settings' ? S.set.sec : ''
  const h = `#${S.view}${tab ? '/' + encodeURIComponent(tab) : ''}`
  if (window.location.hash !== h) history.pushState(null, '', h)
}

/** Shows a screen. Leaving the contract flow keeps the draft. */
export function go(view: View, opts: { tab?: string } = {}) {
  update((s) => {
    if (s.cur && (s.view === 'edit' || s.view === 'review') && view !== s.view) {
      s.cur.updated = 'Just now'
      s.cur = null
      toast('Saved in Drafts. Continue any time.')
    }
    if (FLOW.includes(view) && !FLOW.includes(s.view)) s.origin = s.view
    s.view = view
    if (view === 'contracts') s.listTab = opts.tab ?? 'all'
    s.dialog = null
  })
  writeHash()
  window.scrollTo(0, 0)
}

export const setListTab = (tab: string) => {
  update((s) => (s.listTab = tab))
  writeHash()
}

export const openDialog = (d: DialogId | null) => update((s) => (s.dialog = d))

/* ---------- Contract actions ---------- */

const find = (id: number) => S.contracts.find((c) => c.id === id)!

export function openContract(id: number) {
  const c = find(id)
  if (c.status === 'Draft' && !c.seed) return continueContract(id)
  update((s) => {
    s.detail = c
    s.view = 'details'
  })
  window.scrollTo(0, 0)
}

export function continueContract(id: number) {
  const c = find(id)
  if (c.seed) return toast('This draft is sample data. Create a new contract to try the flow.')
  update((s) => {
    if (!FLOW.includes(s.view)) s.origin = s.view
    s.cur = c
    s.view = (['edit', 'review'] as const)[Math.min(c.step || 0, 1)]
    s.showErrors = false
  })
}

export function resend(id: number) {
  const c = find(id)
  if (c.seed) return toast('This contract is sample data. Create a new contract to try Resend.')
  update((s) => {
    c.step = 1
    c.status = 'Draft'
    c.activity.push([now(), 'Opened again to resend. Signing starts over.'])
    if (!FLOW.includes(s.view)) s.origin = s.view
    s.cur = c
    s.view = 'review'
  })
}

export function runAction(action: 'continue' | 'review-again' | 'resend', id: number) {
  if (action === 'continue') continueContract(id)
  else resend(id)
}

export function startFromTemplate(tplId: string) {
  update((s) => {
    const c = newContract(tplId, false)
    c.fromLib = s.view === 'library' && !s.dialog
    syncSigners(c)
    c.party = partyName(c)
    s.contracts.unshift(c)
    if (!FLOW.includes(s.view)) s.origin = s.view
    s.cur = c
    s.dialog = null
    s.view = 'edit'
    s.showErrors = false
  })
  toast('Draft created. It is saved in Drafts as you go.')
  window.scrollTo(0, 0)
}

export function startBlank() {
  update((s) => {
    const c = newContract('nda', true)
    s.contracts.unshift(c)
    if (!FLOW.includes(s.view)) s.origin = s.view
    s.cur = c
    s.dialog = null
    s.view = 'edit'
    s.showErrors = false
  })
  window.scrollTo(0, 0)
  /* The prototype opens the contract builder here; it isn't ported. */
  setTimeout(editorNotPorted, 0)
}

/** Checks step 1 (details and signatories). Fills S.errors. */
export function validateStep(c: Contract) {
  S.errors = {}
  if (c.step !== 0) return true
  const okFields = missing(c).length === 0
  if (!c.signers.length) S.errors.none = 'Add at least one signatory.'
  c.signers.forEach((s, i) => {
    if (!s.name.trim() || !emailOk(s.email)) S.errors['s' + i] = `Signatory ${i + 1}: add a name and a valid email.`
  })
  if (c.needsApproval && c.approver && (!c.approver.name.trim() || !emailOk(c.approver.email)))
    S.errors.appr = 'Approver: add a name and a valid email.'
  c.signers.forEach((s, i) => {
    const j = c.signers.findIndex((x) => x.email && x.email.trim().toLowerCase() === s.email.trim().toLowerCase())
    if (s.email && j < i && !S.errors['s' + i])
      S.errors['s' + i] = `Signatories ${j + 1} and ${i + 1} have the same email. Each signatory needs their own.`
  })
  return okFields && !Object.keys(S.errors).length
}

/** Goes to step n (0 = details, 1 = review). Returns false when step 1 has errors. */
export function goStep(n: number) {
  const c = S.cur!
  if (n > c.step && !validateStep(c)) {
    update((s) => (s.showErrors = true))
    return false
  }
  update((s) => {
    s.showErrors = false
    s.errors = {}
    c.step = n
    c.savedAt = 'just now'
    s.view = (['edit', 'review'] as const)[n]
  })
  window.scrollTo(0, 0)
  return true
}

function startSend(c: Contract) {
  c.status = c.needsApproval ? 'Waiting for approval' : 'Out for signature'
  c.sentAt = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  c.updated = 'Just now'
  c.party = partyName(c)
  c.remindedToday = false
  c.rejected = null
  c.signers = c.signers.map((s, i) => ({
    ...s,
    state: c.needsApproval ? 'waiting' : i === 0 || !c.order ? 'sent' : 'waiting',
    when: '',
  }))
  if (c.needsApproval && c.approver) c.approver = { ...c.approver, state: 'pending', when: '' }
  c.activity.push([now(), c.needsApproval ? `${ME.name} sent the contract for approval.` : `${ME.name} sent the contract for signature.`])
  if (!S.contracts.includes(c)) S.contracts.unshift(c)
}

export function send() {
  if (S.sending) return
  update((s) => (s.sending = true))
  setTimeout(() => {
    update((s) => {
      const c = s.cur!
      startSend(c)
      s.detail = c
      s.cur = null
      s.sending = false
      s.view = 'sent'
    })
    window.scrollTo(0, 0)
  }, 900)
}

/** Leaves the flow and keeps the draft. */
export function exitFlow(saveButton: boolean) {
  update((s) => {
    if (s.cur) s.cur.updated = 'Just now'
    s.cur = null
    s.view = s.origin === 'details' ? 'contracts' : ORIGIN[s.origin] ? s.origin : 'dashboard'
  })
  writeHash()
  toast(saveButton ? 'Saved in Drafts. Continue any time from the Dashboard or Contracts.' : 'Saved in Drafts. Continue any time from Contracts.')
}

export function cancelContract() {
  update((s) => {
    const c = s.detail!
    c.status = 'Cancelled'
    c.note = `Cancelled by ${ME.name}.`
    c.updated = 'Just now'
    c.activity.push([now(), `${ME.name} cancelled the contract. Everyone got an email.`])
    s.dialog = null
  })
  toast('Contract cancelled. Signatories got an email.')
}

/** Prototype controls: what approvers and signatories do in SELISE Signature. */
export function simulate(kind: 'approve' | 'reject' | 'open' | 'sign' | 'decline' | 'expire') {
  update((s) => {
    const c = s.detail!
    const t = now()
    const next = c.signers.find((x) => x.state !== 'signed')
    const ap = c.approver
    if (kind === 'approve' && ap) {
      ap.state = 'approved'
      ap.when = t
      c.status = 'Out for signature'
      c.signers.forEach((x, i) => (x.state = i === 0 || !c.order ? 'sent' : 'waiting'))
      c.activity.push([t, `${ap.name} approved. Signatories got their links.`])
    }
    if (kind === 'reject' && ap) {
      ap.state = 'rejected'
      ap.when = t
      c.status = 'Draft'
      c.rejected = 'Please change the confidentiality period to 5 years.'
      c.step = 0
      c.activity.push([t, `${ap.name} did not approve: ${c.rejected}`])
    }
    if (kind === 'open' && next) {
      next.state = 'opened'
      next.when = 'Opened ' + t
      c.activity.push([t, `${next.name} opened the contract.`])
    }
    if (kind === 'sign' && next) {
      next.state = 'signed'
      next.when = 'Signed ' + t
      c.activity.push([t, `${next.name} signed.`])
      const after = c.signers.find((x) => x.state !== 'signed')
      if (after) {
        if (after.state === 'waiting') after.state = 'sent'
      } else {
        c.status = 'Completed'
        c.updated = 'Just now'
        c.activity.push([t, 'Everyone signed. All parties got the signed PDF.'])
        toast('Completed. Everyone got the signed PDF.')
      }
    }
    if (kind === 'decline' && next) {
      next.state = 'declined'
      next.when = 'Declined ' + t
      c.status = 'Declined'
      c.note = `${next.name} declined. Cancelled for everyone.`
      c.updated = 'Just now'
      c.activity.push([t, `${next.name} declined. The contract is cancelled for everyone.`])
    }
    if (kind === 'expire') {
      c.status = 'Expired'
      c.note = `Signing deadline passed, ${c.signers.filter((x) => x.state === 'signed').length} of ${c.signers.length} signed.`
      c.updated = 'Just now'
      c.activity.push([t, 'The signing deadline passed.'])
    }
  })
}

/* ---------- Contacts ---------- */

export function addPerson(p: Person) {
  update((s) => s.people.unshift(p))
}

export const notPorted = (what: string) => toast(`${what} isn’t part of this prototype.`)

/** The document editor (contract builder) is not part of the React app. */
export const editorNotPorted = () =>
  toast('The document editor isn’t ported to React. Use the HTML prototype to edit the wording.')

/* ---------- Menus ---------- */

export function openSettings(sec: SettingsSection) {
  S.set.sec = sec
  S.set.own = false
  go('settings')
}

export function openNotification(i: number) {
  const n = S.notifications[i]
  const c = S.contracts.find((x) => x.title === n.t && x.party === n.p)
  update((s) => {
    n.read = true
    if (c) {
      s.detail = c
      s.view = 'details'
      s.dialog = null
    }
  })
  if (c) window.scrollTo(0, 0)
}

export const markAllRead = () => update((s) => s.notifications.forEach((n) => (n.read = true)))

export function setLang(lang: 'en' | 'de') {
  update((s) => (s.lang = lang))
  toast(lang === 'de' ? 'Language set to Deutsch. The prototype text stays in English.' : 'Language set to English.')
}
