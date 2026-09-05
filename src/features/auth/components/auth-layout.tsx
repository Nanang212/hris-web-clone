import type { ReactNode } from 'react'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card'
import { SidebarProvider } from '@/shared/components/ui/sidebar'
import { BackgroundDecor, BrandMark } from '@/features/auth/components/background'

interface AuthLayoutProps {
  title: string
  subtitle: string
  children: ReactNode
}

export function AuthLayout({ title, subtitle, children }: Readonly<AuthLayoutProps>) {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className='relative flex min-h-screen w-full items-center justify-center bg-muted/30 p-4 sm:p-6'>
        <BackgroundDecor />
        <Card className='relative w-full max-w-lg'>
          <CardHeader>
            <BrandMark />
          </CardHeader>
          <CardContent>
            <AppMain
              title={title}
              subtitle={subtitle}
              className='min-h-0 overflow-x-visible overflow-y-visible border-0 bg-transparent p-0'
            >
              {children}
            </AppMain>
          </CardContent>
        </Card>
      </div>
    </SidebarProvider>
  )
}
