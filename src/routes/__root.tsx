import { QueryClientProvider } from '@tanstack/react-query'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import { useLocale } from '@/i18n/local-store'
import { ThemeProvider } from '@/shared/components/theme-provider'
import { Toaster } from '@/shared/components/ui/sonner'
import { TooltipProvider } from '@/shared/components/ui/tooltip'
import { queryClient } from '@/shared/lib/query'

const RootLayout = () => {
  const locale = useLocale()
  return (
    <ThemeProvider key={locale}>
      <TooltipProvider delayDuration={150}>
        <Toaster richColors />
        <QueryClientProvider client={queryClient}>
          <Outlet />
        </QueryClientProvider>
        <TanStackRouterDevtools />
      </TooltipProvider>
    </ThemeProvider>
  )
}

export const Route = createRootRoute({ component: RootLayout })
