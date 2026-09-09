// upload-attachment-modal.tsx — Dialog to add or edit a standalone supporting attachment
import { IconFile, IconLoader2, IconUpload } from '@tabler/icons-react'
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
import { useCreateAttachment, useUpdateAttachment } from '@/features/employment/document/hooks'
import type { AttachmentCategory, AttachmentItem } from '@/features/employment/document/types'
import { useGetEmployees } from '@/features/employment/employee/hooks'

interface UploadAttachmentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultEmployeeId?: string
  attachmentToEdit?: AttachmentItem | null
}

const KNOWN_CATEGORIES = ['Recruitment', 'Training', 'Medical', 'Recognition', 'Other']

export function UploadAttachmentModal({
  open,
  onOpenChange,
  defaultEmployeeId,
  attachmentToEdit,
}: UploadAttachmentModalProps) {
  const { data: employeesResult } = useGetEmployees({})
  const employees = employeesResult?.items ?? []
  const createAttMutation = useCreateAttachment()
  const updateAttMutation = useUpdateAttachment()

  const isEditMode = Boolean(attachmentToEdit)

  const [employeeId, setEmployeeId] = useState(
    attachmentToEdit?.employeeId || defaultEmployeeId || employees[0]?.id || '',
  )
  const [fileName, setFileName] = useState(attachmentToEdit?.fileName || '')
  const [category, setCategory] = useState<string>(() => {
    if (!attachmentToEdit) return 'Recruitment'
    return KNOWN_CATEGORIES.includes(attachmentToEdit.category)
      ? attachmentToEdit.category
      : 'Other'
  })
  const [customCategory, setCustomCategory] = useState(() => {
    if (!attachmentToEdit) return ''
    return KNOWN_CATEGORIES.includes(attachmentToEdit.category) ? '' : attachmentToEdit.category
  })
  const [fileSize, setFileSize] = useState(attachmentToEdit?.fileSize || '1.2 MB')

  useEffect(() => {
    if (attachmentToEdit) {
      setEmployeeId(attachmentToEdit.employeeId)
      setFileName(attachmentToEdit.fileName)
      const isKnown = KNOWN_CATEGORIES.includes(attachmentToEdit.category)
      setCategory(isKnown ? attachmentToEdit.category : 'Other')
      setCustomCategory(isKnown ? '' : attachmentToEdit.category)
      setFileSize(attachmentToEdit.fileSize || '1.2 MB')
    } else if (open) {
      setEmployeeId(defaultEmployeeId || employees[0]?.id || '')
      setFileName('')
      setCategory('Recruitment')
      setCustomCategory('')
      setFileSize('1.2 MB')
    }
  }, [attachmentToEdit, open, defaultEmployeeId, employees])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0]
      setFileName(f.name)
      const sizeMb = (f.size / (1024 * 1024)).toFixed(1)
      setFileSize(`${sizeMb} MB`)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!employeeId || !fileName) {
      snackbar.error('Please select an employee and choose a file to upload.')
      return
    }

    if (category === 'Other' && !customCategory.trim()) {
      snackbar.error('Please enter the custom category name.')
      return
    }

    const finalCategory = category === 'Other' ? customCategory.trim() : category

    try {
      if (isEditMode && attachmentToEdit) {
        await updateAttMutation.mutateAsync({
          id: attachmentToEdit.id,
          employeeId,
          fileName,
          category: finalCategory as AttachmentCategory,
          fileSize,
        })
        snackbar.success('Attachment updated successfully!')
      } else {
        await createAttMutation.mutateAsync({
          employeeId,
          fileName,
          category: finalCategory as AttachmentCategory,
          fileSize,
        })
        snackbar.success('Attachment uploaded successfully!')
      }
      onOpenChange(false)
    } catch {
      snackbar.error(isEditMode ? 'Failed to update attachment.' : 'Failed to upload attachment.')
    }
  }

  const isPending = createAttMutation.isPending || updateAttMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[480px]'>
        <DialogHeader>
          <div className='flex items-center gap-2.5'>
            <div className='flex size-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'>
              <IconFile size={18} />
            </div>
            <div>
              <DialogTitle className='text-base font-bold'>
                {isEditMode ? 'Edit Supporting Attachment' : 'Upload Supporting Attachment'}
              </DialogTitle>
              <DialogDescription className='text-xs'>
                {isEditMode
                  ? 'Update file name, employee attachment categories, and details.'
                  : 'Upload general employee documentation, training records, medical notes, etc.'}
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
              disabled={isEditMode}
              className={`h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:ring-2 focus:ring-primary/30 focus:outline-none ${isEditMode ? 'cursor-not-allowed opacity-70' : ''}`}
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName} ({emp.employeeCode} · {emp.departmentName})
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div className='space-y-1.5'>
            <label className='font-semibold text-foreground'>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className='h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:ring-2 focus:ring-primary/30 focus:outline-none'
            >
              <option value='Recruitment'>Recruitment</option>
              <option value='Training'>Training</option>
              <option value='Medical'>Medical</option>
              <option value='Recognition'>Recognition</option>
              <option value='Other'>Other</option>
            </select>
          </div>

          {/* Custom Category Input (shown when category is 'Other') */}
          {category === 'Other' && (
            <div className='animate-in space-y-1.5 rounded-xl border border-primary/20 bg-primary/5 p-3 duration-200 fade-in-50'>
              <label className='font-semibold text-foreground'>
                Specify Category Name <span className='text-rose-500'>*</span>
              </label>
              <Input
                placeholder='e.g. Legal, Visa, Tax Letter, Compliance'
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className='h-9 bg-background text-xs'
                required
                autoFocus
              />
              <p className='text-[10px] text-muted-foreground'>
                Enter a custom category label for this supporting attachment.
              </p>
            </div>
          )}

          {/* File Name / Document Title */}
          <div className='space-y-1.5'>
            <label className='font-semibold text-foreground'>
              File Name / Title <span className='text-rose-500'>*</span>
            </label>
            <Input
              placeholder='e.g. Training_Record_2026.pdf'
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className='h-9 text-xs'
              required
            />
          </div>

          {/* Choose File */}
          <div className='space-y-1.5'>
            <label className='font-semibold text-foreground'>File Attachment</label>
            <div className='flex items-center gap-2'>
              <label className='flex h-9 cursor-pointer items-center justify-center rounded-lg border border-dashed border-border px-3 text-xs font-semibold transition-colors hover:bg-muted/40'>
                <IconUpload size={14} className='mr-1.5 text-primary' />
                {isEditMode ? 'Replace File' : 'Choose File'}
                <input
                  type='file'
                  accept='.pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx'
                  onChange={handleFileChange}
                  className='hidden'
                />
              </label>
              <span className='max-w-[240px] truncate text-[11px] text-muted-foreground'>
                {fileName
                  ? `${fileName} (${fileSize})`
                  : 'No file chosen (PDF, DOC, XLS up to 10MB)'}
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
              {isEditMode ? 'Update Attachment' : 'Upload Attachment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
