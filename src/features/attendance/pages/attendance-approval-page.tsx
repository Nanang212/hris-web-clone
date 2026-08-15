import { IconCircleCheck, IconShieldExclamation, IconX } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'

import { AppMain } from '@/shared/components/app-layout/app-main'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { AttendanceTabs } from '@/features/attendance/components/attendance-tabs'
import { m } from '@/i18n/paraglide/messages'

export function AttendanceApprovalPage() {
  const stats = [
    [
      IconShieldExclamation,
      '12',
      m.attendance_approval_needs_action(),
      'bg-orange-50 text-orange-500',
    ],
    [
      IconCircleCheck,
      '8',
      m.attendance_approval_approved_today(),
      'bg-emerald-50 text-emerald-600',
    ],
    [IconX, '1', m.attendance_approval_rejected_today(), 'bg-rose-50 text-rose-500'],
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
  return (
    <AppMain
      title={m.attendance_approval_title()}
      subtitle={m.attendance_approval_subtitle()}
      className='gap-5 bg-muted/30'
    >
      <AttendanceTabs active='approval' />
      <div className='grid gap-3 sm:grid-cols-3'>
        {stats.map(([Icon, value, label, color]) => (
          <section
            key={label as string}
            className='flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm'
          >
            <span
              className={`flex size-10 items-center justify-center rounded-xl ${color as string}`}
            >
              <Icon className='size-5' />
            </span>
            <div>
              <p className='text-2xl font-bold'>{value}</p>
              <p className='text-xs text-muted-foreground'>{label}</p>
            </div>
          </section>
        ))}
      </div>
      <div className='flex gap-10 rounded-2xl border border-border bg-card px-4 shadow-sm'>
        <span className='border-b-2 border-primary py-3 text-sm font-semibold text-primary'>
          {m.attendance_approval_needs_action()}
        </span>
        <span className='py-3 text-sm text-muted-foreground'>
          {m.attendance_requests_approved()}
        </span>
        <span className='py-3 text-sm text-muted-foreground'>
          {m.attendance_requests_rejected()}
        </span>
      </div>
      <section className='overflow-hidden rounded-2xl border border-border bg-card shadow-sm'>
        <Table>
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
            {rows.map((row) => (
              <TableRow key={row[0]}>
                {row.map((cell, index) => (
                  <TableCell
                    key={cell}
                    className={index === 0 ? 'text-xs font-semibold' : 'text-xs'}
                  >
                    {index === 5 ? (
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${cell === m.attendance_approval_low() ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-500'}`}
                      >
                        {cell}
                      </span>
                    ) : (
                      cell
                    )}
                  </TableCell>
                ))}
                <TableCell>
                  <Link
                    to='/attendance/approval/REQ-0241'
                    className='text-xs font-medium hover:underline'
                  >
                    {m.attendance_approval_review()}
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
      <section className='rounded-2xl border border-border bg-card p-4 shadow-sm'>
        <h3 className='font-semibold'>{m.attendance_approval_guidance()}</h3>
        <div className='mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4'>
          {[
            [m.attendance_approval_gps(), m.attendance_approval_gps_desc()],
            [m.attendance_approval_face(), m.attendance_approval_face_desc()],
            [m.attendance_approval_device(), m.attendance_approval_device_desc()],
            [m.attendance_approval_tolerance(), m.attendance_approval_tolerance_desc()],
          ].map(([title, desc]) => (
            <div key={title} className='flex gap-3'>
              <span className='rounded-lg bg-blue-50 p-2 text-blue-600'>
                <IconShieldExclamation className='size-4' />
              </span>
              <div>
                <p className='text-sm font-semibold'>{title}</p>
                <p className='mt-1 text-xs text-muted-foreground'>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </AppMain>
  )
}
