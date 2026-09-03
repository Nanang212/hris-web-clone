import {
  IconCheck,
  IconDownload,
  IconFileSpreadsheet,
  IconFileTypePdf,
} from '@tabler/icons-react'
import { useState } from 'react'
import { generateReportExcel } from '../utils/excel-generator'
import { generateReportPdf } from '../utils/pdf-generator'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { snackbar } from '@/shared/lib/snackbar'
import type { ReportFilterCriteria } from '../types'

interface ExportReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reportTitle: string
  filters: ReportFilterCriteria
  headers?: string[]
  rows?: (string | number)[][]
}

export function ExportReportDialog({
  open,
  onOpenChange,
  reportTitle,
  filters,
  headers = ['NO', 'TANGGAL', 'NAMA', 'DEPARTEMEN', 'STATUS / NILAI'],
  rows = [
    ['1', '2026-08-28', 'Ahmad Fauzi', 'Engineering & Technology', '100%'],
    ['2', '2026-08-28', 'Siti Rahmawati', 'Finance & Accounting', '95.5%'],
    ['3', '2026-08-27', 'Budi Santoso', 'Sales & Business Dev', '90.9%'],
    ['4', '2026-08-27', 'Dewi Lestari', 'Marketing & Growth', '100%'],
    ['5', '2026-08-26', 'Rian Pratama', 'Operations & Logistics', '86.4%'],
  ],
}: ExportReportDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState<'excel' | 'pdf'>('excel')

  const handleDownload = () => {
    const ext = selectedFormat === 'excel' ? 'xlsx' : 'pdf'
    const filename = `${reportTitle.toLowerCase().replace(/[\s&]+/g, '_')}_${new Date().toISOString().split('T')[0]}.${ext}`

    const dateRangeStr =
      filters.startDate && filters.endDate
        ? `${filters.startDate} s.d ${filters.endDate}`
        : filters.datePreset === 'this_month'
          ? 'Bulan Ini (Agu 2026)'
          : filters.datePreset === 'this_year'
            ? 'Tahun 2026'
            : 'Semua Periode'

    let blob: Blob
    if (selectedFormat === 'excel') {
      blob = generateReportExcel({
        sheetName: reportTitle,
        title: reportTitle,
        dateRange: dateRangeStr,
        department: filters.department === 'all' ? 'Semua Departemen' : filters.department,
        headers,
        rows,
      })
    } else {
      blob = generateReportPdf({
        title: reportTitle,
        subtitle: 'HRIS Enterprise Management System · Official Analytics Report',
        dateRange: dateRangeStr,
        department: filters.department === 'all' ? 'Semua Departemen' : filters.department,
        headers,
        rows,
      })
    }

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    snackbar.success(
      `Laporan ${reportTitle} berhasil diekspor (${selectedFormat.toUpperCase()})!`,
    )
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[480px] p-0 rounded-3xl overflow-hidden border-border/80'>
        {/* Header */}
        <div className='p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b border-border/80'>
          <div className='flex items-center gap-3'>
            <div className='size-12 rounded-2xl bg-primary/15 text-primary flex items-center justify-center shrink-0 shadow-xs'>
              <IconDownload size={24} />
            </div>
            <div>
              <DialogTitle className='text-lg font-bold text-foreground'>
                Ekspor Laporan
              </DialogTitle>
              <DialogDescription className='text-xs text-muted-foreground mt-0.5'>
                {reportTitle} · Pilih format dokumen yang diinginkan
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className='p-6 space-y-4 text-xs'>
          {/* Active Filter Info Box */}
          <div className='p-3.5 rounded-2xl bg-muted/30 border border-border/60 space-y-1.5'>
            <p className='text-[10px] font-bold text-muted-foreground uppercase tracking-wider'>
              Cakupan Data yang Diekspor
            </p>
            <div className='grid grid-cols-2 gap-2 text-xs'>
              <div>
                <span className='text-muted-foreground'>Rentang Tanggal:</span>
                <p className='font-semibold text-foreground'>
                  {filters.startDate || 'Semua'} s.d {filters.endDate || 'Sekarang'}
                </p>
              </div>
              <div>
                <span className='text-muted-foreground'>Departemen:</span>
                <p className='font-semibold text-foreground truncate'>
                  {filters.department === 'all' ? 'Semua Departemen' : filters.department}
                </p>
              </div>
            </div>
          </div>

          {/* Format Selection Cards */}
          <div className='space-y-2'>
            <label className='text-xs font-bold text-foreground block'>
              Pilih Format Berkas
            </label>

            <div className='grid grid-cols-2 gap-3'>
              {/* Option 1: Excel */}
              <div
                onClick={() => setSelectedFormat('excel')}
                className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  selectedFormat === 'excel'
                    ? 'border-emerald-600 bg-emerald-500/10 shadow-xs'
                    : 'border-border/80 bg-card hover:border-border hover:bg-muted/20'
                }`}
              >
                <div>
                  <div className='size-10 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 flex items-center justify-center mb-2'>
                    <IconFileSpreadsheet size={22} />
                  </div>
                  <h5 className='font-bold text-foreground text-xs'>Microsoft Excel</h5>
                  <p className='text-[10px] text-muted-foreground mt-0.5'>Format .xlsx spreadsheet</p>
                </div>
                {selectedFormat === 'excel' && (
                  <span className='absolute top-3 right-3 size-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]'>
                    <IconCheck size={12} />
                  </span>
                )}
              </div>

              {/* Option 2: PDF */}
              <div
                onClick={() => setSelectedFormat('pdf')}
                className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  selectedFormat === 'pdf'
                    ? 'border-rose-600 bg-rose-500/10 shadow-xs'
                    : 'border-border/80 bg-card hover:border-border hover:bg-muted/20'
                }`}
              >
                <div>
                  <div className='size-10 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 flex items-center justify-center mb-2'>
                    <IconFileTypePdf size={22} />
                  </div>
                  <h5 className='font-bold text-foreground text-xs'>Dokumen PDF</h5>
                  <p className='text-[10px] text-muted-foreground mt-0.5'>Format .pdf siap cetak</p>
                </div>
                {selectedFormat === 'pdf' && (
                  <span className='absolute top-3 right-3 size-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px]'>
                    <IconCheck size={12} />
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className='p-4 px-6 border-t border-border/80 bg-muted/10 flex items-center justify-between'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => onOpenChange(false)}
            className='rounded-xl h-9 text-xs'
          >
            Batal
          </Button>

          <Button
            type='button'
            size='sm'
            onClick={handleDownload}
            className={`rounded-xl h-9 text-xs font-bold gap-1.5 shadow-xs text-white ${
              selectedFormat === 'excel'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-rose-600 hover:bg-rose-700'
            }`}
          >
            <IconDownload size={14} />
            Unduh Berkas {selectedFormat.toUpperCase()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
