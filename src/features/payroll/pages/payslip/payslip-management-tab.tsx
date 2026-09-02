// src/features/payroll/pages/payslip/payslip-management-tab.tsx — Screen 16: Payslip Directory & Table
import {
  IconSearch,
  IconDownload,
  IconEye,
  IconMail,
  IconSend,
  IconUsers,
  IconFileSpreadsheet,
} from '@tabler/icons-react'
import { useState } from 'react'
import { PayslipDetailView } from './payslip-detail-view'
import { PayrollStatusBadge } from '../../components/payroll-status-badge'
import { formatIDR, initialPayslips } from '../../data/mock-payroll-data'
import { downloadPayslipPdf, exportPayslipsBulkZip } from '../../lib/payroll-download-helper'
import type { PayslipRecord } from '../../types'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { snackbar } from '@/shared/lib/snackbar'

export function PayslipManagementTab() {
  const [payslips, setPayslips] = useState<PayslipRecord[]>(initialPayslips)
  const [search, setSearch] = useState('')
  const [periodFilter, setPeriodFilter] = useState('May 2026')
  const [selectedPayslip, setSelectedPayslip] = useState<PayslipRecord | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  const filtered = payslips.filter((p) => {
    const matchesSearch =
      p.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      p.employeeCode.toLowerCase().includes(search.toLowerCase()) ||
      p.department.toLowerCase().includes(search.toLowerCase()) ||
      p.payslipNumber.toLowerCase().includes(search.toLowerCase())

    const matchesPeriod = periodFilter === 'all' || p.period === periodFilter
    return matchesSearch && matchesPeriod
  })

  const handleBulkSend = () => {
    setPayslips((prev) =>
      prev.map((p) => ({
        ...p,
        status: 'sent',
        sentAt: 'Just now',
      })),
    )
    snackbar.success(`Successfully sent ${filtered.length} payslips to employee registered emails!`)
  }

  const handleDownloadSingle = (p: PayslipRecord) => {
    try {
      downloadPayslipPdf(p)
      setPayslips((prev) =>
        prev.map((item) =>
          item.id === p.id ? { ...item, status: 'downloaded', downloadedAt: 'Just now' } : item,
        ),
      )
      snackbar.success(`Slip gaji ${p.employeeName} (${p.payslipNumber}) berhasil diunduh.`)
    } catch {
      snackbar.error(`Gagal mengunduh slip gaji ${p.payslipNumber}.`)
    }
  }

  const handleExportBulk = async () => {
    try {
      setIsExporting(true)
      await exportPayslipsBulkZip(periodFilter, filtered)
      snackbar.success(`Berhasil mengekspor ${filtered.length} slip gaji (Excel + PDF Bundle)!`)
    } catch {
      snackbar.error('Gagal mengekspor file bulk payslips.')
    } finally {
      setIsExporting(false)
    }
  }

  if (selectedPayslip) {
    return (
      <PayslipDetailView
        payslip={selectedPayslip}
        onBack={() => setSelectedPayslip(null)}
      />
    )
  }

  return (
    <div className='space-y-6'>
      {/* ── Top Summary & Filter Bar ───────────────────────────────────────── */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <span className='p-2.5 rounded-xl bg-primary/10 text-primary'>
              <IconUsers size={20} />
            </span>
            <div>
              <p className='text-[11px] font-semibold text-muted-foreground'>Total Payslips</p>
              <b className='text-base font-bold text-foreground'>{payslips.length} Slips</b>
            </div>
          </div>
        </div>

        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <span className='p-2.5 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'>
              <IconSend size={20} />
            </span>
            <div>
              <p className='text-[11px] font-semibold text-muted-foreground'>Sent to Employees</p>
              <b className='text-base font-bold text-emerald-600 dark:text-emerald-400'>
                {payslips.filter((p) => p.status === 'sent' || p.status === 'downloaded').length} Slips
              </b>
            </div>
          </div>
        </div>

        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <span className='p-2.5 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'>
              <IconDownload size={20} />
            </span>
            <div>
              <p className='text-[11px] font-semibold text-muted-foreground'>Downloaded by Staff</p>
              <b className='text-base font-bold text-blue-600 dark:text-blue-400'>
                {payslips.filter((p) => p.status === 'downloaded').length} Slips
              </b>
            </div>
          </div>
        </div>

        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <span className='p-2.5 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'>
              <IconMail size={20} />
            </span>
            <div>
              <p className='text-[11px] font-semibold text-muted-foreground'>Pending Delivery</p>
              <b className='text-base font-bold text-amber-600 dark:text-amber-400'>
                {payslips.filter((p) => p.status === 'published' || p.status === 'draft').length} Slips
              </b>
            </div>
          </div>
        </div>
      </div>

      {/* ── Search & Filter Controls ───────────────────────────────────────── */}
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div className='flex flex-wrap items-center gap-3 flex-1'>
          <div className='relative w-full max-w-sm'>
            <IconSearch className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground' />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Search employee name, ID, or slip no...'
              className='pl-9 h-9.5 text-xs bg-card rounded-xl shadow-xs'
            />
          </div>

          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className='h-9.5 text-xs bg-card rounded-xl min-w-[140px] shadow-xs'>
              <SelectValue placeholder='Select Period' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Periods</SelectItem>
              <SelectItem value='May 2026'>May 2026</SelectItem>
              <SelectItem value='April 2026'>April 2026</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='flex items-center gap-2.5'>
          <Button
            variant='outline'
            size='sm'
            onClick={handleExportBulk}
            disabled={isExporting || filtered.length === 0}
            className='gap-1.5 text-xs font-semibold rounded-xl h-9'
          >
            <IconFileSpreadsheet size={15} />
            {isExporting ? 'Exporting...' : 'Export Bulk (ZIP/Excel)'}
          </Button>

          <Button
            size='sm'
            onClick={handleBulkSend}
            className='gap-1.5 text-xs font-semibold rounded-xl h-9 shadow-xs'
          >
            <IconMail size={15} />
            Send All to Email
          </Button>
        </div>
      </div>

      {/* ── Payslip Table ─────────────────────────────────────────────────── */}
      <div className='rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden'>
        <Table>
          <TableHeader>
            <TableRow className='bg-muted/30 text-xs border-b border-border/60'>
              <TableHead className='font-bold text-muted-foreground py-3.5 pl-6'>Slip Number</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3.5'>Employee</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3.5'>Period</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3.5'>Gross Earnings</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3.5'>Deductions</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3.5'>Take Home Pay</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3.5'>Status</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3.5 pr-6 text-right'>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => (
              <TableRow key={p.id} className='text-xs hover:bg-muted/20 border-b border-border/40'>
                <TableCell className='py-4 pl-6 font-mono font-bold text-foreground'>
                  {p.payslipNumber}
                </TableCell>
                <TableCell className='py-4'>
                  <div>
                    <p className='font-bold text-foreground'>{p.employeeName}</p>
                    <p className='text-[10px] text-muted-foreground font-mono mt-0.5'>{p.employeeCode} · {p.department}</p>
                  </div>
                </TableCell>
                <TableCell className='py-4 text-muted-foreground font-medium'>{p.period}</TableCell>
                <TableCell className='py-4 font-semibold text-foreground'>{formatIDR(p.totalEarnings)}</TableCell>
                <TableCell className='py-4 text-rose-600 dark:text-rose-400 font-semibold'>-{formatIDR(p.totalDeductions)}</TableCell>
                <TableCell className='py-4 font-bold text-emerald-600 dark:text-emerald-400'>{formatIDR(p.netPay)}</TableCell>
                <TableCell className='py-4'>
                  <PayrollStatusBadge status={p.status} />
                </TableCell>
                <TableCell className='py-4 pr-6 text-right'>
                  <div className='flex items-center justify-end gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setSelectedPayslip(p)}
                      className='h-7.5 px-2.5 text-xs font-semibold gap-1 rounded-lg'
                    >
                      <IconEye size={13} />
                      View
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => handleDownloadSingle(p)}
                      className='size-7.5 text-muted-foreground hover:text-foreground'
                    >
                      <IconDownload size={15} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
