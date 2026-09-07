import {
  IconCalendar,
  IconDownload,
  IconFileSpreadsheet,
  IconFileTypePdf,
  IconFilter,
  IconRotate2,
  IconSearch,
} from '@tabler/icons-react'
import { useState } from 'react'
import { ExportReportDialog } from './export-report-dialog'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { mockDepartments } from '../data/mock-report-data'
import type { ReportFilterCriteria } from '../types'

export interface ReportFilterBarProps {
  reportTitle: string
  filters: ReportFilterCriteria
  onFilterChange: (filters: ReportFilterCriteria) => void
  onReset: () => void
  showDepartmentFilter?: boolean
  searchPlaceholder?: string
  exportHeaders?: string[]
  exportRows?: (string | number)[][]
}

export function ReportFilterBar({
  reportTitle,
  filters,
  onFilterChange,
  onReset,
  showDepartmentFilter = true,
  searchPlaceholder = 'Cari data laporan...',
  exportHeaders,
  exportRows,
}: ReportFilterBarProps) {
  const [exportDialogOpen, setExportDialogOpen] = useState(false)

  const handlePresetChange = (preset: ReportFilterCriteria['datePreset']) => {
    let startDate = ''
    let endDate = ''

    if (preset === 'this_month') {
      startDate = '2026-08-01'
      endDate = '2026-08-31'
    } else if (preset === 'last_month') {
      startDate = '2026-07-01'
      endDate = '2026-07-31'
    } else if (preset === 'this_quarter') {
      startDate = '2026-07-01'
      endDate = '2026-09-30'
    } else if (preset === 'this_year') {
      startDate = '2026-01-01'
      endDate = '2026-12-31'
    }

    onFilterChange({
      ...filters,
      datePreset: preset,
      startDate,
      endDate,
    })
  }

  return (
    <>
      <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs space-y-3'>
        {/* Main Toolbar Line */}
        <div className='flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3'>
          {/* Left: Search input & Department filter */}
          <div className='flex flex-wrap items-center gap-2.5 flex-1 min-w-0'>
            {/* Search Input */}
            <div className='relative flex-1 min-w-[220px]'>
              <IconSearch
                size={14}
                className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'
              />
              <Input
                value={filters.searchQuery}
                onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
                placeholder={searchPlaceholder}
                className='h-9 pl-9 text-xs bg-background rounded-xl w-full'
              />
            </div>

            {/* Department Filter */}
            {showDepartmentFilter && (
              <div className='w-full sm:w-56 shrink-0'>
                <Select
                  value={filters.department}
                  onValueChange={(val) => onFilterChange({ ...filters, department: val })}
                >
                  <SelectTrigger className='h-9 text-xs w-full rounded-xl bg-background'>
                    <SelectValue placeholder='Departemen' />
                  </SelectTrigger>
                  <SelectContent>
                    {mockDepartments.map((dept) => (
                      <SelectItem key={dept} value={dept === 'All Departments' ? 'all' : dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Right: Export Button */}
          <div className='flex items-center gap-2 shrink-0'>
            <Button
              type='button'
              size='sm'
              onClick={() => setExportDialogOpen(true)}
              className='rounded-xl h-9 text-xs font-bold gap-1.5 shadow-xs bg-primary hover:bg-primary/90 text-primary-foreground'
            >
              <IconDownload size={14} />
              Export Laporan
            </Button>
          </div>
        </div>

        {/* Date Filters Line (Cleanly integrated in bottom toolbar) */}
        <div className='pt-2 border-t border-border/60 flex flex-wrap items-center justify-between gap-2.5'>
          <div className='flex flex-wrap items-center gap-2.5'>
            {/* Date Preset Selector */}
            <div className='w-full sm:w-48 shrink-0'>
              <Select
                value={filters.datePreset}
                onValueChange={(val: any) => handlePresetChange(val)}
              >
                <SelectTrigger className='h-8 text-xs w-full rounded-xl bg-muted/30 border-border/70'>
                  <IconCalendar size={13} className='mr-1.5 text-muted-foreground' />
                  <SelectValue placeholder='Periode Waktu' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='this_month'>Bulan Ini (Agu 2026)</SelectItem>
                  <SelectItem value='last_month'>Bulan Lalu (Jul 2026)</SelectItem>
                  <SelectItem value='this_quarter'>Kuartal Ini (Q3 2026)</SelectItem>
                  <SelectItem value='this_year'>Tahun Berjalan (2026)</SelectItem>
                  <SelectItem value='custom'>Kustom Rentang Tanggal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Custom Date Pickers */}
            <div className='flex items-center gap-1.5 bg-muted/30 p-1 px-2.5 rounded-xl border border-border/70'>
              <span className='text-[11px] text-muted-foreground font-semibold'>Dari:</span>
              <input
                type='date'
                value={filters.startDate || ''}
                onChange={(e) =>
                  onFilterChange({ ...filters, startDate: e.target.value, datePreset: 'custom' })
                }
                className='text-xs bg-transparent text-foreground border-none outline-none cursor-pointer'
              />
              <span className='text-[11px] text-muted-foreground font-semibold ml-1.5'>s/d:</span>
              <input
                type='date'
                value={filters.endDate || ''}
                onChange={(e) =>
                  onFilterChange({ ...filters, endDate: e.target.value, datePreset: 'custom' })
                }
                className='text-xs bg-transparent text-foreground border-none outline-none cursor-pointer'
              />
            </div>
          </div>

          {/* Reset Filter Button */}
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={onReset}
            className='rounded-xl h-8 text-xs text-muted-foreground hover:text-foreground gap-1 px-2.5'
            title='Reset Filter'
          >
            <IconRotate2 size={13} />
            <span>Reset Filter</span>
          </Button>
        </div>
      </div>

      {/* Export Format Dialog (Modal) */}
      <ExportReportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        reportTitle={reportTitle}
        filters={filters}
        headers={exportHeaders}
        rows={exportRows}
      />
    </>
  )
}
