import { IconCheck, IconChevronDown, IconPlus, IconTrash } from '@tabler/icons-react'
import { Fragment, useState, type ReactNode } from 'react'

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
import { ScrollArea, ScrollBar } from '@/shared/components/ui/scroll-area'
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
    <ScrollArea className='w-full rounded-2xl border bg-muted/20 shadow-sm'>
      <div className='px-3 py-3 sm:px-4 sm:py-4'>
        <div className='relative grid min-w-[760px] grid-cols-5 gap-0'>
          {steps.map((step, index) => {
            const completed = index < currentStep
            const active = index === currentStep

            return (
              <Fragment key={step.title}>
                <button
                  type='button'
                  className={cn(
                    'group relative z-10 flex min-w-0 flex-col items-center gap-2 rounded-xl px-2 py-1 text-center transition-colors focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none',
                    active && 'bg-primary/5',
                    index > currentStep && 'cursor-not-allowed opacity-55',
                  )}
                  aria-current={active ? 'step' : undefined}
                  disabled={index > currentStep}
                  onClick={() => index <= currentStep && onStepChange(index)}
                  title={`${step.title}: ${step.description}`}
                >
                  <span
                    className={cn(
                      'relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border-2 bg-background text-sm font-semibold shadow-sm transition-colors',
                      active &&
                        'border-primary bg-primary text-primary-foreground shadow-primary/20',
                      completed &&
                        'border-primary bg-primary/10 text-primary group-hover:bg-primary/15',
                      !active && !completed && 'border-border text-muted-foreground',
                    )}
                  >
                    {completed ? <IconCheck className='size-4' /> : index + 1}
                  </span>
                  {index < steps.length - 1 && (
                    <span
                      aria-hidden='true'
                      className={cn(
                        'pointer-events-none absolute top-7 z-0 h-0.5',
                        'right-[calc(-50%+20px)] left-[calc(50%+20px)]',
                        completed ? 'bg-primary' : 'bg-border',
                      )}
                    />
                  )}
                  <span className='max-w-full min-w-0'>
                    <span
                      className={cn(
                        'block truncate text-sm font-semibold',
                        active ? 'text-primary' : 'text-foreground',
                      )}
                    >
                      {step.title}
                    </span>
                    <span className='mt-0.5 line-clamp-2 block text-xs leading-4 text-muted-foreground'>
                      {step.description}
                    </span>
                  </span>
                </button>
              </Fragment>
            )
          })}
        </div>
      </div>
      <ScrollBar orientation='horizontal' />
    </ScrollArea>
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
