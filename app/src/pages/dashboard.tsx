import type { ReactNode } from 'react'
import { ChevronRight, FileText, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { StatusBadge, StatusChip } from '@/components/status-chip'
import { actionOf, progressOf, type Contract } from '@/data/contracts'
import { TEMPLATES } from '@/data/templates'
import { cn } from '@/lib/utils'
import { go, openContract, openDialog, runAction, update, useApp } from '@/lib/store'

/* Port of V.dashboard in preview/new-contract-flow.html.
   Card numbers add sample history so the dashboard looks like a real account. */

function SectionHeader({ title, link, onLink }: { title: string; link: string; onLink: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className="text-base font-semibold text-heading">{title}</h2>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault()
          onLink()
        }}
        className="text-sm font-medium text-primary hover:underline"
      >
        {link}
      </a>
    </div>
  )
}

function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('overflow-hidden rounded-xl border border-border bg-card', className)}>{children}</div>
}

function StatCard({ value, label, bar }: { value: number; label: string; bar: string }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-xl border border-border bg-card p-5">
      <strong className="text-[32px] leading-10 font-semibold text-heading">{value}</strong>
      <span className="flex items-center gap-3 text-sm text-muted-foreground">
        <span className={cn('h-5 w-1.5 flex-none rounded-[3px]', bar)} aria-hidden="true" />
        {label}
      </span>
    </div>
  )
}

function rowDetail(c: Contract) {
  if (c.status === 'Draft') return `Edited ${c.updated.toLowerCase()}`
  if (c.status === 'Waiting for approval') return `Waiting for ${c.approver?.name ?? 'approval'}`
  return `Updated ${c.updated.toLowerCase()}`
}

function ActiveRow({ contract: c }: { contract: Contract }) {
  const [label, value] = progressOf(c)
  const action = actionOf(c)
  return (
    <TableRow className="cursor-pointer hover:bg-accent" onClick={() => openContract(c.id)}>
      <TableCell className="h-[72px] px-4">
        <div className="text-sm text-foreground">
          {c.title} — {c.party}
        </div>
        <div className="mt-1 text-xs text-muted-foreground">{rowDetail(c)}</div>
      </TableCell>
      <TableCell className="w-[150px] px-4">
        <div className="flex w-[118px] flex-col gap-2">
          <span className="text-sm text-subtle-foreground">{label}</span>
          <Progress value={value * 100} aria-label={label} />
        </div>
      </TableCell>
      <TableCell className="w-[230px] px-4">
        <StatusChip contract={c} />
      </TableCell>
      <TableCell className="w-[120px] px-4">
        {action && (
          <Button
            variant="outline"
            className="h-9 px-3 font-medium"
            onClick={(e) => {
              e.stopPropagation()
              runAction(action[1], c.id)
            }}
          >
            {action[0]}
          </Button>
        )}
      </TableCell>
    </TableRow>
  )
}

export function Dashboard() {
  const C = useApp().contracts
  const count = (statuses: Contract['status'][]) => C.filter((c) => statuses.includes(c.status)).length
  const attention = C.filter((c) => c.status === 'Declined' || c.status === 'Expired')
  const active = C.filter((c) => ['Draft', 'Waiting for approval', 'Out for signature'].includes(c.status))

  const stats = [
    { label: 'Needs attention', value: attention.length + 12, bar: 'bg-stat-warning' },
    { label: 'Out for signature', value: count(['Out for signature', 'Waiting for approval']) - 1, bar: 'bg-stat-info' },
    { label: 'Drafts', value: count(['Draft']) + 27, bar: 'bg-stat-neutral' },
    { label: 'Completed', value: count(['Completed']) + 139, bar: 'bg-stat-success' },
  ]

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-heading">Good morning, Lea</h1>
          <p className="mt-1 text-sm text-muted-foreground">{attention.length + 12} contracts need your attention.</p>
        </div>
        <Button className="h-10 px-4 font-medium" onClick={() => openDialog('start')}>
          <Plus className="size-4" />
          New contract
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="flex flex-col gap-3">
          <SectionHeader title="Active contracts" link="View all contracts" onLink={() => go('contracts')} />
          <Panel>
            <Table className="min-w-[620px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  {['Contract', 'Progress', 'Status', 'Action'].map((h) => (
                    <TableHead key={h} className="h-[52px] bg-table-header px-4 font-medium text-subtle-foreground">
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {active.slice(0, 6).map((c) => (
                  <ActiveRow key={c.id} contract={c} />
                ))}
              </TableBody>
            </Table>
          </Panel>
        </section>

        <aside className="flex flex-col gap-6">
          <section className="flex flex-col gap-3">
            <SectionHeader title="Needs attention" link="View all" onLink={() => go('contracts', { tab: 'attention' })} />
            <Panel>
              <ul className="divide-y divide-border-subtle">
                {attention.length ? (
                  attention.map((c) => {
                    const declined = c.status === 'Declined'
                    return (
                      <li key={c.id} className="flex flex-col gap-3 px-4 py-3 first:pt-5 last:pb-5">
                        <div>
                          <div className="text-sm text-foreground">
                            {c.title} — {c.party}
                          </div>
                          <div className="mt-0.5 text-xs text-muted-foreground">{c.note}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <StatusBadge status={c.status} />
                          <span className="text-xs text-muted-foreground">{c.updated}</span>
                          <a
                            href="#"
                            onClick={(e) => {
                              e.preventDefault()
                              runAction(declined ? 'review-again' : 'resend', c.id)
                            }}
                            className="ml-auto text-sm font-medium text-primary hover:underline"
                          >
                            {declined ? 'Review' : 'Resend'}
                          </a>
                        </div>
                      </li>
                    )
                  })
                ) : (
                  <li className="p-5 text-sm text-muted-foreground">Nothing needs your attention.</li>
                )}
              </ul>
            </Panel>
          </section>

          <section className="flex flex-col gap-3">
            <SectionHeader title="Start from a template" link="Browse all" onLink={() => go('library')} />
            <Panel>
              <ul className="divide-y divide-border-subtle">
                {TEMPLATES.slice(0, 3).map((t) => (
                  <li key={t.id}>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        update((s) => {
                          s.pick.sel = t.id
                          s.dialog = 'preview'
                        })
                      }}
                      className="flex h-16 items-center gap-3 px-4 transition-colors hover:bg-accent"
                    >
                      <span className="grid size-8 flex-none place-items-center rounded-md bg-muted text-muted-foreground">
                        <FileText className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-foreground">{t.name}</span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">{t.used ?? `Updated ${t.upd}`}</span>
                      </span>
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </a>
                  </li>
                ))}
              </ul>
            </Panel>
          </section>
        </aside>
      </div>
    </div>
  )
}
