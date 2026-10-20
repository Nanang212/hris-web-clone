import { IconCheck } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { getAttendanceBreadcrumbs } from '@/features/attendance/components/attendance-breadcrumbs'
import { AttendanceTabs } from '@/features/attendance/components/attendance-tabs'

interface ClockResultPageProps {
  mode: 'in' | 'out'
}

export function ClockResultPage({ mode }: Readonly<ClockResultPageProps>) {
  const isClockIn = mode === 'in'
  const title = isClockIn ? 'Clock In Berhasil' : 'Clock Out Berhasil'
  return (
    <AppMain
      title={title}
      subtitle={
        isClockIn ? 'Kehadiran hari ini berhasil dicatat.' : 'Jam kerja hari ini telah tersimpan.'
      }
      breadcrumbs={getAttendanceBreadcrumbs(title)}
      className='gap-5 bg-muted/30'
    >
      <AttendanceTabs active='clock' />
      <Card className='mx-auto w-full max-w-3xl'>
        <CardContent className='flex flex-col items-center gap-6 p-8 text-center'>
          <span className='flex size-24 items-center justify-center rounded-full bg-emerald-50 text-emerald-600'>
            <IconCheck className='size-12' />
          </span>
          <div>
            <h2 className='text-3xl font-bold'>{title}</h2>
            <p className='mt-2 text-muted-foreground'>
              {isClockIn
                ? 'Kehadiran Anda berhasil dicatat pada 08:52 WIB.'
                : 'Jam kerja Anda telah ditutup pada 17:31 WIB.'}
            </p>
          </div>
          <div className='grid w-full gap-3 sm:grid-cols-3'>
            {(isClockIn
              ? [
                  ['Clock In', '08:52'],
                  ['Shift', '09:00–18:00'],
                  ['Lokasi', 'Jakarta HQ'],
                ]
              : [
                  ['Clock In', '08:52'],
                  ['Clock Out', '17:31'],
                  ['Durasi', '8j 39m'],
                ]
            ).map(([label, value]) => (
              <div key={label} className='rounded-xl border bg-muted/30 p-4 text-left'>
                <p className='text-xs text-muted-foreground'>{label}</p>
                <p className='mt-2 text-xl font-bold'>{value}</p>
              </div>
            ))}
          </div>
          <div className='flex w-full flex-col gap-2 sm:flex-row'>
            <Button className='flex-1' asChild>
              <Link to='/attendance'>Kembali ke Attendance</Link>
            </Button>
            <Button className='flex-1' variant='outline' asChild>
              <Link to='/attendance/history'>Lihat Detail Kehadiran</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </AppMain>
  )
}
