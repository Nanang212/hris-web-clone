import {
  IconAlertCircle,
} from '@tabler/icons-react'
import type { EmployeeContract } from '@/features/employment/types'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { snackbar } from '@/shared/lib/snackbar'

interface ContractRenewalViewProps {
  activeContract: EmployeeContract
  onBack: () => void
  onCreateRenewal: () => void
  onSaveDraft: () => void
  
  newStartDate: string
  setNewStartDate: (d: string) => void
  newEndDate: string
  setNewEndDate: (d: string) => void
  renewalType: string
  setRenewalType: (t: string) => void
  newContractType: string
  setNewContractType: (t: string) => void
  effectivePosition: string
  setEffectivePosition: (p: string) => void
  workLocation: string
  setWorkLocation: (l: string) => void
  renewalReason: string
  setRenewalReason: (r: string) => void
}

export function ContractRenewalView({
  activeContract,
  onBack,
  onCreateRenewal,
  onSaveDraft,
  
  newStartDate,
  setNewStartDate,
  newEndDate,
  setNewEndDate,
  renewalType,
  setRenewalType,
  newContractType,
  setNewContractType,
  effectivePosition,
  setEffectivePosition,
  workLocation,
  setWorkLocation,
  renewalReason,
  setRenewalReason,
}: ContractRenewalViewProps) {
  return (
    <>
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* Left Column: Current Contract details */}
        <div className='flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm h-max'>
          <div className='flex items-center justify-between border-b pb-3 mb-2'>
            <h3 className='text-sm font-bold text-foreground'>Current Contract</h3>
            <Badge variant='amber'>Expiring in 14 Days</Badge>
          </div>
          <div className='flex flex-col gap-3 text-xs'>
            <div className='flex flex-col gap-0.5'>
              <span className='text-muted-foreground'>Contract Number</span>
              <span className='font-bold text-foreground'>{activeContract.contractNumber}</span>
            </div>
            <div className='flex flex-col gap-0.5'>
              <span className='text-muted-foreground'>Employee</span>
              <span className='font-bold text-foreground'>{activeContract.fullName}</span>
            </div>
            <div className='flex flex-col gap-0.5'>
              <span className='text-muted-foreground'>Contract Type</span>
              <span className='font-bold text-foreground'>{activeContract.contractType}</span>
            </div>
            <div className='grid grid-cols-2 gap-2 mt-1'>
              <div className='flex flex-col gap-0.5'>
                <span className='text-muted-foreground'>Start Date</span>
                <span className='font-bold text-foreground'>{activeContract.startDate}</span>
              </div>
              <div className='flex flex-col gap-0.5'>
                <span className='text-muted-foreground'>End Date</span>
                <span className='font-bold text-foreground'>{activeContract.endDate}</span>
              </div>
            </div>
            <div className='flex flex-col gap-0.5'>
              <span className='text-muted-foreground'>Position</span>
              <span className='font-bold text-foreground'>{activeContract.positionName}</span>
            </div>
            <div className='flex flex-col gap-0.5'>
              <span className='text-muted-foreground'>Work Location</span>
              <span className='font-bold text-foreground'>{activeContract.workLocation}</span>
            </div>
          </div>
          <div className='mt-2 rounded-xl bg-muted/40 border p-3 text-[10px] text-muted-foreground leading-relaxed'>
            Previous signed contract steps remain immutable and visible in Contract History logs.
          </div>
        </div>

        {/* Right Column: Renewal Details Form */}
        <div className='lg:col-span-2 flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 shadow-sm'>
          <h3 className='text-sm font-bold text-foreground border-b pb-3 mb-2'>Renewal Details</h3>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-xs'>
            <div className='flex flex-col gap-1.5'>
              <label className='font-semibold text-muted-foreground'>Renewal Type</label>
              <Select value={renewalType} onValueChange={setRenewalType}>
                <SelectTrigger>
                  <SelectValue placeholder='Pilih jenis' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='Extension'>Extension</SelectItem>
                  <SelectItem value='Renewal'>Renewal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='flex flex-col gap-1.5'>
              <label className='font-semibold text-muted-foreground'>New Contract Type</label>
              <Select value={newContractType} onValueChange={setNewContractType}>
                <SelectTrigger>
                  <SelectValue placeholder='Pilih tipe' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='PKWT'>PKWT / Fixed-Term</SelectItem>
                  <SelectItem value='PKWTT'>PKWTT / Permanent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='flex flex-col gap-1.5'>
              <label className='font-semibold text-muted-foreground'>New Start Date</label>
              <Input type='date' value={newStartDate} onChange={(e) => setNewStartDate(e.target.value)} />
            </div>

            <div className='flex flex-col gap-1.5'>
              <label className='font-semibold text-muted-foreground'>New End Date</label>
              <Input type='date' value={newEndDate} onChange={(e) => setNewEndDate(e.target.value)} />
            </div>

            <div className='flex flex-col gap-1.5'>
              <label className='font-semibold text-muted-foreground'>Effective Position</label>
              <Input value={effectivePosition} onChange={(e) => setEffectivePosition(e.target.value)} />
            </div>

            <div className='flex flex-col gap-1.5'>
              <label className='font-semibold text-muted-foreground'>Work Location</label>
              <Input value={workLocation} onChange={(e) => setWorkLocation(e.target.value)} />
            </div>
          </div>

          <div className='flex flex-col gap-1.5 text-xs'>
            <label className='font-semibold text-muted-foreground'>Reason</label>
            <textarea
              value={renewalReason}
              onChange={(e) => setRenewalReason(e.target.value)}
              rows={3}
              className='w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring/50 focus:outline-none font-sans'
            />
          </div>

          <div className='border-t pt-4 flex items-center justify-between'>
            <div className='flex items-center gap-1.5 text-[10px] text-amber-700 font-semibold'>
              <IconAlertCircle size={14} />
              <span>Renewal reminder active · next send T-14 · Email + Push + WhatsApp</span>
            </div>
            <Button
              variant='outline'
              size='sm'
              className='text-xs'
              onClick={() => {
                snackbar.success('Renewal draft generated successfully!')
              }}
            >
              Generate Renewal Draft
            </Button>
          </div>
        </div>
      </div>

      {/* Actions bar */}
      <div className='mt-8 border-t border-border pt-4 flex items-center justify-end gap-3'>
        <Button variant='outline' onClick={onBack}>
          Batal
        </Button>
        <Button variant='outline' onClick={onSaveDraft}>
          Save Draft
        </Button>
        <Button className='bg-primary text-primary-foreground font-semibold' onClick={onCreateRenewal}>
          Create Renewal
        </Button>
      </div>
    </>
  )
}
