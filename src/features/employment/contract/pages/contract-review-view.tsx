import { IconDownload, IconFileText, IconInfoCircle } from '@tabler/icons-react'

import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import type { EmployeeContract } from '@/features/employment/contract/types'

interface ContractReviewViewProps {
  activeContract: EmployeeContract
  onBack: () => void
  onSubmit: () => void
  onPreview: () => void
}

export function ContractReviewView({
  activeContract,
  onBack,
  onSubmit,
  onPreview,
}: ContractReviewViewProps) {
  return (
    <>
      <div className='mb-6 grid grid-cols-1 gap-4 rounded-2xl border border-border/65 bg-muted/20 p-5 text-xs sm:grid-cols-4'>
        <div className='flex flex-col gap-1'>
          <span className='font-semibold text-muted-foreground'>Employee</span>
          <span className='text-sm font-bold text-foreground'>{activeContract.fullName}</span>
        </div>
        <div className='flex flex-col gap-1'>
          <span className='font-semibold text-muted-foreground'>Contract Type</span>
          <Badge variant='outline' className='w-max'>
            {activeContract.contractType}
          </Badge>
        </div>
        <div className='flex flex-col gap-1'>
          <span className='font-semibold text-muted-foreground'>Period</span>
          <span className='font-bold text-foreground'>
            {activeContract.startDate} — {activeContract.endDate}
          </span>
        </div>
        <div className='flex flex-col gap-1'>
          <span className='font-semibold text-muted-foreground'>Status</span>
          <Badge variant='gray' className='w-max'>
            Draft
          </Badge>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* Left Column: Contract Details */}
        <div className='flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-2'>
          <h3 className='mb-2 border-b pb-3 text-sm font-bold text-foreground'>Contract Details</h3>
          <div className='grid grid-cols-2 gap-x-6 gap-y-4 text-xs'>
            <div className='flex flex-col gap-1'>
              <span className='font-semibold text-muted-foreground'>Contract Number</span>
              <span className='font-bold text-foreground'>{activeContract.contractNumber}</span>
            </div>
            <div className='flex flex-col gap-1'>
              <span className='font-semibold text-muted-foreground'>Effective Date</span>
              <span className='font-bold text-foreground'>{activeContract.startDate}</span>
            </div>
            <div className='flex flex-col gap-1'>
              <span className='font-semibold text-muted-foreground'>Department / Location</span>
              <span className='font-bold text-foreground'>
                {activeContract.positionName.includes('Product')
                  ? 'Product Design'
                  : 'Human Resources'}{' '}
                — Supervisor
              </span>
            </div>
            <div className='flex flex-col gap-1'>
              <span className='font-semibold text-muted-foreground'>Grade / Work Location</span>
              <span className='font-bold text-foreground'>
                {activeContract.salaryGrade} — {activeContract.workLocation}
              </span>
            </div>
            <div className='flex flex-col gap-1'>
              <span className='font-semibold text-muted-foreground'>Position</span>
              <span className='font-bold text-foreground'>{activeContract.positionName}</span>
            </div>
            <div className='flex flex-col gap-1'>
              <span className='font-semibold text-muted-foreground'>Signatory</span>
              <span className='font-bold text-foreground'>HR Director</span>
            </div>
          </div>
        </div>

        {/* Right Column: Approval & Document */}
        <div className='flex flex-col gap-6'>
          {/* Approval Route */}
          <div className='flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm'>
            <h3 className='border-b pb-3 text-sm font-bold text-foreground'>Approval Route</h3>
            <div className='flex flex-col gap-4 text-xs'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2.5'>
                  <span className='flex size-5 items-center justify-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-700'>
                    1
                  </span>
                  <span className='font-semibold'>HR Manager</span>
                </div>
                <Badge variant='amber'>Pending</Badge>
              </div>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2.5'>
                  <span className='flex size-5 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground'>
                    2
                  </span>
                  <span className='font-semibold text-muted-foreground'>HR Director</span>
                </div>
                <Badge variant='gray'>Waiting</Badge>
              </div>
            </div>
          </div>

          {/* Document draft */}
          <div className='flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm'>
            <h3 className='border-b pb-3 text-sm font-bold text-foreground'>Contract Document</h3>
            <div className='flex items-center gap-3'>
              <div className='flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                <IconFileText size={20} />
              </div>
              <div className='text-xs'>
                <p className='max-w-[150px] truncate font-semibold text-foreground'>
                  {activeContract.documentName || 'employment_contract_draft.pdf'}
                </p>
                <p className='mt-0.5 text-muted-foreground'>
                  {activeContract.documentSize || '148 KB'}
                </p>
              </div>
            </div>
            <div className='mt-2 grid grid-cols-2 gap-2'>
              <Button variant='outline' size='sm' className='text-xs' onClick={onPreview}>
                Preview PDF
              </Button>
              <Button variant='outline' size='sm' className='text-xs'>
                <IconDownload size={13} className='mr-1.5' />
                Download
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Warning Banner */}
      <div className='mt-6 flex items-start gap-3 rounded-2xl border border-amber-200/50 bg-amber-50/50 p-4 dark:bg-amber-950/20'>
        <IconInfoCircle size={18} className='mt-0.5 text-amber-600' />
        <div className='text-xs'>
          <p className='font-bold text-amber-800 dark:text-amber-300'>Confirmation Notice</p>
          <p className='mt-0.5 text-amber-600 dark:text-amber-400'>
            Submitting locks the contract draft version and sends it through the configured approval
            route. Changes after submission require an amendment.
          </p>
        </div>
      </div>

      {/* Actions bar */}
      <div className='mt-8 flex items-center justify-end gap-3 border-t border-border pt-4'>
        <Button variant='outline' onClick={onBack}>
          Batal
        </Button>
        <Button className='bg-primary font-semibold text-primary-foreground' onClick={onSubmit}>
          Submit to Approval
        </Button>
      </div>
    </>
  )
}
