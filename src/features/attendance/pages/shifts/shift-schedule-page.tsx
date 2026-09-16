import {
  IconArrowsExchange,
  IconClock,
  IconPlus,
  IconUsers,
} from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { ShiftTabs } from '@/features/attendance/components/shift-tabs'
import { getAttendanceBreadcrumbs } from '@/features/attendance/components/attendance-breadcrumbs'

const shifts = [
  ['SFT-REG', 'Regular', '09:00–18:00', '12:00–13:00', '15 min', '842'],
  ['SFT-MOR', 'Morning', '07:00–16:00', '11:30–12:30', '10 min', '214'],
  ['SFT-EVE', 'Evening', '14:00–23:00', '18:00–19:00', '10 min', '96'],
  ['SFT-NGT', 'Night', '22:00–07:00', '02:00–03:00', '15 min', '48'],
]
export function ShiftSchedulePage() {
  return (
    <AppMain
      title='Shift Schedule'
      subtitle='Kelola master jadwal shift dan toleransi attendance.'
      breadcrumbs={getAttendanceBreadcrumbs('Shift Schedule')}
      backTo='/attendance/management'
      className='gap-5 bg-muted/30'
      actions={
        <Button asChild>
          <Link to='/attendance/management/shifts/setup'>
            <IconPlus />
            Add Shift
          </Link>
        </Button>
      }
    >
      <ShiftTabs active='schedule' />
      <section className='overflow-x-auto rounded-2xl border bg-card shadow-sm'>
        <Table className='min-w-[760px]'>
          <TableHeader className='bg-muted/50'>
            <TableRow>
              {[
                'Shift Code',
                'Shift Name',
                'Schedule',
                'Break',
                'Late Tol.',
                'Employees',
                'Status',
                'Action',
              ].map((v) => (
                <TableHead key={v}>{v}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {shifts.map((row) => (
              <TableRow key={row[0]}>
                {row.map((cell, index) => (
                  <TableCell
                    key={cell}
                    className={index === 0 ? 'text-xs font-semibold' : 'text-xs'}
                  >
                    {cell}
                  </TableCell>
                ))}
                <TableCell>
                  <Badge variant='green'>
                    Active
                  </Badge>
                </TableCell>
                <TableCell>
                  <Link
                    to='/attendance/management/shifts/setup'
                    className='text-xs font-medium hover:underline'
                  >
                    Edit
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
      <Card className='w-full min-w-0 shadow-sm'>
        <CardHeader className='pb-3'>
          <CardTitle>Shift Configuration Notes</CardTitle>
        </CardHeader>
        <CardContent className='grid min-w-0 gap-4 pt-0 md:grid-cols-3'>
          {[
            [IconArrowsExchange, 'Cross-day shift', 'Night shift dapat melewati tengah malam.'],
            [IconClock, 'Attendance window', 'Clock In/Out mengikuti shift dan tolerance.'],
            [IconUsers, 'Assignment', 'Perubahan shift efektif berdasarkan tanggal assignment.'],
          ].map(([Icon, title, description]) => (
            <div key={title} className='flex min-w-0 items-start gap-3 rounded-xl border p-3'>
              <span className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'>
                <Icon className='size-4' />
              </span>
              <div className='min-w-0 text-xs leading-5'>
                <b className='block text-sm'>{title}</b>
                <p className='mt-1 text-muted-foreground'>{description}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </AppMain>
  )
}
