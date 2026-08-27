// document-attachments-tab.tsx — Attachments tab with Stats, Category filters, Directory table, and Upload modal
import {
  IconSearch,
  IconDownload,
  IconPlus,
  IconArchive,
  IconFileSpreadsheet,
} from '@tabler/icons-react'
import { useState } from 'react'
import {
  DocumentStatsCards,
  type DocumentStatCardItem,
} from '@/features/document/components/document-stats-cards'
import { AttachmentDirectoryTable } from '@/features/document/components/attachment-directory-table'
import { UploadAttachmentModal } from '@/features/document/components/upload-attachment-modal'
import {
  useGetAttachments,
  useGetAttachmentStats,
} from '@/features/document/hooks'
import {
  downloadExcelExport,
  exportAttachmentsBundleZip,
} from '@/features/document/lib/download-helper'
import { useGetEmployees } from '@/features/employment/hooks'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { snackbar } from '@/shared/lib/snackbar'

export function DocumentAttachmentsTab() {
  const [searchInput, setSearchInput] = useState('')
  const [searchValue, setSearchValue] = useState('')
  const [employeeFilter, setEmployeeFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const [isUploadOpen, setIsUploadOpen] = useState(false)

  const { data: employeesResult } = useGetEmployees({})
  const employees = employeesResult?.items ?? []

  const { data: stats } = useGetAttachmentStats()
  const {
    data: attachments = [],
    isPending,
    isFetching,
  } = useGetAttachments(
    searchValue || undefined,
    categoryFilter !== 'all' ? categoryFilter : undefined,
    employeeFilter !== 'all' ? employeeFilter : undefined,
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') setSearchValue(searchInput)
  }

  const getFilteredEmpName = () => {
    return employeeFilter !== 'all'
      ? employees.find((e) => e.id === employeeFilter)?.fullName || 'Filtered'
      : 'All_Employees'
  }

  // Export Excel (.xlsx) only
  const handleExportExcel = () => {
    if (attachments.length === 0) {
      snackbar.error('No attachment records found to export.')
      return
    }

    const empName = getFilteredEmpName()
    downloadExcelExport(
      `Attachments_Report_${empName.replace(/\s+/g, '_')}.xlsx`,
      'Attachments',
      ['Employee Name', 'NIP', 'Department', 'File Name', 'Category', 'Uploaded Date', 'Uploaded By', 'File Size'],
      attachments.map((a) => [
        a.fullName,
        a.employeeCode,
        a.department,
        a.fileName,
        a.category,
        a.uploadedDate,
        a.uploadedBy,
        a.fileSize || '-',
      ]),
    )
    snackbar.success(`Exported ${attachments.length} attachment records to Excel (.xlsx)!`)
  }

  // Export ZIP Bundle (Excel + Supporting Documents)
  const handleExportZipBundle = async () => {
    if (attachments.length === 0) {
      snackbar.error('No attachment records found to export.')
      return
    }

    const empName = getFilteredEmpName()
    try {
      snackbar.info('Preparing and archiving supporting files package...')
      await exportAttachmentsBundleZip(
        `Attachments_Package_${empName.replace(/\s+/g, '_')}.zip`,
        attachments,
      )
      snackbar.success(`Downloaded complete package: Excel + ${attachments.length} Supporting Files!`)
    } catch {
      snackbar.error('Failed to create attachments package.')
    }
  }

  const statItems: DocumentStatCardItem[] = [
    {
      id: 'stat-total-att',
      label: 'Attachments',
      value: stats?.totalAttachments ?? 1864,
      subtext: 'Supporting files',
      iconBadgeText: 'ATT',
      iconBgClass: 'bg-blue-50 dark:bg-blue-950/50',
      iconTextClass: 'text-blue-600 dark:text-blue-400',
    },
    {
      id: 'stat-employees-att',
      label: 'Employees',
      value: stats?.employeesWithAttachments ?? 724,
      subtext: 'With attachments',
      iconBadgeText: 'EMP',
      iconBgClass: 'bg-emerald-50 dark:bg-emerald-950/50',
      iconTextClass: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      id: 'stat-storage',
      label: 'Storage Used',
      value: stats?.storageUsed ?? '8.4 GB',
      subtext: 'PDF + Image files',
      iconBadgeText: 'GB',
      iconBgClass: 'bg-purple-50 dark:bg-purple-950/50',
      iconTextClass: 'text-purple-600 dark:text-purple-400',
    },
    {
      id: 'stat-uploaded-month',
      label: 'Uploaded This Month',
      value: stats?.uploadedThisMonth ?? 146,
      subtext: 'Current month',
      iconBadgeText: 'NEW',
      iconBgClass: 'bg-amber-50 dark:bg-amber-950/50',
      iconTextClass: 'text-amber-600 dark:text-amber-400',
    },
  ]

  return (
    <div className='flex flex-col gap-6'>
      {/* Metric Cards */}
      <DocumentStatsCards items={statItems} />

      {/* Filter Bar */}
      <div className='flex flex-wrap items-center gap-3'>
        <div className='relative min-w-[200px] flex-1'>
          <IconSearch
            size={15}
            className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'
          />
          <Input
            className='h-9 pl-9 pr-4 text-xs'
            placeholder='Search employee or file...'
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* Employee Filter */}
        <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
          <SelectTrigger className='h-9 w-44 text-xs'>
            <SelectValue placeholder='All employees' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Employees</SelectItem>
            {employees.map((emp) => (
              <SelectItem key={emp.id} value={emp.id}>
                {emp.fullName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Category Filter */}
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className='h-9 w-44 text-xs'>
            <SelectValue placeholder='All categories' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All categories</SelectItem>
            <SelectItem value='Recruitment'>Recruitment</SelectItem>
            <SelectItem value='Training'>Training</SelectItem>
            <SelectItem value='Medical'>Medical</SelectItem>
            <SelectItem value='Recognition'>Recognition</SelectItem>
            <SelectItem value='Other'>Other</SelectItem>
          </SelectContent>
        </Select>

        {/* Export Dropdown (Excel + Full Package with PDFs) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' size='sm' className='gap-1.5 text-xs font-semibold'>
              <IconDownload size={14} />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-52 text-xs'>
            <DropdownMenuItem onClick={handleExportExcel} className='gap-2 py-2 cursor-pointer'>
              <IconFileSpreadsheet size={15} className='text-emerald-600' />
              <div>
                <p className='font-semibold'>Export Excel (.xlsx)</p>
                <p className='text-[10px] text-muted-foreground'>Spreadsheet report only</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportZipBundle} className='gap-2 py-2 cursor-pointer'>
              <IconArchive size={15} className='text-blue-600' />
              <div>
                <p className='font-semibold'>Export Package (.zip)</p>
                <p className='text-[10px] text-muted-foreground'>Excel + All Attached Files</p>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          size='sm'
          onClick={() => setIsUploadOpen(true)}
          className='gap-1.5 text-xs font-semibold'
        >
          <IconPlus size={14} />
          Upload Attachment
        </Button>
      </div>

      {/* Directory Table */}
      <AttachmentDirectoryTable
        attachments={attachments}
        isPending={isPending}
        isFetching={isFetching}
      />

      <UploadAttachmentModal
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
      />
    </div>
  )
}
