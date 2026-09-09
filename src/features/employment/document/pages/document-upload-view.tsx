import {
  IconAlertCircle,
  IconArchive,
  IconAward,
  IconCheck,
  IconDownload,
  IconEye,
  IconFile,
  IconFileText,
  IconFileTypePdf,
  IconLoader2,
  IconPencil,
  IconPlus,
  IconRefresh,
  IconTrash,
  IconUpload,
} from '@tabler/icons-react'
import { useState } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { snackbar } from '@/shared/lib/snackbar'
import {
  DocumentPreviewDialog,
  type PreviewDocInfo,
} from '@/features/employment/document/components/document-preview-dialog'
import { UploadAttachmentModal } from '@/features/employment/document/components/upload-attachment-modal'
import { UploadCertificateModal } from '@/features/employment/document/components/upload-certificate-modal'
import {
  useDeleteAttachments,
  useDeleteCertificates,
  useGetAttachments,
  useGetCertificates,
  useSaveEmployeeDocuments,
} from '@/features/employment/document/hooks'
import {
  downloadEmployeeDocument,
  exportEmployeeDossierZip,
} from '@/features/employment/document/lib/download-helper'
import type {
  AttachmentItem,
  CertificateItem,
  DocumentVerificationStatus,
  EmployeeDocumentCompleteness,
} from '@/features/employment/document/types'
import { useGetEmployees } from '@/features/employment/employee/hooks'

interface DocumentUploadViewProps {
  initialEmployee?: EmployeeDocumentCompleteness | null
  onCancel: () => void
  onSuccess: (savedEmployee: EmployeeDocumentCompleteness) => void
}

interface LocalDocState {
  key: string
  name: string
  required: boolean
  fieldLabel: string
  fieldValue: string
  fileName?: string
  fileSize?: string
  status: DocumentVerificationStatus
  dueDate?: string
}

export function DocumentUploadView({
  initialEmployee,
  onCancel,
  onSuccess,
}: DocumentUploadViewProps) {
  const { data: employeesResult } = useGetEmployees({})
  const employees = employeesResult?.items ?? []
  const saveMutation = useSaveEmployeeDocuments()

  // Selected employee ID
  const [selectedEmpId] = useState(initialEmployee?.employeeId || employees[0]?.id || 'emp-1')

  // Current active employee info
  const currentEmp = employees.find((e) => e.id === selectedEmpId) || {
    id: selectedEmpId,
    employeeCode: initialEmployee?.employeeCode || 'EMP001',
    fullName: initialEmployee?.fullName || 'Employee',
    photo: initialEmployee?.photo || null,
    departmentName: initialEmployee?.department || 'IT & Engineering',
  }

  // Query Certificates & Attachments for this employee
  const { data: certificates = [] } = useGetCertificates(
    undefined,
    undefined,
    undefined,
    undefined,
    selectedEmpId,
  )

  const { data: attachments = [] } = useGetAttachments(undefined, undefined, selectedEmpId)

  // Modal open states for adding/editing certificates or attachments
  const [isAddCertOpen, setIsAddCertOpen] = useState(false)
  const [isAddAttOpen, setIsAddAttOpen] = useState(false)
  const [editingCert, setEditingCert] = useState<CertificateItem | null>(null)
  const [editingAtt, setEditingAtt] = useState<AttachmentItem | null>(null)

  const handleOpenAddCert = () => {
    setEditingCert(null)
    setIsAddCertOpen(true)
  }

  const handleOpenEditCert = (cert: CertificateItem) => {
    setEditingCert(cert)
    setIsAddCertOpen(true)
  }

  const handleOpenAddAtt = () => {
    setEditingAtt(null)
    setIsAddAttOpen(true)
  }

  const handleOpenEditAtt = (att: AttachmentItem) => {
    setEditingAtt(att)
    setIsAddAttOpen(true)
  }

  const deleteCertsMutation = useDeleteCertificates()
  const deleteAttsMutation = useDeleteAttachments()

  // Selection states for Batch Delete
  const [selectedCertIds, setSelectedCertIds] = useState<string[]>([])
  const [selectedAttIds, setSelectedAttIds] = useState<string[]>([])

  const handleToggleCertSelect = (id: string) => {
    setSelectedCertIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const handleToggleSelectAllCerts = () => {
    if (selectedCertIds.length === certificates.length) {
      setSelectedCertIds([])
    } else {
      setSelectedCertIds(certificates.map((c) => c.id))
    }
  }

  const handleBatchDeleteCerts = async () => {
    if (selectedCertIds.length === 0) {
      snackbar.warning('Please select at least one certificate to delete.')
      return
    }
    try {
      await deleteCertsMutation.mutateAsync(selectedCertIds)
      snackbar.success(`Deleted ${selectedCertIds.length} certificate(s) successfully!`)
      setSelectedCertIds([])
    } catch {
      snackbar.error('Failed to delete certificates.')
    }
  }

  const handleSingleDeleteCert = async (certId: string, certTitle: string) => {
    try {
      await deleteCertsMutation.mutateAsync([certId])
      snackbar.success(`Deleted certificate "${certTitle}" successfully!`)
      setSelectedCertIds((prev) => prev.filter((i) => i !== certId))
    } catch {
      snackbar.error('Failed to delete certificate.')
    }
  }

  const handleToggleAttSelect = (id: string) => {
    setSelectedAttIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const handleToggleSelectAllAtts = () => {
    if (selectedAttIds.length === attachments.length) {
      setSelectedAttIds([])
    } else {
      setSelectedAttIds(attachments.map((a) => a.id))
    }
  }

  const handleBatchDeleteAtts = async () => {
    if (selectedAttIds.length === 0) {
      snackbar.warning('Please select at least one attachment to delete.')
      return
    }
    try {
      await deleteAttsMutation.mutateAsync(selectedAttIds)
      snackbar.success(`Deleted ${selectedAttIds.length} attachment(s) successfully!`)
      setSelectedAttIds([])
    } catch {
      snackbar.error('Failed to delete attachments.')
    }
  }

  const handleSingleDeleteAtt = async (attId: string, fileName: string) => {
    try {
      await deleteAttsMutation.mutateAsync([attId])
      snackbar.success(`Deleted attachment "${fileName}" successfully!`)
      setSelectedAttIds((prev) => prev.filter((i) => i !== attId))
    } catch {
      snackbar.error('Failed to delete attachment.')
    }
  }

  // Pagination states for Certificates & Attachments
  const [certPage, setCertPage] = useState(1)
  const certPageSize = 4
  const totalCertPages = Math.max(1, Math.ceil(certificates.length / certPageSize))
  const paginatedCerts = certificates.slice((certPage - 1) * certPageSize, certPage * certPageSize)

  const [attPage, setAttPage] = useState(1)
  const attPageSize = 4
  const totalAttPages = Math.max(1, Math.ceil(attachments.length / attPageSize))
  const paginatedAtts = attachments.slice((attPage - 1) * attPageSize, attPage * attPageSize)

  // Local document state initialized from template or employee docs (excluding standalone certificate list)
  const [docStates, setDocStates] = useState<LocalDocState[]>(() => {
    if (initialEmployee?.documents && initialEmployee.documents.length > 0) {
      return initialEmployee.documents
        .filter((d) => d.key !== 'certificate' && d.key !== 'mcu')
        .map((d) => ({
          key: d.key,
          name: d.name,
          required: d.required,
          fieldLabel: d.fieldLabel,
          fieldValue: d.fieldValue || '',
          fileName: d.fileName,
          fileSize: d.fileSize || '1.0 MB',
          status: d.status,
          dueDate: d.dueDate,
        }))
    }

    // Default template (6 core mandatory employee documents)
    return [
      {
        key: 'ktp',
        name: 'KTP',
        required: true,
        fieldLabel: 'NIK',
        fieldValue: '3171012345678901',
        fileName: 'KTP_File.pdf',
        fileSize: '1.2 MB',
        status: 'verified',
      },
      {
        key: 'kk',
        name: 'Kartu Keluarga',
        required: true,
        fieldLabel: 'No. KK',
        fieldValue: '3171019988776655',
        fileName: 'KK_File.pdf',
        fileSize: '850 KB',
        status: 'verified',
      },
      {
        key: 'npwp',
        name: 'NPWP',
        required: true,
        fieldLabel: 'NPWP',
        fieldValue: '01.234.567.8-901.000',
        fileName: 'NPWP_File.pdf',
        fileSize: '620 KB',
        status: 'verified',
      },
      {
        key: 'bpjs_kes',
        name: 'BPJS Kesehatan',
        required: true,
        fieldLabel: 'BPJS No.',
        fieldValue: '',
        fileName: undefined,
        status: 'missing',
      },
      {
        key: 'bpjs_tk',
        name: 'BPJS Ketenagakerjaan',
        required: true,
        fieldLabel: 'BPJS No.',
        fieldValue: '',
        fileName: undefined,
        status: 'missing',
      },
      {
        key: 'ijazah',
        name: 'Ijazah Terakhir',
        required: true,
        fieldLabel: 'Education',
        fieldValue: 'S1 Teknik Informatika',
        fileName: 'Ijazah_File.pdf',
        fileSize: '1.8 MB',
        status: 'verified',
      },
    ]
  })

  // Has attempted save (for highlighting missing required docs)
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)
  const [isSaved, setIsSaved] = useState<boolean>(() => {
    if (!initialEmployee?.documents || initialEmployee.documents.length === 0) return false
    const missing = initialEmployee.documents.filter(
      (d) => d.required && (!d.fileName || d.status === 'missing'),
    )
    return missing.length === 0
  })
  const [isExporting, setIsExporting] = useState(false)

  // Document preview popup state
  const [previewDoc, setPreviewDoc] = useState<PreviewDocInfo | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const handleOpenPreview = (
    name: string,
    fieldLabel: string,
    fieldValue?: string,
    fileName?: string,
    status?: string,
    key?: string,
  ) => {
    setPreviewDoc({
      key: key || name.toLowerCase(),
      name,
      fieldLabel,
      fieldValue,
      fileName,
      fileSize: '1.2 MB',
      employeeName: currentEmp.fullName,
      employeeCode: currentEmp.employeeCode,
      department: currentEmp.departmentName || 'General',
      status: status || 'verified',
    })
    setIsPreviewOpen(true)
  }

  // Document calculations
  const totalDocTypes = docStates.length + certificates.length + attachments.length
  const requiredDocs = docStates.filter((d) => d.required)
  const readyDocs = docStates.filter((d) => Boolean(d.fileName))
  const missingRequired = requiredDocs.filter((d) => !d.fileName)

  // Update field value
  const handleFieldValueChange = (key: string, val: string) => {
    setIsSaved(false)
    setDocStates((prev) => prev.map((d) => (d.key === key ? { ...d, fieldValue: val } : d)))
  }

  // Update attached file
  const handleFileUpload = (key: string, file: File) => {
    setIsSaved(false)
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1)
    setDocStates((prev) =>
      prev.map((d) =>
        d.key === key
          ? {
              ...d,
              fileName: file.name,
              fileSize: `${sizeMb} MB`,
              status: d.required ? 'verified' : 'valid',
            }
          : d,
      ),
    )
  }

  // Remove file
  const handleFileRemove = (key: string) => {
    setIsSaved(false)
    setDocStates((prev) =>
      prev.map((d) =>
        d.key === key
          ? {
              ...d,
              fileName: undefined,
              status: d.required ? 'missing' : 'pending',
            }
          : d,
      ),
    )
  }

  const handleDownloadFile = (
    name: string,
    fileName?: string,
    fieldLabel?: string,
    fieldValue?: string,
  ) => {
    downloadEmployeeDocument({
      name,
      fileName,
      fieldLabel,
      fieldValue,
      employeeName: currentEmp.fullName,
      employeeCode: currentEmp.employeeCode,
      department: currentEmp.departmentName || 'General',
    })
    snackbar.success(`Downloaded ${fileName || name} successfully!`)
  }

  const handleSave = async () => {
    setHasAttemptedSubmit(true)

    if (missingRequired.length > 0) {
      const missingNames = missingRequired.map((m) => m.name).join(' and ')
      snackbar.error(
        `${missingRequired.length} required documents missing: upload ${missingNames} before saving.`,
      )
      return
    }

    try {
      const res = await saveMutation.mutateAsync({
        employeeId: selectedEmpId,
        documents: docStates.map((d) => ({
          key: d.key,
          fieldValue: d.fieldValue,
          fileName: d.fileName,
          fileSize: d.fileSize,
          status: d.fileName
            ? d.required
              ? 'verified'
              : 'valid'
            : d.required
              ? 'missing'
              : 'pending',
          dueDate: d.dueDate,
        })),
      })
      setIsSaved(true)
      snackbar.success('All employee documents saved successfully!')
      onSuccess(res.data)
    } catch {
      snackbar.error('Failed to save documents. Please try again.')
    }
  }

  // Handle Export Dossier (.zip bundle of excel and all physical PDFs)
  const handleExportDossier = async () => {
    if (!isSaved || missingRequired.length > 0) {
      snackbar.warning(
        'Dokumen mandatory harus di-save terlebih dahulu sebelum dapat melakukan export.',
      )
      return
    }

    try {
      setIsExporting(true)
      await exportEmployeeDossierZip(
        currentEmp.fullName,
        currentEmp.employeeCode,
        currentEmp.departmentName || 'General',
        docStates,
        certificates,
        attachments,
      )
      snackbar.success(`Dokumen dan berkas untuk ${currentEmp.fullName} berhasil diekspor!`)
    } catch {
      snackbar.error('Gagal mengekspor dokumen.')
    } finally {
      setIsExporting(false)
    }
  }

  const scrollToFirstMissing = () => {
    const firstMissing = missingRequired[0]
    if (firstMissing) {
      const el = document.getElementById(`doc-card-${firstMissing.key}`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  return (
    <div className='flex flex-col gap-6'>
      {/* ── Top Employee Card Banner ──────────────────────────────────────── */}
      <div className='flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/60 bg-card p-6 shadow-sm'>
        <div className='flex items-center gap-4'>
          <Avatar className='size-14 border border-border/60 shadow-sm'>
            <AvatarImage src={currentEmp.photo ?? undefined} />
            <AvatarFallback className='bg-primary/10 text-base font-bold text-primary'>
              {currentEmp.fullName
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <span className='text-[10px] font-bold tracking-wider text-muted-foreground uppercase'>
              Employee
            </span>
            <h3 className='mt-0.5 text-lg font-bold text-foreground'>{currentEmp.fullName}</h3>
            <p className='mt-0.5 text-xs text-muted-foreground'>
              NIP: {currentEmp.employeeCode} · {currentEmp.departmentName}
            </p>
          </div>
        </div>

        {/* Stats Pills & Export Action */}
        <div className='flex flex-wrap items-center gap-3'>
          <div className='flex items-center gap-3 rounded-xl border border-border/60 bg-muted/20 px-4 py-2 text-xs'>
            <div>
              <p className='text-[10px] font-medium text-muted-foreground'>Document Types</p>
              <p className='text-sm font-bold text-foreground'>
                {totalDocTypes}{' '}
                <span className='text-[11px] font-normal text-muted-foreground'>
                  ({requiredDocs.length} mandatory, {certificates.length} certs,{' '}
                  {attachments.length} files)
                </span>
              </p>
            </div>
          </div>

          <div className='flex items-center gap-3 rounded-xl border border-border/60 bg-muted/20 px-4 py-2 text-xs'>
            <div>
              <p className='text-[10px] font-medium text-muted-foreground'>Files Ready</p>
              <p className='text-sm font-bold text-emerald-600 dark:text-emerald-400'>
                {readyDocs.length + certificates.length + attachments.length}{' '}
                <span className='text-[11px] font-normal text-muted-foreground'>
                  valid files attached
                </span>
              </p>
            </div>
          </div>

          <Button
            variant={isSaved && missingRequired.length === 0 ? 'default' : 'outline'}
            size='sm'
            onClick={handleExportDossier}
            disabled={isExporting}
            className='h-11 gap-1.5 px-4 text-xs font-semibold'
            title={
              isSaved && missingRequired.length === 0
                ? 'Export full dossier package (.zip)'
                : 'Save all mandatory documents first to enable export'
            }
          >
            {isExporting ? (
              <IconLoader2 size={16} className='animate-spin' />
            ) : (
              <IconArchive size={16} />
            )}
            Export Documents (.zip)
          </Button>
        </div>
      </div>

      {/* ── Missing Documents Warning Banner (Screen 3) ───────────────────── */}
      {hasAttemptedSubmit && missingRequired.length > 0 && (
        <div className='flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 dark:border-rose-900/60 dark:bg-rose-950/30'>
          <div className='flex items-center gap-3'>
            <div className='flex size-8 flex-shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-900/60 dark:text-rose-400'>
              <IconAlertCircle size={18} />
            </div>
            <div>
              <p className='text-xs font-bold text-rose-800 dark:text-rose-300'>
                {missingRequired.length} required{' '}
                {missingRequired.length === 1 ? 'document is' : 'documents are'} still missing
              </p>
              <p className='text-xs text-rose-700/90 dark:text-rose-400'>
                Please upload {missingRequired.map((m) => m.name).join(' and ')} before saving.
              </p>
            </div>
          </div>

          <Button
            size='sm'
            variant='outline'
            onClick={scrollToFirstMissing}
            className='border-rose-300 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-800 dark:text-rose-300'
          >
            Review Missing
          </Button>
        </div>
      )}

      {/* ── 1. Mandatory Document Checklist Grid ──────────────────────────── */}
      <div className='rounded-2xl border border-border/60 bg-card p-6 shadow-sm'>
        <div className='mb-6'>
          <h4 className='text-sm font-bold text-foreground'>Mandatory Document Checklist</h4>
          <p className='mt-0.5 text-xs text-muted-foreground'>
            Fill metadata and upload each required file (PDF/JPG/PNG, maximum 10MB per file).
          </p>
        </div>

        <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
          {docStates.map((doc) => {
            const isMissingAndAttempted = hasAttemptedSubmit && doc.required && !doc.fileName
            const inputId = `file-input-${doc.key}`

            return (
              <div
                key={doc.key}
                id={`doc-card-${doc.key}`}
                className={`flex flex-col justify-between rounded-xl border p-4.5 transition-all ${
                  isMissingAndAttempted
                    ? 'border-rose-400 bg-rose-50/30 shadow-sm dark:border-rose-800 dark:bg-rose-950/10'
                    : 'border-border/70 bg-background/50 hover:border-border'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className='flex items-center justify-between pb-3'>
                    <div className='flex items-center gap-2'>
                      <IconFileText
                        size={16}
                        className={doc.required ? 'text-primary' : 'text-muted-foreground'}
                      />
                      <h5 className='text-xs font-bold text-foreground'>{doc.name}</h5>
                    </div>

                    <Badge
                      variant={doc.required ? 'green' : 'outline'}
                      className={`py-0.2 px-2 text-[10px] font-semibold ${
                        isMissingAndAttempted ? 'border-rose-500 bg-rose-50 text-rose-600' : ''
                      }`}
                    >
                      {doc.required ? 'Required' : 'Optional'}
                    </Badge>
                  </div>

                  {/* Metadata Input Field */}
                  <div className='mb-3.5 space-y-1.5'>
                    <label className='text-[11px] font-semibold text-muted-foreground'>
                      {doc.fieldLabel} {doc.required && <span className='text-rose-500'>*</span>}
                    </label>
                    <Input
                      placeholder={`Enter ${doc.fieldLabel}...`}
                      value={doc.fieldValue}
                      onChange={(e) => handleFieldValueChange(doc.key, e.target.value)}
                      className='h-8 bg-card text-xs'
                    />
                  </div>
                </div>

                {/* File Upload / Attachment Area */}
                <div>
                  <label className='mb-1.5 block text-[11px] font-semibold text-muted-foreground'>
                    File Attachment {doc.required && <span className='text-rose-500'>*</span>}
                  </label>

                  {doc.fileName ? (
                    /* Attached file pill with 3 clean action icons */
                    <div className='flex items-center justify-between gap-2 rounded-lg border border-border/80 bg-muted/40 px-3 py-2 text-xs'>
                      <div className='flex min-w-0 items-center gap-2'>
                        <IconCheck size={14} className='flex-shrink-0 text-emerald-600' />
                        <span className='truncate text-xs font-semibold text-foreground'>
                          {doc.fileName}
                        </span>
                        <span className='flex-shrink-0 text-[10px] text-muted-foreground'>
                          ({doc.fileSize})
                        </span>
                      </div>

                      <div className='flex flex-shrink-0 items-center gap-1'>
                        {/* View document popup button */}
                        <button
                          type='button'
                          onClick={() =>
                            handleOpenPreview(
                              doc.name,
                              doc.fieldLabel,
                              doc.fieldValue,
                              doc.fileName,
                              doc.status,
                              doc.key,
                            )
                          }
                          className='flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-primary'
                          title='View document'
                        >
                          <IconEye size={15} />
                        </button>

                        {/* Replace file icon button */}
                        <label
                          htmlFor={inputId}
                          className='flex size-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-primary'
                          title='Replace document file'
                        >
                          <IconRefresh size={15} />
                        </label>

                        {/* Delete file button */}
                        <button
                          type='button'
                          onClick={() => handleFileRemove(doc.key)}
                          className='flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-rose-600'
                          title='Remove file'
                        >
                          <IconTrash size={15} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Empty upload button */
                    <label
                      htmlFor={inputId}
                      className={`flex h-10 w-full cursor-pointer items-center justify-center rounded-lg border border-dashed text-xs font-semibold transition-colors ${
                        isMissingAndAttempted
                          ? 'border-rose-400 bg-rose-100/50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
                          : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:bg-muted/40 hover:text-foreground'
                      }`}
                    >
                      <IconUpload size={14} className='mr-1.5 text-primary' />
                      {isMissingAndAttempted ? 'Upload File (Required)' : 'Upload File'}
                    </label>
                  )}

                  <input
                    id={inputId}
                    type='file'
                    accept='.pdf,.png,.jpg,.jpeg,.doc,.docx'
                    className='hidden'
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(doc.key, e.target.files[0])
                      }
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Mandatory Documents Save Action */}
        <div className='mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-5'>
          <div>
            {isSaved && missingRequired.length === 0 ? (
              <p className='flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400'>
                <IconCheck size={15} className='stroke-[2.5]' />* Semua dokumen sudah tersave
              </p>
            ) : (
              <p className='flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400'>
                <IconAlertCircle size={15} />* Belum ada dokumen yang tersave
              </p>
            )}
            <p className='mt-0.5 text-[11px] text-muted-foreground'>
              Pastikan seluruh dokumen mandatory terisi dan tersimpan sebelum melakukan ekspor
              berkas.
            </p>
          </div>

          <div className='flex items-center gap-3'>
            <Button
              variant='outline'
              size='sm'
              onClick={onCancel}
              disabled={saveMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              size='sm'
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className='gap-1.5 font-semibold'
            >
              {saveMutation.isPending && (
                <IconLoader2 size={14} className='animate-spin' data-icon='inline-start' />
              )}
              Save Documents
            </Button>
          </div>
        </div>
      </div>

      {/* ── 2. Employee Professional Certificates (List with Pagination) ─── */}
      <div className='rounded-2xl border border-border/60 bg-card p-6 shadow-sm'>
        <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
          <div>
            <div className='flex items-center gap-2'>
              <IconAward size={18} className='text-purple-600' />
              <h4 className='text-sm font-bold text-foreground'>
                Professional Certificates ({certificates.length})
              </h4>
            </div>
            <p className='mt-0.5 text-xs text-muted-foreground'>
              Certificates, credentials, and professional licenses registered for{' '}
              {currentEmp.fullName}.
            </p>
          </div>

          <div className='flex items-center gap-2'>
            <Button
              size='sm'
              variant={selectedCertIds.length > 0 ? 'destructive' : 'outline'}
              onClick={handleBatchDeleteCerts}
              disabled={deleteCertsMutation.isPending}
              className={`gap-1.5 text-xs font-semibold ${
                selectedCertIds.length === 0
                  ? 'border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/50 dark:hover:bg-rose-950/30'
                  : ''
              }`}
            >
              {deleteCertsMutation.isPending ? (
                <IconLoader2 size={14} className='animate-spin' />
              ) : (
                <IconTrash size={14} />
              )}
              {selectedCertIds.length > 0
                ? `Delete Selected (${selectedCertIds.length})`
                : 'Delete Selected'}
            </Button>

            <Button
              size='sm'
              variant='outline'
              onClick={handleOpenAddCert}
              className='gap-1.5 text-xs font-semibold'
            >
              <IconPlus size={14} />
              Add Certificate
            </Button>
          </div>
        </div>

        {/* Select all bar if multiple certificates exist */}
        {certificates.length > 0 && (
          <div className='mb-3 flex items-center justify-between rounded-lg bg-muted/30 px-3 py-1.5 text-xs'>
            <label className='flex cursor-pointer items-center gap-2'>
              <input
                type='checkbox'
                checked={selectedCertIds.length === certificates.length && certificates.length > 0}
                onChange={handleToggleSelectAllCerts}
                className='size-3.5 rounded border-border text-primary focus:ring-primary/30'
              />
              <span className='text-[11px] font-medium text-foreground'>
                {selectedCertIds.length === certificates.length
                  ? 'Deselect All'
                  : `Select All (${certificates.length})`}
              </span>
            </label>
            {selectedCertIds.length > 0 && (
              <span className='text-[11px] font-semibold text-primary'>
                {selectedCertIds.length} certificate(s) selected
              </span>
            )}
          </div>
        )}

        {certificates.length === 0 ? (
          <div className='rounded-xl border border-dashed border-border/70 p-6 text-center text-xs text-muted-foreground'>
            No certificates registered for this employee yet. Click &quot;Add Certificate&quot; to
            register one.
          </div>
        ) : (
          <div className='flex flex-col gap-3'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              {paginatedCerts.map((cert: CertificateItem) => {
                const isSelected = selectedCertIds.includes(cert.id)
                return (
                  <div
                    key={cert.id}
                    className={`flex flex-col justify-between rounded-xl border p-4 transition-colors ${
                      isSelected
                        ? 'border-primary/60 bg-primary/5 shadow-xs'
                        : 'border-border/70 bg-background/50 hover:border-border'
                    }`}
                  >
                    <div>
                      <div className='flex items-start justify-between gap-2 pb-2'>
                        <div className='flex min-w-0 items-start gap-2.5'>
                          <input
                            type='checkbox'
                            checked={isSelected}
                            onChange={() => handleToggleCertSelect(cert.id)}
                            className='mt-0.5 size-4 flex-shrink-0 cursor-pointer rounded border-border text-primary focus:ring-primary/30'
                          />
                          <div className='min-w-0'>
                            <h5 className='truncate text-xs font-bold text-foreground'>
                              {cert.title}
                            </h5>
                            <p className='truncate text-[11px] text-muted-foreground'>
                              Issuer: {cert.issuer} · ID: {cert.credentialId || 'CRED-VAL'}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            cert.status === 'active'
                              ? 'green'
                              : cert.status === 'expiring'
                                ? 'amber'
                                : cert.status === 'expired'
                                  ? 'red'
                                  : 'blue'
                          }
                          className='py-0.2 flex-shrink-0 px-2 text-[10px] capitalize'
                        >
                          {cert.status === 'expiring' ? 'Expiring Soon' : cert.status}
                        </Badge>
                      </div>

                      <p className='mb-3 pl-6.5 text-[11px] text-muted-foreground'>
                        Validity: {cert.issuedDate} &mdash; {cert.expiryDate}
                      </p>
                    </div>

                    {/* Attached Certificate File Pill */}
                    <div className='flex items-center justify-between gap-2 rounded-lg border border-border/80 bg-muted/40 px-3 py-2 text-xs'>
                      <div className='flex min-w-0 items-center gap-2'>
                        <IconFileTypePdf size={15} className='flex-shrink-0 text-purple-600' />
                        <span className='truncate text-xs font-semibold text-foreground'>
                          {cert.fileName || `${cert.title}.pdf`}
                        </span>
                        <span className='flex-shrink-0 text-[10px] text-muted-foreground'>
                          ({cert.fileSize || '1.2 MB'})
                        </span>
                      </div>

                      <div className='flex flex-shrink-0 items-center gap-1'>
                        <button
                          type='button'
                          onClick={() =>
                            handleOpenPreview(
                              `Certificate: ${cert.title}`,
                              'Credential ID',
                              cert.credentialId,
                              cert.fileName,
                              cert.status,
                              'certificate',
                            )
                          }
                          className='flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-primary'
                          title='View certificate preview'
                        >
                          <IconEye size={15} />
                        </button>

                        <button
                          type='button'
                          onClick={() => handleOpenEditCert(cert)}
                          className='flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-primary'
                          title='Edit certificate'
                        >
                          <IconPencil size={15} />
                        </button>

                        <button
                          type='button'
                          onClick={() =>
                            handleDownloadFile(
                              `Certificate - ${cert.title}`,
                              cert.fileName,
                              'Credential ID',
                              cert.credentialId,
                            )
                          }
                          className='flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-emerald-600'
                          title='Download certificate file'
                        >
                          <IconDownload size={15} />
                        </button>

                        <button
                          type='button'
                          onClick={() => handleSingleDeleteCert(cert.id, cert.title)}
                          className='flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-rose-600'
                          title='Delete certificate'
                        >
                          <IconTrash size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pagination Controls */}
            {totalCertPages > 1 && (
              <div className='flex items-center justify-between border-t border-border/40 pt-3 text-xs'>
                <span className='text-[11px] text-muted-foreground'>
                  Page {certPage} of {totalCertPages} ({certificates.length} certificates)
                </span>
                <div className='flex items-center gap-1.5'>
                  <Button
                    variant='outline'
                    size='sm'
                    className='h-7 px-2 text-xs'
                    disabled={certPage === 1}
                    onClick={() => setCertPage((p) => Math.max(1, p - 1))}
                  >
                    Prev
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    className='h-7 px-2 text-xs'
                    disabled={certPage === totalCertPages}
                    onClick={() => setCertPage((p) => Math.min(totalCertPages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── 3. Employee Supporting Attachments (List with Pagination) ──────── */}
      <div className='rounded-2xl border border-border/60 bg-card p-6 shadow-sm'>
        <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
          <div>
            <div className='flex items-center gap-2'>
              <IconFile size={18} className='text-blue-600' />
              <h4 className='text-sm font-bold text-foreground'>
                Supporting Attachments ({attachments.length})
              </h4>
            </div>
            <p className='mt-0.5 text-xs text-muted-foreground'>
              General employment files, offer letters, training records, medical notes, etc.
            </p>
          </div>

          <div className='flex items-center gap-2'>
            <Button
              size='sm'
              variant={selectedAttIds.length > 0 ? 'destructive' : 'outline'}
              onClick={handleBatchDeleteAtts}
              disabled={deleteAttsMutation.isPending}
              className={`gap-1.5 text-xs font-semibold ${
                selectedAttIds.length === 0
                  ? 'border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/50 dark:hover:bg-rose-950/30'
                  : ''
              }`}
            >
              {deleteAttsMutation.isPending ? (
                <IconLoader2 size={14} className='animate-spin' />
              ) : (
                <IconTrash size={14} />
              )}
              {selectedAttIds.length > 0
                ? `Delete Selected (${selectedAttIds.length})`
                : 'Delete Selected'}
            </Button>

            <Button
              size='sm'
              variant='outline'
              onClick={handleOpenAddAtt}
              className='gap-1.5 text-xs font-semibold'
            >
              <IconPlus size={14} />
              Add Attachment
            </Button>
          </div>
        </div>

        {/* Select all bar if multiple attachments exist */}
        {attachments.length > 0 && (
          <div className='mb-3 flex items-center justify-between rounded-lg bg-muted/30 px-3 py-1.5 text-xs'>
            <label className='flex cursor-pointer items-center gap-2'>
              <input
                type='checkbox'
                checked={selectedAttIds.length === attachments.length && attachments.length > 0}
                onChange={handleToggleSelectAllAtts}
                className='size-3.5 rounded border-border text-primary focus:ring-primary/30'
              />
              <span className='text-[11px] font-medium text-foreground'>
                {selectedAttIds.length === attachments.length
                  ? 'Deselect All'
                  : `Select All (${attachments.length})`}
              </span>
            </label>
            {selectedAttIds.length > 0 && (
              <span className='text-[11px] font-semibold text-primary'>
                {selectedAttIds.length} attachment(s) selected
              </span>
            )}
          </div>
        )}

        {attachments.length === 0 ? (
          <div className='rounded-xl border border-dashed border-border/70 p-6 text-center text-xs text-muted-foreground'>
            No supporting attachments uploaded for this employee yet. Click &quot;Add
            Attachment&quot; to upload files.
          </div>
        ) : (
          <div className='flex flex-col gap-3'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              {paginatedAtts.map((att: AttachmentItem) => {
                const isSelected = selectedAttIds.includes(att.id)
                return (
                  <div
                    key={att.id}
                    className={`flex flex-col justify-between rounded-xl border p-4 transition-colors ${
                      isSelected
                        ? 'border-primary/60 bg-primary/5 shadow-xs'
                        : 'border-border/70 bg-background/50 hover:border-border'
                    }`}
                  >
                    <div>
                      <div className='flex items-start justify-between gap-2 pb-2'>
                        <div className='flex min-w-0 items-start gap-2.5'>
                          <input
                            type='checkbox'
                            checked={isSelected}
                            onChange={() => handleToggleAttSelect(att.id)}
                            className='mt-0.5 size-4 flex-shrink-0 cursor-pointer rounded border-border text-primary focus:ring-primary/30'
                          />
                          <div className='min-w-0'>
                            <h5 className='truncate text-xs font-bold text-foreground'>
                              {att.fileName}
                            </h5>
                            <p className='truncate text-[11px] text-muted-foreground'>
                              Uploaded by: {att.uploadedBy} · {att.uploadedDate}
                            </p>
                          </div>
                        </div>
                        <Badge variant='outline' className='py-0.2 flex-shrink-0 px-2 text-[10px]'>
                          {att.category}
                        </Badge>
                      </div>
                    </div>

                    {/* Attached File Pill */}
                    <div className='mt-2 flex items-center justify-between gap-2 rounded-lg border border-border/80 bg-muted/40 px-3 py-2 text-xs'>
                      <div className='flex min-w-0 items-center gap-2'>
                        <IconFileTypePdf size={15} className='flex-shrink-0 text-blue-600' />
                        <span className='truncate text-xs font-semibold text-foreground'>
                          {att.fileName}
                        </span>
                        <span className='flex-shrink-0 text-[10px] text-muted-foreground'>
                          ({att.fileSize})
                        </span>
                      </div>

                      <div className='flex flex-shrink-0 items-center gap-1'>
                        <button
                          type='button'
                          onClick={() =>
                            handleOpenPreview(
                              att.fileName,
                              'Category',
                              att.category,
                              att.fileName,
                              'verified',
                              'attachment',
                            )
                          }
                          className='flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-primary'
                          title='View attachment preview'
                        >
                          <IconEye size={15} />
                        </button>

                        <button
                          type='button'
                          onClick={() => handleOpenEditAtt(att)}
                          className='flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-primary'
                          title='Edit attachment'
                        >
                          <IconPencil size={15} />
                        </button>

                        <button
                          type='button'
                          onClick={() =>
                            handleDownloadFile(
                              `Attachment - ${att.category}`,
                              att.fileName,
                              'Category',
                              att.category,
                            )
                          }
                          className='flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-emerald-600'
                          title='Download attachment file'
                        >
                          <IconDownload size={15} />
                        </button>

                        <button
                          type='button'
                          onClick={() => handleSingleDeleteAtt(att.id, att.fileName)}
                          className='flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-rose-600'
                          title='Delete attachment'
                        >
                          <IconTrash size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pagination Controls */}
            {totalAttPages > 1 && (
              <div className='flex items-center justify-between border-t border-border/40 pt-3 text-xs'>
                <span className='text-[11px] text-muted-foreground'>
                  Page {attPage} of {totalAttPages} ({attachments.length} files)
                </span>
                <div className='flex items-center gap-1.5'>
                  <Button
                    variant='outline'
                    size='sm'
                    className='h-7 px-2 text-xs'
                    disabled={attPage === 1}
                    onClick={() => setAttPage((p) => Math.max(1, p - 1))}
                  >
                    Prev
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    className='h-7 px-2 text-xs'
                    disabled={attPage === totalAttPages}
                    onClick={() => setAttPage((p) => Math.min(totalAttPages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Document Preview Popup Dialog ─────────────────────────────────── */}
      <DocumentPreviewDialog
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        doc={previewDoc}
      />

      {/* ── Upload / Edit Certificate Modal ─────────────────────────────── */}
      <UploadCertificateModal
        open={isAddCertOpen}
        onOpenChange={setIsAddCertOpen}
        defaultEmployeeId={selectedEmpId}
        certificateToEdit={editingCert}
      />

      {/* ── Upload / Edit Attachment Modal ────────────────────────────────── */}
      <UploadAttachmentModal
        open={isAddAttOpen}
        onOpenChange={setIsAddAttOpen}
        defaultEmployeeId={selectedEmpId}
        attachmentToEdit={editingAtt}
      />
    </div>
  )
}
