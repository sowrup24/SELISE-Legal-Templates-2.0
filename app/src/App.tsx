import { useState } from 'react'
import { AppHeader } from '@/components/layout/app-header'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { DialogHost } from '@/components/dialogs'
import { ProtoControls } from '@/components/proto-controls'
import { Dashboard } from '@/pages/dashboard'
import { Contracts } from '@/pages/contracts'
import { Templates } from '@/pages/templates'
import { Companies, Company, People } from '@/pages/contacts'
import { Details } from '@/pages/details'
import { Edit, Review, Sent } from '@/pages/flow'
import { Settings } from '@/pages/settings'
import { FLOW, useApp, type View } from '@/lib/store'
import { cn } from '@/lib/utils'

/* App shell from preview/new-contract-flow.html. Every screen is ported except the
   document editor (contract builder); its buttons show a toast instead. */

const VIEWS: Record<View, () => React.ReactNode> = {
  dashboard: Dashboard,
  contracts: Contracts,
  library: Templates,
  contacts: People,
  companies: Companies,
  company: Company,
  settings: Settings,
  details: Details,
  edit: Edit,
  review: Review,
  sent: Sent,
}

export default function App() {
  const S = useApp()
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('lt-nav') === 'mini'
    } catch {
      return false
    }
  })
  const toggle = () =>
    setCollapsed((v) => {
      try {
        localStorage.setItem('lt-nav', v ? 'full' : 'mini')
      } catch {
        /* storage blocked: keep the in-memory state only */
      }
      return !v
    })

  const focus = FLOW.includes(S.view)
  /* Edit and review keep the page fixed and scroll the form and the contract separately. */
  const pinned = S.view === 'edit' || S.view === 'review'
  const Page = VIEWS[S.view]

  return (
    <div className={cn('flex min-h-svh bg-background text-foreground', pinned && 'min-[1101px]:h-svh min-[1101px]:overflow-hidden')}>
      {!focus && <AppSidebar collapsed={collapsed} />}
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader collapsed={collapsed} onToggle={toggle} focus={focus} />
        <main className={cn('flex-1', pinned && 'min-[1101px]:min-h-0')}>
          <Page />
        </main>
      </div>
      <DialogHost />
      <ProtoControls />
    </div>
  )
}
