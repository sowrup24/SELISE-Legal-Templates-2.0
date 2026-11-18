import {
  BookOpen, Check, ChevronUp, Cpu, CreditCard, ExternalLink, FileCheck, FileText, LayoutGrid, PanelsTopLeft, Plus,
  Settings, SlidersHorizontal, SquareUser, LayoutGrid as Grid, type LucideIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Chip } from '@/components/status-chip'
import { OrgTile } from '@/components/layout/org-tile'
import { cn } from '@/lib/utils'
import { go, notPorted, openSettings, update, useApp, type SettingsSection, type View } from '@/lib/store'
import logoFull from '@/assets/logo-full.png'
import logoMark from '@/assets/logo-mark.svg'

const NAV: { id: View | 'checker'; label: string; icon: LucideIcon }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
  { id: 'contracts', label: 'My Contracts', icon: FileText },
  { id: 'library', label: 'Templates', icon: PanelsTopLeft },
  { id: 'contacts', label: 'Contacts', icon: SquareUser },
  { id: 'checker', label: 'Contract Checker', icon: FileCheck },
]

const SET_SECS: [string, [SettingsSection | 'billing' | 'knowledge', string, LucideIcon, boolean?][]][] = [
  ['Organization', [['general', 'General', SlidersHorizontal], ['letterheads', 'Letterheads', FileText], ['billing', 'Billing', CreditCard, true]]],
  ['Contracts', [['integrations', 'Integrations', Grid], ['mcp', 'MCP server', Cpu], ['knowledge', 'Knowledge base', BookOpen, true]]],
]

const itemClass = (on: boolean, collapsed: boolean) =>
  cn(
    'flex h-10 items-center gap-3 rounded-md px-3 text-sm text-subtle-foreground transition-colors hover:bg-accent',
    collapsed && 'justify-center px-0',
    on && 'bg-selected font-medium text-primary hover:bg-selected',
  )

function MainNav({ collapsed }: { collapsed: boolean }) {
  const S = useApp()
  const current = S.view === 'companies' || S.view === 'company' ? 'contacts' : S.view === 'details' ? 'contracts' : S.view
  return (
    <nav aria-label="Main" className={cn('flex flex-col gap-1 py-4', collapsed ? 'px-3' : 'px-4')}>
      {NAV.map(({ id, label, icon: Icon }) => {
        const on = id === current
        return (
          <a
            key={id}
            href={id === 'checker' ? '#' : `#${id}`}
            aria-current={on ? 'page' : undefined}
            title={collapsed ? label : undefined}
            aria-label={collapsed ? label : undefined}
            onClick={(e) => {
              e.preventDefault()
              if (id === 'checker') notPorted('Contract Checker')
              else go(id)
            }}
            className={itemClass(on, collapsed)}
          >
            <Icon className={cn('size-5 flex-none', on ? 'text-primary' : 'text-muted-foreground')} />
            {!collapsed && label}
          </a>
        )
      })}
    </nav>
  )
}

function SettingsNav({ collapsed }: { collapsed: boolean }) {
  const S = useApp()
  const cur = S.set.sec === 'signature' ? 'integrations' : S.set.sec
  return (
    <nav aria-label="Settings" className={cn('flex flex-col gap-1 pb-4', collapsed ? 'px-3 pt-4' : 'px-4')}>
      {!collapsed && <div className="px-3 pt-4 pb-2 text-xl font-semibold text-heading" aria-hidden="true">Settings</div>}
      {SET_SECS.map(([group, items]) => (
        <div key={group} className="flex flex-col gap-1">
          {!collapsed && <div className="px-3 pt-3 pb-1 text-xs font-medium text-muted-foreground">{group}</div>}
          {items.map(([k, label, Icon, soon]) =>
            soon ? (
              <a key={k} aria-disabled="true" title={`${label} (coming soon)`} className={cn(itemClass(false, collapsed), 'cursor-default text-placeholder hover:bg-transparent')}>
                <Icon className="size-5 flex-none text-placeholder" />
                {!collapsed && (
                  <>
                    {label}
                    <Chip className="ml-auto">Soon</Chip>
                  </>
                )}
              </a>
            ) : (
              <a
                key={k}
                href={`#settings/${k}`}
                title={label}
                aria-current={cur === k ? 'page' : undefined}
                onClick={(e) => {
                  e.preventDefault()
                  openSettings(k as SettingsSection)
                }}
                className={itemClass(cur === k, collapsed)}
              >
                <Icon className={cn('size-5 flex-none', cur === k ? 'text-primary' : 'text-muted-foreground')} />
                {!collapsed && label}
              </a>
            ),
          )}
        </div>
      ))}
    </nav>
  )
}

function OrgMenu({ collapsed }: { collapsed: boolean }) {
  const S = useApp()
  const cur = S.orgs[0]
  cur.n = S.set.name
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Organization: ${cur.n}, ${cur.plan}`}
          title={cur.n}
          className={cn(
            'flex w-full items-center gap-3 rounded-md p-2 text-left text-muted-foreground transition-colors hover:bg-accent data-[state=open]:bg-accent',
            collapsed ? 'justify-center p-1' : 'bg-muted',
          )}
        >
          <OrgTile org={cur} />
          {!collapsed && (
            <>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-foreground">
                <span className="truncate text-sm font-medium">{cur.n}</span>
                <span className="truncate text-xs text-subtle-foreground">
                  {cur.plan} · {cur.left} generations left
                </span>
              </span>
              <ChevronUp className="size-4" />
            </>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" sideOffset={8} className="w-[264px] p-2">
        <div className="flex items-center gap-3 p-2">
          <OrgTile org={cur} size="lg" />
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-heading">{cur.n}</div>
            <div className="text-xs text-subtle-foreground">{cur.plan}</div>
          </div>
        </div>
        <div className="m-1 flex flex-col gap-1.5 rounded-md bg-muted p-3">
          <div className="flex justify-between text-xs text-subtle-foreground">
            <span>Contract generations</span>
            <span className="font-medium text-heading">{cur.left} left</span>
          </div>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              toast('Opens the SELISE Store in a new tab.')
            }}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            Upgrade in SELISE Store
            <ExternalLink className="size-3" />
          </a>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="h-10 gap-3" onSelect={() => openSettings('general')}>
          <Settings className="size-5" />
          Organization settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">Switch organization</DropdownMenuLabel>
        {S.orgs.map((o, i) => (
          <DropdownMenuItem
            key={i}
            role="menuitemradio"
            aria-checked={i === 0}
            className="h-10 gap-3"
            onSelect={() => {
              if (i) toast('Switching organization isn’t part of this prototype.')
            }}
          >
            <OrgTile org={o} size="sm" />
            <span className="min-w-0 flex-1 truncate">{o.n}</span>
            {i === 0 && <Check className="size-5 text-primary" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem
          className="h-10 gap-3"
          onSelect={() =>
            update((s) => {
              s.no = { name: '', img: '' }
              s.dialog = 'neworg'
            })
          }
        >
          <Plus className="size-5" />
          Create organization
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function AppSidebar({ collapsed }: { collapsed: boolean }) {
  const S = useApp()
  return (
    <aside
      className={cn(
        'sticky top-0 hidden h-svh flex-none flex-col border-r border-border-subtle bg-card md:flex',
        collapsed ? 'w-[72px]' : 'w-[264px]',
      )}
    >
      <a
        href="#dashboard"
        onClick={(e) => {
          e.preventDefault()
          go('dashboard')
        }}
        className={cn('flex h-16 flex-none items-center', collapsed ? 'justify-center' : 'px-6')}
        aria-label="Go to dashboard"
        title="Dashboard"
      >
        {collapsed ? (
          <img src={logoMark} alt="SELISE Legal Templates" className="w-9 dark:invert dark:hue-rotate-180" />
        ) : (
          <img src={logoFull} alt="SELISE Legal Templates" className="h-10 w-[70px] dark:invert dark:hue-rotate-180" />
        )}
      </a>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {S.view === 'settings' ? <SettingsNav collapsed={collapsed} /> : <MainNav collapsed={collapsed} />}
      </div>
      <div className={cn('flex-none', collapsed ? 'px-3 py-4' : 'p-4')}>
        <OrgMenu collapsed={collapsed} />
      </div>
    </aside>
  )
}
