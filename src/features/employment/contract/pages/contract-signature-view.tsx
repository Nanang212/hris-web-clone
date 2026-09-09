import { IconFileText } from '@tabler/icons-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { snackbar } from '@/shared/lib/snackbar'
import type { EmployeeContract } from '@/features/employment/contract/types'

interface ContractSignatureViewProps {
  activeContract: EmployeeContract
  onBack: () => void
  onComplete: () => void
  onPreview: () => void
}

export function ContractSignatureView({
  activeContract,
  onBack,
  onComplete,
  onPreview,
}: ContractSignatureViewProps) {
  return (
    <>
      <div className='mb-6 flex items-center gap-3 rounded-2xl border border-border/60 bg-muted/20 p-4 text-xs'>
        <Avatar className='size-10'>
          <AvatarImage src={activeContract.photo ?? undefined} />
          <AvatarFallback className='bg-primary/10 font-bold text-primary'>
            {activeContract.fullName[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <h4 className='text-sm font-bold text-foreground'>{activeContract.fullName}</h4>
          <p className='mt-0.5 text-muted-foreground'>
            {activeContract.contractNumber} · {activeContract.contractType} ·{' '}
            {activeContract.startDate} — {activeContract.endDate}
          </p>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        {/* Left Column: Approved Contract details */}
        <div className='flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm'>
          <h3 className='mb-2 border-b pb-3 text-sm font-bold text-foreground'>
            Approved Contract
          </h3>
          <div className='grid grid-cols-2 gap-4 text-xs'>
            <div className='flex flex-col gap-1'>
              <span className='font-semibold text-muted-foreground'>Contract Number</span>
              <span className='font-bold text-foreground'>{activeContract.contractNumber}</span>
            </div>
            <div className='flex flex-col gap-1'>
              <span className='font-semibold text-muted-foreground'>Contract Type</span>
              <span className='font-bold text-foreground'>
                {activeContract.contractType} / Fixed-Term
              </span>
            </div>
            <div className='flex flex-col gap-1'>
              <span className='font-semibold text-muted-foreground'>Start Date</span>
              <span className='font-bold text-foreground'>{activeContract.startDate}</span>
            </div>
            <div className='flex flex-col gap-1'>
              <span className='font-semibold text-muted-foreground'>End Date</span>
              <span className='font-bold text-foreground'>{activeContract.endDate}</span>
            </div>
          </div>

          <div className='mt-4 flex items-center justify-between rounded-xl border border-border bg-muted/30 p-4'>
            <div className='flex items-center gap-3'>
              <div className='flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                <IconFileText size={20} />
              </div>
              <div className='text-xs'>
                <p className='font-semibold text-foreground'>employment_contract_final.pdf</p>
                <p className='mt-0.5 text-muted-foreground'>
                  Approved Version · Ready for signature
                </p>
              </div>
            </div>
            <Button variant='outline' size='sm' className='text-xs' onClick={onPreview}>
              Preview PDF
            </Button>
          </div>
        </div>

        {/* Right Column: Signature Status & Actions */}
        <div className='flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm'>
          <h3 className='mb-2 border-b pb-3 text-sm font-bold text-foreground'>Signature Status</h3>
          <div className='mb-4 flex flex-col gap-4 text-xs'>
            <div className='flex items-center justify-between border-b pb-3'>
              <div>
                <p className='font-bold text-foreground'>Company Signatory</p>
                <p className='mt-0.5 text-[10px] text-muted-foreground'>
                  HR Director · Signed 8 Aug 2026
                </p>
              </div>
              <Badge variant='green'>Signed</Badge>
            </div>
            <div className='flex items-center justify-between'>
              <div>
                <p className='font-bold text-foreground'>Employee</p>
                <p className='mt-0.5 text-[10px] text-muted-foreground'>Waiting for signature</p>
              </div>
              <Badge variant='amber'>Pending</Badge>
            </div>
          </div>

          <div className='mt-auto flex flex-col gap-2'>
            <Button
              className='h-9 w-full bg-blue-600 py-2 text-xs font-semibold text-white hover:bg-blue-700'
              onClick={() => snackbar.success('Signature reminder sent to employee!')}
            >
              Send Signature Reminder
            </Button>
            <Button
              variant='outline'
              className='h-9 w-full text-xs'
              onClick={() => snackbar.success('Signed contract uploaded successfully!')}
            >
              Upload Manually Signed Contract
            </Button>
            <p className='mt-1 text-center text-[10px] text-muted-foreground'>
              Available after all required signatures are complete.
            </p>
          </div>
        </div>
      </div>

      {/* Actions bar */}
      <div className='mt-8 flex items-center justify-end gap-3 border-t border-border pt-4'>
        <Button variant='outline' onClick={onBack}>
          Back
        </Button>
        <Button className='bg-primary font-semibold text-primary-foreground' onClick={onComplete}>
          Complete Contract
        </Button>
      </div>
    </>
  )
}
