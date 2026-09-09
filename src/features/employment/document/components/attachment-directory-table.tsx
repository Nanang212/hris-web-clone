// attachment-directory-table.tsx — Attachments directory table with pagination & category filters
import {
  IconDotsVertical,
  IconDownload,
  IconEye,
  IconFileTypePdf,
  IconPencil,
} from '@tabler/icons-react'
import { useState } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { snackbar } from '@/shared/lib/snackbar'
import {
  DocumentPreviewDialog,
  type PreviewDocInfo,
} from '@/features/employment/document/components/document-preview-dialog'
import { UploadAttachmentModal } from '@/features/employment/document/components/upload-attachment-modal'
import { downloadEmployeeDocument } from '@/features/employment/document/lib/download-helper'
import type { AttachmentItem } from '@/features/employment/document/types'
import { TablePagination } from '@/features/employment/components/table-pagination'

interface AttachmentDirectoryTableProps {
  attachments: AttachmentItem[]
  isPending?: boolean
  isFetching?: boolean
}

export function AttachmentDirectoryTable({
  attachments,
  isPending = false,
  isFetching = false,
}: AttachmentDirectoryTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [editingAtt, setEditingAtt] = useState<AttachmentItem | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)

  // Preview modal state
  const [previewDoc, setPreviewDoc] = useState<PreviewDocInfo | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const totalItems = attachments.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const activePage = Math.min(currentPage, totalPages)
  const paginated = attachments.slice((activePage - 1) * pageSize, activePage * pageSize)
  const startItemIdx = totalItems === 0 ? 0 : (activePage - 1) * pageSize + 1
  const endItemIdx = Math.min(activePage * pageSize, totalItems)

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1)
  }

  const handleDownload = (att: AttachmentItem) => {
    downloadEmployeeDocument({
      name: `Supporting Attachment - ${att.category}`,
      fileName: att.fileName,
      fieldLabel: 'Category',
      fieldValue: att.category,
      employeeName: att.fullName,
      employeeCode: att.employeeCode,
      department: att.department,
      verifiedAt: att.uploadedDate,
    })
    snackbar.success(`Downloaded ${att.fileName} successfully!`)
  }

  const handleEdit = (att: AttachmentItem) => {
    setEditingAtt(att)
    setIsEditOpen(true)
  }

  const handleView = (att: AttachmentItem) => {
    setPreviewDoc({
      key: 'attachment',
      name: `Attachment: ${att.fileName}`,
      fieldLabel: 'Category',
      fieldValue: att.category,
      fileName: att.fileName,
      fileSize: att.fileSize || '1.2 MB',
      employeeName: att.fullName,
      employeeCode: att.employeeCode,
      department: att.department,
      status: 'verified',
      verifiedAt: att.uploadedDate,
    })
    setIsPreviewOpen(true)
  }

  return (
    <div className='flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm'>
      {/* Header bar */}
      <div className='border-b border-border/60 px-6 py-4'>
        <h3 className='text-sm font-bold text-foreground'>Attachment Directory</h3>
        <p className='mt-0.5 text-xs text-muted-foreground'>
          Manage supporting employee files that do not belong to mandatory document or certificate
          categories.
        </p>
      </div>

      {/* Loading bar */}
      <div
        className={`h-0.5 overflow-hidden bg-primary/20 transition-all ${isFetching && !isPending ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className='h-full w-1/2 animate-[slide-in-out_1.2s_ease-in-out_infinite] bg-primary' />
      </div>

      <div className='overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow className='bg-muted/30'>
              <TableHead>Employee</TableHead>
              <TableHead>File Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead>Uploaded By</TableHead>
              <TableHead>Size</TableHead>
              <TableHead className='w-16 text-right'>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending && (
              <TableRow>
                <TableCell colSpan={7} className='py-12 text-center text-sm text-muted-foreground'>
                  Loading attachments...
                </TableCell>
              </TableRow>
            )}

            {!isPending && paginated.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className='py-12 text-center text-sm text-muted-foreground'>
                  No attachments found.
                </TableCell>
              </TableRow>
            )}

            {paginated.map((att) => {
              return (
                <TableRow key={att.id} className='transition-colors hover:bg-muted/30'>
                  <TableCell>
                    <div className='flex items-center gap-3'>
                      <Avatar className='size-8'>
                        <AvatarImage src={att.photo ?? undefined} />
                        <AvatarFallback className='bg-primary/10 text-xs font-bold text-primary'>
                          {att.fullName
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className='min-w-0'>
                        <p className='truncate text-xs font-semibold text-foreground'>
                          {att.fullName}
                        </p>
                        <p className='truncate text-[11px] text-muted-foreground'>
                          {att.employeeCode} · {att.department}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <IconFileTypePdf size={16} className='flex-shrink-0 text-blue-600' />
                      <span className='truncate text-xs font-semibold text-foreground'>
                        {att.fileName}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant='outline' className='text-[11px] font-medium'>
                      {att.category}
                    </Badge>
                  </TableCell>

                  <TableCell className='text-xs whitespace-nowrap text-muted-foreground'>
                    {att.uploadedDate}
                  </TableCell>
                  <TableCell className='text-xs font-medium text-foreground/80'>
                    {att.uploadedBy}
                  </TableCell>
                  <TableCell className='text-xs text-muted-foreground'>{att.fileSize}</TableCell>

                  <TableCell className='text-right'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='size-8 text-muted-foreground hover:text-foreground'
                        >
                          <IconDotsVertical size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end' className='w-44 text-xs'>
                        <DropdownMenuItem onClick={() => handleView(att)}>
                          <IconEye size={14} className='mr-2 text-primary' />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(att)}>
                          <IconPencil size={14} className='mr-2 text-blue-600' />
                          Edit Attachment
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownload(att)}>
                          <IconDownload size={14} className='mr-2 text-emerald-600' />
                          Download
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <TablePagination
        itemLabel='files'
        startItemIdx={startItemIdx}
        endItemIdx={endItemIdx}
        totalItems={totalItems}
        activePage={activePage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={handlePageSizeChange}
      />

      {/* Edit Attachment Modal */}
      <UploadAttachmentModal
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        attachmentToEdit={editingAtt}
      />

      {/* Document & Attachment Preview Modal */}
      <DocumentPreviewDialog
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        doc={previewDoc}
      />
    </div>
  )
}
