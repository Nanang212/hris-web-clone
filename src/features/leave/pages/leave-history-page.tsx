import dayjs from 'dayjs'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { leaveRequests } from '@/features/leave/components/leave-data'
import { LeaveSelect } from '@/features/leave/components/leave-select'
import { LeaveTabs } from '@/features/leave/components/leave-tabs'
import {
  formatLeavePeriod,
  getLeaveTypeLabel,
  LeaveStatus,
} from '@/features/leave/components/leave-utils'
import { m } from '@/i18n/paraglide/messages'

export function LeaveHistoryPage() {
  const history = leaveRequests.filter((request) => request.status !== 'pending')
  return (
    <AppMain
      title={m.leave_history_title()}
      subtitle={m.leave_history_subtitle()}
      actions={<Button variant='outline'>{m.leave_export()}</Button>}
      className='gap-5 bg-muted/30'
    >
      <LeaveTabs active='history' />
      <section className='grid gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm md:grid-cols-[repeat(3,1fr)_1.6fr_auto]'>
        <Select defaultValue='2026'>
          <SelectTrigger className='w-full' aria-label={m.leave_filter_year()}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='2026'>2026</SelectItem>
            <SelectItem value='2025'>2025</SelectItem>
          </SelectContent>
        </Select>
        <LeaveSelect value='all' includeAll className='w-full' />
        <Select defaultValue='all'>
          <SelectTrigger className='w-full' aria-label={m.leave_table_status()}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>{m.leave_filter_all_status()}</SelectItem>
            <SelectItem value='approved'>{m.leave_status_approved()}</SelectItem>
            <SelectItem value='rejected'>{m.leave_status_rejected()}</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder={m.leave_filter_search_placeholder()}
          aria-label={m.leave_filter_search_placeholder()}
        />
        <Button variant='outline'>{m.leave_filter_button()}</Button>
      </section>
      <section className='overflow-hidden rounded-2xl border border-border bg-card shadow-sm'>
        <div className='p-4'>
          <h3 className='font-semibold'>{m.leave_history_table_title()}</h3>
        </div>
        <Table>
          <TableHeader className='bg-muted/40'>
            <TableRow>
              <TableHead>{m.leave_history_date()}</TableHead>
              <TableHead>{m.leave_table_type()}</TableHead>
              <TableHead>{m.leave_table_period()}</TableHead>
              <TableHead>{m.leave_table_duration()}</TableHead>
              <TableHead>{m.leave_table_status()}</TableHead>
              <TableHead>{m.leave_history_approved_by()}</TableHead>
              <TableHead>{m.leave_balance_expiry_date()}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{dayjs(request.submittedAt).format('DD MMM YYYY')}</TableCell>
                <TableCell>{getLeaveTypeLabel(request.leaveType)}</TableCell>
                <TableCell>{formatLeavePeriod(request.startDate, request.endDate)}</TableCell>
                <TableCell>{m.leave_days({ count: request.duration })}</TableCell>
                <TableCell>
                  <LeaveStatus status={request.status} />
                </TableCell>
                <TableCell>Rama Arif</TableCell>
                <TableCell className='text-rose-500'>31 Dec 2026</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </AppMain>
  )
}
