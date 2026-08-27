// attachment-directory-table.tsx — Attachments directory table with pagination & category filters
import {
  IconDotsVertical,
  IconDownload,
  IconFileTypePdf,
  IconPencil,
  IconEye,
} from '@tabler/icons-react'
import { useState } from 'react'
import {
  DocumentPreviewDialog,
  type PreviewDocInfo,
} from '@/features/document/components/document-preview-dialog'
import { UploadAttachmentModal } from '@/features/document/components/upload-attachment-modal'
import type { AttachmentItem } from '@/features/document/types'
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
import { TablePagination } from '@/features/employment/components/table-pagination'
import { downloadEmployeeDocument } from '@/features/document/lib/download-helper'
import { snackbar } from '@/shared/lib/snackbar'

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
    <div className='rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden flex flex-col'>
      {/* Header bar */}
      <div className='border-b border-border/60 px-6 py-4'>
        <h3 className='text-sm font-bold text-foreground'>Attachment Directory</h3>
        <p className='text-xs text-muted-foreground mt-0.5'>
          Manage supporting employee files that do not belong to mandatory document or certificate categories.
        </p>
      </div>

      {/* Loading bar */}
      <div className={`h-0.5 bg-primary/20 overflow-hidden transition-all ${isFetching && !isPending ? 'opacity-100' : 'opacity-0'}`}>
        <div className='h-full w-1/2 bg-primary animate-[slide-in-out_1.2s_ease-in-out_infinite]' />
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
              <TableHead className='text-right w-16'>Action</TableHead>
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
                <TableRow key={att.id} className='hover:bg-muted/30 transition-colors'>
                  <TableCell>
                    <div className='flex items-center gap-3'>
                      <Avatar className='size-8'>
                        <AvatarImage src={att.photo ?? undefined} />
                        <AvatarFallback className='text-xs bg-primary/10 text-primary font-bold'>
                          {att.fullName
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className='min-w-0'>
                        <p className='text-xs font-semibold text-foreground truncate'>{att.fullName}</p>
                        <p className='text-[11px] text-muted-foreground truncate'>{att.employeeCode} · {att.department}</p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <IconFileTypePdf size={16} className='text-blue-600 flex-shrink-0' />
                      <span className='text-xs font-semibold text-foreground truncate'>{att.fileName}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant='outline' className='text-[11px] font-medium'>
                      {att.category}
                    </Badge>
                  </TableCell>

                  <TableCell className='text-xs text-muted-foreground whitespace-nowrap'>{att.uploadedDate}</TableCell>
                  <TableCell className='text-xs text-foreground/80 font-medium'>{att.uploadedBy}</TableCell>
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
