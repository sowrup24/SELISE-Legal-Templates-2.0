import type { ReactNode } from 'react'
import { PersonAvatar } from '@/components/common/person-avatar'
import { Chip } from '@/components/status-chip'
import type { StatusKind } from '@/data/contracts'

/** One approver or signatory with step label and state, the prototype's srow(). */
export function SignerRow({ label, person, state, kind, when }: { label: ReactNode; person: { name: string; email?: string }; state: string; kind: StatusKind | 'alert'; when?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-3 py-3">
      <span className="w-16 flex-none text-xs font-medium text-muted-foreground">{label}</span>
      <PersonAvatar name={person.name} />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-heading">{person.name}</span>
        <span className="block truncate text-xs text-muted-foreground">{person.email}</span>
      </span>
      {when && <span className="text-xs text-muted-foreground">{when}</span>}
      <Chip kind={kind}>{state}</Chip>
    </div>
  )
}
