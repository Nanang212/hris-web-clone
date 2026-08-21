import {
  IconFileText,
} from '@tabler/icons-react'
import type { EmployeeContract } from '@/features/employment/types'
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
          <h3 className='text-sm font-bold text-foreground border-b pb-3 mb-2'>Amendment Changes</h3>
          <p className='text-[10px] text-muted-foreground mt-[-8px]'>
            Amendment No: AM-2026-00021 · Base Contract: {activeContract.contractNumber}
          </p>

          <div className='border border-border/80 rounded-xl overflow-hidden'>
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

          <div className='mt-2 rounded-xl border border-border bg-muted/30 p-4 flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                <IconFileText size={20} />
              </div>
              <div className='text-xs'>
                <p className='font-semibold text-foreground truncate max-w-[170px]'>
                  employment_contract_amendment_AMP-2026-00021.pdf
                </p>
                <p className='text-muted-foreground mt-0.5'>Amended Version · Preview Draft</p>
              </div>
            </div>
            <Button variant='outline' size='sm' className='text-xs' onClick={onPreview}>
              Preview PDF
            </Button>
          </div>
        </div>

        {/* Right Column: Signature Status */}
        <div className='flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 shadow-sm'>
          <h3 className='text-sm font-bold text-foreground border-b pb-3 mb-2'>Signature Status</h3>

          <div className='flex flex-col gap-4 text-xs mb-4'>
            <div className='flex items-center justify-between border-b pb-3'>
              <div>
                <p className='font-bold text-foreground'>HR Director</p>
                <p className='text-muted-foreground text-[10px] mt-0.5'>Signed · 8 Aug 2026 10:15</p>
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
              variant='outline'
              className='w-full text-xs h-9'
              onClick={() => snackbar.success('Signed amendment contract uploaded successfully!')}
            >
              Upload Manually Signed Contract
            </Button>
            <Button
              className='w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-9'
              onClick={() => snackbar.success('Signature reminder sent to employee!')}
            >
              Send Signature Reminder
            </Button>
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
