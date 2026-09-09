// document-upload-success-view.tsx — Document Upload Complete success screen (Screen 4)
import { IconArrowLeft, IconCheck, IconEye } from '@tabler/icons-react'

import { Button } from '@/shared/components/ui/button'
import type { EmployeeDocumentCompleteness } from '@/features/employment/document/types'

interface DocumentUploadSuccessViewProps {
  employee: EmployeeDocumentCompleteness
  onBackToCenter: () => void
  onViewDocuments: () => void
}

export function DocumentUploadSuccessView({
  employee,
  onBackToCenter,
  onViewDocuments,
}: DocumentUploadSuccessViewProps) {
  const requiredDocs = employee.documents.filter((d) => d.required)
  const optionalDocs = employee.documents.filter((d) => !d.required)
  const savedRequiredNames = requiredDocs
    .filter((d) => Boolean(d.fileName))
    .map((d) => d.name)
    .join(' · ')

  return (
    <div className='mx-auto flex w-full max-w-3xl flex-col gap-6 py-4'>
      {/* Top Back Action */}
      <div className='flex items-center justify-between'>
        <Button
          variant='ghost'
          size='sm'
          onClick={onBackToCenter}
          className='gap-1.5 text-xs text-muted-foreground hover:text-foreground'
        >
          <IconArrowLeft size={16} />
          Back to Document Center
        </Button>
      </div>

      {/* Main Success Card */}
      <div className='flex flex-col items-center rounded-2xl border border-border/60 bg-card p-8 text-center shadow-sm sm:p-10'>
        {/* Large green check circle */}
        <div className='mb-5 flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-sm ring-8 ring-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400 dark:ring-emerald-950/20'>
          <IconCheck size={32} strokeWidth={3} />
        </div>

        <h3 className='text-xl font-bold text-foreground'>
          {employee.completedCount} required documents saved
        </h3>
        <p className='mt-1 text-xs text-muted-foreground'>
          {employee.fullName} · NIP: {employee.employeeCode} · {employee.department}
        </p>

        {/* 3 Metric Pills */}
        <div className='mt-6 grid w-full max-w-lg grid-cols-1 gap-3 sm:grid-cols-3'>
          <div className='rounded-xl border border-border/60 bg-muted/20 p-3'>
            <p className='text-[11px] font-medium text-muted-foreground'>Required</p>
            <p className='text-lg font-bold text-emerald-600 dark:text-emerald-400'>
              {employee.completedCount}/{employee.totalRequired}
            </p>
          </div>

          <div className='rounded-xl border border-border/60 bg-muted/20 p-3'>
            <p className='text-[11px] font-medium text-muted-foreground'>Optional retained</p>
            <p className='text-lg font-bold text-blue-600 dark:text-blue-400'>
              {optionalDocs.filter((d) => Boolean(d.fileName)).length}/{optionalDocs.length}
            </p>
          </div>

          <div className='rounded-xl border border-border/60 bg-muted/20 p-3'>
            <p className='text-[11px] font-medium text-muted-foreground'>Expiring soon</p>
            <p className='text-lg font-bold text-foreground'>{employee.expiringCount}</p>
          </div>
        </div>

        {/* Saved documents summary text */}
        <div className='mt-6 w-full max-w-lg rounded-xl border border-border/60 bg-background/50 p-4 text-left'>
          <p className='mb-1.5 text-[11px] font-bold tracking-wider text-muted-foreground uppercase'>
            Saved documents
          </p>
          <p className='text-xs leading-relaxed font-semibold text-foreground/90'>
            {savedRequiredNames || 'No documents attached'}
          </p>

          <p className='mt-3 border-t border-border/40 pt-2.5 text-[11px] text-muted-foreground'>
            Optional Certificate and MCU Document were retained. All files are securely archived in
            the Document Center.
          </p>
        </div>

        {/* Bottom CTA button */}
        <div className='mt-8 flex items-center gap-3'>
          <Button variant='outline' onClick={onBackToCenter} className='text-xs'>
            Back to Document Center
          </Button>
          <Button onClick={onViewDocuments} className='gap-2 text-xs font-semibold'>
            <IconEye size={15} />
            View {employee.fullName.split(' ')[0]}&apos;s Documents
          </Button>
        </div>
      </div>
    </div>
  )
}
