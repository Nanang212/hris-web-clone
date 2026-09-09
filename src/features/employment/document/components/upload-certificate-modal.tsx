import { IconAward, IconLoader2, IconUpload } from '@tabler/icons-react'
import { useEffect, useState } from 'react'

import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { snackbar } from '@/shared/lib/snackbar'
import { useCreateCertificate, useUpdateCertificate } from '@/features/employment/document/hooks'
import type { CertificateItem } from '@/features/employment/document/types'
import { useGetEmployees } from '@/features/employment/employee/hooks'

interface UploadCertificateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultEmployeeId?: string
  certificateToEdit?: CertificateItem | null
}

export function UploadCertificateModal({
  open,
  onOpenChange,
  defaultEmployeeId,
  certificateToEdit,
}: UploadCertificateModalProps) {
  const { data: employeesResult } = useGetEmployees({})
  const employees = employeesResult?.items ?? []
  const createCertMutation = useCreateCertificate()
  const updateCertMutation = useUpdateCertificate()

  const isEditMode = Boolean(certificateToEdit)

  const [employeeId, setEmployeeId] = useState(
    certificateToEdit?.employeeId || defaultEmployeeId || employees[0]?.id || '',
  )
  const [title, setTitle] = useState(certificateToEdit?.title || '')
  const [issuer, setIssuer] = useState(certificateToEdit?.issuer || '')
  const [issuedDate, setIssuedDate] = useState(certificateToEdit?.issuedDate || '')
  const [expiryDate, setExpiryDate] = useState(
    certificateToEdit?.expiryDate === 'No Expiry' ? '' : certificateToEdit?.expiryDate || '',
  )
  const [hasNoExpiry, setHasNoExpiry] = useState(
    certificateToEdit?.status === 'lifetime' || certificateToEdit?.expiryDate === 'No Expiry',
  )
  const [credentialId, setCredentialId] = useState(certificateToEdit?.credentialId || '')
  const [fileName, setFileName] = useState(certificateToEdit?.fileName || '')

  useEffect(() => {
    if (certificateToEdit) {
      setEmployeeId(certificateToEdit.employeeId)
      setTitle(certificateToEdit.title)
      setIssuer(certificateToEdit.issuer)
      setIssuedDate(certificateToEdit.issuedDate)
      setExpiryDate(
        certificateToEdit.expiryDate === 'No Expiry' ? '' : certificateToEdit.expiryDate,
      )
      setHasNoExpiry(
        certificateToEdit.status === 'lifetime' || certificateToEdit.expiryDate === 'No Expiry',
      )
      setCredentialId(certificateToEdit.credentialId || '')
      setFileName(certificateToEdit.fileName || '')
    } else if (open) {
      setEmployeeId(defaultEmployeeId || employees[0]?.id || '')
      setTitle('')
      setIssuer('')
      setIssuedDate('')
      setExpiryDate('')
      setHasNoExpiry(false)
      setCredentialId('')
      setFileName('')
    }
  }, [certificateToEdit, open, defaultEmployeeId, employees])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!employeeId || !title || !issuer || !issuedDate || (!hasNoExpiry && !expiryDate)) {
      snackbar.error('Please fill in all required certificate details.')
      return
    }

    try {
      if (isEditMode && certificateToEdit) {
        await updateCertMutation.mutateAsync({
          id: certificateToEdit.id,
          employeeId,
          title,
          issuer,
          issuedDate,
          expiryDate: hasNoExpiry ? 'No Expiry' : expiryDate,
          hasNoExpiry,
          credentialId,
          fileName: fileName || certificateToEdit.fileName,
        })
        snackbar.success('Certificate updated successfully!')
      } else {
        await createCertMutation.mutateAsync({
          employeeId,
          title,
          issuer,
          issuedDate,
          expiryDate: hasNoExpiry ? 'No Expiry' : expiryDate,
          hasNoExpiry,
          credentialId,
          fileName: fileName || `${title.replace(/\s+/g, '_')}.pdf`,
        })
        snackbar.success('Certificate added successfully!')
      }
      onOpenChange(false)
    } catch {
      snackbar.error(isEditMode ? 'Failed to update certificate.' : 'Failed to add certificate.')
    }
  }

  const isPending = createCertMutation.isPending || updateCertMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <div className='flex items-center gap-2.5'>
            <div className='flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary'>
              <IconAward size={18} />
            </div>
            <div>
              <DialogTitle className='text-base font-bold'>
                {isEditMode ? 'Edit Certificate' : 'Upload Certificate'}
              </DialogTitle>
              <DialogDescription className='text-xs'>
                {isEditMode
                  ? 'Update professional certification details, validity, and credentials.'
                  : 'Add professional certification details, validity, and lifetime status for an employee.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4 py-2 text-xs'>
          {/* Employee select */}
          <div className='space-y-1.5'>
            <label className='font-semibold text-foreground'>
              Employee <span className='text-rose-500'>*</span>
            </label>
            <select
              value={employeeId || employees[0]?.id}
              onChange={(e) => setEmployeeId(e.target.value)}
              className='h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:ring-2 focus:ring-primary/30 focus:outline-none'
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName} ({emp.employeeCode} · {emp.departmentName})
                </option>
              ))}
            </select>
          </div>

          {/* Certificate Title */}
          <div className='space-y-1.5'>
            <label className='font-semibold text-foreground'>
              Certificate Title <span className='text-rose-500'>*</span>
            </label>
            <Input
              placeholder='e.g. AWS Solutions Architect, PMP, Ahli K3'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className='h-9 text-xs'
              required
            />
          </div>

          {/* Issuer & Credential ID */}
          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-1.5'>
              <label className='font-semibold text-foreground'>
                Issuer / Institution <span className='text-rose-500'>*</span>
              </label>
              <Input
                placeholder='e.g. Amazon, PMI, Kemnaker'
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
                className='h-9 text-xs'
                required
              />
            </div>
            <div className='space-y-1.5'>
              <label className='font-semibold text-foreground'>Credential ID</label>
              <Input
                placeholder='e.g. AWS-99201'
                value={credentialId}
                onChange={(e) => setCredentialId(e.target.value)}
                className='h-9 text-xs'
              />
            </div>
          </div>

          {/* Dates & Lifetime checkbox */}
          <div className='space-y-3 rounded-xl border border-border/60 bg-muted/20 p-3'>
            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <label className='font-semibold text-foreground'>
                  Issue Date <span className='text-rose-500'>*</span>
                </label>
                <Input
                  type='date'
                  value={issuedDate}
                  onChange={(e) => setIssuedDate(e.target.value)}
                  className='h-9 bg-background text-xs'
                  required
                />
              </div>
              <div className='space-y-1.5'>
                <label
                  className={`font-semibold ${hasNoExpiry ? 'text-muted-foreground' : 'text-foreground'}`}
                >
                  Expiry Date {!hasNoExpiry && <span className='text-rose-500'>*</span>}
                </label>
                <Input
                  type='date'
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className={`h-9 bg-background text-xs ${hasNoExpiry ? 'cursor-not-allowed opacity-50' : ''}`}
                  disabled={hasNoExpiry}
                  required={!hasNoExpiry}
                />
              </div>
            </div>

            {/* Checkbox No Expiration / Lifetime */}
            <label className='flex cursor-pointer items-center gap-2 pt-1'>
              <input
                type='checkbox'
                checked={hasNoExpiry}
                onChange={(e) => setHasNoExpiry(e.target.checked)}
                className='size-4 rounded border-border text-primary focus:ring-primary/30'
              />
              <span className='text-xs font-semibold text-foreground'>
                This certificate does not expire (Lifetime / Permanent)
              </span>
            </label>
          </div>

          {/* File Upload */}
          <div className='space-y-1.5'>
            <label className='font-semibold text-foreground'>Certificate File (PDF/Image)</label>
            <div className='flex items-center gap-2'>
              <label className='flex h-9 cursor-pointer items-center justify-center rounded-lg border border-dashed border-border px-3 text-xs font-semibold transition-colors hover:bg-muted/40'>
                <IconUpload size={14} className='mr-1.5 text-primary' />
                Choose File
                <input
                  type='file'
                  accept='.pdf,.png,.jpg,.jpeg'
                  onChange={handleFileChange}
                  className='hidden'
                />
              </label>
              <span className='max-w-[240px] truncate text-[11px] text-muted-foreground'>
                {fileName || 'No file chosen (PDF or PNG up to 5MB)'}
              </span>
            </div>
          </div>

          <DialogFooter className='pt-2'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type='submit' size='sm' disabled={isPending}>
              {isPending && (
                <IconLoader2 size={14} className='animate-spin' data-icon='inline-start' />
              )}
              {isEditMode ? 'Update Certificate' : 'Save Certificate'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
