import { IconCalendarCheck } from '@tabler/icons-react'

interface CheckInBannerProps {
  checkInTime: string
  workEndTime: string
}

export function CheckInBanner({ checkInTime, workEndTime }: Readonly<CheckInBannerProps>) {
  return (
    <div className='flex items-center gap-3 rounded-2xl bg-blue-600 px-5 py-3.5 text-white shadow-sm'>
      <div className='flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white/20'>
        <IconCalendarCheck size={18} stroke={2} />
      </div>
      <div className='flex-1'>
        <p className='text-sm font-semibold'>Checked in at {checkInTime}</p>
        <p className='text-xs text-blue-100'>
          You are on time today. Your next scheduled workday ends at {workEndTime}.
        </p>
      </div>
      <button
        type='button'
        className='flex-shrink-0 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/30'
      >
        View attendance
      </button>
    </div>
  )
}
