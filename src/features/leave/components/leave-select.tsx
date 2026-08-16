import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { m } from '@/i18n/paraglide/messages'

interface LeaveSelectProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  className?: string
  id?: string
  includeAll?: boolean
}

export function LeaveSelect({
  value,
  onValueChange,
  placeholder,
  className,
  id,
  includeAll = false,
}: Readonly<LeaveSelectProps>) {
  const options = [
    { value: 'annual', label: m.leave_type_annual() },
    { value: 'sick', label: m.leave_type_sick() },
    { value: 'personal', label: m.leave_type_personal() },
    { value: 'maternity', label: m.leave_type_maternity() },
  ]

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger id={id} className={className}>
        <SelectValue placeholder={placeholder ?? m.leave_filter_all_types()} />
      </SelectTrigger>
      <SelectContent>
        {includeAll && <SelectItem value='all'>{m.leave_filter_all_types()}</SelectItem>}
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
