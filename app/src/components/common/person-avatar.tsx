import { PHOTOS, initials } from '@/data/contacts'
import { cn } from '@/lib/utils'

/** Photo for saved contacts, initials for everyone else. */
export function PersonAvatar({ name, className }: { name: string; className?: string }) {
  const src = PHOTOS[name]
  return (
    <span
      className={cn(
        'grid size-10 flex-none place-items-center overflow-hidden rounded-full bg-secondary text-xs font-medium text-subtle-foreground',
        className,
      )}
      aria-hidden="true"
    >
      {src ? <img src={src} alt="" className="size-full object-cover" /> : initials(name)}
    </span>
  )
}
