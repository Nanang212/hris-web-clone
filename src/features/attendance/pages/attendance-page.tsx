import dayjs from 'dayjs'
import { useState } from 'react'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card'
import { DatePicker } from '@/shared/components/ui/date-picker'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { getAttendanceBreadcrumbs } from '@/features/attendance/components/attendance-breadcrumbs'
import { AttendanceOverviewHistory } from '@/features/attendance/components/attendance-overview-history'
import { AttendanceOverviewPanels } from '@/features/attendance/components/attendance-overview-panels'
import { AttendanceTabs } from '@/features/attendance/components/attendance-tabs'
import { useGetAttendanceOverview } from '@/features/attendance/hooks'
import { m } from '@/i18n/paraglide/messages'

function AttendanceOverviewSkeleton() {
  return (
    <div className='flex flex-col gap-5' aria-label={m.attendance_overview_title()}>
      <Skeleton className='h-11 w-full max-w-4xl' />
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <Skeleton className='h-6 w-48' />
        <div className='flex gap-2'>
          <Skeleton className='h-9 w-44' />
          <Skeleton className='h-9 w-40' />
        </div>
      </div>
      <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        {Array.from({ length: 4 }, (_, index) => (
          <Card key={index} size='sm'>
            <CardContent className='flex flex-col gap-4'>
              <Skeleton className='size-9' />
              <Skeleton className='h-7 w-24' />
              <Skeleton className='h-4 w-32' />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className='grid gap-4 xl:grid-cols-2'>
        {Array.from({ length: 4 }, (_, index) => (
          <Card key={index}>
            <CardHeader>
              <Skeleton className='h-5 w-40' />
              <Skeleton className='h-4 w-56' />
            </CardHeader>
            <CardContent>
              <Skeleton className='h-44 w-full' />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className='h-6 w-60' />
        </CardHeader>
        <CardContent className='flex flex-col gap-3'>
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className='h-10 w-full' />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

export function AttendancePage() {
  const [date, setDate] = useState(() => dayjs().format('YYYY-MM-DD'))
  const [departmentId, setDepartmentId] = useState('all')
  const overviewQuery = useGetAttendanceOverview({
    date,
    departmentId: departmentId === 'all' ? undefined : departmentId,
  })
  const { data, isPending, error, refetch } = overviewQuery
  const breadcrumbs = getAttendanceBreadcrumbs(m.attendance_tab_overview())

  if (isPending || error || !data) {
    return (
      <AppMain
        title={m.attendance_overview_title()}
        subtitle={m.attendance_overview_subtitle()}
        breadcrumbs={breadcrumbs}
        pending={isPending}
        error={error}
        notFound={!isPending && !error && !data}
        retry={refetch}
        loadingComponent={<AttendanceOverviewSkeleton />}
      />
    )
  }

  const departmentName =
    departmentId === 'all'
      ? m.attendance_overview_all_departments()
      : (data.departments.find((department) => department.id === departmentId)?.name ??
        m.attendance_overview_all_departments())
  const isToday = dayjs(date).isSame(dayjs(), 'day')

  return (
    <AppMain
      title={m.attendance_overview_title()}
      subtitle={m.attendance_overview_subtitle()}
      breadcrumbs={breadcrumbs}
      className='gap-5'
    >
      <AttendanceTabs active='overview' />

      <div className='flex flex-wrap items-end justify-between gap-3'>
        <h2 className='text-lg font-semibold'>{m.attendance_overview_summary_title()}</h2>
        <div className='grid w-full min-w-0 grid-cols-2 gap-2 sm:flex sm:w-auto'>
          <Select value={departmentId} onValueChange={setDepartmentId}>
            <SelectTrigger
              className='w-full min-w-0 sm:w-44'
              aria-label={m.attendance_overview_department_filter()}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value='all'>{m.attendance_overview_all_departments()}</SelectItem>
                {data.departments.map((department) => (
                  <SelectItem key={department.id} value={department.id}>
                    {department.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <DatePicker
            mode='single'
            selected={dayjs(date).toDate()}
            onSelect={(selected) => {
              if (selected) setDate(dayjs(selected).format('YYYY-MM-DD'))
            }}
            aria-label={m.attendance_overview_date_filter()}
            className='w-full min-w-0 sm:w-auto sm:min-w-40'
          />
        </div>
      </div>

      <AttendanceOverviewPanels data={data} isToday={isToday} />
      <AttendanceOverviewHistory
        key={`${date}:${departmentId}`}
        date={date}
        departmentId={departmentId === 'all' ? undefined : departmentId}
        departmentName={departmentName}
        isToday={isToday}
      />
    </AppMain>
  )
}
