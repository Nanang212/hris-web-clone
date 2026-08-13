import { Link, type LinkProps } from '@tanstack/react-router'
import React from 'react'

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/components/ui/breadcrumb'
import { useSidebar } from '@/shared/components/ui/sidebar'
import { cn } from '@/shared/lib/utils'

type BreadcrumbItemType = {
  label: string
} & (
  | { to: LinkProps['to']; params?: LinkProps['params']; search?: LinkProps['search'] }
  | { to?: undefined }
)

type AppMainProps = React.ComponentProps<'main'> & {
  title?: string
  description?: string
  actions?: React.ReactNode
  breadcrumbs?: BreadcrumbItemType[]
}

function AppBreadcrumb({ items }: { items: BreadcrumbItemType[] }) {
  const collapsedMobile = items.length > 2

  return (
    <Breadcrumb>
      <BreadcrumbList className='flex-nowrap gap-1 overflow-x-auto text-xs whitespace-nowrap sm:flex-wrap sm:gap-1.5'>
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          const isFirst = index === 0
          const isMiddle = !isFirst && !isLast

          const crumb =
            isLast || !item.to ? (
              <BreadcrumbPage className='max-w-[140px] truncate sm:max-w-none'>
                {item.label}
              </BreadcrumbPage>
            ) : (
              <BreadcrumbLink asChild className='max-w-[100px] truncate sm:max-w-none'>
                <Link to={item.to} params={item.params} search={item.search}>
                  {item.label}
                </Link>
              </BreadcrumbLink>
            )

          return (
            <React.Fragment key={`${item.label}-${index}`}>
              <BreadcrumbItem className={cn(collapsedMobile && isMiddle && 'hidden sm:flex')}>
                {crumb}
              </BreadcrumbItem>
              {!isLast && (
                <BreadcrumbSeparator
                  className={cn(collapsedMobile && isMiddle && 'hidden sm:flex')}
                />
              )}
              {collapsedMobile && isFirst && (
                <>
                  <BreadcrumbItem className='sm:hidden'>
                    <BreadcrumbEllipsis />
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className='sm:hidden' />
                </>
              )}
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export function AppMain({
  title,
  description,
  actions,
  breadcrumbs,
  className,
  children,
  ...props
}: AppMainProps) {
  const { open } = useSidebar()
  return (
    <main
      className={cn(
        'flex min-h-[calc(100vh-64px)] w-full flex-col gap-6 border border-border bg-background p-4',
        open && 'rounded-s-3xl transition-all duration-300',
        className,
      )}
      {...props}
    >
      {(title || description || actions || (breadcrumbs && breadcrumbs.length > 0)) && (
        <div className='flex flex-col justify-between gap-3 sm:flex-row sm:items-start'>
          {(title || description || (breadcrumbs && breadcrumbs.length > 0)) && (
            <div className='min-w-0'>
              {breadcrumbs && breadcrumbs.length > 0 && <AppBreadcrumb items={breadcrumbs} />}
              {title && (
                <h2 className='text-2xl font-bold tracking-tight text-foreground'>{title}</h2>
              )}
              {description && <p className='mt-1 text-sm text-muted-foreground'>{description}</p>}
            </div>
          )}
          {actions && <div className='flex flex-wrap items-center gap-2'>{actions}</div>}
        </div>
      )}

      {children}
    </main>
  )
}
