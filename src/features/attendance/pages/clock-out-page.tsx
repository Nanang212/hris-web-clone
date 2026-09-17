import { IconCheck, IconClock } from '@tabler/icons-react'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { getAttendanceBreadcrumbs } from '@/features/attendance/components/attendance-breadcrumbs'
import { AttendanceTabs } from '@/features/attendance/components/attendance-tabs'

export function ClockOutPage() {
  return (
    <AppMain
      title='Clock Out'
      subtitle='Periksa ringkasan kerja sebelum mengakhiri kehadiran.'
      breadcrumbs={getAttendanceBreadcrumbs('Clock Out')}
      className='gap-5 bg-muted/30'
    >
      <AttendanceTabs active='clock' />
      <div className='grid gap-5 xl:grid-cols-[minmax(0,1.8fr)_320px]'>
        <Card>
          <CardHeader>
            <CardTitle>Ringkasan Jam Kerja</CardTitle>
            <p className='text-sm text-muted-foreground'>16 Mei 2024 • Shift Regular</p>
          </CardHeader>
          <CardContent>
            <div className='grid gap-3 sm:grid-cols-3'>
              {[
                ['Clock In', '08:52'],
                ['Waktu Sekarang', '17:31'],
                ['Durasi Aktif', '8j 39m'],
              ].map(([label, value]) => (
                <div key={label} className='rounded-xl border bg-muted/30 p-4'>
                  <p className='text-xs text-muted-foreground'>{label}</p>
                  <p className='mt-2 text-xl font-bold'>{value}</p>
                </div>
              ))}
            </div>
            <div className='mt-8 flex items-center gap-3'>
              <IconClock className='size-5 text-primary' />
              <div>
                <p className='font-semibold'>Timeline Hari Ini</p>
                <p className='text-xs text-muted-foreground'>
                  08:52 Clock In → 12:00 Istirahat → 13:00 Kembali → 17:31 Clock Out
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className='h-fit'>
          <CardHeader>
            <CardTitle>Konfirmasi Clock Out</CardTitle>
          </CardHeader>
          <CardContent className='flex flex-col gap-5'>
            <p className='text-sm'>Pastikan pekerjaan hari ini sudah selesai.</p>
            <div className='flex items-center gap-2 text-sm text-emerald-600'>
              <IconCheck className='size-4' />
              Inside Jakarta HQ zone
            </div>
            <Button size='lg'>Clock Out Sekarang</Button>
            <Button variant='outline'>Batal</Button>
          </CardContent>
        </Card>
      </div>
    </AppMain>
  )
}
