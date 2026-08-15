import { IconCalendarRepeat, IconChevronDown } from '@tabler/icons-react'
import dayjs from 'dayjs'
import * as React from 'react'
import type { DateRange } from 'react-day-picker'

import { Button, type ButtonProps } from '@/shared/components/ui/button'
import { Calendar } from '@/shared/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover'
import { cn } from '@/shared/lib/utils'

type DatePickerBaseProps = Omit<ButtonProps, 'children' | 'onSelect'>

type DatePickerSingleProps = DatePickerBaseProps & {
  placeholder?: string
  mode: 'single'
  selected?: Date
  onSelect: (date?: Date) => void
}

type DatePickerRangeProps = DatePickerBaseProps & {
  placeholder?: string
  mode: 'range'
  selected?: DateRange
  onSelect: (range: DateRange | undefined) => void
}

type DatePickerProps = DatePickerSingleProps | DatePickerRangeProps

export function DatePicker(props: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const { mode, selected, onSelect, placeholder, ...buttonProps } = props
  const isSelected = mode === 'range' ? !!selected?.from || !!selected?.to : !!selected

  let displayValue = placeholder ?? 'Choose date'

  if (mode === 'single') {
    displayValue = selected ? dayjs(selected).format('DD MMM YYYY') : (placeholder ?? 'Choose date')
  } else if (selected?.from) {
    const from = dayjs(selected.from).format('DD MMM YYYY')
    const to = selected.to ? dayjs(selected.to).format('DD MMM YYYY') : null

    displayValue = to ? `${from} - ${to}` : from
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          className='w-65 justify-start text-left font-normal'
          {...buttonProps}
        >
          <IconCalendarRepeat className='mr-2 h-4 w-4 text-muted-foreground' />
          <span
            className={cn('font-normal text-muted-foreground', isSelected && 'text-foreground')}
          >
            {displayValue}
          </span>
          <IconChevronDown className='ml-auto h-4 w-4 text-muted-foreground opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='start'>
        <Calendar
          startMonth={dayjs().subtract(100, 'years').startOf('year').toDate()}
          endMonth={dayjs().add(100, 'years').endOf('year').toDate()}
          mode={mode}
          selected={selected as any}
          onSelect={(date: any) => {
            onSelect(date)
          }}
          numberOfMonths={mode === 'range' ? 2 : 1}
          captionLayout='dropdown'
          {...(mode === 'range' ? { required: false } : {})}
        />
      </PopoverContent>
    </Popover>
  )
}
