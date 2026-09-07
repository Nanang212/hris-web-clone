// src/features/company/employee-information/pages/export-employee-information-page.tsx
import {
  IconDownload,
  IconHistory,
  IconRefresh,
  IconShieldLock,
} from '@tabler/icons-react'
import dayjs from 'dayjs'
import { useState } from 'react'

import {
  exportEmployeeData,
  INITIAL_EXPORT_COLUMNS,
  useEmployeeImportExportStore,
  type ExportColumnDefinition,
} from '@/features/company/employee-information/store/employee-import-export-store'
import { AppMain } from '@/shared/components/app-layout/app-main'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Checkbox } from '@/shared/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { snackbar } from '@/shared/lib/snackbar'

export function ExportEmployeeInformationPage() {
  const { exportHistory, addExportHistory, employees } = useEmployeeImportExportStore()

  // Filters State
  const [department, setDepartment] = useState('All Departments')
  const [status, setStatus] = useState('All Status')
  const [employmentType, setEmploymentType] = useState('All Types')
  const [joinDateStart, setJoinDateStart] = useState('2023-01-01')
  const [joinDateEnd, setJoinDateEnd] = useState('2024-05-31')
  const [position, setPosition] = useState('All Positions')
  const [location, setLocation] = useState('All Locations')

  // Columns Selection State
  const [columns, setColumns] = useState<ExportColumnDefinition[]>(INITIAL_EXPORT_COLUMNS)

  // Options State
  const [format, setFormat] = useState<'Excel' | 'CSV'>('Excel')
  const [scheduleType, setScheduleType] = useState<'now' | 'schedule'>('now')
  const [exporting, setExporting] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)

  const isAllSelected = columns.every((c) => c.checked)

  const toggleSelectAll = (checked: boolean) => {
    setColumns((prev) => prev.map((c) => ({ ...c, checked })))
  }

  const toggleColumn = (id: string) => {
    setColumns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, checked: !c.checked } : c)),
    )
  }

  const resetFilters = () => {
    setDepartment('All Departments')
    setStatus('All Status')
    setEmploymentType('All Types')
    setJoinDateStart('2023-01-01')
    setJoinDateEnd('2024-05-31')
    setPosition('All Positions')
    setLocation('All Locations')
    snackbar.info('Filters have been reset.')
  }

  const latestHistory = exportHistory[0]

  const handleExport = () => {
    const activeCols = columns.filter((c) => c.checked)
    if (activeCols.length === 0) {
      snackbar.error('Please select at least one column to export.')
      return
    }

    setExporting(true)

    setTimeout(() => {
      // Filter employees
      let filtered = [...employees]
      if (department !== 'All Departments') {
        filtered = filtered.filter((e) => e.department.toLowerCase() === department.toLowerCase())
      }
      if (status !== 'All Status') {
        filtered = filtered.filter((e) => e.status.toLowerCase() === status.toLowerCase())
      }
      if (employmentType !== 'All Types') {
        filtered = filtered.filter((e) => e.employmentType.toLowerCase() === employmentType.toLowerCase())
      }

      const fileName = `Employee_Export_${dayjs().format('MMM_YYYY')}`

      // Trigger actual file generation and download
      exportEmployeeData({
        employees: filtered.length > 0 ? filtered : employees,
        selectedColumns: columns,
        format,
        fileName,
      })

      // Record in history
      const filterSummary = `${department}, ${status}`
      addExportHistory({
        fileName: `${fileName}.${format === 'Excel' ? 'xlsx' : 'csv'}`,
        filters: filterSummary,
        format,
        columnsCount: activeCols.length,
        exportedBy: 'Rama Aditya',
        status: 'Completed',
      })

      setExporting(false)
      snackbar.success(`Successfully exported ${activeCols.length} columns in ${format} format!`)
    }, 600)
  }

  const renderCategoryCard = (
    title: string,
    category: ExportColumnDefinition['category'],
  ) => {
    const categoryCols = columns.filter((c) => c.category === category)
    return (
      <div className='rounded-xl border bg-card p-4 shadow-xs'>
        <h4 className='mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
          {title}
        </h4>
        <div className='flex flex-col gap-2.5'>
          {categoryCols.map((col) => (
            <label
              key={col.id}
              className='flex cursor-pointer items-center gap-2.5 text-xs text-foreground transition-colors hover:text-primary'
            >
              <Checkbox
                checked={col.checked}
                onCheckedChange={() => toggleColumn(col.id)}
                className='size-4'
              />
              <span className={col.checked ? 'font-medium' : 'text-muted-foreground'}>
                {col.label}
              </span>
            </label>
          ))}
        </div>
      </div>
    )
  }

  return (
    <AppMain
      breadcrumbs={[
        { to: '/company/employee-info', label: 'Employee Information' },
        { to: '.', label: 'Export Employee Data' },
      ]}
      backTo='/company/employee-info'
      title='Export Employee Data'
      subtitle='Export employee data based on your selected filters and preferences.'
      actions={
        <Button
          variant='outline'
          size='sm'
          onClick={() => setHistoryOpen(true)}
          className='gap-1.5'
        >
          <IconHistory className='size-4 text-primary' />
          Export History
        </Button>
      }
    >
      <div className='mx-auto flex max-w-6xl flex-col gap-6 pb-12'>
        {/* ─── SECTION 1: FILTERS ────────────────────────────────────────── */}
        <Card className='rounded-2xl border shadow-xs'>
          <CardHeader className='pb-3'>
            <div className='flex items-center gap-2.5'>
              <div className='flex size-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white'>
                1
              </div>
              <CardTitle className='text-base font-semibold'>Filters</CardTitle>
            </div>
            <p className='text-xs text-muted-foreground'>
              Set the criteria to filter employees you want to export.
            </p>
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
              <div className='flex flex-col gap-1.5'>
                <Label htmlFor='exp-dept' className='text-xs font-medium'>
                  Department
                </Label>
                <select
                  id='exp-dept'
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className='flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-xs shadow-xs focus:outline-none focus:ring-2 focus:ring-ring'
                >
                  <option>All Departments</option>
                  <option>Product Design</option>
                  <option>Engineering</option>
                  <option>Finance</option>
                  <option>HR</option>
                  <option>Marketing</option>
                  <option>Operations</option>
                </select>
              </div>

              <div className='flex flex-col gap-1.5'>
                <Label htmlFor='exp-status' className='text-xs font-medium'>
                  Status
                </Label>
                <select
                  id='exp-status'
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className='flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-xs shadow-xs focus:outline-none focus:ring-2 focus:ring-ring'
                >
                  <option>All Status</option>
                  <option>Active</option>
                  <option>On Leave</option>
                  <option>Probation</option>
                  <option>Resigned</option>
                  <option>Inactive</option>
                </select>
              </div>

              <div className='flex flex-col gap-1.5'>
                <Label htmlFor='exp-type' className='text-xs font-medium'>
                  Employment Type
                </Label>
                <select
                  id='exp-type'
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                  className='flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-xs shadow-xs focus:outline-none focus:ring-2 focus:ring-ring'
                >
                  <option>All Types</option>
                  <option>Permanent</option>
                  <option>Contract</option>
                  <option>Internship</option>
                  <option>Freelance</option>
                </select>
              </div>

              <div className='flex flex-col gap-1.5'>
                <Label className='text-xs font-medium'>Join Date Range</Label>
                <div className='flex items-center gap-1.5'>
                  <Input
                    type='date'
                    value={joinDateStart}
                    onChange={(e) => setJoinDateStart(e.target.value)}
                    className='h-9 text-xs'
                  />
                  <span className='text-xs text-muted-foreground'>→</span>
                  <Input
                    type='date'
                    value={joinDateEnd}
                    onChange={(e) => setJoinDateEnd(e.target.value)}
                    className='h-9 text-xs'
                  />
                </div>
              </div>
            </div>

            <div className='flex flex-wrap items-center justify-between border-t pt-3'>
              <div className='flex items-center gap-4 text-xs text-muted-foreground'>
                <span className='font-semibold text-foreground'>Additional Filters:</span>
                <span>Position: {position}</span>
                <span>•</span>
                <span>Location: {location}</span>
              </div>
              <button
                type='button'
                onClick={resetFilters}
                className='inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline dark:text-blue-400'
              >
                <IconRefresh className='size-3.5' />
                Reset Filters
              </button>
            </div>
          </CardContent>
        </Card>

        {/* ─── SECTION 2: SELECT COLUMNS ─────────────────────────────────── */}
        <Card className='rounded-2xl border shadow-xs'>
          <CardHeader className='pb-3'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2.5'>
                <div className='flex size-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white'>
                  2
                </div>
                <div>
                  <CardTitle className='text-base font-semibold'>Select Columns</CardTitle>
                  <p className='text-xs text-muted-foreground'>
                    Choose the data columns you want to include in the export file.
                  </p>
                </div>
              </div>
              <label className='flex cursor-pointer items-center gap-2 text-xs font-medium text-foreground hover:text-primary'>
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={(v) => toggleSelectAll(Boolean(v))}
                />
                Select All
              </label>
            </div>
          </CardHeader>
          <CardContent>
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
              {renderCategoryCard('Profile', 'profile')}
              {renderCategoryCard('Personal', 'personal')}
              {renderCategoryCard('Employment', 'employment')}
              {renderCategoryCard('Status', 'status')}
              {renderCategoryCard('Bank', 'bank')}
              {renderCategoryCard('NPWP', 'npwp')}
              {renderCategoryCard('BPJS', 'bpjs')}
              {renderCategoryCard('Documents', 'documents')}
            </div>
          </CardContent>
        </Card>

        {/* ─── SECTION 3 & 4: FORMAT, SCHEDULE & PRIVACY ──────────────────── */}
        <div className='grid gap-4 lg:grid-cols-3'>
          {/* Section 3: File Format */}
          <Card className='rounded-2xl border shadow-xs'>
            <CardHeader className='pb-3'>
              <div className='flex items-center gap-2.5'>
                <div className='flex size-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white'>
                  3
                </div>
                <CardTitle className='text-sm font-semibold'>File Format</CardTitle>
              </div>
            </CardHeader>
            <CardContent className='flex flex-col gap-2.5'>
              <label
                onClick={() => setFormat('Excel')}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all ${
                  format === 'Excel'
                    ? 'border-blue-600 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-950/20'
                    : 'border-border hover:bg-muted/40'
                }`}
              >
                <div
                  className={`flex size-4 items-center justify-center rounded-full border ${
                    format === 'Excel' ? 'border-blue-600 bg-blue-600' : 'border-muted-foreground'
                  }`}
                >
                  {format === 'Excel' && <div className='size-1.5 rounded-full bg-white' />}
                </div>
                <div>
                  <p className='text-xs font-semibold text-foreground'>Excel (.xlsx)</p>
                  <p className='text-[11px] text-muted-foreground'>Standard formatted spreadsheet</p>
                </div>
              </label>

              <label
                onClick={() => setFormat('CSV')}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all ${
                  format === 'CSV'
                    ? 'border-blue-600 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-950/20'
                    : 'border-border hover:bg-muted/40'
                }`}
              >
                <div
                  className={`flex size-4 items-center justify-center rounded-full border ${
                    format === 'CSV' ? 'border-blue-600 bg-blue-600' : 'border-muted-foreground'
                  }`}
                >
                  {format === 'CSV' && <div className='size-1.5 rounded-full bg-white' />}
                </div>
                <div>
                  <p className='text-xs font-semibold text-foreground'>CSV (.csv)</p>
                  <p className='text-[11px] text-muted-foreground'>Best for analysis and reporting</p>
                </div>
              </label>
            </CardContent>
          </Card>

          {/* Section 4: Schedule Export */}
          <Card className='rounded-2xl border shadow-xs'>
            <CardHeader className='pb-3'>
              <div className='flex items-center gap-2.5'>
                <div className='flex size-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white'>
                  4
                </div>
                <CardTitle className='text-sm font-semibold'>Schedule Export (Optional)</CardTitle>
              </div>
            </CardHeader>
            <CardContent className='flex flex-col gap-2.5'>
              <label
                onClick={() => setScheduleType('now')}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all ${
                  scheduleType === 'now'
                    ? 'border-blue-600 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-950/20'
                    : 'border-border hover:bg-muted/40'
                }`}
              >
                <div
                  className={`flex size-4 items-center justify-center rounded-full border ${
                    scheduleType === 'now' ? 'border-blue-600 bg-blue-600' : 'border-muted-foreground'
                  }`}
                >
                  {scheduleType === 'now' && <div className='size-1.5 rounded-full bg-white' />}
                </div>
                <div>
                  <p className='text-xs font-semibold text-foreground'>Export Now</p>
                  <p className='text-[11px] text-muted-foreground'>Generate and download immediately</p>
                </div>
              </label>

              <label
                onClick={() => setScheduleType('schedule')}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all ${
                  scheduleType === 'schedule'
                    ? 'border-blue-600 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-950/20'
                    : 'border-border hover:bg-muted/40'
                }`}
              >
                <div
                  className={`flex size-4 items-center justify-center rounded-full border ${
                    scheduleType === 'schedule' ? 'border-blue-600 bg-blue-600' : 'border-muted-foreground'
                  }`}
                >
                  {scheduleType === 'schedule' && <div className='size-1.5 rounded-full bg-white' />}
                </div>
                <div>
                  <p className='text-xs font-semibold text-foreground'>Schedule Export</p>
                  <p className='text-[11px] text-muted-foreground'>Deliver periodic report to email</p>
                </div>
              </label>
            </CardContent>
          </Card>

          {/* Privacy & Data Security Notice */}
          <Card className='rounded-2xl border border-blue-100 bg-blue-50/40 p-5 shadow-xs dark:border-blue-900/40 dark:bg-blue-950/20'>
            <div className='flex items-start gap-3'>
              <div className='flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'>
                <IconShieldLock className='size-5' />
              </div>
              <div className='flex flex-col gap-1'>
                <h4 className='text-sm font-semibold text-blue-950 dark:text-blue-300'>
                  Privacy & Data Security
                </h4>
                <p className='text-xs text-blue-800/80 dark:text-blue-400/80'>
                  Exported data follows your organization's data privacy policies. Sensitive fields are included based on your column selection and access level.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* ─── BOTTOM ROW: EXPORT HISTORY SUMMARY & EXPORT BUTTON ────────── */}
        <div className='flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between'>
          {latestHistory ? (
            <div className='flex flex-wrap items-center gap-x-6 gap-y-2 text-xs'>
              <div>
                <p className='text-[11px] text-muted-foreground'>Export History (Latest)</p>
                <p className='font-semibold text-foreground'>{latestHistory.fileName}</p>
              </div>
              <div>
                <p className='text-[11px] text-muted-foreground'>Filters</p>
                <p className='text-foreground'>{latestHistory.filters}</p>
              </div>
              <div>
                <p className='text-[11px] text-muted-foreground'>Format</p>
                <p className='text-foreground'>{latestHistory.format}</p>
              </div>
              <div>
                <p className='text-[11px] text-muted-foreground'>Columns</p>
                <p className='text-foreground'>{latestHistory.columnsCount}</p>
              </div>
              <div>
                <p className='text-[11px] text-muted-foreground'>Exported By</p>
                <p className='text-foreground'>{latestHistory.exportedBy}</p>
              </div>
              <div>
                <p className='text-[11px] text-muted-foreground'>Date</p>
                <p className='text-foreground'>{latestHistory.date}</p>
              </div>
              <div>
                <p className='text-[11px] text-muted-foreground'>Status</p>
                <Badge variant='emerald' className='text-[10px]'>
                  {latestHistory.status}
                </Badge>
              </div>
            </div>
          ) : (
            <p className='text-xs text-muted-foreground'>No previous export records found.</p>
          )}

          <Button
            size='lg'
            onClick={handleExport}
            disabled={exporting}
            className='gap-2 bg-blue-600 px-6 font-semibold text-white shadow-sm hover:bg-blue-700 dark:bg-blue-600'
          >
            <IconDownload className='size-4.5' />
            {exporting ? 'Exporting…' : 'Export Data'}
          </Button>
        </div>
      </div>

      {/* ─── EXPORT HISTORY DIALOG ────────────────────────────────────────── */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className='max-h-[85vh] overflow-y-auto sm:max-w-3xl'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <IconHistory className='size-5 text-primary' />
              Export History
            </DialogTitle>
            <DialogDescription>
              All employee data files previously exported from the system.
            </DialogDescription>
          </DialogHeader>

          <div className='overflow-auto rounded-xl border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Filters</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Cols</TableHead>
                  <TableHead>Exported By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exportHistory.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell className='font-medium text-foreground'>{h.fileName}</TableCell>
                    <TableCell className='text-xs text-muted-foreground'>{h.filters}</TableCell>
                    <TableCell>
                      <Badge variant='outline' className='text-[10px]'>
                        {h.format}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-xs'>{h.columnsCount}</TableCell>
                    <TableCell className='text-xs'>{h.exportedBy}</TableCell>
                    <TableCell className='text-xs'>{h.date}</TableCell>
                    <TableCell>
                      <Badge variant='emerald' className='text-[10px]'>
                        {h.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </AppMain>
  )
}
