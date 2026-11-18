import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatusChip } from '@/components/status-chip'
import { actionOf, progressOf, type Contract } from '@/data/contracts'
import { openContract, openDialog, runAction, setListTab, useApp } from '@/lib/store'

/* Port of V.contracts in preview/new-contract-flow.html. */

const TABS: { id: string; label: string; match: (c: Contract) => boolean }[] = [
  { id: 'all', label: 'All contracts', match: () => true },
  { id: 'Draft', label: 'Drafts', match: (c) => c.status === 'Draft' },
  { id: 'Waiting for approval', label: 'Waiting for approval', match: (c) => c.status === 'Waiting for approval' },
  { id: 'Out for signature', label: 'Out for signature', match: (c) => c.status === 'Out for signature' },
  { id: 'Completed', label: 'Completed', match: (c) => c.status === 'Completed' },
  { id: 'attention', label: 'Needs attention', match: (c) => c.status === 'Declined' || c.status === 'Expired' },
  { id: 'Cancelled', label: 'Cancelled', match: (c) => c.status === 'Cancelled' },
]

/** What the Signatories column says for each status. */
function signatories(c: Contract) {
  if (c.status === 'Draft') return 'Not sent yet'
  if (c.status === 'Waiting for approval') return `Approver: ${c.approver?.name ?? 'Sara Meier'}`
  if ((c.status === 'Declined' || c.status === 'Cancelled') && c.note) return c.note.replace(/\.$/, '')
  return progressOf(c)[0]
}

const HEADS: { label: string; className?: string }[] = [
  { label: 'Contract' },
  { label: 'Status', className: 'w-[230px]' },
  { label: 'Signatories', className: 'w-[220px]' },
  { label: 'Last update', className: 'w-[140px]' },
  { label: '', className: 'w-[120px]' },
]

export function Contracts() {
  const S = useApp()
  const current = TABS.find((t) => t.id === S.listTab) ?? TABS[0]
  const list = S.contracts.filter(current.match)

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-heading">Contracts</h1>
          <p className="mt-1 text-sm text-muted-foreground">Every contract you created, from draft to signed.</p>
        </div>
        <Button className="h-10 px-4 font-medium" onClick={() => openDialog('start')}>
          <Plus className="size-4" />
          New contract
        </Button>
      </div>

      <Tabs value={current.id} onValueChange={setListTab}>
        <TabsList
          variant="line"
          className="h-auto w-full justify-start gap-1 overflow-x-auto border-b border-border-subtle p-0"
        >
          {TABS.map((t) => (
            <TabsTrigger
              key={t.id}
              value={t.id}
              className="h-10 flex-none rounded-none px-3 font-normal text-subtle-foreground after:bottom-[-1px] after:bg-primary hover:text-heading data-active:font-medium data-active:text-heading dark:text-subtle-foreground dark:data-active:text-heading"
            >
              {t.label} ({S.contracts.filter(t.match).length})
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <Table className="min-w-[760px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {HEADS.map((h, i) => (
                <TableHead
                  key={i}
                  className={`h-[52px] bg-table-header px-4 font-medium text-subtle-foreground ${h.className ?? ''}`}
                >
                  {h.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.length ? (
              list.map((c) => {
                const action = actionOf(c)
                return (
                  <TableRow
                    key={c.id}
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => openContract(c.id)}
                  >
                    <TableCell className="h-[72px] px-4">
                      <div className="text-sm font-medium text-foreground">{c.title}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{c.party}</div>
                    </TableCell>
                    <TableCell className="px-4">
                      <StatusChip contract={c} />
                    </TableCell>
                    <TableCell className="px-4 text-sm whitespace-normal text-subtle-foreground">{signatories(c)}</TableCell>
                    <TableCell className="px-4 text-sm text-subtle-foreground">{c.updated}</TableCell>
                    <TableCell className="px-4">
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
              })
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No contracts here.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
