import { useTheme } from 'next-themes'
import { Check, Monitor, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const THEMES = [
  { id: 'light', label: 'Light theme', icon: Sun },
  { id: 'dark', label: 'Dark theme', icon: Moon },
  { id: 'system', label: 'Device default', icon: Monitor },
] as const

export function ThemeMenu() {
  const { theme = 'light', setTheme } = useTheme()
  const current = THEMES.find((t) => t.id === theme) ?? THEMES[0]
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-10 text-muted-foreground" aria-label={`Theme: ${current.label}`} title={`Theme: ${current.label}`}>
          <current.icon className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60 p-2">
        {THEMES.map(({ id, label, icon: Icon }) => {
          const on = theme === id
          return (
            <DropdownMenuItem
              key={id}
              onSelect={() => setTheme(id)}
              className={on ? 'bg-muted text-primary focus:text-primary [&_svg]:text-primary' : ''}
            >
              <Icon className="size-5" />
              {label}
              {on && <Check className="ml-auto size-5" />}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
