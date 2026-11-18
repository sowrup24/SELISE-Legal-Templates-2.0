import { useRef, type ReactNode } from 'react'
import { ArrowLeft, Copy, ExternalLink, FileText, Key, PenTool, Plus, Trash2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Chip } from '@/components/status-chip'
import { inputClass } from '@/components/common/page'
import { Switch } from '@/components/ui/switch'
import { go, openDialog, openSettings, update, useApp, type McpPerm } from '@/lib/store'
import { cn } from '@/lib/utils'

/* Port of V.settings and SET_V in preview/new-contract-flow.html. */

const slugOk = (v: string) => /^[a-z0-9-]+$/.test(v)
const dangerBtn = 'bg-[#c9362b] text-white hover:bg-[#b02e24] focus-visible:ring-[#c9362b]/40'

function Block({ title, desc, right, children }: { title: string; desc?: string; right?: ReactNode; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-heading">{title}</h2>
          {desc && <p className="mt-1 text-sm text-subtle-foreground">{desc}</p>}
        </div>
        {right}
      </div>
      {children}
    </section>
  )
}

function SetCard({ danger, children }: { danger?: boolean; children: ReactNode }) {
  return <div className={cn('flex flex-col divide-y divide-border-subtle rounded-xl border bg-card', danger ? 'border-danger-foreground/40' : 'border-border')}>{children}</div>
}

function Row({ title, desc, end, children }: { title: string; desc: string; end?: boolean; children: ReactNode }) {
  return (
    <div className={cn('grid gap-4 p-5 md:grid-cols-[240px_minmax(0,1fr)]', end && 'items-center')}>
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-heading">{title}</span>
        <span className="text-xs text-subtle-foreground">{desc}</span>
      </div>
      <div className={cn('flex min-w-0 flex-col gap-3', end && 'md:items-end')}>{children}</div>
    </div>
  )
}

function Foot({ children }: { children: ReactNode }) {
  return <div className="flex justify-end gap-2 p-4">{children}</div>
}

const set = (k: 'dName' | 'dSlug' | 'cid' | 'csec', v: string) => update((s) => (s.set[k] = v))

function General() {
  const G = useApp().set
  const bad = !slugOk(G.dSlug)
  const dirty = G.dName.trim() !== G.name || G.dSlug !== G.slug
  return (
    <>
      <Block title="General" desc="Your organization’s name and web address.">
        <SetCard>
          <Row title="Organization name" desc="Shown across the app and in emails to signatories.">
            <input id="set-name" aria-label="Organization name" value={G.dName} onChange={(e) => set('dName', e.target.value)} className={inputClass} />
          </Row>
          <Row title="Organization URL" desc="The web address your team uses to sign in.">
            <div className="flex flex-wrap items-start gap-2">
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <label className={cn('flex h-10 items-center overflow-hidden rounded-md border bg-card text-sm focus-within:border-primary focus-within:ring-3 focus-within:ring-selected', bad ? 'border-danger-foreground' : 'border-border')}>
                  <span className="flex h-full items-center border-r border-border bg-muted px-3 whitespace-nowrap text-subtle-foreground">legaltemplates.selise.ch/org/</span>
                  <input
                    aria-label="Organization URL"
                    aria-describedby="slug-help"
                    aria-invalid={bad || undefined}
                    value={G.dSlug}
                    onChange={(e) => set('dSlug', e.target.value)}
                    className="h-full min-w-0 flex-1 bg-transparent px-3 text-foreground outline-none"
                  />
                </label>
                <span id="slug-help" className={cn('text-xs', bad ? 'text-danger-foreground' : 'text-muted-foreground')}>
                  {bad ? 'Use lowercase letters, numbers and hyphens only.' : 'Lowercase letters, numbers and hyphens only.'}
                </span>
              </div>
              <Button
                variant="outline"
                className="h-10 px-4 font-medium"
                onClick={() => {
                  navigator.clipboard?.writeText('https://legaltemplates.selise.ch/org/' + G.slug).catch(() => {})
                  toast('URL copied.')
                }}
              >
                <Copy className="size-4" />
                Copy
              </Button>
            </div>
          </Row>
          <Foot>
            <Button
              variant="ghost"
              className="h-9 px-3 font-medium"
              disabled={!dirty}
              onClick={() =>
                update((s) => {
                  s.set.dName = s.set.name
                  s.set.dSlug = s.set.slug
                })
              }
            >
              Cancel
            </Button>
            <Button
              className="h-9 px-3 font-medium"
              disabled={!(dirty && !bad && G.dName.trim())}
              onClick={() => {
                update((s) => {
                  s.set.name = s.set.dName.trim()
                  s.set.dName = s.set.name
                  s.set.slug = s.set.dSlug
                })
                toast('Changes saved.')
              }}
            >
              Save changes
            </Button>
          </Foot>
        </SetCard>
      </Block>
      <Block title="Danger zone" desc="These actions can’t be undone.">
        <SetCard danger>
          <Row end title="Delete organization" desc={`Deletes all templates, contracts, letterheads, team access and saved credentials for everyone in ${G.name}.`}>
            <Button
              className={cn('h-9 px-3 font-medium', dangerBtn)}
              onClick={() =>
                update((s) => {
                  s.set.del = ''
                  s.dialog = 'delorg'
                })
              }
            >
              <Trash2 className="size-4" />
              Delete organization
            </Button>
          </Row>
        </SetCard>
      </Block>
    </>
  )
}

function Tile({ children }: { children: ReactNode }) {
  return <span className="grid size-10 flex-none place-items-center rounded-md bg-selected text-primary">{children}</span>
}

function Service({ desc, children }: { desc: string; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-3 p-5">
      <Tile>
        <PenTool className="size-5" />
      </Tile>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-heading">SELISE Signature</div>
        <div className="text-xs text-subtle-foreground">{desc}</div>
      </div>
      <Chip kind="success">Connected</Chip>
      {children}
    </div>
  )
}

function Integrations() {
  return (
    <Block title="Integrations" desc="Connect the services Legal Templates works with.">
      <SetCard>
        <Service desc="Electronic signatures for legally binding contracts.">
          <Button variant="outline" className="h-9 px-3 font-medium" aria-label="Manage SELISE Signature" onClick={() => openSettings('signature')}>
            Manage
          </Button>
        </Service>
      </SetCard>
    </Block>
  )
}

function Signature() {
  const G = useApp().set
  const own = () =>
    update((s) => {
      s.set.own = true
      s.set.cid = ''
      s.set.csec = ''
    })
  let acct: ReactNode
  if (G.own)
    acct = (
      <>
        <div className="flex flex-col gap-1 rounded-md bg-muted p-3 text-xs text-subtle-foreground">
          <span className="font-medium text-heading">Where to find your credentials</span>
          <span>
            1. Sign in to the{' '}
            <a href="https://developer.selise.ch" target="_blank" rel="noopener" className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
              SELISE Developer Portal
              <ExternalLink className="size-3" />
            </a>
          </span>
          <span>2. Click Generate to create a key pair.</span>
          <span>3. Copy the client ID and client secret into the fields below.</span>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="set-cid" className="text-sm font-medium text-heading">
            Client ID
          </label>
          <input id="set-cid" autoFocus autoComplete="off" placeholder="Paste your client ID" value={G.cid} onChange={(e) => set('cid', e.target.value)} className={inputClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="set-csec" className="text-sm font-medium text-heading">
            Client secret
          </label>
          <input id="set-csec" type="password" autoComplete="off" placeholder="Paste your client secret" value={G.csec} onChange={(e) => set('csec', e.target.value)} className={inputClass} />
          <span className="text-xs text-muted-foreground">Stored encrypted. Contracts you send after saving use this account.</span>
        </div>
      </>
    )
  else if (G.acct === 'own')
    acct = (
      <>
        <div>
          <p className="text-sm font-medium text-heading">Your own SELISE account</p>
          <p className="mt-1 text-sm text-subtle-foreground">Client ID ending in {G.cidLast || '••••'}. Contracts you send are tracked in your SELISE dashboard.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="h-9 px-3 font-medium" onClick={own}>
            <Key className="size-4" />
            Change credentials
          </Button>
          <Button
            variant="ghost"
            className="h-9 px-3 font-medium"
            onClick={() => {
              update((s) => (s.set.acct = 'default'))
              toast('Switched to the SELISE default account.')
            }}
          >
            Use SELISE default account
          </Button>
        </div>
      </>
    )
  else
    acct = (
      <>
        <div>
          <p className="text-sm font-medium text-heading">SELISE default account</p>
          <p className="mt-1 text-sm text-subtle-foreground">Your contracts are tracked in a shared SELISE account. Connect your own account to follow them in your SELISE dashboard.</p>
        </div>
        <div>
          <Button variant="outline" className="h-9 px-3 font-medium" onClick={own}>
            <Key className="size-4" />
            Use your own account
          </Button>
        </div>
      </>
    )
  return (
    <Block title="SELISE Signature" desc="Contracts you send are signed through SELISE Signature.">
      <SetCard>
        <Service desc="Electronic signature service for legally binding contracts." />
        <Row title="Account" desc="The SELISE account that tracks the contracts you send.">
          {acct}
        </Row>
        {G.own && (
          <Foot>
            <Button variant="ghost" className="h-9 px-3 font-medium" onClick={() => update((s) => (s.set.own = false))}>
              Cancel
            </Button>
            <Button
              className="h-9 px-3 font-medium"
              disabled={!(G.cid.trim() && G.csec.trim())}
              onClick={() => {
                update((s) => {
                  const g = s.set
                  g.acct = 'own'
                  g.own = false
                  g.cidLast = g.cid.trim().slice(-4)
                  g.cid = ''
                  g.csec = ''
                })
                toast('Credentials saved. New contracts use your SELISE account.')
              }}
            >
              Save credentials
            </Button>
          </Foot>
        )}
      </SetCard>
    </Block>
  )
}

function Letterheads() {
  const G = useApp().set
  const file = useRef<HTMLInputElement>(null)
  const upload = (primary: boolean) => (
    <Button
      variant={primary ? 'default' : 'outline'}
      className="h-9 px-3 font-medium"
      onClick={() => {
        if (file.current) {
          file.current.value = ''
          file.current.click()
        }
      }}
    >
      <Upload className="size-4" />
      Upload letterhead
    </Button>
  )
  return (
    <Block title="Letterheads" desc="Your letterhead is added to the top of every new contract." right={G.lh.length ? upload(false) : undefined}>
      <input
        ref={file}
        type="file"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (!f) return
          const ext = (f.name.split('.').pop() || '').toUpperCase()
          update((s) => s.set.lh.push({ name: f.name.replace(/\.[^.]+$/, ''), meta: `${ext} · Added today`, def: !s.set.lh.length }))
          toast('Letterhead uploaded.')
        }}
      />
      <SetCard>
        {G.lh.length ? (
          G.lh.map((x, i) => (
            <div key={i} className="flex flex-wrap items-center gap-3 p-4">
              <span className="flex h-14 w-10 flex-none flex-col gap-1 rounded-sm border border-border bg-white p-1.5" aria-hidden="true">
                <i className="h-1 w-4 rounded-full bg-[#c7d0d6]" />
                <i className="h-0.5 w-full rounded-full bg-[#e3e8eb]" />
                <i className="h-0.5 w-full rounded-full bg-[#e3e8eb]" />
                <i className="h-0.5 w-2/3 rounded-full bg-[#e3e8eb]" />
              </span>
              <div className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium text-heading">{x.name}</span>
                  {x.def && <Chip kind="info">Default</Chip>}
                </span>
                <span className="text-xs text-subtle-foreground">{x.meta}</span>
              </div>
              {!x.def && (
                <Button
                  variant="ghost"
                  className="h-9 px-3 font-medium"
                  onClick={() => {
                    update((s) => s.set.lh.forEach((l, j) => (l.def = j === i)))
                    toast('Default letterhead changed.')
                  }}
                >
                  Make default
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="size-9 text-muted-foreground hover:text-danger-foreground"
                aria-label={`Remove ${x.name}`}
                title="Remove"
                onClick={() => {
                  update((s) => {
                    const was = s.set.lh[i].def
                    s.set.lh.splice(i, 1)
                    if (was && s.set.lh[0]) s.set.lh[0].def = true
                  })
                  toast('Letterhead removed.')
                }}
              >
                <Trash2 className="size-5" />
              </Button>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <Tile>
              <FileText className="size-6" />
            </Tile>
            <h3 className="text-base font-semibold text-heading">No letterheads yet</h3>
            <p className="max-w-[420px] text-sm text-subtle-foreground">Upload your company letterhead and it’s added to every new contract automatically.</p>
            {upload(true)}
          </div>
        )}
      </SetCard>
    </Block>
  )
}

const PERMS: [McpPerm, string, string][] = [
  ['read', 'Read templates and contracts', 'Search and open templates, drafts and sent contracts.'],
  ['draft', 'Draft contracts', 'Create drafts and fill in contract details. Drafts are never sent automatically.'],
  ['send', 'Send for signature', 'Send contracts to signatories. Your approval rules still apply.'],
  ['contacts', 'Manage contacts', 'Add and edit people and companies.'],
]

function ListRow({ tile, title, meta, action, label, onClick }: { tile: ReactNode; title: string; meta: string; action: string; label: string; onClick: () => void }) {
  return (
    <div className="flex items-center gap-3 p-5">
      <Tile>{tile}</Tile>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-heading">{title}</div>
        <div className="text-xs text-subtle-foreground">{meta}</div>
      </div>
      <Button variant="ghost" className="h-9 px-3 font-medium" aria-label={label} onClick={onClick}>
        {action}
      </Button>
    </div>
  )
}

function Mcp() {
  const G = useApp().set
  const M = G.mcp
  const url = `https://legaltemplates.selise.ch/mcp/${G.slug}`
  const empty = (t: string) => <p className="p-5 text-sm text-subtle-foreground">{t}</p>
  return (
    <>
      <Block
        title="MCP server"
        desc="Let AI tools like Claude, ChatGPT and Cursor work with your templates and contracts."
        right={
          <a
            href="https://docs.legaltemplates.selise.ch/mcp"
            target="_blank"
            rel="noopener"
            title="Opens in a new tab"
            className="inline-flex items-center gap-1 text-sm font-medium whitespace-nowrap text-primary hover:underline"
          >
            Setup guide
            <ExternalLink className="size-4" />
          </a>
        }
      >
        <SetCard>
          <Row end title="MCP server" desc={M.on ? `AI tools can connect to ${G.name}.` : 'AI tools can’t connect. Existing tokens stop working.'}>
            <Switch
              aria-label="MCP server"
              checked={M.on}
              onCheckedChange={(v) => {
                update((s) => (s.set.mcp.on = v))
                toast(v ? 'MCP server turned on.' : 'MCP server turned off.')
              }}
            />
          </Row>
          {M.on && (
            <Row title="Server URL" desc="Paste this into your AI tool to connect.">
              <div className="flex gap-2">
                <input readOnly aria-label="Server URL" value={url} className={cn(inputClass, 'min-w-0 flex-1')} />
                <Button
                  variant="outline"
                  className="h-10 px-3 font-medium"
                  onClick={() => {
                    navigator.clipboard?.writeText(url).catch(() => {})
                    toast('Server URL copied.')
                  }}
                >
                  <Copy className="size-4" />
                  Copy
                </Button>
              </div>
            </Row>
          )}
        </SetCard>
      </Block>
      {M.on && (
        <>
          <Block title="Permissions" desc="Choose what connected AI tools can do.">
            <SetCard>
              {PERMS.map(([k, t, d]) => (
                <Row end key={k} title={t} desc={d}>
                  <Switch
                    aria-label={t}
                    checked={M.perms[k]}
                    onCheckedChange={(v) => {
                      update((s) => (s.set.mcp.perms[k] = v))
                      toast('Permissions updated.')
                    }}
                  />
                </Row>
              ))}
            </SetCard>
          </Block>
          <Block
            title="Access tokens"
            desc="For AI tools that can’t sign in with your account."
            right={
              <Button
                variant="outline"
                className="h-9 px-3 font-medium"
                onClick={() => {
                  update((s) => {
                    s.set.tkName = ''
                    s.set.tkVal = ''
                  })
                  openDialog('mcptoken')
                }}
              >
                <Plus className="size-4" />
                Create token
              </Button>
            }
          >
            <SetCard>
              {M.tokens.length
                ? M.tokens.map((x, i) => (
                    <ListRow
                      key={x.name + i}
                      tile={<Key className="size-5" />}
                      title={x.name}
                      meta={x.meta}
                      action="Revoke"
                      label={`Revoke ${x.name}`}
                      onClick={() => {
                        update((s) => s.set.mcp.tokens.splice(i, 1))
                        toast(`${x.name} revoked.`)
                      }}
                    />
                  ))
                : empty('No access tokens yet.')}
            </SetCard>
          </Block>
          <Block title="Connected AI tools" desc="AI tools that have connected to your organization.">
            <SetCard>
              {M.clients.length
                ? M.clients.map((x, i) => (
                    <ListRow
                      key={x.n}
                      tile={<span className="text-sm font-semibold" aria-hidden="true">{x.n[0]}</span>}
                      title={x.n}
                      meta={x.meta}
                      action="Disconnect"
                      label={`Disconnect ${x.n}`}
                      onClick={() => {
                        update((s) => s.set.mcp.clients.splice(i, 1))
                        toast(`${x.n} disconnected.`)
                      }}
                    />
                  ))
                : empty('No AI tools have connected yet.')}
            </SetCard>
          </Block>
        </>
      )}
    </>
  )
}

const SECTIONS = { general: General, letterheads: Letterheads, integrations: Integrations, signature: Signature, mcp: Mcp }

export function Settings() {
  const S = useApp()
  const Section = SECTIONS[S.set.sec] ?? General
  const back = S.set.sec === 'signature'
  return (
    <div className="mx-auto flex w-full max-w-[760px] flex-col gap-6 p-4 md:p-6">
      <h1 className="sr-only">Settings</h1>
      <div>
        <button
          type="button"
          onClick={() => (back ? openSettings('integrations') : go('dashboard'))}
          className="-ml-1.5 inline-flex h-8 items-center gap-1.5 rounded-md pr-2.5 pl-1.5 text-sm text-subtle-foreground hover:bg-accent hover:text-heading"
        >
          <ArrowLeft className="size-4" />
          {back ? 'Back to integrations' : 'Back to dashboard'}
        </button>
      </div>
      <div className="flex flex-col gap-8">
        <Section />
      </div>
    </div>
  )
}
