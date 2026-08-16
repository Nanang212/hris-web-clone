import { IconCalendarEvent, IconPlus } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Button } from '@/shared/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { ShiftTabs } from '@/features/attendance/components/shift-tabs'

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
      <section className='overflow-hidden rounded-2xl border bg-card shadow-sm'>
        <Table>
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
                  <span className='rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600'>
                    Active
                  </span>
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
      <section className='rounded-2xl border bg-card p-5 shadow-sm'>
        <h2 className='font-bold'>Shift Configuration Notes</h2>
        <div className='mt-5 grid gap-5 md:grid-cols-3'>
          {[
            ['Cross-day shift', 'Night shift dapat melewati tengah malam.'],
            ['Attendance window', 'Clock In/Out mengikuti shift dan tolerance.'],
            ['Assignment', 'Perubahan shift efektif berdasarkan tanggal assignment.'],
          ].map(([title, description]) => (
            <div key={title} className='flex gap-3'>
              <span className='rounded-xl bg-blue-50 p-2 text-primary'>
                <IconCalendarEvent className='size-4' />
              </span>
              <p className='text-xs'>
                <b className='block text-sm'>{title}</b>
                <span className='mt-2 block text-muted-foreground'>{description}</span>
              </p>
            </div>
          ))}
        </div>
      </section>
    </AppMain>
  )
}
