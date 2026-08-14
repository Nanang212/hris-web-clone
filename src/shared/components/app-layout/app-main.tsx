import { IconLoader2, IconSearchOff } from '@tabler/icons-react'
import { Link, type LinkProps } from '@tanstack/react-router'
import React from 'react'

import { m } from '@/i18n/paraglide/messages'
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
import { isAxiosError } from '@/shared/lib/axios'
import { cn } from '@/shared/lib/utils'

type BreadcrumbItemType = {
  label: string
} & (
  | { to: LinkProps['to']; params?: LinkProps['params']; search?: LinkProps['search'] }
  | { to?: undefined }
)

type AppMainProps = React.ComponentProps<'main'> & {
  title?: string
  subtitle?: string
  actions?: React.ReactNode
  breadcrumbs?: BreadcrumbItemType[]
  notFound?: React.ReactNode
  pending?: boolean
  error?: Error | null
  retry?: () => void
  loadingComponent?: () => React.ReactNode
  errorComponent?: (props: { error: Error; retry?: () => void }) => React.ReactNode
}

function AppBreadcrumb({ items }: Readonly<{ items: BreadcrumbItemType[] }>) {
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
              <BreadcrumbPage className='max-w-35 truncate sm:max-w-none'>
                {item.label}
              </BreadcrumbPage>
            ) : (
              <BreadcrumbLink asChild className='max-w-25 truncate sm:max-w-none'>
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

function AppMainNotFound() {
  return (
    <div className='flex flex-1 flex-col items-center justify-center gap-2 py-16 text-center'>
      <IconSearchOff className='size-10 text-muted-foreground' />
      <p className='text-sm font-medium text-foreground'>{m.app_layout_main_not_found()}</p>
      <p className='text-sm text-muted-foreground'>{m.app_layout_main_not_found_description()}</p>
    </div>
  )
}

function AppMainLoading() {
  return (
    <div className='flex flex-1 flex-col items-center justify-center gap-2 py-16 text-center'>
      <IconLoader2 className='size-8 animate-spin text-muted-foreground' />
    </div>
  )
}

function AppMainError({ error, retry }: Readonly<{ error?: Error | null; retry?: () => void }>) {
  const messages = isAxiosError(error)
    ? error.response?.data.messages.join(', ') || error.message
    : m.app_layout_main_error()

  return (
    <div className='flex flex-1 flex-col items-center justify-center gap-2 py-16 text-center'>
      <p className='text-sm font-medium text-foreground'>{messages}</p>
      {retry && (
        <button
          type='button'
          onClick={retry}
          className='mt-2 text-sm font-medium text-primary underline-offset-4 hover:underline'
        >
          {m.app_layout_main_error_retry()}
        </button>
      )}
    </div>
  )
}

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error))
}

export function AppMain({
  title,
  subtitle: description,
  actions,
  breadcrumbs,
  notFound,
  pending,
  error,
  retry,
  loadingComponent,
  errorComponent,
  className,
  children,
  ...props
}: AppMainProps) {
  const { open } = useSidebar()

  let content: React.ReactNode
  if (pending) {
    content = loadingComponent ? loadingComponent() : <AppMainLoading />
  } else if (error) {
    const normalizedError = toError(error)
    content = errorComponent ? (
      errorComponent({ error: normalizedError, retry })
    ) : (
      <AppMainError error={error} retry={retry} />
    )
  } else if (notFound) {
    content = typeof notFound === 'boolean' ? <AppMainNotFound /> : notFound
  } else {
    content = children
  }

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

      {content}
    </main>
  )
}
