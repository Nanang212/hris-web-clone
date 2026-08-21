import {
  IconFileText,
  IconDownload,
  IconAlertCircle,
  IconFileCheck,
  IconSignature,
  IconRefresh,
  IconFileDiff,
} from '@tabler/icons-react'
import type { EmployeeContract, ContractStatus } from '@/features/employment/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'

const STATUS_CONFIG: Record<
  ContractStatus,
  { label: string; variant: 'green' | 'amber' | 'gray' | 'red' }
> = {
  active: { label: 'Active', variant: 'green' },
  expiring: { label: 'Expiring', variant: 'amber' },
  draft: { label: 'Draft', variant: 'gray' },
  unsigned: { label: 'Unsigned', variant: 'red' },
}

interface ContractDetailViewProps {
  activeContract: EmployeeContract
  onBack: () => void
  onPreview: () => void
  onAction: (action: 'review' | 'signature' | 'renewal' | 'amendment') => void
}

export function ContractDetailView({
  activeContract,
  onBack,
  onPreview,
  onAction,
}: ContractDetailViewProps) {
  const status = STATUS_CONFIG[activeContract.status as ContractStatus] || {
    label: activeContract.status,
    variant: 'gray' as const,
  }

  return (
    <>
      {/* Employee Header Info */}
      <div className='flex flex-wrap items-center justify-between gap-4 bg-muted/20 border border-border/60 rounded-2xl p-5 mb-6 text-xs'>
        <div className='flex items-center gap-3'>
          <Avatar className='size-12 border border-border shadow-sm'>
            <AvatarImage src={activeContract.photo ?? undefined} />
            <AvatarFallback className='font-bold bg-primary/10 text-primary text-sm'>
              {activeContract.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className='font-bold text-foreground text-sm'>{activeContract.fullName}</h4>
            <p className='text-muted-foreground mt-0.5'>
              {activeContract.contractNumber} · {activeContract.contractType}
            </p>
          </div>
        </div>
        <Badge variant={status.variant} className='text-xs px-3 py-1 font-semibold'>
          {status.label}
        </Badge>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* Left Column: Contract Parameter Details */}
        <div className='lg:col-span-2 flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm'>
          <h3 className='text-sm font-bold text-foreground border-b pb-3 mb-2'>Contract Parameters</h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-xs'>
            <div className='flex flex-col gap-1 border-b pb-2 md:pb-3 border-border/50'>
              <span className='text-muted-foreground font-semibold'>Contract Number</span>
              <span className='font-bold text-foreground text-sm'>{activeContract.contractNumber}</span>
            </div>
            <div className='flex flex-col gap-1 border-b pb-2 md:pb-3 border-border/50'>
              <span className='text-muted-foreground font-semibold'>Contract Type</span>
              <span className='font-bold text-foreground text-sm'>{activeContract.contractType}</span>
            </div>
            <div className='flex flex-col gap-1 border-b pb-2 md:pb-3 border-border/50'>
              <span className='text-muted-foreground font-semibold'>Start Date</span>
              <span className='font-bold text-foreground text-sm'>{activeContract.startDate}</span>
            </div>
            <div className='flex flex-col gap-1 border-b pb-2 md:pb-3 border-border/50'>
              <span className='text-muted-foreground font-semibold'>End Date</span>
              <span className='font-bold text-foreground text-sm'>{activeContract.endDate}</span>
            </div>
            <div className='flex flex-col gap-1 border-b pb-2 md:pb-3 border-border/50'>
              <span className='text-muted-foreground font-semibold'>Probation Period</span>
              <span className='font-bold text-foreground text-sm'>{activeContract.probation || 'None'}</span>
            </div>
            <div className='flex flex-col gap-1 border-b pb-2 md:pb-3 border-border/50'>
              <span className='text-muted-foreground font-semibold'>Work Location</span>
              <span className='font-bold text-foreground text-sm'>{activeContract.workLocation}</span>
            </div>
            <div className='flex flex-col gap-1'>
              <span className='text-muted-foreground font-semibold'>Position</span>
              <span className='font-bold text-foreground text-sm'>{activeContract.positionName}</span>
            </div>
            <div className='flex flex-col gap-1'>
              <span className='text-muted-foreground font-semibold'>Salary Grade</span>
              <span className='font-bold text-foreground text-sm'>{activeContract.salaryGrade}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Document and Reminders */}
        <div className='flex flex-col gap-6'>
          {/* Document card */}
          <div className='flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm'>
            <h3 className='text-sm font-bold text-foreground border-b pb-3'>Contract Document</h3>
            <div className='flex items-center gap-3'>
              <div className='flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                <IconFileText size={20} />
              </div>
              <div className='text-xs'>
                <p className='font-semibold text-foreground truncate max-w-[150px]'>{activeContract.documentName || 'contract_document.pdf'}</p>
                <p className='text-muted-foreground mt-0.5'>{activeContract.documentSize || '142 KB'}</p>
              </div>
            </div>
            <div className='grid grid-cols-2 gap-2 mt-2'>
              <Button variant='outline' size='sm' className='text-xs' onClick={onPreview}>
                Preview PDF
              </Button>
              <Button variant='outline' size='sm' asChild className='text-xs'>
                <a
                  href='https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  <IconDownload size={13} className='mr-1.5' />
                  Download
                </a>
              </Button>
            </div>
          </div>

          {/* Actions card */}
          <div className='flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm'>
            <h3 className='text-sm font-bold text-foreground border-b pb-3'>Contract Actions</h3>
            <div className='flex flex-col gap-2'>
              <Button
                variant='outline'
                size='sm'
                className='w-full justify-start text-xs font-semibold'
                onClick={() => onAction('review')}
              >
                <IconFileCheck size={14} className='mr-2 text-blue-600' />
                Review & Confirm
              </Button>
              <Button
                variant='outline'
                size='sm'
                className='w-full justify-start text-xs font-semibold'
                onClick={() => onAction('signature')}
              >
                <IconSignature size={14} className='mr-2 text-indigo-600' />
                Signature & Completion
              </Button>
              <Button
                variant='outline'
                size='sm'
                className='w-full justify-start text-xs font-semibold'
                onClick={() => onAction('renewal')}
              >
                <IconRefresh size={14} className='mr-2 text-emerald-600' />
                Renewal & Extension
              </Button>
              <Button
                variant='outline'
                size='sm'
                className='w-full justify-start text-xs font-semibold'
                onClick={() => onAction('amendment')}
              >
                <IconFileDiff size={14} className='mr-2 text-purple-600' />
                Amendment & Signature
              </Button>
            </div>
          </div>

          {/* Reminder status */}
          {activeContract.reminderActive && (
            <div className='rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 p-4 flex items-start gap-3'>
              <IconAlertCircle size={18} className='text-amber-600 mt-0.5' />
              <div className='text-xs'>
                <p className='font-bold text-amber-800 dark:text-amber-300'>Renewal Reminder Active</p>
                <p className='text-amber-600 dark:text-amber-400/80 mt-0.5'>
                  Next send T-14 via Email, Push Notification, and WhatsApp.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions bar */}
      <div className='mt-8 border-t border-border pt-4 flex items-center justify-end gap-3'>
        <Button variant='outline' onClick={onBack}>
          Close
        </Button>
      </div>
    </>
  )
}
