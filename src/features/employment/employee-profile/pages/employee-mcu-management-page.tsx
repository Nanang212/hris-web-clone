// src/features/employment/employee-profile/pages/employee-mcu-management-page.tsx
import {
  IconBell,
  IconCheck,
  IconChevronRight,
  IconEye,
  IconFileText,
  IconFilter,
  IconLoader2,
  IconMail,
  IconMessageCircle,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconSettings,
  IconStethoscope,
  IconUpload,
  IconUsers,
  IconX,
} from '@tabler/icons-react'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'

import { AppMain } from '@/shared/components/app-layout/app-main'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { snackbar } from '@/shared/lib/snackbar'
import { McuDocumentPreviewDialog } from '@/features/employment/employee-profile/components/employee-mcu-tab'
import {
  useEmployeeMcuStore,
  type ExaminationType,
  type McuDueStatus,
  type McuEmployeeRecord,
  type McuRecord,
  type McuStatus,
} from '@/features/employment/employee-profile/store/employee-mcu-store'

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

function getDueStatusVariant(s: McuDueStatus): 'green' | 'amber' | 'red' | 'blue' {
  if (s === 'Current') return 'green'
  if (s === 'Due Soon') return 'amber'
  if (s === 'Overdue') return 'red'
  return 'blue' // Follow-up
}

function getMcuStatusVariant(s: McuStatus | undefined): 'green' | 'amber' | 'red' | 'slate' {
  if (s === 'Fit') return 'green'
  if (s === 'Fit with Notes' || s === 'Temporary Unfit') return 'amber'
  if (s === 'Unfit') return 'red'
  return 'slate'
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  count,
  label,
  badge,
  accentColor,
}: {
  count: number
  label: string
  badge: string
  accentColor: 'amber' | 'red' | 'blue' | 'green'
}) {
  const badgeVariant: 'amber' | 'red' | 'blue' | 'green' = accentColor
  return (
    <Card>
      <CardContent className='py-5'>
        <div className='flex items-start justify-between'>
          <div>
            <p className='text-xs text-muted-foreground'>{label}</p>
            <p className='mt-1 text-3xl font-extrabold'>{count}</p>
          </div>
          <Badge variant={badgeVariant} className='text-[11px]'>
            {badge}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Input / Update MCU Dialog ────────────────────────────────────────────────

interface InputMcuDialogProps {
  open: boolean
  onClose: () => void
  prefillEmployee?: McuEmployeeRecord & { latestMcu?: McuRecord }
  allEmployees: Array<McuEmployeeRecord & { latestMcu?: McuRecord; dueStatus: McuDueStatus }>
}

function InputMcuModalContent({
  onClose,
  prefillEmployee,
  allEmployees,
  selectedEmpId,
  setSelectedEmpId,
}: {
  onClose: () => void
  prefillEmployee?: McuEmployeeRecord & { latestMcu?: McuRecord }
  allEmployees: Array<McuEmployeeRecord & { latestMcu?: McuRecord; dueStatus: McuDueStatus }>
  selectedEmpId: string
  setSelectedEmpId: (id: string) => void
}) {
  const { addMcuRecord } = useEmployeeMcuStore()
  const [saving, setSaving] = useState(false)
  const [docPreviewOpen, setDocPreviewOpen] = useState(false)

  const targetEmp = allEmployees.find((e) => e.employeeId === selectedEmpId) || prefillEmployee
  const existing = targetEmp?.latestMcu

  const [form, setForm] = useState<{
    mcuDate: string
    provider: string
    examinationType: ExaminationType
    status: McuStatus
    nextDueDate: string
    followUpRequired: boolean
    administrativeNote: string
    documentName: string | null
    documentSize: string | null
  }>(() => ({
    mcuDate: fmtDateInput(existing?.mcuDate ?? dayjs().format('YYYY-MM-DD')),
    provider: existing?.provider ?? 'Klinik Prodia OHS Center',
    examinationType: (existing?.examinationType ?? 'Annual MCU') as ExaminationType,
    status: (existing?.status ?? 'Fit') as McuStatus,
    nextDueDate: fmtDateInput(existing?.nextDueDate ?? dayjs().add(1, 'year').format('YYYY-MM-DD')),
    followUpRequired: existing?.followUpRequired ?? false,
    administrativeNote: existing?.administrativeNote ?? '',
    documentName:
      existing?.documentName ??
      (targetEmp
        ? `MCU_${targetEmp.employeeName.replace(/\s+/g, '_')}_${dayjs().format('YYYY')}.pdf`
        : null),
    documentSize: existing?.documentSize ?? '840 KB',
  }))

  const setF =
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
    if (!selectedEmpId) {
      snackbar.error('Please select an employee.')
      return
    }
    if (!form.mcuDate || !form.provider || !form.nextDueDate) {
      snackbar.error('MCU Date, Provider, and Next Due Date are required.')
      return
    }
    setSaving(true)
    setTimeout(() => {
      addMcuRecord(selectedEmpId, {
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
      setSaving(false)
      snackbar.success('MCU record saved successfully!')
      onClose()
    }, 700)
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className='flex items-center gap-2'>
          <IconStethoscope className='size-5 text-primary' />
          {prefillEmployee ? 'Update MCU Record' : 'Input MCU'}
        </DialogTitle>
        <DialogDescription>
          {prefillEmployee
            ? `${prefillEmployee.employeeName} · ${prefillEmployee.employeeNumber}`
            : 'Enter a new MCU record for any employee.'}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSave} className='flex flex-col gap-4'>
        {/* Employee selector (only for "Input MCU" flow, not Update) */}
        {!prefillEmployee && (
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='emp-select'>
              Employee <span className='text-red-500'>*</span>
            </Label>
            <select
              id='emp-select'
              className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none'
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              required
            >
              <option value=''>Select employee…</option>
              {allEmployees.map((emp) => (
                <option key={emp.employeeId} value={emp.employeeId}>
                  {emp.employeeName} · {emp.employeeNumber}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className='grid gap-4 sm:grid-cols-2'>
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='mcu-date-m'>
              MCU Date <span className='text-red-500'>*</span>
            </Label>
            <Input
              id='mcu-date-m'
              type='date'
              value={form.mcuDate}
              onChange={setF('mcuDate')}
              required
            />
          </div>
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='mcu-provider-m'>
              MCU Provider <span className='text-red-500'>*</span>
            </Label>
            <Input
              id='mcu-provider-m'
              value={form.provider}
              onChange={setF('provider')}
              placeholder='e.g. Prodia'
              required
            />
          </div>
        </div>

        <div className='grid gap-4 sm:grid-cols-2'>
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='exam-type-m'>
              Examination Type <span className='text-red-500'>*</span>
            </Label>
            <select
              id='exam-type-m'
              className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none'
              value={form.examinationType}
              onChange={(e) =>
                setForm((p) => ({ ...p, examinationType: e.target.value as ExaminationType }))
              }
            >
              <option>Annual MCU</option>
              <option>Pre-Employment</option>
              <option>Periodic</option>
              <option>Special</option>
            </select>
          </div>
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='mcu-status-m'>
              MCU Status <span className='text-red-500'>*</span>
            </Label>
            <select
              id='mcu-status-m'
              className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none'
              value={form.status}
              onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as McuStatus }))}
            >
              <option>Fit</option>
              <option>Fit with Notes</option>
              <option>Temporary Unfit</option>
              <option>Unfit</option>
            </select>
          </div>
        </div>

        <div className='grid gap-4 sm:grid-cols-2'>
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='next-due-m'>
              Next MCU Due <span className='text-red-500'>*</span>
            </Label>
            <Input
              id='next-due-m'
              type='date'
              value={form.nextDueDate}
              onChange={setF('nextDueDate')}
              required
            />
          </div>
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='follow-up-m'>Follow-up Required</Label>
            <select
              id='follow-up-m'
              className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none'
              value={form.followUpRequired ? 'Yes' : 'No'}
              onChange={(e) =>
                setForm((p) => ({ ...p, followUpRequired: e.target.value === 'Yes' }))
              }
            >
              <option>No</option>
              <option>Yes</option>
            </select>
          </div>
        </div>

        <div className='flex flex-col gap-1.5'>
          <Label htmlFor='admin-note-m'>Administrative Note</Label>
          <textarea
            id='admin-note-m'
            rows={2}
            className='flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none'
            placeholder='e.g. Fit for work. No follow-up required.'
            value={form.administrativeNote}
            onChange={setF('administrativeNote')}
          />
        </div>

        {/* Document Upload & Preview */}
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
                    htmlFor='mcu-doc-upload-m'
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
                id='mcu-doc-upload-m'
                type='file'
                accept='.pdf,.jpg,.jpeg,.png'
                className='sr-only'
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <label
              htmlFor='mcu-doc-upload-m'
              className='flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border py-4 transition-colors hover:border-primary/50 hover:bg-muted/30'
            >
              <IconUpload className='size-6 text-muted-foreground' />
              <span className='text-xs font-medium text-primary'>Upload PDF / image result</span>
              <span className='text-[11px] text-muted-foreground'>Maximum 10 MB</span>
              <input
                id='mcu-doc-upload-m'
                type='file'
                accept='.pdf,.jpg,.jpeg,.png'
                className='sr-only'
                onChange={handleFileChange}
              />
            </label>
          )}
        </div>

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
            Save MCU
          </Button>
        </DialogFooter>
      </form>

      {/* Embedded Document Preview Modal */}
      <McuDocumentPreviewDialog
        open={docPreviewOpen}
        onClose={() => setDocPreviewOpen(false)}
        record={{
          id: existing?.id || 'preview',
          employeeId: selectedEmpId,
          mcuDate: form.mcuDate || dayjs().format('YYYY-MM-DD'),
          provider: form.provider || 'Occupational Health Clinic',
          examinationType: form.examinationType,
          status: form.status,
          nextDueDate: form.nextDueDate || dayjs().add(1, 'year').format('YYYY-MM-DD'),
          followUpRequired: form.followUpRequired,
          administrativeNote: form.administrativeNote,
          documentName: form.documentName,
          documentSize: form.documentSize,
          createdAt: existing?.createdAt || new Date().toISOString(),
          bloodPressure: existing?.bloodPressure,
          bmi: existing?.bmi,
          fastingBloodSugar: existing?.fastingBloodSugar,
          totalCholesterol: existing?.totalCholesterol,
          vision: existing?.vision,
          audiometry: existing?.audiometry,
          xray: existing?.xray,
          doctorRecommendations: existing?.doctorRecommendations,
        }}
        employeeName={targetEmp?.employeeName || 'Employee'}
        employeeNumber={targetEmp?.employeeNumber || '-'}
        positionName=''
        branchName=''
      />
    </>
  )
}

function InputMcuDialog({ open, onClose, prefillEmployee, allEmployees }: InputMcuDialogProps) {
  const [selectedEmpId, setSelectedEmpId] = useState(prefillEmployee?.employeeId ?? '')

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className='max-h-[94vh] [scrollbar-width:none] overflow-y-auto p-6 sm:max-w-xl md:max-w-2xl [&::-webkit-scrollbar]:hidden'>
        <InputMcuModalContent
          key={`${prefillEmployee?.employeeId || selectedEmpId || 'new'}-${prefillEmployee?.latestMcu?.id || 'new'}`}
          onClose={onClose}
          prefillEmployee={prefillEmployee}
          allEmployees={allEmployees}
          selectedEmpId={selectedEmpId || prefillEmployee?.employeeId || ''}
          setSelectedEmpId={setSelectedEmpId}
        />
      </DialogContent>
    </Dialog>
  )
}

// ─── Reminder Policy Card ─────────────────────────────────────────────────────

function ReminderPolicyCard() {
  const { reminderPolicy } = useEmployeeMcuStore()

  return (
    <Card>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <CardTitle className='flex items-center gap-2 text-base'>
            <IconBell className='size-5 text-primary' />
            Reminder Policy
          </CardTitle>
          <Badge variant={reminderPolicy.isActive ? 'green' : 'slate'} className='text-[11px]'>
            {reminderPolicy.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className='flex flex-col gap-3'>
        <div className='rounded-lg border bg-muted/20 p-3 text-sm'>
          <p className='mb-2 text-base font-semibold'>MCU Due Reminder</p>
          <div className='flex flex-col gap-2 text-sm'>
            <div className='flex items-center gap-2'>
              <span className='w-20 shrink-0 text-xs text-muted-foreground'>Trigger</span>
              <span className='text-xs font-medium'>{reminderPolicy.trigger}</span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='w-20 shrink-0 text-xs text-muted-foreground'>Recipients</span>
              <span className='text-xs font-medium'>{reminderPolicy.recipients}</span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='w-20 shrink-0 text-xs text-muted-foreground'>Channels</span>
              <div className='flex flex-wrap gap-1'>
                {reminderPolicy.channels.map((ch) => (
                  <Badge key={ch} variant='outline' className='text-[10px] font-medium'>
                    {ch === 'Email' && <IconMail className='mr-1 size-2.5' />}
                    {ch === 'WhatsApp' && <IconMessageCircle className='mr-1 size-2.5' />}
                    {ch === 'Push' && <IconBell className='mr-1 size-2.5' />}
                    {ch}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div>
          <p className='mb-2 text-xs font-medium text-muted-foreground'>Default schedule</p>
          <div className='grid grid-cols-2 gap-2'>
            {reminderPolicy.scheduleDays
              .filter((d) => d > 0)
              .map((d) => (
                <div
                  key={d}
                  className='flex items-center justify-center rounded-lg border bg-primary/5 py-2 text-sm font-bold text-primary'
                >
                  {d} days
                </div>
              ))}
            <div className='flex items-center justify-center rounded-lg border bg-primary/5 py-2 text-sm font-bold text-primary'>
              Due date
            </div>
          </div>
        </div>

        <div className='rounded-lg border bg-muted/20 p-3 text-xs text-muted-foreground'>
          Reminder stops automatically when a newer MCU record is saved. Overdue remains visible to
          HR until updated.
        </div>

        <Button
          variant='outline'
          className='w-full'
          onClick={() => snackbar.info('Notification template management coming soon.')}
        >
          <IconSettings className='size-4' />
          Manage Notification Template
        </Button>
      </CardContent>
    </Card>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function EmployeeMcuManagementPage() {
  const { getAllRecordsWithStatus } = useEmployeeMcuStore()

  const [search, setSearch] = useState('')
  const [dueFilter, setDueFilter] = useState<McuDueStatus | 'All'>('All')
  const [inputOpen, setInputOpen] = useState(false)
  const [updateTarget, setUpdateTarget] = useState<
    (McuEmployeeRecord & { latestMcu?: McuRecord; dueStatus: McuDueStatus }) | null
  >(null)

  const allRecords = getAllRecordsWithStatus()

  const stats = useMemo(
    () => ({
      dueSoon: allRecords.filter((r) => r.dueStatus === 'Due Soon').length,
      overdue: allRecords.filter((r) => r.dueStatus === 'Overdue').length,
      followUp: allRecords.filter((r) => r.dueStatus === 'Follow-up').length,
      current: allRecords.filter((r) => r.dueStatus === 'Current').length,
    }),
    [allRecords],
  )

  const filtered = useMemo(() => {
    return allRecords.filter((r) => {
      const matchSearch =
        !search ||
        r.employeeName.toLowerCase().includes(search.toLowerCase()) ||
        r.employeeNumber.toLowerCase().includes(search.toLowerCase())
      const matchFilter = dueFilter === 'All' || r.dueStatus === dueFilter
      return matchSearch && matchFilter
    })
  }, [allRecords, search, dueFilter])

  const dueFilterOptions: Array<McuDueStatus | 'All'> = [
    'All',
    'Current',
    'Due Soon',
    'Overdue',
    'Follow-up',
  ]

  return (
    <AppMain
      breadcrumbs={[
        { to: '/employment/employee-profile', label: 'Employee Information' },
        { label: 'MCU Management' },
      ]}
      title='MCU Management'
      subtitle='Monitor MCU due dates, overdue employees, follow-up, and employee MCU records.'
      actions={
        <Button onClick={() => setInputOpen(true)}>
          <IconPlus className='size-4' />
          Input MCU
        </Button>
      }
    >
      {/* ── Stats ── */}
      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        <StatCard
          count={stats.dueSoon}
          label='Due ≤ 30 Days'
          badge='Reminder Active'
          accentColor='amber'
        />
        <StatCard count={stats.overdue} label='Overdue' badge='Needs Action' accentColor='red' />
        <StatCard
          count={stats.followUp}
          label='Follow-up Required'
          badge='Review'
          accentColor='blue'
        />
        <StatCard count={stats.current} label='Up to Date' badge='Current' accentColor='green' />
      </div>

      {/* ── Main Content Grid ── */}
      <div className='grid gap-6 xl:grid-cols-[1fr_320px]'>
        {/* Employee MCU Records */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-base'>
              <IconUsers className='size-5 text-primary' />
              Employee MCU Records
            </CardTitle>
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            {/* Filters */}
            <div className='flex flex-col gap-3 sm:flex-row'>
              <div className='relative flex-1'>
                <IconSearch className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  placeholder='Search employee / NIP…'
                  className='pl-9'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className='flex shrink-0 items-center gap-2'>
                <IconFilter className='size-4 text-muted-foreground' />
                <select
                  className='flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none'
                  value={dueFilter}
                  onChange={(e) => setDueFilter(e.target.value as McuDueStatus | 'All')}
                >
                  {dueFilterOptions.map((o) => (
                    <option key={o} value={o}>
                      {o === 'All' ? 'Due Status' : o}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table */}
            <div className='overflow-auto rounded-lg border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Last MCU</TableHead>
                    <TableHead>Next Due</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reminder</TableHead>
                    <TableHead className='w-20 text-right'>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className='py-10 text-center text-sm text-muted-foreground'
                      >
                        No employees match your filter.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((rec) => {
                      const dueVariant = getDueStatusVariant(rec.dueStatus)
                      const isDueSoonOrOverdue =
                        rec.dueStatus === 'Due Soon' || rec.dueStatus === 'Overdue'
                      return (
                        <TableRow
                          key={rec.employeeId}
                          className={
                            isDueSoonOrOverdue ? 'bg-amber-50/40 dark:bg-amber-950/10' : ''
                          }
                        >
                          <TableCell>
                            <div className='flex items-center gap-3'>
                              <Avatar className='size-9'>
                                <AvatarFallback className='bg-primary/10 text-xs font-bold text-primary'>
                                  {getInitials(rec.employeeName)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className='text-sm font-semibold'>{rec.employeeName}</p>
                                <p className='text-xs text-muted-foreground'>
                                  {rec.employeeNumber}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className='text-sm'>
                            {fmtDate(rec.latestMcu?.mcuDate)}
                          </TableCell>
                          <TableCell className='text-sm'>
                            {fmtDate(rec.latestMcu?.nextDueDate)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={getMcuStatusVariant(rec.latestMcu?.status)}
                              className='text-[11px]'
                            >
                              {rec.latestMcu?.status ?? 'No Data'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={dueVariant} className='text-[11px]'>
                              {rec.dueStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className='text-right'>
                            <Button
                              size='sm'
                              variant='ghost'
                              className='h-8 gap-1 text-xs text-primary hover:bg-primary/10'
                              onClick={() => setUpdateTarget(rec)}
                            >
                              Update
                              <IconChevronRight className='size-3' />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            <p className='text-xs text-muted-foreground'>
              Showing {filtered.length} of {allRecords.length} employees
            </p>
          </CardContent>
        </Card>

        {/* Reminder Policy */}
        <ReminderPolicyCard />
      </div>

      {/* ── Dialogs ── */}
      <InputMcuDialog
        open={inputOpen}
        onClose={() => setInputOpen(false)}
        allEmployees={allRecords}
      />

      {updateTarget && (
        <InputMcuDialog
          open={true}
          onClose={() => setUpdateTarget(null)}
          prefillEmployee={updateTarget}
          allEmployees={allRecords}
        />
      )}
    </AppMain>
  )
}
