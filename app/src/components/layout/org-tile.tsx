import { cn } from '@/lib/utils'
import type { Org } from '@/lib/store'
import orgLogo from '@/assets/org.png'

/** Organization logo, or its first letter on a colored square. */
export function OrgTile({ org, size = 'md' }: { org: Org; size?: 'sm' | 'md' | 'lg' }) {
  const box = { sm: 'size-6 rounded text-xs', md: 'size-9 rounded-md text-sm', lg: 'size-10 rounded-md text-base' }[size]
  const src = org.img === 'selise' ? orgLogo : org.img
  return src ? (
    <span className={cn('grid flex-none place-items-center overflow-hidden border border-border-subtle bg-white p-0.5', box)} aria-hidden="true">
      <img src={src} alt="" className="size-full object-contain" />
    </span>
  ) : (
    <span className={cn('grid flex-none place-items-center font-semibold text-white', box)} style={{ background: org.bg }} aria-hidden="true">
      {org.n.trim()[0] || '?'}
    </span>
  )
}
