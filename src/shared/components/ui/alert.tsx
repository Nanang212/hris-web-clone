import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/shared/lib/utils'

const alertVariants = cva(
  'group/alert flex w-full items-center gap-3 rounded-2xl bg-card px-5 py-4 text-start text-sm text-card-foreground shadow-sm ring-1 ring-foreground/5 dark:ring-foreground/10',
  {
    variants: {
      variant: {
        default: 'bg-card text-card-foreground',
        info: 'bg-card text-card-foreground [&_[data-slot=alert-icon]]:bg-blue-500/10 [&_[data-slot=alert-icon]]:text-blue-700 dark:[&_[data-slot=alert-icon]]:text-blue-300',
        success:
          'bg-card text-card-foreground [&_[data-slot=alert-icon]]:bg-emerald-500/10 [&_[data-slot=alert-icon]]:text-emerald-700 dark:[&_[data-slot=alert-icon]]:text-emerald-300',
        warning:
          'bg-card text-card-foreground [&_[data-slot=alert-icon]]:bg-amber-500/10 [&_[data-slot=alert-icon]]:text-amber-700 dark:[&_[data-slot=alert-icon]]:text-amber-300',
        destructive:
          'bg-card text-destructive *:data-[slot=alert-description]:text-destructive/90 *:[svg]:text-current',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot='alert'
      role='alert'
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='alert-title'
      className={cn(
        'font-semibold [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground',
        className,
      )}
      {...props}
    />
  )
}

function AlertDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='alert-description'
      className={cn(
        'text-xs text-balance text-muted-foreground md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4',
        className,
      )}
      {...props}
    />
  )
}

function AlertAction({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot='alert-action' className={cn('ms-auto shrink-0', className)} {...props} />
}

function AlertIcon({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='alert-icon'
      className={cn(
        'flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground [&_svg]:size-4.5',
        className,
      )}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, AlertAction, AlertIcon }
