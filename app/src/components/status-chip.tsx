import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { KIND, isLive, type Contract, type ContractStatus, type StatusKind } from '@/data/contracts'

const KIND_CLASS: Record<StatusKind | 'alert', string> = {
  neutral: 'bg-secondary text-secondary-foreground',
  info: 'bg-info text-info-foreground',
  warning: 'bg-warning text-warning-foreground',
  success: 'bg-success text-success-foreground',
  error: 'bg-danger text-danger-foreground',
  alert: 'bg-alert text-alert-foreground',
}

/** Small pill label, the prototype's chip(). */
export function Chip({ kind = 'neutral', className, children }: { kind?: StatusKind | 'alert'; className?: string; children: React.ReactNode }) {
  return (
    <Badge className={cn('h-6 shrink-0 rounded-full px-2 text-xs font-medium', KIND_CLASS[kind], className)}>{children}</Badge>
  )
}

export function StatusBadge({ status, className }: { status: ContractStatus; className?: string }) {
  return (
    <Chip kind={KIND[status]} className={className}>
      {status}
    </Chip>
  )
}

/** Status badge plus the due date or reminder note for contracts that are still out. */
export function StatusChip({ contract: c }: { contract: Contract }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5 align-middle">
      <StatusBadge status={c.status} />
      {isLive(c) && c.due && <span className="text-xs whitespace-nowrap text-subtle-foreground">{c.due}</span>}
      {isLive(c) && c.remindedToday && <span className="text-xs whitespace-nowrap text-subtle-foreground">Reminded today</span>}
    </span>
  )
}
