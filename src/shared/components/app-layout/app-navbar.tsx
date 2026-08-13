import {
  IconBell,
  IconChevronDown,
  IconDeviceDesktop,
  IconLanguage,
  IconMoon,
  IconSun,
} from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'

import { switchLocale, useLocale } from '@/i18n/local-store'
import { m } from '@/i18n/paraglide/messages'
import { locales } from '@/i18n/paraglide/runtime'
import { AppCommandMenu } from '@/shared/components/app-layout/app-command-menu'
import { useTheme } from '@/shared/components/theme-provider'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { SidebarTrigger } from '@/shared/components/ui/sidebar'
import { cn } from '@/shared/lib/utils'

const THEME_OPTIONS = [
  { value: 'light', label: m.app_layout_theme_light, icon: IconSun },
  { value: 'dark', label: m.app_layout_theme_dark, icon: IconMoon },
  {
    value: 'system',
    label: m.app_layout_theme_system,
    icon: IconDeviceDesktop,
  },
] as const

interface AppNavbarUser {
  name: string
  role: string
  avatarUrl?: string
}

interface AppNavbarProps {
  className?: string
  title?: string
  user?: AppNavbarUser
  notificationCount?: number
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()

  return (
    <div className='px-2 py-1.5'>
      <p className='mb-1.5 text-xs font-medium text-muted-foreground'>
        {m.app_layout_theme_label()}
      </p>
      <div className='flex gap-1 rounded-lg bg-muted/50 p-1'>
        {THEME_OPTIONS.map(({ value, icon: Icon }) => (
          <button
            key={value}
            type='button'
            onClick={() => setTheme(value)}
            className={cn(
              'flex flex-1 items-center justify-center rounded-md py-1.5 text-muted-foreground transition-colors hover:text-foreground',
              theme === value && 'bg-background text-foreground shadow-sm',
            )}
          >
            <Icon size={16} />
          </button>
        ))}
      </div>
    </div>
  )
}

function LocaleSwitcher() {
  const locale = useLocale()

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <IconLanguage size={16} className='mr-2 text-muted-foreground' />
        {m.app_layout_language_label()}
        <span className='ml-auto pl-2 text-xs text-muted-foreground'>{locale.toUpperCase()}</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent className='max-h-64 overflow-y-auto'>
          <DropdownMenuRadioGroup
            value={locale}
            onValueChange={(value) => switchLocale(value as any)}
          >
            {locales.map((value) => (
              <DropdownMenuRadioItem key={value} value={value}>
                {value.toUpperCase()}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  )
}

function UserMenu({ user }: { readonly user: AppNavbarUser }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type='button'
          className='flex items-center gap-2 rounded-xl px-1.5 py-1 hover:bg-muted/50'
        >
          <Avatar className='h-9 w-9'>
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div className='hidden text-left leading-tight sm:block'>
            <p className='text-sm font-medium'>{user.name}</p>
            <p className='text-xs text-muted-foreground'>{user.role}</p>
          </div>
          <IconChevronDown size={16} className='hidden text-muted-foreground sm:block' />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-48'>
        <DropdownMenuLabel>{m.app_layout_account_label()}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to='/'>{m.app_layout_profile_link()}</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to='/'>{m.app_layout_settings_link()}</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />

        <ThemeSwitcher />
        <LocaleSwitcher />

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild variant='destructive'>
          <Link to='/signout'>{m.app_layout_signout_link()}</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function AppNavbar({
  className,
  title,
  user,
  notificationCount = 2,
}: Readonly<AppNavbarProps>) {
  return (
    <nav className={cn('flex h-16 items-center gap-4 bg-sidebar px-4 lg:px-6', className)}>
      <SidebarTrigger className='-ml-1' />

      <h1 className='text-lg font-semibold tracking-tight'>{title}</h1>

      <div className='ml-auto flex items-center gap-3'>
        <AppCommandMenu />

        <Button variant='outline' size='icon' className='relative'>
          <IconBell size={24} />
          {notificationCount > 0 && (
            <Badge className='absolute -top-1 -right-1 h-4.5 min-w-4.5 justify-center rounded-full px-1 text-[0.65rem]'>
              {notificationCount}
            </Badge>
          )}
        </Button>

        {user && <UserMenu user={user} />}
      </div>
    </nav>
  )
}
