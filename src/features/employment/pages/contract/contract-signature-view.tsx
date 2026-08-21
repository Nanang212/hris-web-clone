import {
  IconFileText,
} from '@tabler/icons-react'
import type { EmployeeContract } from '@/features/employment/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { snackbar } from '@/shared/lib/snackbar'

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
      <div className='flex items-center gap-3 bg-muted/20 border border-border/60 rounded-2xl p-4 mb-6 text-xs'>
        <Avatar className='size-10'>
          <AvatarImage src={activeContract.photo ?? undefined} />
          <AvatarFallback className='font-bold bg-primary/10 text-primary'>
            {activeContract.fullName[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <h4 className='font-bold text-foreground text-sm'>{activeContract.fullName}</h4>
          <p className='text-muted-foreground mt-0.5'>
            {activeContract.contractNumber} · {activeContract.contractType} · {activeContract.startDate} — {activeContract.endDate}
          </p>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        {/* Left Column: Approved Contract details */}
        <div className='flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm'>
          <h3 className='text-sm font-bold text-foreground border-b pb-3 mb-2'>Approved Contract</h3>
          <div className='grid grid-cols-2 gap-4 text-xs'>
            <div className='flex flex-col gap-1'>
              <span className='text-muted-foreground font-semibold'>Contract Number</span>
              <span className='font-bold text-foreground'>{activeContract.contractNumber}</span>
            </div>
            <div className='flex flex-col gap-1'>
              <span className='text-muted-foreground font-semibold'>Contract Type</span>
              <span className='font-bold text-foreground'>{activeContract.contractType} / Fixed-Term</span>
            </div>
            <div className='flex flex-col gap-1'>
              <span className='text-muted-foreground font-semibold'>Start Date</span>
              <span className='font-bold text-foreground'>{activeContract.startDate}</span>
            </div>
            <div className='flex flex-col gap-1'>
              <span className='text-muted-foreground font-semibold'>End Date</span>
              <span className='font-bold text-foreground'>{activeContract.endDate}</span>
            </div>
          </div>

          <div className='mt-4 rounded-xl border border-border bg-muted/30 p-4 flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                <IconFileText size={20} />
              </div>
              <div className='text-xs'>
                <p className='font-semibold text-foreground'>employment_contract_final.pdf</p>
                <p className='text-muted-foreground mt-0.5'>Approved Version · Ready for signature</p>
              </div>
            </div>
            <Button variant='outline' size='sm' className='text-xs' onClick={onPreview}>
              Preview PDF
            </Button>
          </div>
        </div>

        {/* Right Column: Signature Status & Actions */}
        <div className='flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm'>
          <h3 className='text-sm font-bold text-foreground border-b pb-3 mb-2'>Signature Status</h3>
          <div className='flex flex-col gap-4 text-xs mb-4'>
            <div className='flex items-center justify-between border-b pb-3'>
              <div>
                <p className='font-bold text-foreground'>Company Signatory</p>
                <p className='text-muted-foreground text-[10px] mt-0.5'>HR Director · Signed 8 Aug 2026</p>
              </div>
              <Badge variant='green'>Signed</Badge>
            </div>
            <div className='flex items-center justify-between'>
              <div>
                <p className='font-bold text-foreground'>Employee</p>
                <p className='text-muted-foreground text-[10px] mt-0.5'>Waiting for signature</p>
              </div>
              <Badge variant='amber'>Pending</Badge>
            </div>
          </div>

          <div className='flex flex-col gap-2 mt-auto'>
            <Button
              className='w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2 h-9'
              onClick={() => snackbar.success('Signature reminder sent to employee!')}
            >
              Send Signature Reminder
            </Button>
            <Button
              variant='outline'
              className='w-full text-xs h-9'
              onClick={() => snackbar.success('Signed contract uploaded successfully!')}
            >
              Upload Manually Signed Contract
            </Button>
            <p className='text-[10px] text-center text-muted-foreground mt-1'>
              Available after all required signatures are complete.
            </p>
          </div>
        </div>
      </div>

      {/* Actions bar */}
      <div className='mt-8 border-t border-border pt-4 flex items-center justify-end gap-3'>
        <Button variant='outline' onClick={onBack}>
          Back
        </Button>
        <Button className='bg-primary text-primary-foreground font-semibold' onClick={onComplete}>
          Complete Contract
        </Button>
      </div>
    </>
  )
}
