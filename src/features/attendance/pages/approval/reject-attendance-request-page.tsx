import { IconUser, IconX } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { getAttendanceBreadcrumbs } from '@/features/attendance/components/attendance-breadcrumbs'
import { AttendanceTabs } from '@/features/attendance/components/attendance-tabs'

export function RejectAttendanceRequestPage() {
  return (
    <AppMain
      title='Attendance Approval Detail'
      subtitle='State modal reject dengan reason wajib.'
      breadcrumbs={getAttendanceBreadcrumbs('Reject Attendance Request')}
      backTo='/attendance/approval'
      className='gap-5 bg-muted/30'
    >
      <AttendanceTabs active='approval' />
      <section className='rounded-2xl border bg-card p-5 shadow-sm'>
        <h2 className='text-lg font-bold'>REQ-0241 • Forgot Clock In</h2>
        <p className='mt-2 text-xs text-muted-foreground'>
          Evidence dan approval detail tetap terlihat di belakang modal.
        </p>
      </section>
      <div className='mx-auto w-full max-w-xl rounded-2xl border bg-card p-6 shadow-lg'>
        <div className='flex items-center gap-3'>
          <span className='rounded-xl bg-rose-50 p-2 text-primary'>
            <IconUser />
          </span>
          <h2 className='text-lg font-bold'>Reject Attendance Request?</h2>
        </div>
        <p className='mt-4 text-xs text-muted-foreground'>
          Pilih alasan reject. Catatan akan terlihat oleh requester.
        </p>
        <label className='mt-6 block text-xs font-medium text-muted-foreground'>
          Reject Reason
          <Input className='mt-2 rounded-xl border bg-background' placeholder='Pilih alasan' />
        </label>
        <label className='mt-6 block text-xs font-medium text-muted-foreground'>
          Catatan
          <Input
            className='mt-2 rounded-xl border bg-background'
            defaultValue='Bukti tidak cukup untuk memvalidasi waktu Clock In.'
          />
        </label>
        <div className='mt-6 rounded-xl bg-rose-50 p-4 text-xs text-rose-600'>
          Requester akan menerima notifikasi setelah request ditolak.
        </div>
        <div className='mt-4 flex justify-end gap-3'>
          <Button variant='outline' asChild>
            <Link to='/attendance/approval/REQ-0241'>Batal</Link>
          </Button>
          <Button variant='outline' className='border-destructive text-destructive'>
            <IconX />
            Reject Request
          </Button>
        </div>
      </div>
    </AppMain>
  )
}
