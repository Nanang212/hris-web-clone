// document-certificates-tab.tsx — Certificates tab with Stats, Filters, Directory table, and Upload modal
import {
  IconArchive,
  IconDownload,
  IconFileSpreadsheet,
  IconPlus,
  IconSearch,
} from '@tabler/icons-react'
import { useState } from 'react'

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
import { CertificateDirectoryTable } from '@/features/employment/document/components/certificate-directory-table'
import {
  DocumentStatsCards,
  type DocumentStatCardItem,
} from '@/features/employment/document/components/document-stats-cards'
import { UploadCertificateModal } from '@/features/employment/document/components/upload-certificate-modal'
import { useGetCertificates, useGetCertificateStats } from '@/features/employment/document/hooks'
import {
  downloadExcelExport,
  exportCertificatesBundleZip,
} from '@/features/employment/document/lib/download-helper'
import { useGetEmployees } from '@/features/employment/employee/hooks'

export function DocumentCertificatesTab() {
  const [searchInput, setSearchInput] = useState('')
  const [searchValue, setSearchValue] = useState('')
  const [employeeFilter, setEmployeeFilter] = useState('all')
  const [issuerFilter, setIssuerFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [expiryRange, setExpiryRange] = useState('all')

  const [isUploadOpen, setIsUploadOpen] = useState(false)

  const { data: employeesResult } = useGetEmployees({})
  const employees = employeesResult?.items ?? []

  const { data: stats } = useGetCertificateStats()
  const {
    data: certificates = [],
    isPending,
    isFetching,
  } = useGetCertificates(
    searchValue || undefined,
    issuerFilter !== 'all' ? issuerFilter : undefined,
    statusFilter !== 'all' ? statusFilter : undefined,
    expiryRange !== 'all' ? expiryRange : undefined,
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
    if (certificates.length === 0) {
      snackbar.error('No certificate records found to export.')
      return
    }

    const empName = getFilteredEmpName()
    downloadExcelExport(
      `Certificates_Report_${empName.replace(/\s+/g, '_')}.xlsx`,
      'Certificates',
      [
        'Employee Name',
        'NIP',
        'Department',
        'Certificate Title',
        'Issuer',
        'Credential ID',
        'Issue Date',
        'Expiry Date',
        'Status',
      ],
      certificates.map((c) => [
        c.fullName,
        c.employeeCode,
        c.department,
        c.title,
        c.issuer,
        c.credentialId || '-',
        c.issuedDate,
        c.expiryDate,
        c.status,
      ]),
    )
    snackbar.success(`Exported ${certificates.length} certificate records to Excel (.xlsx)!`)
  }

  // Export ZIP Bundle (Excel + Certificate PDF Documents)
  const handleExportZipBundle = async () => {
    if (certificates.length === 0) {
      snackbar.error('No certificate records found to export.')
      return
    }

    const empName = getFilteredEmpName()
    try {
      snackbar.info('Preparing and archiving certificates package...')
      await exportCertificatesBundleZip(
        `Certificates_Package_${empName.replace(/\s+/g, '_')}.zip`,
        certificates,
      )
      snackbar.success(
        `Downloaded complete package: Excel + ${certificates.length} Certificate PDFs!`,
      )
    } catch {
      snackbar.error('Failed to create certificates package.')
    }
  }

  const statItems: DocumentStatCardItem[] = [
    {
      id: 'stat-total-cert',
      label: 'Certificates',
      value: stats?.totalCertificates ?? 486,
      subtext: 'Across employees',
      iconBadgeText: 'CRT',
      iconBgClass: 'bg-purple-50 dark:bg-purple-950/50',
      iconTextClass: 'text-purple-600 dark:text-purple-400',
    },
    {
      id: 'stat-active',
      label: 'Active',
      value: stats?.activeCount ?? 398,
      subtext: `${stats?.activePercentage ?? 88}% active`,
      iconBadgeText: 'OK',
      iconBgClass: 'bg-emerald-50 dark:bg-emerald-950/50',
      iconTextClass: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      id: 'stat-expiring',
      label: 'Expiring in 30 Days',
      value: stats?.expiringCount ?? 28,
      subtext: 'Reminder active',
      iconBadgeText: 'EXP',
      iconBgClass: 'bg-amber-50 dark:bg-amber-950/50',
      iconTextClass: 'text-amber-600 dark:text-amber-400',
    },
    {
      id: 'stat-expired',
      label: 'Expired',
      value: stats?.expiredCount ?? 20,
      subtext: 'Needs renewal',
      iconBadgeText: '!',
      iconBgClass: 'bg-rose-50 dark:bg-rose-950/50',
      iconTextClass: 'text-rose-600 dark:text-rose-400',
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
            className='absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground'
          />
          <Input
            className='h-9 pr-4 pl-9 text-xs'
            placeholder='Search employee or certificate...'
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

        {/* Issuer Filter */}
        <Select value={issuerFilter} onValueChange={setIssuerFilter}>
          <SelectTrigger className='h-9 w-36 text-xs'>
            <SelectValue placeholder='All issuers' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All issuers</SelectItem>
            <SelectItem value='PMI'>PMI</SelectItem>
            <SelectItem value='Amazon Web Services'>Amazon Web Services</SelectItem>
            <SelectItem value='IAI'>IAI</SelectItem>
            <SelectItem value='HRCI'>HRCI</SelectItem>
            <SelectItem value='Kemnaker'>Kemnaker</SelectItem>
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className='h-9 w-36 text-xs'>
            <SelectValue placeholder='All status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All status</SelectItem>
            <SelectItem value='active'>Active</SelectItem>
            <SelectItem value='expiring'>Expiring Soon</SelectItem>
            <SelectItem value='expired'>Expired</SelectItem>
            <SelectItem value='lifetime'>Lifetime</SelectItem>
          </SelectContent>
        </Select>

        {/* Expiry Range Filter */}
        <Select value={expiryRange} onValueChange={setExpiryRange}>
          <SelectTrigger className='h-9 w-36 text-xs'>
            <SelectValue placeholder='Expiry range' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Expiry: All</SelectItem>
            <SelectItem value='30d'>Next 30 Days</SelectItem>
            <SelectItem value='60d'>Next 60 Days</SelectItem>
            <SelectItem value='90d'>Next 90 Days</SelectItem>
            <SelectItem value='this_year'>This Year</SelectItem>
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
            <DropdownMenuItem onClick={handleExportExcel} className='cursor-pointer gap-2 py-2'>
              <IconFileSpreadsheet size={15} className='text-emerald-600' />
              <div>
                <p className='font-semibold'>Export Excel (.xlsx)</p>
                <p className='text-[10px] text-muted-foreground'>Spreadsheet report only</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportZipBundle} className='cursor-pointer gap-2 py-2'>
              <IconArchive size={15} className='text-blue-600' />
              <div>
                <p className='font-semibold'>Export Package (.zip)</p>
                <p className='text-[10px] text-muted-foreground'>Excel + All Certificate PDFs</p>
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
          Upload Certificate
        </Button>
      </div>

      {/* Directory Table */}
      <CertificateDirectoryTable
        certificates={certificates}
        isPending={isPending}
        isFetching={isFetching}
      />

      <UploadCertificateModal open={isUploadOpen} onOpenChange={setIsUploadOpen} />
    </div>
  )
}
