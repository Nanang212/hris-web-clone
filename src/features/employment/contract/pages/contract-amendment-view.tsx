import { IconFileText } from '@tabler/icons-react'

import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { snackbar } from '@/shared/lib/snackbar'
import type { EmployeeContract } from '@/features/employment/contract/types'

interface ContractAmendmentViewProps {
  activeContract: EmployeeContract
  onBack: () => void
  onComplete: () => void
  onPreview: () => void
}

export function ContractAmendmentView({
  activeContract,
  onBack,
  onComplete,
  onPreview,
}: ContractAmendmentViewProps) {
  return (
    <>
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        {/* Left Column: Amendment Changes */}
        <div className='flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm'>
          <h3 className='mb-2 border-b pb-3 text-sm font-bold text-foreground'>
            Amendment Changes
          </h3>
          <p className='mt-[-8px] text-[10px] text-muted-foreground'>
            Amendment No: AM-2026-00021 · Base Contract: {activeContract.contractNumber}
          </p>

          <div className='overflow-hidden rounded-xl border border-border/80'>
            <Table>
              <TableHeader>
                <TableRow className='bg-muted/40 text-xs'>
                  <TableHead>Field</TableHead>
                  <TableHead>Current</TableHead>
                  <TableHead>Amended Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className='text-xs'>
                <TableRow>
                  <TableCell className='font-semibold'>Position</TableCell>
                  <TableCell className='text-muted-foreground'>HR Supervisor</TableCell>
                  <TableCell className='font-bold text-primary'>HR Manager</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className='font-semibold'>Grade Code</TableCell>
                  <TableCell className='text-muted-foreground'>07</TableCell>
                  <TableCell className='font-bold text-primary'>08</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className='font-semibold'>Salary Grade</TableCell>
                  <TableCell className='text-muted-foreground'>07-B</TableCell>
                  <TableCell className='font-bold text-primary'>08-A</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className='font-semibold'>Effective Date</TableCell>
                  <TableCell className='text-muted-foreground'>12 Aug 2025</TableCell>
                  <TableCell className='font-bold text-primary'>1 Jan 2027</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div className='mt-2 flex items-center justify-between rounded-xl border border-border bg-muted/30 p-4'>
            <div className='flex items-center gap-3'>
              <div className='flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                <IconFileText size={20} />
              </div>
              <div className='text-xs'>
                <p className='max-w-[170px] truncate font-semibold text-foreground'>
                  employment_contract_amendment_AMP-2026-00021.pdf
                </p>
                <p className='mt-0.5 text-muted-foreground'>Amended Version · Preview Draft</p>
              </div>
            </div>
            <Button variant='outline' size='sm' className='text-xs' onClick={onPreview}>
              Preview PDF
            </Button>
          </div>
        </div>

        {/* Right Column: Signature Status */}
        <div className='flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 shadow-sm'>
          <h3 className='mb-2 border-b pb-3 text-sm font-bold text-foreground'>Signature Status</h3>

          <div className='mb-4 flex flex-col gap-4 text-xs'>
            <div className='flex items-center justify-between border-b pb-3'>
              <div>
                <p className='font-bold text-foreground'>HR Director</p>
                <p className='mt-0.5 text-[10px] text-muted-foreground'>
                  Signed · 8 Aug 2026 10:15
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
              variant='outline'
              className='h-9 w-full text-xs'
              onClick={() => snackbar.success('Signed amendment contract uploaded successfully!')}
            >
              Upload Manually Signed Contract
            </Button>
            <Button
              className='h-9 w-full bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700'
              onClick={() => snackbar.success('Signature reminder sent to employee!')}
            >
              Send Signature Reminder
            </Button>
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
