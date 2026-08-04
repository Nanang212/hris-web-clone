import { Link } from "@tanstack/react-router"
import {
  IconSearch,
  IconBell,
  IconChevronDown,
  IconSun,
  IconMoon,
  IconDeviceDesktop,
} from "@tabler/icons-react"

import { SidebarTrigger } from "@/shared/components/ui/sidebar"
import { Input } from "@/shared/components/ui/input"
import { Badge } from "@/shared/components/ui/badge"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { Separator } from "@/shared/components/ui/separator"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/components/ui/button"
import { useTheme } from "@/shared/components/theme-provider"

interface AppNavbarProps {
  className?: string
  title?: string
  user?: {
    name: string
    role: string
    avatarUrl?: string
  }
  notificationCount?: number
}

export function AppNavbar({
  className,
  title,
  user,
  notificationCount = 2,
}: Readonly<AppNavbarProps>) {
  const initials = user?.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
  const { theme, setTheme } = useTheme()

  const themeOptions = [
    { value: "light", label: "Light", icon: IconSun },
    { value: "dark", label: "Dark", icon: IconMoon },
    { value: "system", label: "System", icon: IconDeviceDesktop },
  ] as const

  return (
    <nav
      className={cn(
        "flex h-16 items-center gap-4 border-b bg-background px-4 lg:px-6",
        className
      )}
    >
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" />

      <h1 className="text-lg font-semibold tracking-tight">{title}</h1>

      <div className="ml-auto flex items-center gap-3">
        <div className="relative hidden sm:block">
          <IconSearch
            size={16}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search anything..."
            className="w-56 rounded-xl bg-muted/40 pl-9 lg:w-72"
          />
        </div>

        <Button variant="outline" size="icon" className="relative">
          <IconBell size={24} />
          {notificationCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4.5 min-w-4.5 justify-center rounded-full px-1 text-[0.65rem]">
              {notificationCount}
            </Badge>
          )}
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 rounded-xl px-1.5 py-1 hover:bg-muted/50"
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.avatarUrl} alt={user.name} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="hidden text-left leading-tight sm:block">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.role}</p>
                </div>
                <IconChevronDown
                  size={16}

                  className="hidden text-muted-foreground sm:block"
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/settings">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              <div className="px-2 py-1.5">
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                  Theme
                </p>
                <div className="flex gap-1 rounded-lg bg-muted/50 p-1">
                  {themeOptions.map(({ value, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setTheme(value)}
                      className={cn(
                        "flex flex-1 items-center justify-center rounded-md py-1.5 text-muted-foreground transition-colors hover:text-foreground",
                        theme === value &&
                          "bg-background text-foreground shadow-sm"
                      )}
                    >
                      <Icon size={16} />
                    </button>
                  ))}
                </div>
              </div>

              <DropdownMenuSeparator />
              <DropdownMenuItem asChild variant="destructive">
                <Link to="/signout">Sign out</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </nav>
  )
}
