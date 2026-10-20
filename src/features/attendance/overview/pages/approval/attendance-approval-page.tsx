import {
  IconCamera,
  IconCircleCheck,
  IconClock,
  IconDeviceMobile,
  IconMapPin,
  IconShieldExclamation,
  IconX,
} from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { getAttendanceBreadcrumbs } from '@/features/attendance/components/attendance-breadcrumbs'
import { AttendanceTabs } from '@/features/attendance/components/attendance-tabs'
import { m } from '@/i18n/paraglide/messages'

export function AttendanceApprovalPage() {
  const [typeFilter, setTypeFilter] = useState('all')
  const [riskFilter, setRiskFilter] = useState('all')
  const stats = [
    [
      IconShieldExclamation,
      '12',
      m.attendance_approval_needs_action(),
      'bg-primary/10 text-primary',
    ],
    [
      IconCircleCheck,
      '8',
      m.attendance_approval_approved_today(),
      'bg-primary/10 text-primary',
    ],
    [IconX, '1', m.attendance_approval_rejected_today(), 'bg-primary/10 text-primary'],
  ]
  const rows = [
    [
      'Rama Aditya',
      '16 Mei',
      m.attendance_requests_forgot_clock_in(),
      '08:52',
      '09:10',
      m.attendance_approval_low(),
    ],
    [
      'Budi Setiawan',
      '15 Mei',
      m.attendance_requests_forgot_clock_out(),
      '18:05',
      '18:22',
      m.attendance_approval_medium(),
    ],
    [
      'Sinta Maharani',
      '14 Mei',
      m.attendance_requests_correction(),
      '08:30',
      '10:14',
      m.attendance_approval_low(),
    ],
  ]
  const filteredRows = rows.filter(
    (row) =>
      (typeFilter === 'all' || row[2] === typeFilter) &&
      (riskFilter === 'all' || row[5] === riskFilter),
  )
  return (
    <AppMain
      title={m.attendance_approval_title()}
      subtitle={m.attendance_approval_subtitle()}
      breadcrumbs={getAttendanceBreadcrumbs(m.attendance_approval_title())}
      className='gap-5 bg-muted/30'
    >
      <AttendanceTabs active='approval' />
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
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className='w-full'>
            <SelectValue placeholder={m.attendance_requests_type()} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>{m.attendance_requests_all_types()}</SelectItem>
            <SelectItem value={m.attendance_requests_forgot_clock_in()}>
              {m.attendance_requests_forgot_clock_in()}
            </SelectItem>
            <SelectItem value={m.attendance_requests_forgot_clock_out()}>
              {m.attendance_requests_forgot_clock_out()}
            </SelectItem>
            <SelectItem value={m.attendance_requests_correction()}>
              {m.attendance_requests_correction()}
            </SelectItem>
          </SelectContent>
        </Select>
        <Select value={riskFilter} onValueChange={setRiskFilter}>
          <SelectTrigger className='w-full'>
            <SelectValue placeholder={m.attendance_approval_risk()} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>{m.attendance_approval_risk()}</SelectItem>
            <SelectItem value={m.attendance_approval_low()}>{m.attendance_approval_low()}</SelectItem>
            <SelectItem value={m.attendance_approval_medium()}>
              {m.attendance_approval_medium()}
            </SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue='may'>
          <SelectTrigger className='w-full'>
            <SelectValue placeholder={m.attendance_history_period()} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='may'>{m.attendance_history_period_value()}</SelectItem>
          </SelectContent>
        </Select>
        <Button variant='outline' onClick={() => { setTypeFilter('all'); setRiskFilter('all') }}>
          {m.attendance_history_filter()}
        </Button>
        </CardContent>
      </Card>
      <Card className='min-w-0 overflow-hidden py-0'>
        <CardContent className='overflow-x-auto px-0'>
        <Table className='min-w-[860px]'>
          <TableHeader className='bg-muted/50'>
            <TableRow>
              {[
                m.attendance_approval_requester(),
                m.attendance_table_date(),
                m.attendance_requests_type(),
                m.attendance_approval_requested_time(),
                m.attendance_approval_submitted(),
                m.attendance_approval_risk(),
                m.attendance_history_action(),
              ].map((label) => (
                <TableHead key={label}>{label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRows.map((row) => (
              <TableRow key={row[0]}>
                {row.map((cell, index) => (
                  <TableCell
                    key={cell}
                    className={index === 0 ? 'text-xs font-semibold' : 'text-xs'}
                  >
                    {index === 5 ? (
                      <Badge variant={cell === m.attendance_approval_low() ? 'green' : 'amber'}>
                        {cell}
                      </Badge>
                    ) : (
                      cell
                    )}
                  </TableCell>
                ))}
                <TableCell>
                  <Button size='sm' variant='ghost' asChild>
                    <Link to='/attendance/approval/REQ-0241'>
                      {m.attendance_approval_review()}
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </CardContent>
      </Card>
      <Card className='w-full min-w-0 shadow-sm'>
        <CardHeader className='pb-3'>
          <CardTitle>{m.attendance_approval_guidance()}</CardTitle>
        </CardHeader>
        <CardContent className='grid min-w-0 gap-4 pt-0 sm:grid-cols-2 xl:grid-cols-4'>
          {[
            [IconMapPin, m.attendance_approval_gps(), m.attendance_approval_gps_desc()],
            [IconCamera, m.attendance_approval_face(), m.attendance_approval_face_desc()],
            [IconDeviceMobile, m.attendance_approval_device(), m.attendance_approval_device_desc()],
            [IconClock, m.attendance_approval_tolerance(), m.attendance_approval_tolerance_desc()],
          ].map(([Icon, title, desc]) => (
            <div key={title} className='flex min-w-0 items-start gap-3 rounded-xl border p-3'>
              <span className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'>
                <Icon className='size-4' />
              </span>
              <div className='min-w-0'>
                <p className='text-sm font-semibold'>{title}</p>
                <p className='mt-1 text-xs leading-5 text-muted-foreground'>{desc}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </AppMain>
  )
}
