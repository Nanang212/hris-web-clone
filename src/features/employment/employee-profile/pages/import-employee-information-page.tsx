// src/features/employment/employee-profile/pages/import-employee-information-page.tsx
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconCircleCheck,
  IconDownload,
  IconEye,
  IconFileSpreadsheet,
  IconHistory,
  IconInfoCircle,
  IconLoader2,
  IconUpload,
  IconUsers,
  IconX,
} from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import { useId, useRef, useState } from 'react'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
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
  downloadBlankEmployeeTemplate,
  downloadExistingEmployeeTemplate,
  parseAndValidateEmployeeFile,
  useEmployeeImportExportStore,
  type ImportErrorItem,
  type ImportPreviewRow,
  type ValidationSummary,
} from '@/features/employment/employee-profile/store/employee-import-export-store'

export function ImportEmployeeInformationPage() {
  const navigate = useNavigate()
  const fileInputId = useId()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { employees, importHistory, addImportHistory, bulkInsertEmployees, bulkUpdateEmployees } =
    useEmployeeImportExportStore()

  // Mode: 'create' for new employees, 'bulk_update' for updating existing employees
  const [mode, setMode] = useState<'create' | 'bulk_update'>('create')

  // Upload & File state
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)

  // Validation results - empty until file is uploaded
  const [summary, setSummary] = useState<ValidationSummary>({
    totalRows: 0,
    validRows: 0,
    warningRows: 0,
    errorRows: 0,
  })

  const [errors, setErrors] = useState<ImportErrorItem[]>([])
  const [previewRows, setPreviewRows] = useState<ImportPreviewRow[]>([])
  const [rawValidRows, setRawValidRows] = useState<typeof employees>([])

  // Modal dialogs
  const [historyOpen, setHistoryOpen] = useState(false)
  const [allErrorsOpen, setAllErrorsOpen] = useState(false)
  const [allRulesOpen, setAllRulesOpen] = useState(false)
  const [docPreviewOpen, setDocPreviewOpen] = useState(false)

  const handleDownloadTemplate = () => {
    if (mode === 'create') {
      downloadBlankEmployeeTemplate()
      snackbar.success('Blank template downloaded! Fill in new employee data and re-upload.')
    } else {
      downloadExistingEmployeeTemplate(employees)
      snackbar.success(
        'Template pre-filled with existing employee data downloaded! Edit desired fields and re-upload.',
      )
    }
  }

  const handleModeChange = async (newMode: 'create' | 'bulk_update') => {
    setMode(newMode)
    if (file) {
      setUploading(true)
      try {
        const result = await parseAndValidateEmployeeFile(file, newMode, employees)
        setSummary(result.summary)
        setErrors(result.errors)
        setPreviewRows(result.previewRows)
        setRawValidRows(result.rawValidRows)
      } finally {
        setUploading(false)
      }
    }
  }

  const handleProcessFile = async (uploadedFile: File) => {
    setFile(uploadedFile)
    setUploading(true)

    try {
      const result = await parseAndValidateEmployeeFile(uploadedFile, mode, employees)
      setSummary(result.summary)
      setErrors(result.errors)
      setPreviewRows(result.previewRows)
      setRawValidRows(result.rawValidRows)
      snackbar.info(
        `File loaded: ${uploadedFile.name} (${result.summary.totalRows} rows). Review preview below and click Import Data to execute.`,
      )
    } catch {
      snackbar.error('Failed to parse spreadsheet. Please ensure format is valid (.xlsx or .csv).')
      setFile(null)
    } finally {
      setUploading(false)
    }
  }

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) void handleProcessFile(droppedFile)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) void handleProcessFile(selectedFile)
  }

  const handleRemoveFile = () => {
    setFile(null)
    setSummary({ totalRows: 0, validRows: 0, warningRows: 0, errorRows: 0 })
    setErrors([])
    setPreviewRows([])
    setRawValidRows([])
    if (fileInputRef.current) fileInputRef.current.value = ''
    snackbar.info('Uploaded file removed.')
  }

  const handleExecuteImport = () => {
    if (!file || summary.validRows === 0) {
      snackbar.error('No valid rows available to import. Please upload a spreadsheet first.')
      return
    }

    setImporting(true)
    setTimeout(() => {
      if (mode === 'create') {
        if (rawValidRows.length > 0) bulkInsertEmployees(rawValidRows)
        snackbar.success(`Successfully registered ${summary.validRows} new employees!`)
      } else {
        if (rawValidRows.length > 0) bulkUpdateEmployees(rawValidRows)
        snackbar.success(`Successfully updated ${summary.validRows} existing employee records!`)
      }

      addImportHistory({
        fileName: file.name,
        importedBy: 'Rama Aditya',
        status: summary.errorRows === 0 ? 'Completed' : 'Partial',
        totalRows: summary.totalRows,
        validRows: summary.validRows,
        errorRows: summary.errorRows,
        mode,
      })

      setImporting(false)
      void navigate({ to: '/employment/employee-profile' })
    }, 700)
  }

  return (
    <AppMain
      breadcrumbs={[
        { to: '/employment/employee-profile', label: 'Employee Information' },
        { to: '.', label: 'Import Employee Data' },
      ]}
      backTo='/employment/employee-profile'
      title='Import Employee Data'
      subtitle='Import employee data in bulk using Excel or CSV file.'
      actions={
        <Button
          variant='outline'
          size='sm'
          onClick={() => setHistoryOpen(true)}
          className='gap-1.5'
        >
          <IconHistory className='size-4 text-primary' />
          Import History
        </Button>
      }
    >
      <div className='mx-auto flex max-w-6xl flex-col gap-6 pb-12'>
        {/* ─── MODE SELECTOR (BULK INSERT VS BULK UPDATE) ─────────────────── */}
        <div className='flex flex-col gap-2 rounded-2xl border bg-card p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex flex-col gap-0.5'>
            <h3 className='text-sm font-semibold text-foreground'>
              {mode === 'create'
                ? 'Bulk Insert (Create New Employees)'
                : 'Bulk Update (Update Existing Employees)'}
            </h3>
            <p className='text-xs text-muted-foreground'>
              {mode === 'create'
                ? 'Register multiple new employee records at once using a blank template.'
                : 'Download template pre-filled with existing employee data, edit values in Excel, and re-upload to update.'}
            </p>
          </div>

          <div className='flex items-center rounded-xl bg-muted p-1'>
            <button
              type='button'
              onClick={() => void handleModeChange('create')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                mode === 'create'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Create New
            </button>
            <button
              type='button'
              onClick={() => void handleModeChange('bulk_update')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                mode === 'bulk_update'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Bulk Update
            </button>
          </div>
        </div>

        {/* ─── TOP 2-COLUMN GRID (LEFT: UPLOAD & ERRORS, RIGHT: SUMMARY & HISTORY) ─── */}
        <div className='grid gap-6 lg:grid-cols-12'>
          {/* LEFT COLUMN (7 COLS) */}
          <div className='flex flex-col gap-6 lg:col-span-7'>
            {/* Section 1: Upload File */}
            <Card className='rounded-2xl border shadow-xs'>
              <CardHeader className='pb-3'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2.5'>
                    <div className='flex size-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white'>
                      1
                    </div>
                    <CardTitle className='text-base font-semibold'>Upload File</CardTitle>
                  </div>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={handleDownloadTemplate}
                    className='h-8 gap-1.5 text-xs'
                  >
                    <IconDownload className='size-3.5' />
                    Download Template
                  </Button>
                </div>
                <p className='text-xs text-muted-foreground'>
                  {mode === 'create'
                    ? 'Upload your employee data file. Please ensure the file follows the template format.'
                    : 'Upload modified template. Matching is performed by Employee ID.'}
                </p>
              </CardHeader>
              <CardContent className='flex flex-col gap-3'>
                {/* Drag and drop box */}
                <label
                  htmlFor={fileInputId}
                  onDragOver={(e) => {
                    e.preventDefault()
                    setIsDragOver(true)
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleFileDrop}
                  className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-8 transition-all ${
                    isDragOver
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/20'
                      : 'border-border hover:border-blue-400 hover:bg-muted/30'
                  }`}
                >
                  <div className='flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400'>
                    {uploading ? (
                      <IconLoader2 className='size-6 animate-spin' />
                    ) : (
                      <IconUpload className='size-6' />
                    )}
                  </div>
                  <div className='text-center'>
                    <p className='text-xs font-medium text-foreground'>
                      Drag and drop your file here
                    </p>
                    <p className='text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400'>
                      or click to browse
                    </p>
                  </div>
                  <p className='text-[11px] text-muted-foreground'>
                    Supported file types: .xlsx, .xls, .csv (Max. 10MB)
                  </p>
                  <input
                    ref={fileInputRef}
                    id={fileInputId}
                    type='file'
                    accept='.xlsx,.xls,.csv'
                    className='sr-only'
                    onChange={handleFileInputChange}
                  />
                </label>

                {/* Uploaded File Pill Card - Shown only when file is selected */}
                {file && (
                  <div className='flex items-center justify-between gap-3 rounded-2xl border bg-muted/20 p-3'>
                    <div className='flex min-w-0 items-center gap-3'>
                      <div className='flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'>
                        <IconFileSpreadsheet className='size-5' />
                      </div>
                      <div className='min-w-0'>
                        <p className='truncate text-xs font-semibold text-foreground'>
                          {file.name}
                        </p>
                        <p className='text-[11px] text-muted-foreground'>
                          {Math.ceil(file.size / 1024)} KB • Uploaded just now
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center gap-1.5'>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => setDocPreviewOpen(true)}
                        className='h-7 gap-1 px-2 text-xs'
                      >
                        <IconEye className='size-3.5 text-primary' />
                        Preview
                      </Button>
                      <button
                        type='button'
                        onClick={handleRemoveFile}
                        className='inline-flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive'
                        title='Remove file'
                      >
                        <IconX className='size-4' />
                      </button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Section 2: Error Details */}
            <Card className='rounded-2xl border shadow-xs'>
              <CardHeader className='pb-3'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2.5'>
                    <div className='flex size-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white'>
                      2
                    </div>
                    <CardTitle className='text-base font-semibold'>Error Details</CardTitle>
                  </div>
                  {file && summary.errorRows > 0 ? (
                    <Badge variant='destructive' className='text-[11px]'>
                      {summary.errorRows} rows
                    </Badge>
                  ) : file ? (
                    <Badge variant='emerald' className='text-[11px]'>
                      0 errors
                    </Badge>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent className='flex flex-col gap-3'>
                {!file ? (
                  <div className='flex flex-col items-center justify-center py-6 text-center text-muted-foreground'>
                    <IconFileSpreadsheet className='mb-2 size-8 opacity-40' />
                    <p className='text-xs font-medium'>No file uploaded yet</p>
                    <p className='text-[11px]'>
                      Upload a spreadsheet above to view error breakdown and validation checks.
                    </p>
                  </div>
                ) : errors.length === 0 ? (
                  <div className='flex flex-col items-center justify-center py-6 text-center text-emerald-600 dark:text-emerald-400'>
                    <IconCircleCheck className='mb-2 size-8' />
                    <p className='text-xs font-semibold'>All records valid!</p>
                    <p className='text-[11px] text-muted-foreground'>
                      No formatting or data errors found. All {summary.validRows} rows are ready to
                      be imported.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className='overflow-auto rounded-xl border'>
                      <Table>
                        <TableHeader>
                          <TableRow className='text-xs'>
                            <TableHead className='w-14'>Row</TableHead>
                            <TableHead>Column</TableHead>
                            <TableHead>Error Message</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead>Solution</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {errors.slice(0, 5).map((err, idx) => (
                            <TableRow key={idx} className='text-xs'>
                              <TableCell className='font-medium text-foreground'>
                                {err.row}
                              </TableCell>
                              <TableCell className='font-semibold text-foreground'>
                                {err.column}
                              </TableCell>
                              <TableCell className='text-red-600 dark:text-red-400'>
                                {err.errorMessage}
                              </TableCell>
                              <TableCell className='font-mono text-[11px] text-muted-foreground'>
                                {err.value}
                              </TableCell>
                              <TableCell className='text-muted-foreground'>
                                {err.solution}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div className='flex justify-end'>
                      <button
                        type='button'
                        onClick={() => setAllErrorsOpen(true)}
                        className='text-xs font-medium text-blue-600 hover:underline dark:text-blue-400'
                      >
                        View all errors ›
                      </button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN (5 COLS) */}
          <div className='flex flex-col gap-6 lg:col-span-5'>
            {/* Validation Summary Card */}
            <Card className='rounded-2xl border shadow-xs'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-base font-semibold'>Validation Summary</CardTitle>
              </CardHeader>
              <CardContent className='flex flex-col gap-4'>
                <div className='grid grid-cols-2 gap-3'>
                  {/* Total Rows */}
                  <div className='flex items-center justify-between rounded-2xl border bg-card p-3.5 shadow-xs'>
                    <div>
                      <p className='text-[11px] text-muted-foreground'>Total Rows</p>
                      <p className='text-xl font-bold text-foreground'>
                        {summary.totalRows.toLocaleString()}
                      </p>
                    </div>
                    <div className='flex size-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400'>
                      <IconUsers className='size-5' />
                    </div>
                  </div>

                  {/* Valid Rows */}
                  <div className='flex items-center justify-between rounded-2xl border bg-emerald-50/40 p-3.5 shadow-xs dark:bg-emerald-950/20'>
                    <div>
                      <p className='text-[11px] text-emerald-700 dark:text-emerald-400'>
                        Valid Rows
                      </p>
                      <p className='text-xl font-bold text-emerald-600 dark:text-emerald-400'>
                        {summary.validRows.toLocaleString()}
                      </p>
                    </div>
                    <div className='flex size-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/60 dark:text-emerald-300'>
                      <IconCircleCheck className='size-5' />
                    </div>
                  </div>

                  {/* Warning Rows */}
                  <div className='flex items-center justify-between rounded-2xl border bg-amber-50/40 p-3.5 shadow-xs dark:bg-amber-950/20'>
                    <div>
                      <p className='text-[11px] text-amber-700 dark:text-amber-400'>Warning Rows</p>
                      <p className='text-xl font-bold text-amber-600 dark:text-amber-400'>
                        {summary.warningRows}
                      </p>
                    </div>
                    <div className='flex size-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/60 dark:text-amber-300'>
                      <IconAlertTriangle className='size-5' />
                    </div>
                  </div>

                  {/* Error Rows */}
                  <div className='flex items-center justify-between rounded-2xl border bg-rose-50/40 p-3.5 shadow-xs dark:bg-rose-950/20'>
                    <div>
                      <p className='text-[11px] text-rose-700 dark:text-rose-400'>Error Rows</p>
                      <p className='text-xl font-bold text-rose-600 dark:text-rose-400'>
                        {summary.errorRows}
                      </p>
                    </div>
                    <div className='flex size-9 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-900/60 dark:text-rose-300'>
                      <IconAlertCircle className='size-5' />
                    </div>
                  </div>
                </div>

                {/* Validation Rules Checklist */}
                <div className='rounded-xl border bg-muted/20 p-3.5'>
                  <p className='text-xs font-semibold text-foreground'>Validation Rules</p>
                  <ul className='mt-2 space-y-1.5 text-xs text-muted-foreground'>
                    <li className='flex items-center gap-2'>
                      <span className='size-1.5 rounded-full bg-blue-600' />
                      Required fields must be filled
                    </li>
                    <li className='flex items-center gap-2'>
                      <span className='size-1.5 rounded-full bg-blue-600' />
                      Email must be valid format
                    </li>
                    <li className='flex items-center gap-2'>
                      <span className='size-1.5 rounded-full bg-blue-600' />
                      NPWP must be 15–16 digit number
                    </li>
                    <li className='flex items-center gap-2'>
                      <span className='size-1.5 rounded-full bg-blue-600' />
                      Phone number must be valid
                    </li>
                    <li className='flex items-center gap-2'>
                      <span className='size-1.5 rounded-full bg-blue-600' />
                      Join Date must be a valid date
                    </li>
                    <li className='flex items-center gap-2'>
                      <span className='size-1.5 rounded-full bg-blue-600' />
                      No duplicate Email, NIK, or Employee ID
                    </li>
                  </ul>
                  <div className='mt-2.5 text-right'>
                    <button
                      type='button'
                      onClick={() => setAllRulesOpen(true)}
                      className='text-xs font-medium text-blue-600 hover:underline dark:text-blue-400'
                    >
                      View all history ›
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Import History (Latest) Card */}
            <Card className='rounded-2xl border shadow-xs'>
              <CardHeader className='pb-3'>
                <div className='flex items-center justify-between'>
                  <CardTitle className='text-base font-semibold'>Import History (Latest)</CardTitle>
                  <button
                    type='button'
                    onClick={() => setHistoryOpen(true)}
                    className='text-xs font-medium text-blue-600 hover:underline dark:text-blue-400'
                  >
                    View all history ›
                  </button>
                </div>
              </CardHeader>
              <CardContent className='flex flex-col gap-3'>
                {importHistory.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className='flex items-center justify-between rounded-xl border p-3 text-xs shadow-xs'
                  >
                    <div className='min-w-0'>
                      <p className='truncate font-semibold text-foreground'>{item.fileName}</p>
                      <p className='text-[11px] text-muted-foreground'>
                        Imported by {item.importedBy}
                      </p>
                    </div>
                    <div className='text-right'>
                      <Badge variant='emerald' className='text-[10px]'>
                        {item.status}
                      </Badge>
                      <p className='mt-1 text-[11px] text-muted-foreground'>
                        {item.validRows.toLocaleString()} / {item.totalRows.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ─── SECTION 3: PREVIEW (FIRST 10 ROWS) ─────────────────────────── */}
        <Card className='rounded-2xl border shadow-xs'>
          <CardHeader className='pb-3'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2.5'>
                <div className='flex size-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white'>
                  3
                </div>
                <div>
                  <CardTitle className='text-base font-semibold'>Preview (First 10 rows)</CardTitle>
                  <p className='text-xs text-muted-foreground'>
                    Preview of parsed data rows ready for import.
                  </p>
                </div>
              </div>
              {file && previewRows.length > 0 && (
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => setDocPreviewOpen(true)}
                  className='h-8 gap-1.5 text-xs'
                >
                  <IconEye className='size-3.5 text-primary' />
                  Full Document Preview
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!file || previewRows.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-10 text-center text-muted-foreground'>
                <IconFileSpreadsheet className='mb-2 size-10 opacity-30' />
                <p className='text-sm font-medium'>No Data to Preview</p>
                <p className='text-xs'>
                  Upload an Excel or CSV file to inspect data rows before importing.
                </p>
              </div>
            ) : (
              <div className='overflow-auto rounded-xl border'>
                <Table>
                  <TableHeader>
                    <TableRow className='text-xs'>
                      <TableHead className='w-12'>No</TableHead>
                      <TableHead>Employee ID</TableHead>
                      <TableHead>Full Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewRows.map((row) => (
                      <TableRow key={row.no} className='text-xs'>
                        <TableCell className='text-muted-foreground'>{row.no}</TableCell>
                        <TableCell className='font-mono font-medium'>{row.employeeId}</TableCell>
                        <TableCell className='font-medium text-foreground'>
                          {row.fullName}
                        </TableCell>
                        <TableCell className='text-muted-foreground'>{row.email}</TableCell>
                        <TableCell>{row.department}</TableCell>
                        <TableCell className='text-muted-foreground'>{row.position}</TableCell>
                        <TableCell>{row.joinDate}</TableCell>
                        <TableCell>
                          <Badge variant='outline' className='text-[10px]'>
                            {row.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={row.status === 'Active' ? 'emerald' : 'secondary'}
                            className='text-[10px]'
                          >
                            {row.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ─── FOOTER ACTIONS ─────────────────────────────────────────────── */}
        <div className='flex items-center justify-end gap-3'>
          <Button
            type='button'
            variant='outline'
            onClick={() => void navigate({ to: '/employment/employee-profile' })}
          >
            Cancel
          </Button>
          <Button
            type='button'
            onClick={handleExecuteImport}
            disabled={importing || !file || summary.validRows === 0}
            className='gap-2 bg-blue-600 px-6 font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-600'
          >
            {importing ? (
              <IconLoader2 className='size-4 animate-spin' />
            ) : (
              <IconUpload className='size-4' />
            )}
            Import Data
          </Button>
        </div>
      </div>

      {/* ─── ALL ERRORS MODAL ─────────────────────────────────────────────── */}
      <Dialog open={allErrorsOpen} onOpenChange={setAllErrorsOpen}>
        <DialogContent className='max-h-[85vh] overflow-y-auto sm:max-w-3xl'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <IconAlertCircle className='size-5 text-destructive' />
              All Error Details ({errors.length} errors found)
            </DialogTitle>
            <DialogDescription>
              Resolve these errors in your spreadsheet and re-upload, or proceed to import valid
              rows only.
            </DialogDescription>
          </DialogHeader>

          <div className='overflow-auto rounded-xl border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-14'>Row</TableHead>
                  <TableHead>Column</TableHead>
                  <TableHead>Error Message</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Solution</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {errors.map((err, idx) => (
                  <TableRow key={idx} className='text-xs'>
                    <TableCell className='font-medium'>{err.row}</TableCell>
                    <TableCell className='font-semibold'>{err.column}</TableCell>
                    <TableCell className='text-red-600 dark:text-red-400'>
                      {err.errorMessage}
                    </TableCell>
                    <TableCell className='font-mono text-muted-foreground'>{err.value}</TableCell>
                    <TableCell className='text-muted-foreground'>{err.solution}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── IMPORT HISTORY MODAL ─────────────────────────────────────────── */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className='max-h-[85vh] overflow-y-auto sm:max-w-3xl'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <IconHistory className='size-5 text-primary' />
              Import History
            </DialogTitle>
            <DialogDescription>
              Complete history of batch employee imports and updates.
            </DialogDescription>
          </DialogHeader>

          <div className='overflow-auto rounded-xl border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Imported By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Valid / Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {importHistory.map((h) => (
                  <TableRow key={h.id} className='text-xs'>
                    <TableCell className='font-medium text-foreground'>{h.fileName}</TableCell>
                    <TableCell>
                      <Badge variant='outline' className='text-[10px]'>
                        {h.mode === 'create' ? 'Create New' : 'Bulk Update'}
                      </Badge>
                    </TableCell>
                    <TableCell>{h.importedBy}</TableCell>
                    <TableCell>{h.date}</TableCell>
                    <TableCell>
                      {h.validRows.toLocaleString()} / {h.totalRows.toLocaleString()}
                    </TableCell>
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

      {/* ─── VALIDATION RULES MODAL ───────────────────────────────────────── */}
      <Dialog open={allRulesOpen} onOpenChange={setAllRulesOpen}>
        <DialogContent className='max-h-[85vh] overflow-y-auto sm:max-w-xl'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <IconInfoCircle className='size-5 text-primary' />
              Spreadsheet Validation Rules
            </DialogTitle>
            <DialogDescription>
              Guidelines to format your employee data before importing.
            </DialogDescription>
          </DialogHeader>

          <div className='flex flex-col gap-3 text-xs text-muted-foreground'>
            <div className='rounded-xl border p-3'>
              <p className='font-semibold text-foreground'>Required Columns</p>
              <p className='mt-1'>
                Full Name, Email, Phone Number, Department, Position, and Join Date cannot be empty.
              </p>
            </div>
            <div className='rounded-xl border p-3'>
              <p className='font-semibold text-foreground'>Email Verification</p>
              <p className='mt-1'>
                Must follow standard RFC email format (e.g. username@domain.com).
              </p>
            </div>
            <div className='rounded-xl border p-3'>
              <p className='font-semibold text-foreground'>Tax Identification (NPWP)</p>
              <p className='mt-1'>
                Must be 15 or 16 numeric digits (format XX.XXX.XXX.X-XXX.XXX is supported).
              </p>
            </div>
            <div className='rounded-xl border p-3'>
              <p className='font-semibold text-foreground'>Bulk Update Rule</p>
              <p className='mt-1'>
                In Bulk Update mode, Employee ID must match existing records in the database.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── DOCUMENT PREVIEW MODAL ───────────────────────────────────────── */}
      <Dialog open={docPreviewOpen} onOpenChange={setDocPreviewOpen}>
        <DialogContent className='flex max-h-[88vh] flex-col overflow-hidden sm:max-w-4xl'>
          <DialogHeader>
            <div className='flex items-center justify-between gap-4 pr-6'>
              <div>
                <DialogTitle className='flex items-center gap-2'>
                  <IconFileSpreadsheet className='size-5 text-emerald-600 dark:text-emerald-400' />
                  Document Preview
                </DialogTitle>
                <DialogDescription className='mt-1 truncate text-xs'>
                  {file?.name} ({file ? `${Math.ceil(file.size / 1024)} KB` : ''})
                </DialogDescription>
              </div>
              <div className='flex items-center gap-2'>
                <Badge variant='outline' className='text-xs'>
                  {mode === 'create' ? 'Bulk Insert' : 'Bulk Update'}
                </Badge>
                <Badge
                  variant={summary.errorRows === 0 ? 'emerald' : 'destructive'}
                  className='text-xs'
                >
                  {summary.errorRows === 0
                    ? 'Ready to Import'
                    : `${summary.errorRows} Errors Found`}
                </Badge>
              </div>
            </div>
          </DialogHeader>

          {/* Quick Metrics Bar */}
          <div className='grid grid-cols-4 gap-2 border-y py-2.5 text-center text-xs'>
            <div>
              <p className='text-[11px] text-muted-foreground'>Total Detected</p>
              <p className='font-bold text-foreground'>{summary.totalRows} rows</p>
            </div>
            <div>
              <p className='text-[11px] text-emerald-600 dark:text-emerald-400'>Valid</p>
              <p className='font-bold text-emerald-600 dark:text-emerald-400'>
                {summary.validRows} rows
              </p>
            </div>
            <div>
              <p className='text-[11px] text-amber-600 dark:text-amber-400'>Warnings</p>
              <p className='font-bold text-amber-600 dark:text-amber-400'>
                {summary.warningRows} rows
              </p>
            </div>
            <div>
              <p className='text-[11px] text-rose-600 dark:text-rose-400'>Errors</p>
              <p className='font-bold text-rose-600 dark:text-rose-400'>{summary.errorRows} rows</p>
            </div>
          </div>

          {/* Spreadsheet Table View */}
          <div className='flex-1 overflow-auto rounded-xl border'>
            <Table>
              <TableHeader>
                <TableRow className='text-xs'>
                  <TableHead className='w-12 text-center'>No</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className='text-center'>Validation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewRows.map((row) => (
                  <TableRow
                    key={row.no}
                    className={`text-xs ${!row.isValid ? 'bg-rose-50/60 dark:bg-rose-950/20' : ''}`}
                  >
                    <TableCell className='text-center font-medium'>{row.no}</TableCell>
                    <TableCell className='font-mono font-medium text-foreground'>
                      {row.employeeId}
                    </TableCell>
                    <TableCell className='font-semibold text-foreground'>{row.fullName}</TableCell>
                    <TableCell className='text-muted-foreground'>{row.email}</TableCell>
                    <TableCell>{row.department}</TableCell>
                    <TableCell className='text-muted-foreground'>{row.position}</TableCell>
                    <TableCell>{row.joinDate}</TableCell>
                    <TableCell>
                      <Badge variant='outline' className='text-[10px]'>
                        {row.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={row.status === 'Active' ? 'emerald' : 'secondary'}
                        className='text-[10px]'
                      >
                        {row.status}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-center'>
                      {row.isValid ? (
                        <Badge variant='emerald' className='text-[10px]'>
                          Valid
                        </Badge>
                      ) : (
                        <Badge variant='destructive' className='text-[10px]'>
                          Invalid
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className='flex items-center justify-between pt-2'>
            <p className='text-xs text-muted-foreground'>
              Showing document preview. Click &ldquo;Import Data&rdquo; at the bottom of the page to
              execute the import.
            </p>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => setDocPreviewOpen(false)}
            >
              Close Preview
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppMain>
  )
}
