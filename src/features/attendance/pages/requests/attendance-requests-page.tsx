import { IconCircleCheck, IconClock, IconPlus, IconX } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
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
import { getAttendanceBreadcrumbs } from '@/features/attendance/components/attendance-breadcrumbs'
import { AttendanceTabs } from '@/features/attendance/components/attendance-tabs'
import { m } from '@/i18n/paraglide/messages'

export function AttendanceRequestsPage() {
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedRow, setSelectedRow] = useState<string[] | null>(null)
  const stats = [
    [IconClock, '12', m.attendance_requests_pending(), 'bg-orange-50 text-orange-500'],
    [IconCircleCheck, '38', m.attendance_requests_approved(), 'bg-emerald-50 text-emerald-600'],
    [IconX, '4', m.attendance_requests_rejected(), 'bg-rose-50 text-rose-500'],
  ]
  const rows = [
    [
      'REQ-0241',
      '16 Mei',
      'Rama Aditya',
      m.attendance_requests_forgot_clock_in(),
      '08:52',
      m.attendance_requests_application_error(),
      'pending',
    ],
    [
      'REQ-0239',
      '14 Mei',
      'Sinta Maharani',
      m.attendance_requests_forgot_clock_out(),
      '17:35',
      m.attendance_requests_battery_low(),
      'approved',
    ],
    [
      'REQ-0232',
      '10 Mei',
      'Budi Setiawan',
      m.attendance_requests_correction(),
      '09:00',
      m.attendance_requests_gps_issue(),
      'rejected',
    ],
  ]
  const status = {
    pending: [m.attendance_requests_pending(), 'bg-orange-50 text-orange-500'],
    approved: [m.attendance_requests_approved(), 'bg-emerald-50 text-emerald-600'],
    rejected: [m.attendance_requests_rejected(), 'bg-rose-50 text-rose-600'],
  } as const
  const filteredRows = rows.filter(
    (row) => statusFilter === 'all' || row[6] === statusFilter,
  )
  return (
    <AppMain
      title={m.attendance_requests_title()}
      subtitle={m.attendance_requests_subtitle()}
      breadcrumbs={getAttendanceBreadcrumbs(m.attendance_requests_title())}
      className='gap-5 bg-muted/30'
      actions={
        <Button asChild>
          <Link to='/attendance/requests/new'>
            <IconPlus />
            {m.attendance_requests_create()}
          </Link>
        </Button>
      }
    >
      <AttendanceTabs active='requests' />
      <div className='grid gap-3 sm:grid-cols-3'>
        {stats.map(([Icon, value, label, color]) => (
          <Card
            key={label as string}
          >
            <CardContent className='flex items-center gap-3 p-4'>
            <span
              className={`flex size-10 items-center justify-center rounded-xl ${color as string}`}
            >
              <Icon className='size-5' />
            </span>
            <div>
              <p className='text-2xl font-bold'>{value}</p>
              <p className='text-xs text-muted-foreground'>{label}</p>
            </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className='grid gap-3 p-4 md:grid-cols-4 md:items-end'>
        <Select>
          <SelectTrigger className='w-full'>
            <SelectValue placeholder={m.attendance_requests_type()} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>{m.attendance_requests_all_types()}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className='w-full'>
            <SelectValue placeholder={m.attendance_history_status()} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>{m.attendance_history_all_status()}</SelectItem>
            <SelectItem value='pending'>{m.attendance_requests_pending()}</SelectItem>
            <SelectItem value='approved'>{m.attendance_requests_approved()}</SelectItem>
            <SelectItem value='rejected'>{m.attendance_requests_rejected()}</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className='w-full'>
            <SelectValue placeholder={m.attendance_history_period()} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='may'>{m.attendance_requests_may()}</SelectItem>
          </SelectContent>
        </Select>
        <Button variant='outline'>{m.attendance_history_filter()}</Button>
        </CardContent>
      </Card>
      <Card className='min-w-0 overflow-hidden py-0'>
        <CardContent className='overflow-x-auto px-0'>
        <Table className='min-w-[980px]'>
          <TableHeader className='bg-muted/50'>
            <TableRow>
              {[
                m.attendance_requests_id(),
                m.attendance_table_date(),
                m.attendance_history_employee(),
                m.attendance_requests_type(),
                m.attendance_requests_requested_time(),
                m.attendance_requests_reason(),
                m.attendance_table_status(),
                m.attendance_history_action(),
              ].map((label) => (
                <TableHead key={label}>{label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRows.map((row) => {
              const item = status[row[6] as keyof typeof status]
              return (
                <TableRow key={row[0]}>
                  {row.slice(0, 6).map((cell) => (
                    <TableCell key={cell} className='text-xs'>
                      {cell}
                    </TableCell>
                  ))}
                  <TableCell>
                    <Badge variant={row[6] === 'pending' ? 'amber' : row[6] === 'rejected' ? 'red' : 'green'}>
                      {item[0]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button size='sm' variant='ghost' onClick={() => setSelectedRow(row)}>
                      {m.attendance_history_view()}
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        </CardContent>
      </Card>
      <Dialog open={!!selectedRow} onOpenChange={(open) => !open && setSelectedRow(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{m.attendance_history_view()}</DialogTitle>
            <DialogDescription>
              {selectedRow?.[0]} · {selectedRow?.[2]}
            </DialogDescription>
          </DialogHeader>
          {selectedRow && (
            <dl className='grid gap-3 rounded-xl border bg-muted/30 p-4 text-sm sm:grid-cols-2'>
              <div>
                <dt className='text-xs text-muted-foreground'>{m.attendance_requests_id()}</dt>
                <dd className='mt-1 font-medium'>{selectedRow[0]}</dd>
              </div>
              <div>
                <dt className='text-xs text-muted-foreground'>{m.attendance_table_date()}</dt>
                <dd className='mt-1 font-medium'>{selectedRow[1]}</dd>
              </div>
              <div>
                <dt className='text-xs text-muted-foreground'>{m.attendance_history_employee()}</dt>
                <dd className='mt-1 font-medium'>{selectedRow[2]}</dd>
              </div>
              <div>
                <dt className='text-xs text-muted-foreground'>{m.attendance_requests_type()}</dt>
                <dd className='mt-1 font-medium'>{selectedRow[3]}</dd>
              </div>
              <div>
                <dt className='text-xs text-muted-foreground'>{m.attendance_requests_requested_time()}</dt>
                <dd className='mt-1 font-medium'>{selectedRow[4]}</dd>
              </div>
              <div>
                <dt className='text-xs text-muted-foreground'>{m.attendance_requests_reason()}</dt>
                <dd className='mt-1 font-medium'>{selectedRow[5]}</dd>
              </div>
            </dl>
          )}
        </DialogContent>
      </Dialog>
    </AppMain>
  )
}
