import { IconArrowRight } from '@tabler/icons-react'

import { cn } from '@/shared/lib/utils'

interface RequestItem {
  id: string
  label: string
  sublabel: string
  status: 'Pending' | 'Review' | 'Approved' | 'Done' | 'Rejected'
}

const statusStyle: Record<RequestItem['status'], string> = {
  Pending: 'text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-900/40',
  Review: 'text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/40',
  Approved: 'text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/40',
  Done: 'text-muted-foreground bg-muted',
  Rejected: 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/40',
}

const dotStyle: Record<RequestItem['status'], string> = {
  Pending: 'bg-amber-500',
  Review: 'bg-blue-500',
  Approved: 'bg-emerald-500',
  Done: 'bg-muted-foreground',
  Rejected: 'bg-red-500',
}

interface BackendRequestItem {
  id: string
  category: string
  detail: string
  status: string
  dateRange: string
}

export function MyRequestCenter({ requests: propRequests }: { requests?: BackendRequestItem[] }) {
  const defaultRequests: RequestItem[] = [
    {
      id: 'req-1',
      label: 'Annual leave',
      sublabel: '20-21 May',
      status: 'Pending',
    },
    {
      id: 'req-2',
      label: 'Claim CLM-0B12',
      sublabel: 'Medical reimbursement',
      status: 'Review',
    },
    {
      id: 'req-3',
      label: 'Overtime',
      sublabel: '12 May · 2 hours',
      status: 'Approved',
    },
    {
      id: 'req-4',
      label: 'Business trip',
      sublabel: 'Jakarta → Surabaya',
      status: 'Done',
    },
  ]

  const items = propRequests
    ? propRequests.map((r) => ({
        id: r.id,
        label: r.category,
        sublabel: r.detail,
        status: (r.status === 'Pending' ||
        r.status === 'Review' ||
        r.status === 'Approved' ||
        r.status === 'Done' ||
        r.status === 'Rejected'
          ? r.status
          : 'Pending') as RequestItem['status'],
      }))
    : defaultRequests

  return (
    <div className='flex flex-col gap-4 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5'>
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-sm font-semibold'>My Request Center</h3>
          <p className='text-xs text-muted-foreground'>Recent submissions and status</p>
        </div>
        <button
          type='button'
          className='flex items-center gap-1 text-xs font-medium text-primary hover:underline'
        >
          View all
          <IconArrowRight size={12} />
        </button>
      </div>

      <div className='flex flex-col divide-y divide-border/50'>
        {items.map((req) => (
          <div key={req.id} className='flex items-center gap-3 py-3 first:pt-0 last:pb-0'>
            <span
              className={cn(
                'mt-0.5 h-2 w-2 flex-shrink-0 rounded-full',
                dotStyle[req.status] || 'bg-amber-500',
              )}
            />
            <div className='flex-1'>
              <p className='text-sm font-medium'>{req.label}</p>
              <p className='text-xs text-muted-foreground'>{req.sublabel}</p>
            </div>
            <span
              className={cn(
                'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                statusStyle[req.status] ||
                  'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
              )}
            >
              {req.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
