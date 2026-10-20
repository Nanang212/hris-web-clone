import { IconSearch } from '@tabler/icons-react'
import dayjs from 'dayjs'

import 'dayjs/locale/en'
import 'dayjs/locale/id'

import { useEffect, useState } from 'react'

import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/shared/components/ui/empty'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Skeleton } from '@/shared/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { TablePagination } from '@/shared/components/ui/table-pagination'
import { cn } from '@/shared/lib/utils'
import { useGetAttendanceOverviewRecords } from '@/features/attendance/overview/hooks'
import { m } from '@/i18n/paraglide/messages'
import { getLocale } from '@/i18n/paraglide/runtime'

import type { AttendanceOverviewRecord, AttendanceOverviewStatus } from '../types'
import { AttendanceOverviewStatusBadge } from './attendance-overview-status'
import { getAttendanceOverviewStatusLabel } from './attendance-overview-status-labels'

interface AttendanceOverviewHistoryProps {
  date: string
  departmentId?: string
  departmentName: string
  isToday: boolean
}

function formatClock(value: string | null) {
  return value ? dayjs(value).format('HH:mm') : '—'
}

function getRecordNote(record: AttendanceOverviewRecord) {
  if (record.incompleteClockOut) return m.attendance_overview_detail_incomplete_note()
  switch (record.status) {
    case 'late':
      return m.attendance_overview_detail_late_note({ minutes: record.lateMinutes })
    case 'on_time':
      return m.attendance_overview_detail_on_time_note()
    case 'leave':
      return m.attendance_overview_detail_leave_note()
    case 'missing':
      return m.attendance_overview_detail_missing_note()
  }
}

function AttendanceRecordDetail({
  record,
  date,
  isToday,
  isLoading,
}: Readonly<{
  record?: AttendanceOverviewRecord
  date: string
  isToday: boolean
  isLoading: boolean
}>) {
  if (!record || isLoading) {
    return (
      <Card className='min-w-0'>
        <CardHeader>
          <CardTitle>{m.attendance_overview_detail_title()}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className='flex flex-col gap-3'>
              <Skeleton className='h-12 w-full' />
              {Array.from({ length: 6 }, (_, index) => (
                <Skeleton key={index} className='h-7 w-full' />
              ))}
            </div>
          ) : (
            <Empty className='min-h-60 border-0 px-4'>
              <EmptyHeader>
                <EmptyTitle>{m.attendance_overview_detail_title()}</EmptyTitle>
                <EmptyDescription>{m.attendance_overview_detail_empty()}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </CardContent>
      </Card>
    )
  }

  const initials = record.employeeName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
  const duration =
    record.clockInAt && record.clockOutAt
      ? Math.max(0, dayjs(record.clockOutAt).diff(dayjs(record.clockInAt), 'minute'))
      : null
  const source = record.source
    ? {
        web: m.attendance_overview_detail_source_web,
        mobile: m.attendance_overview_detail_source_mobile,
        device: m.attendance_overview_detail_source_device,
      }[record.source]()
    : '—'
  const details = [
    [m.attendance_overview_history_department_column(), record.departmentName],
    [m.attendance_table_date(), dayjs(date).locale(getLocale()).format('DD MMM YYYY')],
    [m.attendance_overview_detail_shift(), `${record.shiftStart} – ${record.shiftEnd}`],
    [m.attendance_table_clock_in(), formatClock(record.clockInAt)],
    [m.attendance_table_clock_out(), formatClock(record.clockOutAt)],
    [
      m.attendance_overview_detail_duration(),
      duration === null
        ? '—'
        : m.attendance_overview_detail_hours_minutes({
            hours: Math.floor(duration / 60),
            minutes: String(duration % 60).padStart(2, '0'),
          }),
    ],
    [
      m.attendance_overview_detail_lateness(),
      record.clockInAt ? m.attendance_overview_insight_minutes({ count: record.lateMinutes }) : '—',
    ],
    [m.attendance_overview_detail_source(), source],
  ]

  return (
    <Card className='min-w-0' aria-label={m.attendance_overview_detail_title()}>
      <CardHeader>
        <CardTitle>{m.attendance_overview_detail_title()}</CardTitle>
        <CardAction>
          <Badge variant='violet'>{m.attendance_overview_detail_selected()}</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className='mb-4 flex min-w-0 items-center gap-3'>
          <Avatar className='size-10 shrink-0'>
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className='min-w-0'>
            <p className='truncate font-semibold'>{record.employeeName}</p>
            <p className='text-xs text-muted-foreground'>{record.employeeId}</p>
          </div>
        </div>
        <AttendanceOverviewStatusBadge status={record.status} isToday={isToday} />
        <dl className='mt-3 flex flex-col'>
          {details.map(([label, value]) => (
            <div
              key={label}
              className='flex justify-between gap-3 border-b py-2 text-xs last:border-b-0'
            >
              <dt className='text-muted-foreground'>{label}</dt>
              <dd className='text-right font-medium'>{value}</dd>
            </div>
          ))}
        </dl>
        <Alert variant='info-overlay' className='mt-4'>
          <div className='flex flex-col gap-1'>
            <p className='text-xs font-semibold'>{m.attendance_overview_detail_system_note()}</p>
            <AlertDescription>{getRecordNote(record)}</AlertDescription>
          </div>
        </Alert>
      </CardContent>
    </Card>
  )
}

export function AttendanceOverviewHistory({
  date,
  departmentId,
  departmentName,
  isToday,
}: Readonly<AttendanceOverviewHistoryProps>) {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState<AttendanceOverviewStatus | 'all'>('all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => clearTimeout(timeout)
  }, [search])

  const recordsQuery = useGetAttendanceOverviewRecords({
    date,
    departmentId,
    search: debouncedSearch || undefined,
    status: status === 'all' ? undefined : status,
    page,
    pageSize,
  })
  const records = recordsQuery.data?.items ?? []
  const selectedRecord = records.find((record) => record.id === selectedId) ?? records[0]
  const statusOptions: AttendanceOverviewStatus[] = ['on_time', 'late', 'leave', 'missing']

  return (
    <div className='grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(280px,0.34fr)]'>
      <Card className='min-w-0 overflow-hidden'>
        <CardHeader>
          <CardTitle>{m.attendance_overview_history_title()}</CardTitle>
          <CardDescription>
            {m.attendance_overview_history_description({
              date: dayjs(date).locale(getLocale()).format('DD MMM YYYY'),
              department: departmentName,
            })}
          </CardDescription>
          <CardAction>
            <Badge variant='violet'>{m.attendance_overview_history_badge()}</Badge>
          </CardAction>
        </CardHeader>
        <CardContent className='flex flex-col gap-3'>
          <div className='flex flex-wrap gap-2'>
            <div className='relative min-w-44 flex-1 sm:max-w-80'>
              <IconSearch
                className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground'
                aria-hidden='true'
              />
              <Input
                type='search'
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value)
                  setPage(1)
                  setSelectedId(null)
                }}
                placeholder={m.attendance_overview_history_search()}
                aria-label={m.attendance_overview_history_search()}
                className='pl-9'
              />
            </div>
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value as AttendanceOverviewStatus | 'all')
                setPage(1)
                setSelectedId(null)
              }}
            >
              <SelectTrigger
                className='w-full sm:w-48'
                aria-label={m.attendance_overview_history_status_filter()}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value='all'>
                    {m.attendance_overview_history_all_statuses()}
                  </SelectItem>
                  {statusOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {getAttendanceOverviewStatusLabel(option, isToday)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          {recordsQuery.error ? (
            <Alert variant='destructive-overlay'>
              <AlertDescription>{m.attendance_overview_history_error()}</AlertDescription>
              <Button size='sm' variant='outline' onClick={() => recordsQuery.refetch()}>
                {m.app_layout_main_error_retry()}
              </Button>
            </Alert>
          ) : (
            <div className='overflow-x-auto'>
              <Table className='min-w-155'>
                <TableHeader>
                  <TableRow>
                    <TableHead>{m.attendance_overview_history_employee_column()}</TableHead>
                    <TableHead>{m.attendance_overview_history_department_column()}</TableHead>
                    <TableHead>{m.attendance_overview_history_shift_column()}</TableHead>
                    <TableHead>{m.attendance_table_clock_in()}</TableHead>
                    <TableHead>{m.attendance_table_clock_out()}</TableHead>
                    <TableHead>{m.attendance_table_status()}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recordsQuery.isFetching ? (
                    Array.from({ length: 5 }, (_, index) => (
                      <TableRow key={index}>
                        <TableCell colSpan={6}>
                          <Skeleton className='h-7 w-full' />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : records.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className='p-0'>
                        <Empty className='min-h-44 border-0'>
                          <EmptyHeader>
                            <EmptyDescription>
                              {m.attendance_overview_history_empty()}
                            </EmptyDescription>
                          </EmptyHeader>
                        </Empty>
                      </TableCell>
                    </TableRow>
                  ) : (
                    records.map((record) => (
                      <TableRow
                        key={record.id}
                        tabIndex={0}
                        aria-selected={record.id === selectedRecord?.id}
                        aria-label={m.attendance_overview_history_view({
                          name: record.employeeName,
                        })}
                        onClick={() => setSelectedId(record.id)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            setSelectedId(record.id)
                          }
                        }}
                        className={cn(
                          'cursor-pointer focus-visible:outline-2 focus-visible:outline-primary',
                          record.id === selectedRecord?.id && 'bg-muted/40',
                        )}
                      >
                        <TableCell>
                          <p className='font-medium'>{record.employeeName}</p>
                          <p className='text-xs text-muted-foreground'>{record.employeeId}</p>
                        </TableCell>
                        <TableCell>{record.departmentName}</TableCell>
                        <TableCell className='whitespace-nowrap'>
                          {record.shiftStart} – {record.shiftEnd}
                        </TableCell>
                        <TableCell>{formatClock(record.clockInAt)}</TableCell>
                        <TableCell>{formatClock(record.clockOutAt)}</TableCell>
                        <TableCell>
                          <AttendanceOverviewStatusBadge status={record.status} isToday={isToday} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className='block p-0'>
          <TablePagination
            totalItems={recordsQuery.data?.total ?? 0}
            currentPage={page}
            pageSize={pageSize}
            pageSizeOptions={[5, 10, 20]}
            itemLabel={m.attendance_overview_history_employee_column()}
            onPageChange={(nextPage) => {
              setPage(nextPage)
              setSelectedId(null)
            }}
            onPageSizeChange={(size) => setPageSize(size)}
          />
        </CardFooter>
      </Card>
      <AttendanceRecordDetail
        record={recordsQuery.error ? undefined : selectedRecord}
        date={date}
        isToday={isToday}
        isLoading={recordsQuery.isFetching}
      />
    </div>
  )
}
