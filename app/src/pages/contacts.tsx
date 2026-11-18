import { Building2, MoreHorizontal, Plus, SquareUser, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BackLink, Card, LinkButton, PageHeading, Panel, PanelHead, SearchBox } from '@/components/common/page'
import { PersonAvatar } from '@/components/common/person-avatar'
import { Chip, StatusBadge } from '@/components/status-chip'
import { COMPANIES, coOf } from '@/data/contacts'
import { partyName } from '@/data/contracts'
import { go, openContract, openDialog, update, useApp } from '@/lib/store'
import { addContact, coContracts, openCompany, peopleAt } from '@/lib/contacts'

/* Port of V.contacts, V.companies and V.company in preview/new-contract-flow.html. */

const rowMore = (e?: React.MouseEvent) => {
  e?.stopPropagation()
  toast('Edit and delete are not part of this prototype yet.')
}

const th = 'h-[52px] bg-table-header px-4 font-medium text-subtle-foreground'

function ContactsHead({ sec }: { sec: 'people' | 'companies' }) {
  const S = useApp()
  return (
    <>
      <PageHeading
        title="Contacts"
        description="People and companies you make contracts with. Save them once and pick them in any contract."
        actions={
          sec === 'people' ? (
            <Button className="h-10 px-4 font-medium" onClick={() => addContact()}>
              <UserPlus className="size-4" />
              Add person
            </Button>
          ) : (
            <Button className="h-10 px-4 font-medium" onClick={() => toast('Adding a company is not part of this prototype yet.')}>
              <Plus className="size-4" />
              Add company
            </Button>
          )
        }
      />
      <Tabs value={sec} onValueChange={(v) => go(v === 'people' ? 'contacts' : 'companies')}>
        <TabsList variant="line" aria-label="Contacts" className="h-auto w-full justify-start gap-1 border-b border-border-subtle p-0">
          {(
            [
              ['people', SquareUser, `People (${S.people.length})`],
              ['companies', Building2, `Companies (${COMPANIES.length})`],
            ] as const
          ).map(([v, Icon, label]) => (
            <TabsTrigger
              key={v}
              value={v}
              className="h-10 flex-none gap-2 rounded-none px-3 font-normal text-subtle-foreground after:bottom-[-1px] after:bg-primary hover:text-heading data-active:font-medium data-active:text-heading dark:text-subtle-foreground dark:data-active:text-heading"
            >
              <Icon className="size-4" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </>
  )
}

const TYPES: [string, string, (p: { colleague: boolean }) => boolean][] = [
  ['all', 'All', () => true],
  ['colleague', 'Colleagues', (p) => p.colleague],
  ['external', 'External', (p) => !p.colleague],
]

export function People() {
  const S = useApp()
  const T = S.ct
  const cur = TYPES.find((t) => t[0] === T.tab) ?? TYPES[0]
  const q = T.q.trim().toLowerCase()
  const list = S.people
    .filter(cur[2])
    .filter((p) => !T.co || p.co === T.co)
    .filter((p) => !q || `${p.name} ${p.email} ${coOf(p.co)?.name ?? ''}`.toLowerCase().includes(q))

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <ContactsHead sec="people" />
      <div className="flex flex-wrap items-center gap-3">
        <SearchBox value={T.q} onChange={(v) => update((s) => (s.ct.q = v))} placeholder="Search by name, email or company" className="w-full sm:w-[360px]" />
        <Select value={T.tab} onValueChange={(v) => update((s) => (s.ct.tab = v))}>
          <SelectTrigger aria-label="Filter by type" className="h-10 w-full rounded-md border-border px-3 data-[size=default]:h-10 sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TYPES.map(([v, label]) => (
              <SelectItem key={v} value={v}>
                Type: {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={T.co || 'all'} onValueChange={(v) => update((s) => (s.ct.co = v === 'all' ? '' : v))}>
          <SelectTrigger aria-label="Filter by company" className="h-10 w-full rounded-md border-border px-3 data-[size=default]:h-10 sm:w-[240px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Company: All</SelectItem>
            {COMPANIES.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Card>
        <Table className="min-w-[860px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className={th}>Name</TableHead>
              <TableHead className={`${th} w-[240px]`}>Company</TableHead>
              <TableHead className={`${th} w-[130px]`}>Type</TableHead>
              <TableHead className={`${th} w-[110px]`}>Contracts</TableHead>
              <TableHead className={`${th} w-[120px]`}>Last used</TableHead>
              <TableHead className={`${th} w-[56px]`} />
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.length ? (
              list.map((p) => {
                const co = coOf(p.co)
                return (
                  <TableRow key={p.email + p.name} className="hover:bg-accent">
                    <TableCell className="h-[72px] px-4">
                      <div className="flex items-center gap-3">
                        <PersonAvatar name={p.name} />
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-heading">{p.name}</div>
                          <div className="mt-0.5 text-xs text-muted-foreground">{p.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 text-sm">
                      {co ? (
                        <LinkButton onClick={() => openCompany(co.id)} className="font-normal">
                          {co.name}
                        </LinkButton>
                      ) : (
                        <span className="text-muted-foreground">No company</span>
                      )}
                    </TableCell>
                    <TableCell className="px-4">
                      <Chip kind={p.colleague ? 'info' : 'neutral'}>{p.colleague ? 'Colleague' : 'External'}</Chip>
                    </TableCell>
                    <TableCell className="px-4 text-sm text-subtle-foreground">{p.contracts}</TableCell>
                    <TableCell className="px-4 text-sm text-subtle-foreground">{p.used}</TableCell>
                    <TableCell className="px-2">
                      <Button variant="ghost" size="icon" className="size-9 text-muted-foreground" aria-label={`More actions for ${p.name}`} onClick={rowMore}>
                        <MoreHorizontal className="size-5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No contacts match “{T.q}”.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

function CompanyLogo() {
  return (
    <span className="grid size-10 flex-none place-items-center rounded-md bg-muted text-muted-foreground" aria-hidden="true">
      <Building2 className="size-5" />
    </span>
  )
}

export function Companies() {
  const S = useApp()
  const q = S.co.q.trim().toLowerCase()
  const list = COMPANIES.filter((c) => !q || `${c.name} ${c.city} ${c.uid} ${c.addr}`.toLowerCase().includes(q))
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <ContactsHead sec="companies" />
      <div className="flex flex-wrap items-center gap-3">
        <SearchBox value={S.co.q} onChange={(v) => update((s) => (s.co.q = v))} placeholder="Search by name, city or UID" className="w-full sm:w-[360px]" />
      </div>
      <Card>
        <Table className="min-w-[900px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className={th}>Company</TableHead>
              <TableHead className={`${th} w-[300px]`}>Address</TableHead>
              <TableHead className={`${th} w-[110px]`}>Contacts</TableHead>
              <TableHead className={`${th} w-[110px]`}>Contracts</TableHead>
              <TableHead className={`${th} w-[120px]`}>Last used</TableHead>
              <TableHead className={`${th} w-[56px]`} />
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.length ? (
              list.map((c) => (
                <TableRow key={c.id} className="cursor-pointer hover:bg-accent" onClick={() => openCompany(c.id)}>
                  <TableCell className="h-[72px] px-4">
                    <div className="flex items-center gap-3">
                      <CompanyLogo />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-sm font-medium text-heading">
                          {c.name}
                          {c.own && <Chip kind="info">Your company</Chip>}
                        </div>
                        <div className="mt-0.5 text-xs text-muted-foreground">UID {c.uid}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 text-sm text-subtle-foreground">{c.addr}</TableCell>
                  <TableCell className="px-4 text-sm text-subtle-foreground">{peopleAt(c.id).length}</TableCell>
                  <TableCell className="px-4 text-sm text-subtle-foreground">{c.own ? 31 : coContracts(c).length}</TableCell>
                  <TableCell className="px-4 text-sm text-subtle-foreground">{c.used}</TableCell>
                  <TableCell className="px-2">
                    <Button variant="ghost" size="icon" className="size-9 text-muted-foreground" aria-label={`More actions for ${c.name}`} onClick={rowMore}>
                      <MoreHorizontal className="size-5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No companies match “{S.co.q}”.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

export function Company() {
  const S = useApp()
  const c = coOf(S.co.sel) ?? COMPANIES[1]
  const ppl = S.people.filter((p) => p.co === c.id)
  const cons = coContracts(c)
  const kv: [string, string][] = [
    ['Legal name', c.name],
    ['Legal form', c.form],
    ['UID', c.uid],
    ['Address', c.addr],
    ['Country', 'Switzerland'],
    ['Language', c.lang],
  ]
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <PageHeading
        title={
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold text-heading">{c.name}</h1>
            {c.own && <Chip kind="info">Your company</Chip>}
          </div>
        }
        description={`UID ${c.uid} · ${c.addr}`}
        actions={
          <>
            <Button variant="outline" className="h-10 px-4 font-medium" onClick={() => rowMore()}>
              Edit company
            </Button>
            {!c.own && (
              <Button className="h-10 px-4 font-medium" onClick={() => openDialog('start')}>
                <Plus className="size-4" />
                New contract
              </Button>
            )}
          </>
        }
      >
        <div className="mb-2">
          <BackLink onClick={() => go('companies')}>Back to contacts</BackLink>
        </div>
      </PageHeading>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-4">
          <Panel>
            <PanelHead title={`Contacts (${ppl.length})`} />
            <p className="text-sm text-muted-foreground">People at {c.name}. Pick them as signatories in any contract.</p>
            {ppl.length ? (
              <ul className="flex flex-col divide-y divide-border-subtle">
                {ppl.map((p) => (
                  <li key={p.email} className="flex flex-wrap items-center gap-3 py-3">
                    <PersonAvatar name={p.name} />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-heading">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{p.email}</div>
                    </div>
                    <span className="text-sm text-subtle-foreground">{p.role}</span>
                    {p.signs && <Chip kind="info">Signs for the company</Chip>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">No contacts saved yet.</p>
            )}
            <div>
              <Button variant="ghost" className="h-9 px-3 font-medium text-primary hover:text-primary" onClick={() => addContact(c.id)}>
                <UserPlus className="size-4" />
                Add contact
              </Button>
            </div>
          </Panel>

          <Panel>
            <PanelHead title={`Contracts (${c.own ? 31 : cons.length})`} />
            <p className="text-sm text-muted-foreground">
              {c.own ? 'Every contract is made by your company. See them all in My Contracts.' : `Contracts made with ${c.name}.`}
            </p>
            {c.own ? (
              <div>
                <LinkButton onClick={() => go('contracts')}>Open My Contracts</LinkButton>
              </div>
            ) : cons.length ? (
              <ul className="flex flex-col divide-y divide-border-subtle">
                {cons.map((k) => (
                  <li key={k.id}>
                    <button type="button" onClick={() => openContract(k.id)} className="-mx-2 flex w-[calc(100%+16px)] flex-wrap items-center gap-3 rounded-md px-2 py-3 text-left hover:bg-accent">
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-heading">{k.title}</div>
                        <div className="text-xs text-muted-foreground">{k.party || partyName(k)}</div>
                      </div>
                      <span className="text-sm text-subtle-foreground">{k.updated}</span>
                      <StatusBadge status={k.status} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">No contracts with this company yet.</p>
            )}
          </Panel>
        </div>

        <Panel className="lg:sticky lg:top-6">
          <PanelHead title="Company details">
            <LinkButton onClick={() => rowMore()}>Edit</LinkButton>
          </PanelHead>
          <dl className="grid grid-cols-[110px_1fr] gap-x-3 gap-y-2 text-sm">
            {kv.map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="text-foreground">{v}</dd>
              </div>
            ))}
          </dl>
        </Panel>
      </div>
    </div>
  )
}
