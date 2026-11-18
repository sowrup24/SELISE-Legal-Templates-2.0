import { useState } from 'react'
import { Bell, Check, Clock, Globe, Info, LogOut, PanelLeft, Search, Settings, Shield, User, UserCheck, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSub,
  DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ThemeMenu } from '@/components/layout/theme-menu'
import { Chip } from '@/components/status-chip'
import { ME } from '@/data/contracts'
import type { Notification } from '@/data/notifications'
import { go, markAllRead, openNotification, openSettings, setLang, useApp } from '@/lib/store'
import { cn } from '@/lib/utils'
import avatar from '@/assets/avatar.jpg'
import logoFull from '@/assets/logo-full.png'

const LANGS: ['en' | 'de', string][] = [
  ['en', 'English'],
  ['de', 'Deutsch (DE)'],
]

const N_ICON = { check: Check, user: UserCheck, clock: Clock, x: X }
const N_KIND = {
  success: 'bg-success text-success-foreground',
  warning: 'bg-warning text-warning-foreground',
  error: 'bg-danger text-danger-foreground',
}

function NotificationRow({ n, i, onOpen }: { n: Notification; i: number; onOpen: () => void }) {
  const Icon = N_ICON[n.icon]
  return (
    <button
      type="button"
      role="listitem"
      onClick={() => {
        onOpen()
        openNotification(i)
      }}
      className={cn('flex w-full items-start gap-3 rounded-md p-3 text-left transition-colors hover:bg-accent', !n.read && 'bg-selected/60')}
    >
      <span className={cn('grid size-8 flex-none place-items-center rounded-full', N_KIND[n.kind])} aria-hidden="true">
        <Icon className="size-4" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-sm text-foreground">
          {n.pre}
          <b className="font-medium text-heading">{n.bold}</b>
          {n.post}
        </span>
        <span className="text-xs text-muted-foreground">{n.when}</span>
      </span>
      {!n.read && <span className="mt-1.5 size-2 flex-none rounded-full bg-primary" aria-label="Unread" />}
    </button>
  )
}

function NotificationsMenu() {
  const S = useApp()
  const [open, setOpen] = useState(false)
  const list = S.notifications
  const unread = list.filter((n) => !n.read).length
  const group = (label: string, items: Notification[]) =>
    items.length > 0 && (
      <>
        <div className="px-3 pt-3 pb-1 text-xs font-medium text-muted-foreground">{label}</div>
        <div role="list">
          {items.map((n) => (
            <NotificationRow key={list.indexOf(n)} n={n} i={list.indexOf(n)} onOpen={() => setOpen(false)} />
          ))}
        </div>
      </>
    )
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative size-10 text-muted-foreground" aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}>
          <Bell className="size-5" />
          {unread > 0 && <span className="absolute top-[9px] right-[10px] size-2 rounded-full bg-danger-foreground ring-2 ring-card" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="max-h-[min(560px,calc(100svh-96px))] w-[380px] max-w-[calc(100vw-32px)] gap-0 overflow-y-auto p-2" aria-label="Notifications">
        <div className="flex items-center justify-between gap-3 px-3 pt-2 pb-1">
          <h2 className="text-base font-semibold text-heading">Notifications</h2>
          {unread > 0 && (
            <button type="button" onClick={markAllRead} className="text-sm font-medium text-primary hover:underline">
              Mark all as read
            </button>
          )}
        </div>
        {group('New', list.filter((n) => !n.read))}
        {group('Earlier', list.filter((n) => n.read))}
      </PopoverContent>
    </Popover>
  )
}

function ProfileMenu() {
  const S = useApp()
  const soon = (what: string) => () => toast(`${what} isn’t part of this prototype.`)
  const item = 'h-10 gap-3 [&_svg:not([class*=size-])]:size-5'
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button type="button" className="ml-4 size-10 overflow-hidden rounded-full ring-1 ring-border data-[state=open]:ring-2 data-[state=open]:ring-primary" aria-label="Account menu">
          <img src={avatar} alt="" className="size-full object-cover" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-[288px] p-2">
        <div className="flex items-center gap-3 p-2">
          <img src={avatar} alt="" className="size-10 flex-none rounded-full object-cover" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-heading">{ME.name}</div>
            <div className="truncate text-xs text-subtle-foreground">{ME.email}</div>
          </div>
          <Chip>{ME.access}</Chip>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className={item} onSelect={soon('My profile')}>
          <User />
          My profile
        </DropdownMenuItem>
        <DropdownMenuItem className={item} onSelect={() => openSettings('general')}>
          <Settings />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className={item}>
            <Globe className="size-5 text-muted-foreground" />
            Language – {LANGS.find((l) => l[0] === S.lang)![1]}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-[200px] p-2">
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">Language</DropdownMenuLabel>
            {LANGS.map(([k, label]) => {
              const on = S.lang === k
              return (
                <DropdownMenuItem
                  key={k}
                  role="menuitemradio"
                  aria-checked={on}
                  className={cn('h-10 gap-3', on && 'bg-muted text-primary')}
                  onSelect={() => setLang(k)}
                >
                  <span className="flex-1">{label}</span>
                  {on && <Check className="size-5 text-primary" />}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem className={item} onSelect={soon('About')}>
          <Info />
          About Legal Templates
        </DropdownMenuItem>
        <DropdownMenuItem className={item} onSelect={soon('Privacy policy')}>
          <Shield />
          Privacy policy
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className={item} onSelect={soon('Log out')}>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function AppHeader({ collapsed, onToggle, focus }: { collapsed: boolean; onToggle: () => void; focus: boolean }) {
  const S = useApp()
  const label = collapsed ? 'Expand sidebar' : 'Collapse sidebar'
  const search = !['contacts', 'companies', 'company', 'library', 'settings'].includes(S.view)
  return (
    <header className="flex h-16 flex-none items-center justify-between gap-4 border-b border-border-subtle bg-card px-4 md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        {focus ? (
          <a
            href="#dashboard"
            onClick={(e) => {
              e.preventDefault()
              go('dashboard')
            }}
            aria-label="Go to dashboard"
            title="Dashboard"
          >
            <img src={logoFull} alt="SELISE Legal Templates" className="h-10 w-[70px] dark:invert dark:hue-rotate-180" />
          </a>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="hidden size-10 text-muted-foreground md:inline-flex"
            aria-label={label}
            aria-expanded={!collapsed}
            title={label}
            onClick={onToggle}
          >
            <PanelLeft className="size-5" />
          </Button>
        )}
        {search && (
          <label className="hidden h-10 w-[480px] max-w-[40vw] items-center gap-2 rounded-md border border-border px-3 text-muted-foreground focus-within:border-primary md:flex">
            <Search className="size-4 flex-none" />
            <input
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-placeholder"
              placeholder="Search contracts, templates and contacts"
              aria-label="Search contracts, templates and contacts"
            />
          </label>
        )}
      </div>
      <div className="flex items-center gap-3">
        <ThemeMenu />
        <NotificationsMenu />
        <ProfileMenu />
      </div>
    </header>
  )
}
