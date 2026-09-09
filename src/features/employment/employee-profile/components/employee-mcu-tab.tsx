// src/features/employment/employee-profile/components/employee-mcu-tab.tsx
import {
  IconBell,
  IconCalendar,
  IconCheck,
  IconChevronRight,
  IconDownload,
  IconEye,
  IconFileText,
  IconHeartbeat,
  IconHistory,
  IconInfoCircle,
  IconLoader2,
  IconLock,
  IconPencil,
  IconPlus,
  IconPrinter,
  IconRefresh,
  IconShieldCheck,
  IconSparkles,
  IconStethoscope,
  IconUpload,
  IconX,
} from '@tabler/icons-react'
import dayjs from 'dayjs'
import { useState } from 'react'

import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { snackbar } from '@/shared/lib/snackbar'
import {
  useEmployeeMcuStore,
  type ExaminationType,
  type McuRecord,
  type McuStatus,
} from '@/features/employment/employee-profile/store/employee-mcu-store'

// ─── Props ────────────────────────────────────────────────────────────────────

interface EmployeeMcuTabProps {
  employeeId: string
  employeeName: string
  employeeNumber: string
  positionName: string
  branchName: string
  avatarUrl?: string | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}

function fmtDate(date: string | null | undefined) {
  if (!date) return '—'
  return dayjs(date).format('DD MMM YYYY')
}

function fmtDateInput(date: string | null | undefined) {
  if (!date) return ''
  return dayjs(date).format('YYYY-MM-DD')
}

type McuStatusVariant = 'green' | 'amber' | 'red' | 'slate'

function getStatusVariant(status: McuStatus | null | undefined): McuStatusVariant {
  if (status === 'Fit') return 'green'
  if (status === 'Fit with Notes' || status === 'Temporary Unfit') return 'amber'
  if (status === 'Unfit') return 'red'
  return 'slate'
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SummaryCard({
  icon: Icon,
  label,
  value,
  badge,
  accent,
}: {
  icon: React.ComponentType<{ className?: string; size?: number }>
  label: string
  value: string
  badge?: { text: string; variant: McuStatusVariant | 'blue' }
  accent?: 'blue' | 'green' | 'amber' | 'red'
}) {
  const accentClass = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    red: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  }[accent ?? 'blue']

  return (
    <Card className='min-w-0'>
      <CardContent className='flex items-start gap-4 py-5'>
        <span
          className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${accentClass}`}
        >
          <Icon className='size-5' />
        </span>
        <div className='min-w-0 flex-1'>
          <p className='text-xs text-muted-foreground'>{label}</p>
          <p className='mt-0.5 text-lg leading-tight font-bold'>{value}</p>
          {badge && (
            <Badge variant={badge.variant} className='mt-1 text-[11px]'>
              {badge.text}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function HistoryItem({ record }: { record: McuRecord }) {
  return (
    <div className='flex items-start justify-between gap-3 rounded-lg border bg-card p-3'>
      <div className='min-w-0'>
        <p className='text-sm font-semibold'>{fmtDate(record.mcuDate)}</p>
        <p className='mt-0.5 text-xs text-muted-foreground'>{record.examinationType}</p>
      </div>
      <Badge variant={getStatusVariant(record.status)} className='shrink-0 text-[11px]'>
        {record.status}
      </Badge>
    </div>
  )
}

// ─── Update MCU Sheet (right panel dialog) ────────────────────────────────────

function getInitialMcuForm(mode: 'create' | 'update', existingRecord?: McuRecord | null) {
  if (mode === 'update' && existingRecord) {
    return {
      mcuDate: fmtDateInput(existingRecord.mcuDate),
      provider: existingRecord.provider || '',
      examinationType: existingRecord.examinationType || 'Annual MCU',
      status: existingRecord.status || 'Fit',
      nextDueDate: fmtDateInput(existingRecord.nextDueDate),
      followUpRequired: Boolean(existingRecord.followUpRequired),
      administrativeNote: existingRecord.administrativeNote || '',
      documentName: existingRecord.documentName || null,
      documentSize: existingRecord.documentSize || null,
    }
  }
  return {
    mcuDate: dayjs().format('YYYY-MM-DD'),
    provider: '',
    examinationType: 'Annual MCU' as ExaminationType,
    status: 'Fit' as McuStatus,
    nextDueDate: dayjs().add(1, 'year').format('YYYY-MM-DD'),
    followUpRequired: false,
    administrativeNote: '',
    documentName: null as string | null,
    documentSize: null as string | null,
  }
}

interface UpdateMcuModalContentProps {
  onClose: () => void
  employeeId: string
  employeeName: string
  employeeNumber: string
  positionName?: string
  branchName?: string
  mode: 'create' | 'update'
  existingRecord?: McuRecord | null
}

function UpdateMcuModalContent({
  onClose,
  employeeId,
  employeeName,
  employeeNumber,
  positionName,
  branchName,
  mode,
  existingRecord,
}: UpdateMcuModalContentProps) {
  const { addMcuRecord, updateMcuRecord } = useEmployeeMcuStore()

  const [saving, setSaving] = useState(false)
  const [docPreviewOpen, setDocPreviewOpen] = useState(false)
  const [form, setForm] = useState(() => getInitialMcuForm(mode, existingRecord))

  const set =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
    }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const sizeMB = file.size / (1024 * 1024)
    setForm((prev) => ({
      ...prev,
      documentName: file.name,
      documentSize: sizeMB >= 1 ? `${sizeMB.toFixed(1)} MB` : `${Math.ceil(file.size / 1024)} KB`,
    }))
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.mcuDate || !form.provider || !form.nextDueDate) {
      snackbar.error('MCU Date, Provider, and Next Due Date are required.')
      return
    }
    setSaving(true)
    setTimeout(() => {
      if (mode === 'update' && existingRecord?.id) {
        updateMcuRecord(employeeId, existingRecord.id, {
          mcuDate: form.mcuDate,
          provider: form.provider,
          examinationType: form.examinationType,
          status: form.status,
          nextDueDate: form.nextDueDate,
          followUpRequired: form.followUpRequired,
          administrativeNote: form.administrativeNote,
          documentName: form.documentName,
          documentSize: form.documentSize,
        })
        snackbar.success('MCU record updated successfully!')
      } else {
        addMcuRecord(
          employeeId,
          {
            mcuDate: form.mcuDate,
            provider: form.provider,
            examinationType: form.examinationType,
            status: form.status,
            nextDueDate: form.nextDueDate,
            followUpRequired: form.followUpRequired,
            administrativeNote: form.administrativeNote,
            documentName: form.documentName,
            documentSize: form.documentSize,
          },
          employeeName,
        )
        snackbar.success('MCU record created successfully!')
      }
      setSaving(false)
      onClose()
    }, 600)
  }

  return (
    <DialogContent className='max-h-[94vh] [scrollbar-width:none] overflow-y-auto p-6 sm:max-w-xl md:max-w-2xl [&::-webkit-scrollbar]:hidden'>
      <DialogHeader>
        <DialogTitle className='flex items-center gap-2'>
          <IconStethoscope className='size-5 text-primary' />
          {mode === 'update' ? 'Update MCU Record' : 'Create MCU Record'}
        </DialogTitle>
        <DialogDescription>
          {employeeName} · {employeeNumber}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSave} className='flex flex-col gap-3.5'>
        <div className='grid gap-4 sm:grid-cols-2'>
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='mcu-date'>
              MCU Date <span className='text-red-500'>*</span>
            </Label>
            <Input
              id='mcu-date'
              type='date'
              value={form.mcuDate}
              onChange={set('mcuDate')}
              required
            />
          </div>
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='mcu-provider'>
              MCU Provider <span className='text-red-500'>*</span>
            </Label>
            <Input
              id='mcu-provider'
              value={form.provider}
              onChange={set('provider')}
              placeholder='e.g. Prodia Occupational Health'
              required
            />
          </div>
        </div>

        <div className='grid gap-4 sm:grid-cols-2'>
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='exam-type'>
              Examination Type <span className='text-red-500'>*</span>
            </Label>
            <select
              id='exam-type'
              className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none'
              value={form.examinationType}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  examinationType: e.target.value as ExaminationType,
                }))
              }
            >
              <option>Annual MCU</option>
              <option>Pre-Employment</option>
              <option>Periodic</option>
              <option>Special</option>
            </select>
          </div>
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='mcu-status'>
              MCU Status <span className='text-red-500'>*</span>
            </Label>
            <select
              id='mcu-status'
              className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none'
              value={form.status}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  status: e.target.value as McuStatus,
                }))
              }
            >
              <option value='Fit'>Fit</option>
              <option value='Fit with Notes'>Fit with Notes</option>
              <option value='Temporary Unfit'>Temporary Unfit</option>
              <option value='Unfit'>Unfit</option>
            </select>
          </div>
        </div>

        <div className='grid gap-4 sm:grid-cols-2'>
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='next-due'>
              Next MCU Due <span className='text-red-500'>*</span>
            </Label>
            <Input
              id='next-due'
              type='date'
              value={form.nextDueDate}
              onChange={set('nextDueDate')}
              required
            />
          </div>
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='follow-up'>
              Follow-up Required <span className='text-red-500'>*</span>
            </Label>
            <select
              id='follow-up'
              className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none'
              value={form.followUpRequired ? 'yes' : 'no'}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  followUpRequired: e.target.value === 'yes',
                }))
              }
            >
              <option value='no'>No</option>
              <option value='yes'>Yes</option>
            </select>
          </div>
        </div>

        <div className='flex flex-col gap-1.5'>
          <Label htmlFor='admin-note'>Administrative Note</Label>
          <textarea
            id='admin-note'
            rows={2}
            className='flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none'
            placeholder='e.g. Fit for work. No follow-up required.'
            value={form.administrativeNote}
            onChange={set('administrativeNote')}
          />
        </div>

        {/* Document upload / preview */}
        <div className='flex flex-col gap-1.5'>
          <Label>
            MCU Document <span className='text-red-500'>*</span>
          </Label>
          {form.documentName ? (
            <div className='flex flex-col gap-2 rounded-2xl border border-border/80 bg-muted/20 p-3 transition-all hover:border-primary/30'>
              <div className='flex items-center justify-between gap-3'>
                <div
                  onClick={() => setDocPreviewOpen(true)}
                  className='group flex min-w-0 cursor-pointer items-center gap-2.5'
                  title='Click to preview document'
                >
                  <div className='flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-400'>
                    <IconFileText className='size-5' />
                  </div>
                  <div className='min-w-0'>
                    <p className='truncate text-sm font-semibold text-foreground group-hover:text-primary group-hover:underline'>
                      {form.documentName}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {form.documentSize || '840 KB'} · Medical Document
                    </p>
                  </div>
                </div>
                <div className='flex shrink-0 items-center gap-1.5'>
                  <button
                    type='button'
                    onClick={() => setDocPreviewOpen(true)}
                    className='inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-border bg-background px-3 text-xs font-medium text-foreground shadow-xs transition-colors hover:border-primary/40 hover:bg-muted hover:text-primary'
                  >
                    <IconEye className='size-3.5 text-primary' />
                    Preview
                  </button>
                  <label
                    htmlFor='mcu-doc-upload'
                    className='inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-border bg-background px-3 text-xs font-medium text-foreground shadow-xs transition-colors hover:bg-muted'
                  >
                    <IconRefresh className='size-3.5' />
                    Change file
                  </label>
                  <button
                    type='button'
                    onClick={() =>
                      setForm((p) => ({
                        ...p,
                        documentName: null,
                        documentSize: null,
                      }))
                    }
                    className='inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive'
                    title='Remove file'
                  >
                    <IconX className='size-4' />
                  </button>
                </div>
              </div>
              <input
                id='mcu-doc-upload'
                type='file'
                accept='.pdf,.jpg,.jpeg,.png'
                className='sr-only'
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <label
              htmlFor='mcu-doc-upload'
              className='flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border py-4 transition-colors hover:border-primary/50 hover:bg-muted/30'
            >
              <IconUpload className='size-6 text-muted-foreground' />
              <span className='text-xs font-medium text-primary'>Upload PDF / image result</span>
              <span className='text-[11px] text-muted-foreground'>Maximum 10 MB</span>
              <input
                id='mcu-doc-upload'
                type='file'
                accept='.pdf,.jpg,.jpeg,.png'
                className='sr-only'
                onChange={handleFileChange}
              />
            </label>
          )}
        </div>

        {/* Health data rule notice */}
        <div className='flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs dark:border-amber-800 dark:bg-amber-950/30'>
          <p className='text-[11px] text-amber-700 dark:text-amber-400'>
            <span className='font-semibold text-amber-800 dark:text-amber-300'>
              Health data rule:
            </span>{' '}
            Store fitness status, dates, provider, and document reference. Detailed diagnosis
            remains restricted.
          </p>
        </div>

        <DialogFooter className='pt-1'>
          <Button type='button' variant='outline' onClick={onClose} disabled={saving}>
            <IconX className='size-4' />
            Cancel
          </Button>
          <Button type='submit' disabled={saving}>
            {saving ? (
              <IconLoader2 className='size-4 animate-spin' />
            ) : (
              <IconCheck className='size-4' />
            )}
            {mode === 'update' ? 'Update MCU' : 'Create MCU'}
          </Button>
        </DialogFooter>
      </form>

      {/* Embedded Document Preview Modal */}
      <McuDocumentPreviewDialog
        open={docPreviewOpen}
        onClose={() => setDocPreviewOpen(false)}
        record={{
          id: existingRecord?.id || 'preview',
          employeeId,
          mcuDate: form.mcuDate || dayjs().format('YYYY-MM-DD'),
          provider: form.provider || 'Occupational Health Clinic',
          examinationType: form.examinationType,
          status: form.status,
          nextDueDate: form.nextDueDate || dayjs().add(1, 'year').format('YYYY-MM-DD'),
          followUpRequired: form.followUpRequired,
          administrativeNote: form.administrativeNote,
          documentName: form.documentName,
          documentSize: form.documentSize,
          createdAt: existingRecord?.createdAt || new Date().toISOString(),
          bloodPressure: existingRecord?.bloodPressure,
          bmi: existingRecord?.bmi,
          fastingBloodSugar: existingRecord?.fastingBloodSugar,
          totalCholesterol: existingRecord?.totalCholesterol,
          vision: existingRecord?.vision,
          audiometry: existingRecord?.audiometry,
          xray: existingRecord?.xray,
          doctorRecommendations: existingRecord?.doctorRecommendations,
        }}
        employeeName={employeeName}
        employeeNumber={employeeNumber}
        positionName={positionName || ''}
        branchName={branchName || ''}
      />
    </DialogContent>
  )
}

interface UpdateMcuSheetProps {
  open: boolean
  onClose: () => void
  employeeId: string
  employeeName: string
  employeeNumber: string
  positionName?: string
  branchName?: string
  mode?: 'create' | 'update'
  existingRecord?: McuRecord | null
}

function UpdateMcuSheet({
  open,
  onClose,
  employeeId,
  employeeName,
  employeeNumber,
  positionName,
  branchName,
  mode = 'update',
  existingRecord,
}: UpdateMcuSheetProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      {open && (
        <UpdateMcuModalContent
          key={`${mode}-${existingRecord?.id || 'new'}`}
          onClose={onClose}
          employeeId={employeeId}
          employeeName={employeeName}
          employeeNumber={employeeNumber}
          positionName={positionName}
          branchName={branchName}
          mode={mode}
          existingRecord={existingRecord}
        />
      )}
    </Dialog>
  )
}

// ─── History Dialog ───────────────────────────────────────────────────────────

function downloadMcuPdf(record: McuRecord, employeeName: string) {
  const fileName =
    record.documentName ||
    `MCU_${employeeName.replace(/\s+/g, '_')}_${dayjs(record.mcuDate).format('YYYY')}.pdf`

  // Generate realistic text content inside pseudo-PDF blob for instant browser download
  const content = `%PDF-1.4
% Official Medical Check-Up Certificate
% ==============================================
Employee Name: ${employeeName}
Examination Date: ${fmtDate(record.mcuDate)}
Examination Type: ${record.examinationType}
Healthcare Provider: ${record.provider}
Fitness Status: ${record.status}
Next Due Date: ${fmtDate(record.nextDueDate)}
Blood Pressure: ${record.bloodPressure || '120/80 mmHg'}
BMI: ${record.bmi || '22.5'}
Doctor Recommendation: ${record.doctorRecommendations || 'None'}
% Digitally Signed by Occupational Health Specialist
% ==============================================`

  const blob = new Blob([content], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  snackbar.success(`Document ${fileName} downloaded successfully`)
}

// ─── History Dialog ───────────────────────────────────────────────────────────

function McuHistoryDialog({
  open,
  onClose,
  history,
  employeeName,
  onViewDocument,
}: {
  open: boolean
  onClose: () => void
  history: McuRecord[]
  employeeName: string
  onViewDocument?: (rec: McuRecord) => void
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className='max-h-[80vh] max-w-lg overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <IconHistory className='size-5 text-primary' />
            MCU History
          </DialogTitle>
          <DialogDescription>{employeeName} — All MCU records</DialogDescription>
        </DialogHeader>
        <div className='flex flex-col gap-3'>
          {history.length === 0 ? (
            <p className='text-center text-sm text-muted-foreground'>No MCU records found.</p>
          ) : (
            history.map((rec) => (
              <div key={rec.id} className='rounded-lg border bg-card p-4'>
                <div className='flex items-start justify-between gap-3'>
                  <div>
                    <p className='text-sm font-bold'>{fmtDate(rec.mcuDate)}</p>
                    <p className='mt-0.5 text-xs text-muted-foreground'>
                      {rec.examinationType} · {rec.provider}
                    </p>
                    <p className='mt-1 text-xs text-muted-foreground'>
                      Next Due: {fmtDate(rec.nextDueDate)}
                    </p>
                  </div>
                  <Badge variant={getStatusVariant(rec.status)} className='shrink-0 text-[11px]'>
                    {rec.status}
                  </Badge>
                </div>
                {rec.administrativeNote && (
                  <p className='mt-2 border-t pt-2 text-xs text-muted-foreground'>
                    {rec.administrativeNote}
                  </p>
                )}
                {rec.documentName && (
                  <div className='mt-2.5 flex items-center justify-between border-t pt-2'>
                    <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                      <IconFileText className='size-3.5 text-muted-foreground' />
                      <span className='truncate font-medium'>{rec.documentName}</span>
                      {rec.documentSize && <span>· {rec.documentSize}</span>}
                    </div>
                    {onViewDocument && (
                      <Button
                        size='xs'
                        variant='ghost'
                        onClick={() => {
                          onClose()
                          onViewDocument(rec)
                        }}
                        className='h-6 gap-1 px-2 text-xs text-primary hover:underline'
                      >
                        <IconEye className='size-3' />
                        View
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Document Preview Dialog ──────────────────────────────────────────────────

export function McuDocumentPreviewDialog({
  open,
  onClose,
  record,
  employeeName,
  employeeNumber,
  positionName,
  branchName,
}: {
  open: boolean
  onClose: () => void
  record: McuRecord | null
  employeeName: string
  employeeNumber: string
  positionName: string
  branchName: string
}) {
  if (!record) return null

  const certNumber = `MCU/OHS/${dayjs(record.mcuDate).format('YYYYMM')}/${record.id.slice(-6).toUpperCase()}`
  const statusVariant = getStatusVariant(record.status)

  const statusTitle =
    record.status === 'Fit'
      ? 'LAIK KERJA (FIT FOR WORK)'
      : record.status === 'Fit with Notes'
        ? 'LAIK KERJA DENGAN CATATAN (FIT WITH RESTRICTIONS)'
        : record.status === 'Temporary Unfit'
          ? 'TIDAK LAIK KERJA SEMENTARA (TEMPORARY UNFIT)'
          : 'TIDAK LAIK KERJA (UNFIT FOR WORK)'

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className='z-[70] max-h-[92vh] max-w-2xl overflow-y-auto p-0 sm:max-w-3xl'>
        {/* Modal Toolbar */}
        <div className='sticky top-0 z-10 flex items-center justify-between border-b bg-background/95 px-5 py-3 backdrop-blur'>
          <div className='flex items-center gap-2.5'>
            <div className='flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary'>
              <IconFileText className='size-4' />
            </div>
            <div>
              <DialogTitle className='text-sm font-semibold'>
                {record.documentName || 'MCU_Certificate.pdf'}
              </DialogTitle>
              <DialogDescription className='text-xs'>
                {record.documentSize || '840 KB'} · Medical Examination Report
              </DialogDescription>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              size='sm'
              variant='outline'
              onClick={() => window.print()}
              className='h-8 gap-1.5 text-xs'
            >
              <IconPrinter className='size-3.5' />
              Print
            </Button>
            <Button
              size='sm'
              variant='default'
              onClick={() => downloadMcuPdf(record, employeeName)}
              className='h-8 gap-1.5 text-xs'
            >
              <IconDownload className='size-3.5' />
              Download
            </Button>
          </div>
        </div>

        {/* Certificate Paper View */}
        <div className='p-6 sm:p-8'>
          <div className='rounded-xl border bg-white p-6 text-slate-900 shadow-sm sm:p-8 dark:bg-slate-900 dark:text-slate-100'>
            {/* Kop Surat / Medical Header */}
            <div className='border-b pb-4'>
              <div className='flex items-start justify-between gap-4'>
                <div className='flex items-center gap-3'>
                  <div className='flex size-12 items-center justify-center rounded-xl bg-blue-600 font-bold text-white shadow-sm'>
                    <IconStethoscope className='size-6' />
                  </div>
                  <div>
                    <h3 className='text-base font-bold tracking-wide text-blue-900 uppercase dark:text-blue-300'>
                      {record.provider || 'Klinik Kesehatan Kerja & MCU Center'}
                    </h3>
                    <p className='text-xs text-slate-500 dark:text-slate-400'>
                      Occupational Health Assessment & Diagnostic Laboratory
                    </p>
                    <p className='text-[11px] text-slate-400'>
                      Izin Operasional Kemenkes / Kemnaker No: SK-8842/OHS/JKT/2023
                    </p>
                  </div>
                </div>
                <div className='text-right'>
                  <span className='rounded bg-slate-100 px-2 py-1 font-mono text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300'>
                    ORIGINAL COPY
                  </span>
                  <p className='mt-1 text-[11px] text-slate-400'>No: {certNumber}</p>
                </div>
              </div>
            </div>

            {/* Document Subject */}
            <div className='my-5 text-center'>
              <h2 className='text-sm font-extrabold tracking-wider text-slate-800 uppercase sm:text-base dark:text-slate-100'>
                SURAT KETERANGAN KELAYAKAN MEDIS KERJA
              </h2>
              <p className='text-xs font-medium text-slate-500 dark:text-slate-400'>
                CERTIFICATE OF OCCUPATIONAL MEDICAL FITNESS
              </p>
            </div>

            {/* Employee Information Table */}
            <div className='mb-5 rounded-lg border bg-slate-50/70 p-4 text-xs dark:bg-slate-800/40'>
              <div className='grid grid-cols-1 gap-2.5 sm:grid-cols-2'>
                <div>
                  <span className='text-slate-500 dark:text-slate-400'>Nama Karyawan:</span>{' '}
                  <span className='font-bold text-slate-800 dark:text-slate-100'>
                    {employeeName}
                  </span>
                </div>
                <div>
                  <span className='text-slate-500 dark:text-slate-400'>Nomor Induk (NIK):</span>{' '}
                  <span className='font-mono font-semibold text-slate-800 dark:text-slate-100'>
                    {employeeNumber}
                  </span>
                </div>
                <div>
                  <span className='text-slate-500 dark:text-slate-400'>Jabatan / Posisi:</span>{' '}
                  <span className='font-medium text-slate-800 dark:text-slate-100'>
                    {positionName}
                  </span>
                </div>
                <div>
                  <span className='text-slate-500 dark:text-slate-400'>Lokasi / Cabang:</span>{' '}
                  <span className='font-medium text-slate-800 dark:text-slate-100'>
                    {branchName}
                  </span>
                </div>
                <div>
                  <span className='text-slate-500 dark:text-slate-400'>Tanggal Periksa:</span>{' '}
                  <span className='font-semibold text-slate-800 dark:text-slate-100'>
                    {fmtDate(record.mcuDate)}
                  </span>
                </div>
                <div>
                  <span className='text-slate-500 dark:text-slate-400'>Jenis Pemeriksaan:</span>{' '}
                  <span className='font-medium text-slate-800 dark:text-slate-100'>
                    {record.examinationType}
                  </span>
                </div>
              </div>
            </div>

            {/* Fitness Status Stamp Banner */}
            <div
              className={`mb-5 rounded-xl border-2 p-4 text-center ${
                record.status === 'Fit'
                  ? 'border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20'
                  : record.status === 'Fit with Notes'
                    ? 'border-amber-500/40 bg-amber-50/50 dark:bg-amber-950/20'
                    : 'border-red-500/40 bg-red-50/50 dark:bg-red-950/20'
              }`}
            >
              <Badge
                variant={statusVariant}
                className='px-4 py-1 text-xs font-bold tracking-wider uppercase'
              >
                {statusTitle}
              </Badge>
              <p className='mt-2 text-xs text-slate-600 dark:text-slate-300'>
                {record.status === 'Fit'
                  ? 'Berdasarkan hasil evaluasi klinis dan penunjang diagnostik, yang bersangkutan dinyatakan SEHAT dan memenuhi persyaratan medis untuk menjalankan tugas pekerjaan.'
                  : record.status === 'Fit with Notes'
                    ? 'Berdasarkan hasil evaluasi klinis, yang bersangkutan dinyatakan LAIK KERJA dengan catatan / penyesuaian khusus sebagaimana tertera dalam rekomendasi medis.'
                    : 'Berdasarkan hasil evaluasi klinis, yang bersangkutan disarankan untuk evaluasi / penanganan medis lanjutan sebelum dinyatakan laik bekerja penuh.'}
              </p>
            </div>

            {/* Clinical Examination Summary */}
            <div className='mb-5'>
              <h4 className='mb-2 text-xs font-bold tracking-wider text-slate-700 uppercase dark:text-slate-300'>
                Ringkasan Hasil Pemeriksaan (Examination Summary)
              </h4>
              <div className='grid grid-cols-2 gap-2 text-xs sm:grid-cols-4'>
                <div className='rounded-lg border bg-slate-50/50 p-2.5 dark:bg-slate-800/30'>
                  <p className='text-[11px] text-slate-500 dark:text-slate-400'>Tekanan Darah</p>
                  <p className='mt-0.5 font-bold text-slate-800 dark:text-slate-100'>
                    {record.bloodPressure || '120/80 mmHg'}
                  </p>
                </div>
                <div className='rounded-lg border bg-slate-50/50 p-2.5 dark:bg-slate-800/30'>
                  <p className='text-[11px] text-slate-500 dark:text-slate-400'>
                    Indeks Massa Tubuh
                  </p>
                  <p className='mt-0.5 font-bold text-slate-800 dark:text-slate-100'>
                    {record.bmi ? `${record.bmi} kg/m²` : '22.5 kg/m²'}
                  </p>
                </div>
                <div className='rounded-lg border bg-slate-50/50 p-2.5 dark:bg-slate-800/30'>
                  <p className='text-[11px] text-slate-500 dark:text-slate-400'>Gula Darah Puasa</p>
                  <p className='mt-0.5 font-bold text-slate-800 dark:text-slate-100'>
                    {record.fastingBloodSugar ? `${record.fastingBloodSugar} mg/dL` : '92 mg/dL'}
                  </p>
                </div>
                <div className='rounded-lg border bg-slate-50/50 p-2.5 dark:bg-slate-800/30'>
                  <p className='text-[11px] text-slate-500 dark:text-slate-400'>Kolesterol Total</p>
                  <p className='mt-0.5 font-bold text-slate-800 dark:text-slate-100'>
                    {record.totalCholesterol ? `${record.totalCholesterol} mg/dL` : '185 mg/dL'}
                  </p>
                </div>
                <div className='rounded-lg border bg-slate-50/50 p-2.5 sm:col-span-2 dark:bg-slate-800/30'>
                  <p className='text-[11px] text-slate-500 dark:text-slate-400'>
                    Pemeriksaan Visus & Mata
                  </p>
                  <p className='mt-0.5 font-medium text-slate-800 dark:text-slate-100'>
                    {record.vision || '6/6 Normal ODS'}
                  </p>
                </div>
                <div className='rounded-lg border bg-slate-50/50 p-2.5 sm:col-span-2 dark:bg-slate-800/30'>
                  <p className='text-[11px] text-slate-500 dark:text-slate-400'>Rontgen Thorax</p>
                  <p className='mt-0.5 font-medium text-slate-800 dark:text-slate-100'>
                    {record.xray || 'Cor dan pulmo dalam batas normal'}
                  </p>
                </div>
              </div>
            </div>

            {/* Doctor's Advice & Recommendations */}
            <div className='mb-6 rounded-lg border bg-slate-50/50 p-3.5 text-xs dark:bg-slate-800/30'>
              <p className='font-semibold text-slate-700 dark:text-slate-200'>
                Catatan & Rekomendasi Dokter:
              </p>
              <p className='mt-1 leading-relaxed text-slate-600 dark:text-slate-300'>
                {record.doctorRecommendations ||
                  'Jaga pola makan seimbang, rutin berolahraga min. 150 menit/minggu, dan lakukan pemeriksaan kesehatan berkala.'}
              </p>
              {record.administrativeNote && (
                <p className='mt-1.5 border-t pt-1.5 text-slate-500 italic dark:text-slate-400'>
                  Catatan administratif: {record.administrativeNote}
                </p>
              )}
              <p className='mt-2 font-medium text-primary'>
                Jadwal MCU berikutnya: {fmtDate(record.nextDueDate)}
              </p>
            </div>

            {/* Doctor Signature & Verification Seal */}
            <div className='flex items-end justify-between border-t pt-4 text-xs'>
              <div className='flex items-center gap-2 text-slate-500'>
                <div className='flex size-9 items-center justify-center rounded-lg border bg-slate-100 text-emerald-600 dark:bg-slate-800'>
                  <IconCheck className='size-5' />
                </div>
                <div>
                  <p className='font-bold text-slate-700 dark:text-slate-300'>DIGITALLY VERIFIED</p>
                  <p className='text-[10px] text-slate-400'>
                    Healthcare Hash: {record.id.slice(0, 12)}
                  </p>
                </div>
              </div>
              <div className='text-right'>
                <p className='text-[11px] text-slate-500'>Dokter Pemeriksa,</p>
                <div className='my-1 font-serif text-sm font-bold tracking-wide text-slate-800 italic dark:text-slate-200'>
                  dr. Hendra Wijaya, Sp.Ok
                </div>
                <p className='text-[10px] text-slate-400'>SIP: 503/442-Dinkes/SIP.TM/2021</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function EmployeeMcuTab({
  employeeId,
  employeeName,
  employeeNumber,
  positionName,
  branchName,
}: EmployeeMcuTabProps) {
  const { getLatestMcu, getMcuHistory, getDueStatus, reminderPolicy, getOrSeedLatestMcu } =
    useEmployeeMcuStore()

  const [formMode, setFormMode] = useState<'create' | 'update'>('update')
  const [updateOpen, setUpdateOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewRecord, setPreviewRecord] = useState<McuRecord | null>(null)

  const latest = getLatestMcu(employeeId)
  const history = getMcuHistory(employeeId)
  const recentHistory = history.slice(0, 3)

  const dueStatus = latest ? getDueStatus(latest.nextDueDate, latest.followUpRequired) : 'Current'
  const mcuStatusVariant = latest ? getStatusVariant(latest.status) : 'slate'

  const dueStatusVariant: McuStatusVariant | 'blue' =
    dueStatus === 'Current'
      ? 'green'
      : dueStatus === 'Due Soon'
        ? 'amber'
        : dueStatus === 'Overdue'
          ? 'red'
          : 'blue'

  return (
    <div className='flex min-w-0 flex-col gap-6'>
      {/* ── Section Header ── */}
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h2 className='text-xl font-bold tracking-tight'>Medical Check Up (MCU)</h2>
          <p className='text-xs text-muted-foreground'>
            MCU record, renewal, document, and follow-up.
          </p>
        </div>
        <div className='flex items-center gap-2'>
          {latest ? (
            <>
              <Button
                onClick={() => {
                  setFormMode('update')
                  setUpdateOpen(true)
                }}
                className='inline-flex items-center gap-2 bg-primary text-white hover:bg-primary/90'
              >
                <IconPencil className='size-4' />
                Update MCU
              </Button>
              <Button
                variant='outline'
                onClick={() => {
                  setFormMode('create')
                  setUpdateOpen(true)
                }}
                className='inline-flex items-center gap-1.5'
              >
                <IconPlus className='size-4' />
                Add MCU
              </Button>
            </>
          ) : (
            <Button
              onClick={() => {
                setFormMode('create')
                setUpdateOpen(true)
              }}
              className='inline-flex items-center gap-2 bg-primary text-white hover:bg-primary/90'
            >
              <IconPlus className='size-4' />
              Create MCU
            </Button>
          )}
        </div>
      </div>

      {!latest ? (
        <Card className='border-dashed'>
          <CardContent className='flex flex-col items-center justify-center py-16 text-center'>
            <div className='mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
              <IconStethoscope className='size-8' />
            </div>
            <h3 className='text-lg font-bold text-foreground'>No MCU Records Found</h3>
            <p className='mt-1.5 max-w-md text-xs text-muted-foreground sm:text-sm'>
              {employeeName} does not have any medical check-up (MCU) records registered yet. Record
              a new medical check-up to start monitoring fitness status, renewal dates, and
              documents.
            </p>
            <div className='mt-6 flex flex-wrap items-center justify-center gap-3'>
              <Button
                onClick={() => {
                  setFormMode('create')
                  setUpdateOpen(true)
                }}
                className='inline-flex items-center gap-2 bg-primary text-white hover:bg-primary/90'
              >
                <IconPlus className='size-4' />
                Create MCU Record
              </Button>
              <Button
                variant='outline'
                onClick={() => {
                  getOrSeedLatestMcu(employeeId, employeeName)
                  snackbar.success('Sample MCU data generated for testing!')
                }}
                className='inline-flex items-center gap-2'
              >
                <IconSparkles className='size-4 text-amber-500' />
                Generate Sample Data
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* ── Employee Banner ── */}
          <Card>
            <CardContent className='flex items-center justify-between gap-4 py-4'>
              <div className='flex items-center gap-4'>
                <Avatar className='size-14'>
                  <AvatarFallback className='bg-primary/10 text-lg font-bold text-primary'>
                    {getInitials(employeeName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className='text-base font-bold'>{employeeName}</p>
                  <p className='text-xs text-muted-foreground'>
                    {employeeNumber} · {positionName} · {branchName}
                  </p>
                </div>
              </div>
              <div className='hidden shrink-0 text-right sm:block'>
                <Badge variant={mcuStatusVariant} className='text-sm font-bold'>
                  {latest.status}
                </Badge>
                <p className='mt-1 text-xs text-muted-foreground'>
                  Last MCU: {fmtDate(latest.mcuDate)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* ── Summary Cards ── */}
          <div className='grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
            <SummaryCard
              icon={IconShieldCheck}
              label='MCU Status'
              value={latest.status}
              accent={
                latest.status === 'Fit'
                  ? 'green'
                  : latest.status === 'Fit with Notes'
                    ? 'amber'
                    : 'red'
              }
            />
            <SummaryCard
              icon={IconCalendar}
              label='Last MCU Date'
              value={fmtDate(latest.mcuDate)}
              accent='blue'
            />
            <SummaryCard
              icon={IconRefresh}
              label='Next MCU Due'
              value={fmtDate(latest.nextDueDate)}
              badge={{ text: dueStatus, variant: dueStatusVariant }}
              accent={
                dueStatus === 'Overdue' ? 'red' : dueStatus === 'Due Soon' ? 'amber' : 'green'
              }
            />
            <SummaryCard
              icon={IconCheck}
              label='Follow-up'
              value={latest.followUpRequired ? 'Required' : 'Not Required'}
              accent={latest.followUpRequired ? 'amber' : 'green'}
            />
          </div>

          {/* ── MCU Information + History ── */}
          <div
            className='grid min-w-0 gap-4 xl:grid-cols-[1fr_auto]'
            style={{ gridTemplateColumns: '1fr 340px' }}
          >
            {/* MCU Information Card */}
            <Card>
              <CardHeader className='flex flex-row items-center justify-between pb-3'>
                <CardTitle className='flex items-center gap-2 text-base'>
                  <IconHeartbeat className='size-5 text-primary' />
                  MCU Information
                </CardTitle>
                <Badge variant='blue' className='text-[11px]'>
                  <IconLock className='mr-1 size-3' />
                  Restricted HR Data
                </Badge>
              </CardHeader>
              <CardContent>
                <div className='grid gap-4 sm:grid-cols-2'>
                  <InfoField label='MCU Status' value={latest.status} />
                  <InfoField label='Last MCU Date' value={fmtDate(latest.mcuDate)} />
                  <InfoField label='Next MCU Due' value={fmtDate(latest.nextDueDate)} />
                  <InfoField label='MCU Provider' value={latest.provider} />
                  <InfoField label='Examination Type' value={latest.examinationType} />
                  <InfoField
                    label='Follow-up Required'
                    value={latest.followUpRequired ? 'Yes' : 'No'}
                  />
                </div>
                {latest.administrativeNote && (
                  <div className='mt-4 rounded-lg border bg-muted/30 p-3'>
                    <p className='text-xs font-medium text-muted-foreground'>Administrative Note</p>
                    <p className='mt-1 text-sm'>{latest.administrativeNote}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* MCU History Card */}
            <Card className='min-w-0'>
              <CardHeader className='flex flex-row items-center justify-between pb-3'>
                <CardTitle className='flex items-center gap-2 text-base'>
                  <IconHistory className='size-5 text-primary' />
                  MCU History
                </CardTitle>
                <button
                  onClick={() => setHistoryOpen(true)}
                  className='text-xs font-medium text-primary hover:underline'
                >
                  View all
                </button>
              </CardHeader>
              <CardContent className='flex flex-col gap-3'>
                {recentHistory.length === 0 ? (
                  <p className='text-sm text-muted-foreground'>No MCU history found.</p>
                ) : (
                  recentHistory.map((rec) => <HistoryItem key={rec.id} record={rec} />)
                )}
                {history.length > 3 && (
                  <button
                    onClick={() => setHistoryOpen(true)}
                    className='flex items-center gap-1 text-xs font-medium text-primary hover:underline'
                  >
                    See {history.length - 3} more records
                    <IconChevronRight className='size-3' />
                  </button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── Document + Privacy ── */}
          <div className='grid min-w-0 gap-4 xl:grid-cols-2'>
            {/* MCU Document */}
            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='flex items-center gap-2 text-base'>
                  <IconFileText className='size-5 text-primary' />
                  MCU Document
                </CardTitle>
              </CardHeader>
              <CardContent>
                {latest?.documentName ? (
                  <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='min-w-0'>
                      <p
                        onClick={() => {
                          setPreviewRecord(latest)
                          setPreviewOpen(true)
                        }}
                        className='cursor-pointer truncate text-sm font-semibold hover:text-primary hover:underline'
                        title='Click to view document'
                      >
                        {latest.documentName}
                      </p>
                      {latest.documentSize && (
                        <p className='mt-0.5 text-xs text-muted-foreground'>
                          {latest.documentSize} · uploaded {fmtDate(latest.mcuDate)}
                        </p>
                      )}
                    </div>
                    <div className='flex shrink-0 items-center gap-2'>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => {
                          setPreviewRecord(latest)
                          setPreviewOpen(true)
                        }}
                        className='inline-flex items-center gap-1.5'
                      >
                        <IconEye className='size-4 text-primary' />
                        View Document
                      </Button>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => downloadMcuPdf(latest, employeeName)}
                        className='inline-flex items-center gap-1.5'
                      >
                        <IconDownload className='size-4' />
                        Download
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className='flex flex-col items-center gap-2 py-6 text-center'>
                    <IconFileText className='size-8 text-muted-foreground/40' />
                    <p className='text-sm text-muted-foreground'>No document uploaded</p>
                    <Button size='sm' variant='outline' onClick={() => setUpdateOpen(true)}>
                      <IconUpload className='size-4' />
                      Upload MCU Document
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Privacy & Access */}
            <Card className='border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20'>
              <CardHeader className='pb-3'>
                <CardTitle className='flex items-center gap-2 text-base text-amber-700 dark:text-amber-400'>
                  <IconInfoCircle className='size-5' />
                  Privacy & Access
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-amber-700 dark:text-amber-400'>
                  Employee information stores fitness status, dates, provider, follow-up, and
                  document reference only. Detailed medical findings remain restricted.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* ── Reminder Banner ── */}
          {reminderPolicy.isActive && (
            <div className='flex items-center justify-between gap-4 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3'>
              <div className='flex min-w-0 items-center gap-2'>
                <IconBell className='size-4 shrink-0 text-primary' />
                <p className='min-w-0 truncate text-xs text-muted-foreground'>
                  <span className='font-medium text-foreground'>Reminder active</span> ·{' '}
                  {reminderPolicy.recipients} ·{' '}
                  {reminderPolicy.scheduleDays
                    .filter((d) => d > 0)
                    .map((d) => `${d}`)
                    .join(', ')}{' '}
                  days before due date · Stops automatically after a newer MCU record is saved.
                </p>
              </div>
              <button
                onClick={() => {}}
                className='shrink-0 text-xs font-medium text-primary hover:underline'
              >
                Manage reminder →
              </button>
            </div>
          )}
        </>
      )}

      {/* ── Modals ── */}
      <UpdateMcuSheet
        open={updateOpen}
        onClose={() => setUpdateOpen(false)}
        employeeId={employeeId}
        employeeName={employeeName}
        employeeNumber={employeeNumber}
        positionName={positionName}
        branchName={branchName}
        mode={formMode}
        existingRecord={formMode === 'update' ? latest : null}
      />

      <McuHistoryDialog
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={history}
        employeeName={employeeName}
        onViewDocument={(rec) => {
          setPreviewRecord(rec)
          setPreviewOpen(true)
        }}
      />

      <McuDocumentPreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        record={previewRecord || latest || null}
        employeeName={employeeName}
        employeeNumber={employeeNumber}
        positionName={positionName}
        branchName={branchName}
      />
    </div>
  )
}

// ─── Helper component for info fields ─────────────────────────────────────────

function InfoField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className='flex flex-col gap-1'>
      <span className='text-xs text-muted-foreground'>{label}</span>
      <div className='rounded-md border bg-muted/20 px-3 py-2 text-sm'>{value ?? '—'}</div>
    </div>
  )
}
