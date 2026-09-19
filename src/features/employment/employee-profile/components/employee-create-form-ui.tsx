import { IconCheck, IconChevronDown, IconPlus, IconTrash } from '@tabler/icons-react'
import { useState, type ReactNode } from 'react'

import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/components/ui/collapsible'
import { cn } from '@/shared/lib/utils'

interface StepItem {
  title: string
  description: string
}

interface EmployeeCreateStepperProps {
  currentStep: number
  steps: StepItem[]
  onStepChange: (step: number) => void
}

export function EmployeeCreateStepper({
  currentStep,
  steps,
  onStepChange,
}: EmployeeCreateStepperProps) {
  return (
    <div className='grid gap-2 sm:grid-cols-2 xl:grid-cols-4'>
      {steps.map((step, index) => {
        const completed = index < currentStep
        const active = index === currentStep

        return (
          <button
            key={step.title}
            type='button'
            className={cn(
              'flex min-w-0 items-start gap-3 rounded-2xl border bg-card p-3 text-start transition-colors',
              active && 'border-primary bg-primary/5 ring-2 ring-primary/10',
              completed && 'border-primary/30 hover:bg-muted/60',
              index > currentStep && 'cursor-not-allowed opacity-55',
            )}
            disabled={index > currentStep}
            onClick={() => index <= currentStep && onStepChange(index)}
          >
            <span
              className={cn(
                'flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold',
                active && 'border-primary bg-primary text-primary-foreground',
                completed && 'border-primary bg-primary/10 text-primary',
              )}
            >
              {completed ? <IconCheck className='size-4' /> : index + 1}
            </span>
            <span className='min-w-0'>
              <span className='block truncate text-sm font-semibold'>{step.title}</span>
              <span className='mt-0.5 line-clamp-2 block text-xs text-muted-foreground'>
                {step.description}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}

interface CollectionCardProps {
  title: string
  description: string
  addLabel: string
  count: number
  onAdd: () => void
  children: ReactNode
  className?: string
}

export function CollectionCard({
  title,
  description,
  addLabel,
  count,
  onAdd,
  children,
  className,
}: CollectionCardProps) {
  return (
    <Card className={className}>
      <CardHeader className='gap-3'>
        <div className='min-w-0 space-y-1.5'>
          <div className='flex items-center gap-2'>
            <CardTitle>{title}</CardTitle>
            <Badge variant='secondary'>{count}</Badge>
          </div>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        {children}
        <Button
          type='button'
          variant='outline'
          size='sm'
          className='w-full justify-center border-dashed'
          onClick={onAdd}
        >
          <IconPlus />
          {addLabel}
        </Button>
      </CardContent>
    </Card>
  )
}

interface CollectionItemProps {
  number: number
  title: string
  description?: string
  removeLabel: string
  onRemove?: () => void
  children: ReactNode
  defaultOpen?: boolean
}

export function CollectionItem({
  number,
  title,
  description,
  removeLabel,
  onRemove,
  children,
  defaultOpen = true,
}: CollectionItemProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <section className='overflow-hidden rounded-2xl border bg-muted/15'>
        <div className='flex items-center justify-between gap-2 bg-background/70 px-2 py-2'>
          <CollapsibleTrigger asChild>
            <button
              type='button'
              className='flex min-w-0 flex-1 items-center gap-3 rounded-xl px-2 py-1 text-start hover:bg-muted/60'
            >
              <Badge variant='outline' className='size-7 shrink-0 rounded-full p-0'>
                {number}
              </Badge>
              <span className='min-w-0 flex-1'>
                <span className='block truncate text-sm font-semibold'>{title}</span>
                {description && (
                  <span className='block truncate text-xs text-muted-foreground'>
                    {description}
                  </span>
                )}
              </span>
              <IconChevronDown
                className={cn('size-4 shrink-0 transition-transform', open && 'rotate-180')}
              />
            </button>
          </CollapsibleTrigger>
          {onRemove && (
            <Button
              type='button'
              variant='ghost'
              size='sm'
              className='text-destructive hover:bg-destructive/10 hover:text-destructive'
              onClick={onRemove}
            >
              <IconTrash />
              <span className='hidden sm:inline'>{removeLabel}</span>
            </Button>
          )}
        </div>
        <CollapsibleContent>
          <div className='border-t p-4'>{children}</div>
        </CollapsibleContent>
      </section>
    </Collapsible>
  )
}
