// certificate-directory-table.tsx — Table for Certificate Directory
import { IconAward, IconDotsVertical, IconDownload, IconEye, IconPencil } from '@tabler/icons-react'
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
import { UploadCertificateModal } from '@/features/employment/document/components/upload-certificate-modal'
import { downloadEmployeeDocument } from '@/features/employment/document/lib/download-helper'
import type { CertificateItem } from '@/features/employment/document/types'
import { TablePagination } from '@/features/employment/components/table-pagination'

interface CertificateDirectoryTableProps {
  certificates: CertificateItem[]
  isPending?: boolean
  isFetching?: boolean
}

export function CertificateDirectoryTable({
  certificates,
  isPending,
  isFetching,
}: CertificateDirectoryTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [editingCert, setEditingCert] = useState<CertificateItem | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)

  // Preview popup state
  const [previewDoc, setPreviewDoc] = useState<PreviewDocInfo | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const totalItems = certificates.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const activePage = Math.min(currentPage, totalPages)
  const startItemIdx = totalItems === 0 ? 0 : (activePage - 1) * pageSize + 1
  const endItemIdx = Math.min(activePage * pageSize, totalItems)

  const paginated = certificates.slice((activePage - 1) * pageSize, activePage * pageSize)

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1)
  }

  const handleDownload = (cert: CertificateItem) => {
    downloadEmployeeDocument({
      name: `Certificate - ${cert.title}`,
      fileName: cert.fileName || `${cert.title.replace(/\s+/g, '_')}.pdf`,
      fieldLabel: 'Credential ID',
      fieldValue: cert.credentialId || 'CRED-VALIDATED',
      employeeName: cert.fullName,
      employeeCode: cert.employeeCode,
      department: cert.department,
      status: cert.status,
      verifiedAt: cert.issuedDate,
    })
    snackbar.success(`Downloaded ${cert.fileName || cert.title} successfully!`)
  }

  const handleEdit = (cert: CertificateItem) => {
    setEditingCert(cert)
    setIsEditOpen(true)
  }

  const handleView = (cert: CertificateItem) => {
    setPreviewDoc({
      key: 'certificate',
      name: `Certificate: ${cert.title}`,
      fieldLabel: 'Credential ID',
      fieldValue: cert.credentialId || 'CRED-VAL-8831',
      fileName: cert.fileName || `${cert.title.replace(/\s+/g, '_')}.pdf`,
      fileSize: cert.fileSize || '1.2 MB',
      employeeName: cert.fullName,
      employeeCode: cert.employeeCode,
      department: cert.department,
      status: cert.status,
      verifiedAt: cert.issuedDate,
    })
    setIsPreviewOpen(true)
  }

  return (
    <div className='flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm'>
      {/* Header bar */}
      <div className='border-b border-border/60 px-6 py-4'>
        <h3 className='text-sm font-bold text-foreground'>Certificate Directory</h3>
        <p className='mt-0.5 text-xs text-muted-foreground'>
          Listing all employee professional certifications, validity, and credentials.
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
              <TableHead>Certificate</TableHead>
              <TableHead>Issuer</TableHead>
              <TableHead>Issued</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className='w-16 text-right'>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending && (
              <TableRow>
                <TableCell colSpan={7} className='py-12 text-center text-sm text-muted-foreground'>
                  Loading certificates...
                </TableCell>
              </TableRow>
            )}

            {!isPending && paginated.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className='py-12 text-center text-sm text-muted-foreground'>
                  No certificate records found.
                </TableCell>
              </TableRow>
            )}

            {paginated.map((cert) => {
              let badgeVariant: 'green' | 'amber' | 'red' | 'blue' = 'green'
              let badgeLabel = 'Active'
              if (cert.status === 'expiring') {
                badgeVariant = 'amber'
                badgeLabel = 'Expiring Soon'
              } else if (cert.status === 'expired') {
                badgeVariant = 'red'
                badgeLabel = 'Expired'
              } else if (cert.status === 'lifetime') {
                badgeVariant = 'blue'
                badgeLabel = 'Lifetime'
              }

              return (
                <TableRow key={cert.id} className='transition-colors hover:bg-muted/30'>
                  <TableCell>
                    <div className='flex items-center gap-3'>
                      <Avatar className='size-8'>
                        <AvatarImage src={cert.photo ?? undefined} />
                        <AvatarFallback className='bg-primary/10 text-xs font-bold text-primary'>
                          {cert.fullName
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className='min-w-0'>
                        <p className='truncate text-xs font-semibold text-foreground'>
                          {cert.fullName}
                        </p>
                        <p className='truncate text-[11px] text-muted-foreground'>
                          {cert.employeeCode} · {cert.department}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <IconAward size={15} className='flex-shrink-0 text-primary' />
                      <span className='truncate text-xs font-semibold text-foreground'>
                        {cert.title}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className='text-xs font-medium text-foreground/80'>
                    {cert.issuer}
                  </TableCell>
                  <TableCell className='text-xs text-muted-foreground'>{cert.issuedDate}</TableCell>
                  <TableCell className='text-xs text-muted-foreground'>{cert.expiryDate}</TableCell>

                  <TableCell>
                    <Badge variant={badgeVariant} className='text-xs font-semibold'>
                      {badgeLabel}
                    </Badge>
                  </TableCell>

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
                        <DropdownMenuItem onClick={() => handleView(cert)}>
                          <IconEye size={14} className='mr-2 text-primary' />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(cert)}>
                          <IconPencil size={14} className='mr-2 text-blue-600' />
                          Edit Certificate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownload(cert)}>
                          <IconDownload size={14} className='mr-2 text-emerald-600' />
                          Download File
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
        itemLabel='certificates'
        startItemIdx={startItemIdx}
        endItemIdx={endItemIdx}
        totalItems={totalItems}
        activePage={activePage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={handlePageSizeChange}
      />

      {/* Edit Certificate Modal */}
      <UploadCertificateModal
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        certificateToEdit={editingCert}
      />

      {/* Document & Certificate Preview Modal */}
      <DocumentPreviewDialog
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        doc={previewDoc}
      />
    </div>
  )
}
