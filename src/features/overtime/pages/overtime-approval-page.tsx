import {
  IconAlertTriangle,
  IconCircleCheck,
  IconClockHour4,
  IconClockPause,
} from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'
import type { DateRange } from 'react-day-picker'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { DatePicker } from '@/shared/components/ui/date-picker'
import { Field, FieldLabel } from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { overtimeRequests } from '@/features/overtime/components/overtime-data'
import { OvertimeStat } from '@/features/overtime/components/overtime-shared'
import { OvertimeTabs } from '@/features/overtime/components/overtime-tabs'
import { m } from '@/i18n/paraglide/messages'

const initialApprovalDateRange: DateRange = {
  from: dayjs('2026-08-01').toDate(),
  to: dayjs('2026-08-31').toDate(),
}

export function OvertimeApprovalPage() {
  const [search, setSearch] = useState('')
  const [dateRange, setDateRange] = useState<DateRange | undefined>(initialApprovalDateRange)
  const [filters, setFilters] = useState<{
    search: string
    dateRange?: DateRange
  }>({ search: '', dateRange: initialApprovalDateRange })
  const filteredRequests = useMemo(
    () =>
      overtimeRequests.filter((request) => {
        const query = filters.search.trim().toLocaleLowerCase()
        const matchesSearch =
          !query ||
          request.employee.toLocaleLowerCase().includes(query) ||
          request.id.toLocaleLowerCase().includes(query)
        const requestDate = dayjs(request.date).startOf('day')
        const rangeStart = filters.dateRange?.from
          ? dayjs(filters.dateRange.from).startOf('day')
          : undefined
        const rangeEnd = filters.dateRange?.to
          ? dayjs(filters.dateRange.to).endOf('day')
          : undefined
        const matchesDateRange =
          (!rangeStart || !requestDate.isBefore(rangeStart)) &&
          (!rangeEnd || !requestDate.isAfter(rangeEnd))

        return matchesSearch && matchesDateRange
      }),
    [filters],
  )

  return (
    <AppMain
      title={m.overtime_approval_title()}
      subtitle={m.overtime_approval_subtitle()}
      breadcrumbs={[
        { label: m.app_layout_nav_time_management() },
        { to: '/overtime', label: m.app_layout_nav_overtime() },
        { label: m.overtime_tab_approval() },
      ]}
      className='gap-5 bg-muted/30'
    >
      <OvertimeTabs active='approval' />
      <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        <OvertimeStat
          icon={IconClockHour4}
          label='Pending Review'
          value='18'
          detail='Need action'
          tone='amber'
        />
        <OvertimeStat
          icon={IconAlertTriangle}
          label='Conflict Flag'
          value='3'
          detail='Schedule / overlap'
          tone='red'
        />
        <OvertimeStat
          icon={IconCircleCheck}
          label='Approved Today'
          value='12'
          detail='Processed'
          tone='green'
        />
        <OvertimeStat
          icon={IconClockPause}
          label='Avg. Review'
          value='14 min'
          detail='This week'
          tone='blue'
        />
      </div>
      <Card>
        <CardContent className='grid gap-4 p-4 md:grid-cols-[minmax(0,1.4fr)_minmax(180px,0.8fr)_auto] md:items-end'>
          <Field>
            <FieldLabel htmlFor='overtime-approval-search'>
              {m.overtime_search_placeholder()}
            </FieldLabel>
            <Input
              id='overtime-approval-search'
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={m.overtime_search_placeholder()}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor='overtime-approval-date-range'>{m.overtime_date()}</FieldLabel>
            <DatePicker
              id='overtime-approval-date-range'
              mode='range'
              selected={dateRange}
              onSelect={setDateRange}
              placeholder={m.overtime_approval_date_range_placeholder()}
              className='w-full'
            />
          </Field>
          <Button variant='outline' onClick={() => setFilters({ search, dateRange })}>
            {m.overtime_filter()}
          </Button>
        </CardContent>
      </Card>
      <Card className='min-w-0 overflow-hidden'>
        <CardHeader className='p-4'>
          <CardTitle>{m.overtime_waiting_approval()}</CardTitle>
          <p className='mt-1 text-xs text-muted-foreground'>{m.overtime_approval_subtitle()}</p>
        </CardHeader>
        <CardContent className='overflow-x-auto p-0'>
          <Table className='min-w-[880px]'>
            <TableHeader className='bg-muted/40'>
              <TableRow>
                <TableHead>{m.overtime_table_employee()}</TableHead>
                <TableHead>{m.overtime_table_date()}</TableHead>
                <TableHead>{m.overtime_table_schedule()}</TableHead>
                <TableHead>{m.overtime_table_requested()}</TableHead>
                <TableHead>{m.overtime_table_eligible()}</TableHead>
                <TableHead>{m.overtime_check()}</TableHead>
                <TableHead>{m.overtime_action()}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request, index) => (
                <TableRow key={request.id}>
                  <TableCell className='text-xs font-medium'>{request.employee}</TableCell>
                  <TableCell className='text-xs'>
                    {dayjs(request.date).format('DD MMM YYYY')}
                  </TableCell>
                  <TableCell className='text-xs'>{request.schedule}</TableCell>
                  <TableCell className='text-xs'>{request.requestedHours} h</TableCell>
                  <TableCell className='text-xs'>{request.eligibleHours} h</TableCell>
                  <TableCell>
                    <Badge variant={index === 0 ? 'red' : index === 3 ? 'amber' : 'green'}>
                      {index === 0 ? 'Conflict' : index === 3 ? 'Need review' : 'Clear'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button size='sm' asChild>
                      <Link to='/overtime/approval/$requestId' params={{ requestId: request.id }}>
                        {m.overtime_review()}
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppMain>
  )
}
