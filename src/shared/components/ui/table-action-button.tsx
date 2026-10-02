// table-action-button.tsx
// Reusable icon-only action button with Radix UI Tooltip for use in tables.
import * as React from 'react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip'

export interface TableActionButtonProps
  extends React.ComponentProps<typeof Button> {
  /** Tooltip text displayed on hover */
  tooltip: string
  /** Icon to render inside the button */
  icon: React.ReactNode
  /** Side the tooltip appears on. Defaults to 'top' */
  tooltipSide?: 'top' | 'bottom' | 'left' | 'right'
  /** Visual variant: 'default' = ghost muted, 'danger' = red destructive, 'primary' = blue primary */
  intent?: 'default' | 'danger' | 'primary' | 'warning' | 'success'
}

const intentClassMap: Record<NonNullable<TableActionButtonProps['intent']>, string> = {
  default:  'text-muted-foreground hover:text-foreground hover:bg-muted',
  danger:   'text-muted-foreground hover:text-destructive hover:bg-destructive/10',
  primary:  'text-muted-foreground hover:text-primary hover:bg-primary/10',
  warning:  'text-muted-foreground hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20',
  success:  'text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20',
}

export function TableActionButton({
  tooltip,
  icon,
  tooltipSide = 'top',
  intent = 'default',
  className,
  disabled,
  ...props
}: TableActionButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type='button'
          variant='ghost'
          size='icon-sm'
          disabled={disabled}
          aria-label={tooltip}
          className={cn(
            'transition-colors',
            intentClassMap[intent],
            className,
          )}
          {...props}
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent side={tooltipSide}>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  )
}
