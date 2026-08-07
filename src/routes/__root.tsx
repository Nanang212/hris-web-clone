import { ThemeProvider } from '@/shared/components/theme-provider'
import { useLocale } from '@/i18n/local-store'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

const RootLayout = () => {
  const locale = useLocale()
  return (
    <ThemeProvider key={locale}>
      <Outlet />
      <TanStackRouterDevtools />
    </ThemeProvider>
  )
}

export const Route = createRootRoute({ component: RootLayout })
