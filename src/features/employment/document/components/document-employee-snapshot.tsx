// document-employee-snapshot.tsx — Quick employee profile & document checklist snapshot
import {
  IconAlertTriangle,
  IconAward,
  IconCheck,
  IconEye,
  IconFile,
  IconFileTypePdf,
  IconUpload,
} from '@tabler/icons-react'
import { useState } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  DocumentPreviewDialog,
  type PreviewDocInfo,
} from '@/features/employment/document/components/document-preview-dialog'
import { useGetAttachments, useGetCertificates } from '@/features/employment/document/hooks'
import type { EmployeeDocumentCompleteness } from '@/features/employment/document/types'

interface DocumentEmployeeSnapshotProps {
  selected: EmployeeDocumentCompleteness | null
  onManage: (employee: EmployeeDocumentCompleteness) => void
}

export function DocumentEmployeeSnapshot({ selected, onManage }: DocumentEmployeeSnapshotProps) {
  // Preview modal state
  const [previewDoc, setPreviewDoc] = useState<PreviewDocInfo | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  // Fetch certificates and attachments for the selected employee
  const { data: certificates = [] } = useGetCertificates(
    undefined,
    undefined,
    undefined,
    undefined,
    selected?.employeeId,
  )
  const { data: attachments = [] } = useGetAttachments(undefined, undefined, selected?.employeeId)

  if (!selected) {
    return (
      <div className='flex h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card p-6 text-center shadow-sm'>
        <p className='text-sm font-semibold text-muted-foreground'>No employee selected</p>
        <p className='mt-1 text-xs text-muted-foreground'>
          Click on any row in the table to inspect document completeness.
        </p>
      </div>
    )
  }

  const isComplete = selected.completedCount === selected.totalRequired

  const handleOpenDocPreview = (
    name: string,
    fieldLabel?: string,
    fieldValue?: string,
    fileName?: string,
    status?: string,
  ) => {
    setPreviewDoc({
      key: name.toLowerCase().replace(/\s+/g, '_'),
      name,
      fieldLabel,
      fieldValue,
      fileName: fileName || `${name.replace(/\s+/g, '_')}.pdf`,
      fileSize: '1.2 MB',
      employeeName: selected.fullName,
      employeeCode: selected.employeeCode,
      department: selected.department,
      status: status || 'verified',
      verifiedAt: selected.lastUpdated,
    })
    setIsPreviewOpen(true)
  }

  // Filter core mandatory documents (excluding certificates which belong to dedicated section)
  const mandatoryDocs = selected.documents.filter((d) => d.key !== 'certificate' && d.key !== 'mcu')
  const completedMandatory = mandatoryDocs.filter(
    (d) => d.status === 'verified' || d.status === 'valid',
  ).length
  const totalMandatory = mandatoryDocs.length

  return (
    <div className='flex h-full flex-col justify-between rounded-2xl border border-border/60 bg-card p-5 shadow-sm'>
      <div>
        {/* Header: Selected Employee */}
        <div className='flex items-start justify-between gap-3 border-b border-border/60 pb-4'>
          <div className='flex items-center gap-3'>
            <Avatar className='size-10'>
              <AvatarImage src={selected.photo ?? undefined} />
              <AvatarFallback className='bg-primary/10 text-xs font-bold text-primary'>
                {selected.fullName
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <div className='min-w-0'>
              <span className='text-[10px] font-bold tracking-wider text-muted-foreground uppercase'>
                Selected Employee
              </span>
              <h4 className='truncate text-sm font-bold text-foreground'>{selected.fullName}</h4>
              <p className='truncate text-xs text-muted-foreground'>
                NIP: {selected.employeeCode} · {selected.department}
              </p>
            </div>
          </div>

          <Badge
            variant={isComplete ? 'green' : 'amber'}
            className='text-[10px] font-semibold uppercase'
          >
            {isComplete ? 'Complete' : 'Incomplete'}
          </Badge>
        </div>

        {/* 1. Mandatory Checklist Section */}
        <div className='py-3'>
          <div className='mb-2.5 flex items-center justify-between'>
            <h5 className='text-xs font-bold text-foreground'>Mandatory Checklist</h5>
            <span className='text-[11px] font-semibold text-muted-foreground'>
              {completedMandatory}/{totalMandatory}
            </span>
          </div>

          <div className='flex flex-col divide-y divide-border/30'>
            {mandatoryDocs.map((doc) => {
              let statusLabel = 'Verified'
              let statusClass =
                'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400'

              if (doc.status === 'missing') {
                statusLabel = 'Missing'
                statusClass =
                  'text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400 font-bold'
              } else if (doc.status === 'expiring') {
                statusLabel = doc.dueDate ? `Due ${doc.dueDate}` : 'Expiring'
                statusClass = 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400'
              } else if (doc.status === 'valid') {
                statusLabel = 'Valid'
                statusClass = 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400'
              }

              return (
                <div key={doc.id} className='group flex items-center justify-between py-2 text-xs'>
                  <div className='flex min-w-0 items-center gap-2'>
                    {doc.status === 'verified' && (
                      <IconCheck size={13} className='flex-shrink-0 text-emerald-500' />
                    )}
                    {doc.status === 'valid' && (
                      <IconCheck size={13} className='flex-shrink-0 text-blue-500' />
                    )}
                    {doc.status === 'missing' && (
                      <span className='size-1.5 flex-shrink-0 rounded-full bg-rose-500' />
                    )}
                    {doc.status === 'expiring' && (
                      <IconAlertTriangle size={13} className='flex-shrink-0 text-amber-500' />
                    )}
                    <span className='truncate font-medium text-foreground'>{doc.name}</span>
                  </div>

                  <div className='flex flex-shrink-0 items-center gap-1.5'>
                    {doc.fileName && (
                      <button
                        type='button'
                        onClick={() =>
                          handleOpenDocPreview(
                            doc.name,
                            doc.fieldLabel,
                            doc.fieldValue,
                            doc.fileName,
                            doc.status,
                          )
                        }
                        className='p-0.5 text-muted-foreground opacity-80 transition-opacity hover:text-primary hover:opacity-100'
                        title='Preview document'
                      >
                        <IconEye size={13} />
                      </button>
                    )}
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap ${statusClass}`}
                    >
                      {statusLabel}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 2. Employee Certificates Section (with scrollbar when multiple) */}
        {certificates.length > 0 && (
          <div className='border-t border-border/50 pt-3'>
            <div className='mb-2 flex items-center justify-between'>
              <div className='flex items-center gap-1.5'>
                <IconAward size={14} className='text-purple-600' />
                <h5 className='text-xs font-bold text-foreground'>
                  Certificates ({certificates.length})
                </h5>
              </div>
            </div>

            <div className='max-h-[150px] scrollbar-thin space-y-1.5 overflow-y-auto pr-1'>
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className='flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/20 px-2.5 py-1.5 text-[11px]'
                >
                  <div className='min-w-0'>
                    <p className='truncate font-semibold text-foreground'>{cert.title}</p>
                    <p className='truncate text-[10px] text-muted-foreground'>
                      {cert.issuer} · Exp: {cert.expiryDate}
                    </p>
                  </div>
                  <button
                    type='button'
                    onClick={() =>
                      handleOpenDocPreview(
                        `Certificate: ${cert.title}`,
                        'Credential ID',
                        cert.credentialId,
                        cert.fileName,
                        cert.status,
                      )
                    }
                    className='flex-shrink-0 p-1 text-muted-foreground hover:text-primary'
                    title='Preview Certificate'
                  >
                    <IconEye size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Supporting Attachments Section (with scrollbar when multiple) */}
        {attachments.length > 0 && (
          <div className='border-t border-border/50 pt-3'>
            <div className='mb-2 flex items-center justify-between'>
              <div className='flex items-center gap-1.5'>
                <IconFile size={14} className='text-blue-600' />
                <h5 className='text-xs font-bold text-foreground'>
                  Supporting Attachments ({attachments.length})
                </h5>
              </div>
            </div>

            <div className='max-h-[150px] scrollbar-thin space-y-1.5 overflow-y-auto pr-1'>
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className='flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/20 px-2.5 py-1.5 text-[11px]'
                >
                  <div className='flex min-w-0 items-center gap-2'>
                    <IconFileTypePdf size={14} className='flex-shrink-0 text-rose-500' />
                    <div className='truncate'>
                      <p className='truncate font-semibold text-foreground'>{att.fileName}</p>
                      <p className='text-[10px] text-muted-foreground'>
                        {att.category} · {att.fileSize}
                      </p>
                    </div>
                  </div>
                  <button
                    type='button'
                    onClick={() =>
                      handleOpenDocPreview(
                        att.fileName,
                        'Category',
                        att.category,
                        att.fileName,
                        'verified',
                      )
                    }
                    className='flex-shrink-0 p-1 text-muted-foreground hover:text-primary'
                    title='Preview Attachment'
                  >
                    <IconEye size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className='mt-4 border-t border-border/60 pt-4'>
        <Button className='w-full text-xs font-semibold' onClick={() => onManage(selected)}>
          <IconUpload size={15} className='mr-2' />
          Manage Documents
        </Button>
      </div>

      {/* Document Preview Popup */}
      <DocumentPreviewDialog
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        doc={previewDoc}
      />
    </div>
  )
}
