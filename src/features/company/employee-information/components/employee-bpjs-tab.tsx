// src/features/company/employee-information/components/employee-bpjs-tab.tsx
import {
  IconCheck,
  IconEdit,
  IconExternalLink,
  IconPencil,
  IconPlus,
  IconRefresh,
  IconTrash,
} from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'

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
import { formatIDR } from '@/features/payroll/data/mock-payroll-data'
import {
  usePayrollBpjsStore,
  type BpjsDependent,
} from '@/features/payroll/store/payroll-bpjs-store'

interface EmployeeBpjsTabProps {
  employeeId: string
  defaultHealthNumber?: string | null
  defaultEmploymentNumber?: string | null
}

export function EmployeeBpjsTab({
  employeeId,
  defaultHealthNumber,
  defaultEmploymentNumber,
}: EmployeeBpjsTabProps) {
  const {
    bpjsTkConfig,
    bpjsKesConfig,
    getEmployeeBpjsRecord,
    updateEmployeeHealthData,
    updateEmployeeEmploymentData,
    addDependent,
    updateDependent,
    deleteDependent,
    syncBpjsRecords,
  } = usePayrollBpjsStore()

  const record = getEmployeeBpjsRecord(
    employeeId,
    defaultHealthNumber || undefined,
    defaultEmploymentNumber || undefined,
  )

  const [isSyncing, setIsSyncing] = useState(false)

  // Dialog States
  const [healthModalOpen, setHealthModalOpen] = useState(false)
  const [healthForm, setHealthForm] = useState(record.health)

  const [employmentModalOpen, setEmploymentModalOpen] = useState(false)
  const [employmentForm, setEmploymentForm] = useState(record.employment)

  const [depModalOpen, setDepModalOpen] = useState(false)
  const [selectedDep, setSelectedDep] = useState<BpjsDependent | null>(null)
  const [depForm, setDepForm] = useState<Omit<BpjsDependent, 'id'>>({
    name: '',
    relationship: 'Child',
    dateOfBirth: '',
    status: 'Pending',
  })

  // Sync action
  const handleSync = () => {
    setIsSyncing(true)
    setTimeout(() => {
      syncBpjsRecords(employeeId)
      setIsSyncing(false)
      snackbar.success(
        'BPJS Records successfully synchronized with Payroll BPJS configuration!',
      )
    }, 600)
  }

  // Health Data Save
  const handleSaveHealth = (e: React.FormEvent) => {
    e.preventDefault()
    updateEmployeeHealthData(employeeId, healthForm)
    setHealthModalOpen(false)
    snackbar.success('BPJS Kesehatan data updated successfully!')
  }

  // Employment Data Save
  const handleSaveEmployment = (e: React.FormEvent) => {
    e.preventDefault()
    updateEmployeeEmploymentData(employeeId, employmentForm)
    setEmploymentModalOpen(false)
    snackbar.success('BPJS Ketenagakerjaan data updated successfully!')
  }

  // Open Dependent Modal for Create
  const handleOpenAddDep = () => {
    setSelectedDep(null)
    setDepForm({
      name: '',
      relationship: 'Child',
      dateOfBirth: '',
      status: 'Pending',
    })
    setDepModalOpen(true)
  }

  // Open Dependent Modal for Edit
  const handleOpenEditDep = (dep: BpjsDependent) => {
    setSelectedDep(dep)
    setDepForm({
      name: dep.name,
      relationship: dep.relationship,
      dateOfBirth: dep.dateOfBirth,
      status: dep.status,
    })
    setDepModalOpen(true)
  }

  // Save Dependent
  const handleSaveDep = (e: React.FormEvent) => {
    e.preventDefault()
    if (!depForm.name.trim()) {
      snackbar.error('Dependent name is required.')
      return
    }
    if (selectedDep) {
      updateDependent(employeeId, selectedDep.id, depForm)
      snackbar.success('Dependent updated successfully!')
    } else {
      addDependent(employeeId, depForm)
      snackbar.success('New dependent added successfully!')
    }
    setDepModalOpen(false)
  }

  const handleDeleteDep = (depId: string, name: string) => {
    if (confirm(`Remove ${name} from registered dependents?`)) {
      deleteDependent(employeeId, depId)
      snackbar.success('Dependent removed.')
    }
  }

  const pendingDependentsCount = record.dependents.filter((d) => d.status === 'Pending').length

  return (
    <div className='flex min-w-0 flex-col gap-6'>
      {/* ── Section Header matching screenshot ── */}
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h2 className='text-xl font-bold tracking-tight text-foreground'>BPJS Number</h2>
          <p className='text-xs text-muted-foreground'>
            Manage BPJS Kesehatan and Ketenagakerjaan membership, dependents, and synchronization.
          </p>
        </div>
        <Button
          onClick={handleSync}
          disabled={isSyncing}
          className='inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-blue-700'
        >
          <IconRefresh size={16} className={isSyncing ? 'animate-spin' : ''} />
          {isSyncing ? 'Syncing...' : 'Sync BPJS Records'}
        </Button>
      </div>

      {/* ── Top Grid: BPJS Kesehatan & BPJS Ketenagakerjaan ── */}
      <div className='grid min-w-0 gap-6 lg:grid-cols-2'>
        {/* Card 1: BPJS Kesehatan */}
        <Card className='rounded-2xl border border-border/70 shadow-xs'>
          <CardHeader className='flex flex-row items-center justify-between pb-3'>
            <CardTitle className='text-base font-bold text-foreground'>BPJS Kesehatan</CardTitle>
            <Badge
              variant={record.health.status === 'Active' ? 'green' : 'slate'}
              className='rounded-full px-2.5 py-0.5 text-[11px] font-medium'
            >
              {record.health.status}
            </Badge>
          </CardHeader>
          <CardContent className='space-y-4 pt-1'>
            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
              <div className='space-y-1'>
                <span className='text-[11px] font-medium text-muted-foreground'>
                  Participant Number
                </span>
                <div className='flex h-10 items-center rounded-xl border border-input bg-background px-3 text-xs font-semibold text-foreground'>
                  {record.health.participantNumber || '-'}
                </div>
              </div>

              <div className='space-y-1'>
                <span className='text-[11px] font-medium text-muted-foreground'>
                  Member Since
                </span>
                <div className='flex h-10 items-center rounded-xl border border-input bg-background px-3 text-xs text-foreground'>
                  {record.health.memberSince || '-'}
                </div>
              </div>

              <div className='space-y-1'>
                <span className='text-[11px] font-medium text-muted-foreground'>Class</span>
                <div className='flex h-10 items-center rounded-xl border border-input bg-background px-3 text-xs text-foreground'>
                  {record.health.classLevel || '-'}
                </div>
              </div>

              <div className='space-y-1'>
                <span className='text-[11px] font-medium text-muted-foreground'>Facility</span>
                <div className='flex h-10 items-center truncate rounded-xl border border-input bg-background px-3 text-xs text-foreground'>
                  {record.health.facility || '-'}
                </div>
              </div>

              <div className='space-y-1'>
                <span className='text-[11px] font-medium text-muted-foreground'>
                  Contribution
                </span>
                <div className='flex h-10 items-center justify-between rounded-xl border border-input bg-background px-3 text-xs text-foreground'>
                  <span>Company + Employee</span>
                  <span className='text-[10px] font-medium text-blue-600 dark:text-blue-400'>
                    {bpjsKesConfig.companyRatePercent}% + {bpjsKesConfig.employeeRatePercent}%
                  </span>
                </div>
              </div>

              <div className='space-y-1'>
                <span className='text-[11px] font-medium text-muted-foreground'>Last Sync</span>
                <div className='flex h-10 items-center rounded-xl border border-input bg-background px-3 text-xs text-muted-foreground'>
                  {record.lastSync}
                </div>
              </div>
            </div>

            <Button
              type='button'
              variant='outline'
              onClick={() => {
                setHealthForm(record.health)
                setHealthModalOpen(true)
              }}
              className='mt-2 w-full gap-2 rounded-xl text-xs font-semibold'
            >
              <IconPencil size={15} />
              Edit Health Data
            </Button>
          </CardContent>
        </Card>

        {/* Card 2: BPJS Ketenagakerjaan */}
        <Card className='rounded-2xl border border-border/70 shadow-xs'>
          <CardHeader className='flex flex-row items-center justify-between pb-3'>
            <CardTitle className='text-base font-bold text-foreground'>
              BPJS Ketenagakerjaan
            </CardTitle>
            <Badge
              variant={record.employment.status === 'Active' ? 'green' : 'slate'}
              className='rounded-full px-2.5 py-0.5 text-[11px] font-medium'
            >
              {record.employment.status}
            </Badge>
          </CardHeader>
          <CardContent className='space-y-4 pt-1'>
            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
              <div className='space-y-1'>
                <span className='text-[11px] font-medium text-muted-foreground'>
                  Participant Number
                </span>
                <div className='flex h-10 items-center rounded-xl border border-input bg-background px-3 text-xs font-semibold text-foreground'>
                  {record.employment.participantNumber || '-'}
                </div>
              </div>

              <div className='space-y-1'>
                <span className='text-[11px] font-medium text-muted-foreground'>
                  Member Since
                </span>
                <div className='flex h-10 items-center rounded-xl border border-input bg-background px-3 text-xs text-foreground'>
                  {record.employment.memberSince || '-'}
                </div>
              </div>

              <div className='space-y-1'>
                <div className='flex items-center justify-between'>
                  <span className='text-[11px] font-medium text-muted-foreground'>JHT</span>
                  <span className='text-[10px] text-muted-foreground'>
                    {(bpjsTkConfig.jhtCompanyPercent + bpjsTkConfig.jhtEmployeePercent).toFixed(1)}%
                  </span>
                </div>
                <div className='flex h-10 items-center rounded-xl border border-input bg-background px-3 text-xs font-medium text-foreground'>
                  {record.employment.jht ? 'Active' : 'Inactive'}
                </div>
              </div>

              <div className='space-y-1'>
                <div className='flex items-center justify-between'>
                  <span className='text-[11px] font-medium text-muted-foreground'>JKK</span>
                  <span className='text-[10px] text-muted-foreground'>
                    {bpjsTkConfig.jkkRatePercent}%
                  </span>
                </div>
                <div className='flex h-10 items-center rounded-xl border border-input bg-background px-3 text-xs font-medium text-foreground'>
                  {record.employment.jkk ? 'Active' : 'Inactive'}
                </div>
              </div>

              <div className='space-y-1'>
                <div className='flex items-center justify-between'>
                  <span className='text-[11px] font-medium text-muted-foreground'>JKM</span>
                  <span className='text-[10px] text-muted-foreground'>
                    {bpjsTkConfig.jkmRatePercent}%
                  </span>
                </div>
                <div className='flex h-10 items-center rounded-xl border border-input bg-background px-3 text-xs font-medium text-foreground'>
                  {record.employment.jkm ? 'Active' : 'Inactive'}
                </div>
              </div>

              <div className='space-y-1'>
                <div className='flex items-center justify-between'>
                  <span className='text-[11px] font-medium text-muted-foreground'>JP</span>
                  <span className='text-[10px] text-muted-foreground'>
                    {(bpjsTkConfig.jpCompanyPercent + bpjsTkConfig.jpEmployeePercent).toFixed(1)}%
                  </span>
                </div>
                <div className='flex h-10 items-center rounded-xl border border-input bg-background px-3 text-xs font-medium text-foreground'>
                  {record.employment.jp ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>

            <Button
              type='button'
              variant='outline'
              onClick={() => {
                setEmploymentForm(record.employment)
                setEmploymentModalOpen(true)
              }}
              className='mt-2 w-full gap-2 rounded-xl text-xs font-semibold'
            >
              <IconPencil size={15} />
              Edit Employment BPJS
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ── Bottom Grid: Registered Dependents & Synchronization Status ── */}
      <div className='grid min-w-0 gap-6 lg:grid-cols-12'>
        {/* Card 3: Registered Dependents (7 cols) */}
        <Card className='rounded-2xl border border-border/70 shadow-xs lg:col-span-7'>
          <CardHeader className='flex flex-row items-center justify-between pb-3'>
            <CardTitle className='text-base font-bold text-foreground'>
              Registered Dependents
            </CardTitle>
            <button
              type='button'
              onClick={handleOpenAddDep}
              className='inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400'
            >
              <IconPlus size={14} />
              Add Dependent
            </button>
          </CardHeader>
          <CardContent className='pt-0'>
            {!bpjsKesConfig.includeFamilyMembers && (
              <div className='mb-3 rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300'>
                ⚠️ Family coverage is currently toggled OFF in Payroll Settings.
              </div>
            )}

            <div className='overflow-x-auto rounded-xl border border-border/50'>
              <Table>
                <TableHeader>
                  <TableRow className='bg-muted/20 text-xs hover:bg-muted/20'>
                    <TableHead className='py-3 font-semibold text-muted-foreground'>Name</TableHead>
                    <TableHead className='py-3 font-semibold text-muted-foreground'>
                      Relationship
                    </TableHead>
                    <TableHead className='py-3 font-semibold text-muted-foreground'>
                      Date of Birth
                    </TableHead>
                    <TableHead className='py-3 font-semibold text-muted-foreground'>Status</TableHead>
                    <TableHead className='py-3 text-right font-semibold text-muted-foreground'>
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {record.dependents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className='py-8 text-center text-xs text-muted-foreground'>
                        No registered dependents found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    record.dependents.map((dep) => (
                      <TableRow key={dep.id} className='text-xs hover:bg-muted/10'>
                        <TableCell className='py-3 font-semibold text-foreground'>
                          {dep.name}
                        </TableCell>
                        <TableCell className='py-3 text-muted-foreground'>
                          {dep.relationship}
                        </TableCell>
                        <TableCell className='py-3 text-muted-foreground'>
                          {dep.dateOfBirth}
                        </TableCell>
                        <TableCell className='py-3'>
                          <Badge
                            variant={dep.status === 'Active' ? 'green' : 'amber'}
                            className='rounded-full px-2 py-0.5 text-[10px]'
                          >
                            {dep.status}
                          </Badge>
                        </TableCell>
                        <TableCell className='py-3 text-right'>
                          <div className='inline-flex items-center gap-1'>
                            <button
                              type='button'
                              onClick={() => handleOpenEditDep(dep)}
                              className='rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground'
                              title='Edit'
                            >
                              <IconEdit size={14} />
                            </button>
                            <button
                              type='button'
                              onClick={() => handleDeleteDep(dep.id, dep.name)}
                              className='rounded p-1 text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40'
                              title='Remove'
                            >
                              <IconTrash size={14} />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Synchronization Status (5 cols) */}
        <Card className='rounded-2xl border border-border/70 shadow-xs lg:col-span-5'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-base font-bold text-foreground'>
              Synchronization Status
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4 pt-0'>
            <div className='space-y-2.5 divide-y divide-border/40 text-xs'>
              <div className='flex items-center justify-between pt-1'>
                <span className='text-foreground'>BPJS Kesehatan</span>
                <Badge variant='green' className='rounded-full px-2 py-0.5 text-[10px]'>
                  Synced
                </Badge>
              </div>

              <div className='flex items-center justify-between pt-2.5'>
                <span className='text-foreground'>BPJS Ketenagakerjaan</span>
                <Badge variant='green' className='rounded-full px-2 py-0.5 text-[10px]'>
                  Synced
                </Badge>
              </div>

              <div className='flex items-center justify-between pt-2.5'>
                <span className='text-foreground'>Dependent validation</span>
                <Badge
                  variant={pendingDependentsCount > 0 ? 'amber' : 'green'}
                  className='rounded-full px-2 py-0.5 text-[10px]'
                >
                  {pendingDependentsCount > 0
                    ? `${pendingDependentsCount} pending`
                    : 'All validated'}
                </Badge>
              </div>

              <div className='flex items-center justify-between pt-2.5'>
                <span className='text-foreground'>Contribution period</span>
                <Badge variant='blue' className='rounded-full px-2.5 py-0.5 text-[10px] font-semibold'>
                  August 2025
                </Badge>
              </div>
            </div>

            {/* Live Synchronized Payroll Configuration Info Box */}
            <div className='mt-4 rounded-xl border border-blue-200/80 bg-blue-50/60 p-3.5 dark:border-blue-900/50 dark:bg-blue-950/30'>
              <div className='flex items-center justify-between'>
                <span className='text-xs font-bold text-blue-900 dark:text-blue-300'>
                  Synced with Payroll Setting
                </span>
                <span className='flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400'>
                  <IconCheck size={13} /> Active Rates
                </span>
              </div>
              <div className='mt-2 space-y-1 text-[11px] text-muted-foreground'>
                <p>
                  • <strong className='text-foreground'>BPJS Kesehatan:</strong>{' '}
                  {bpjsKesConfig.companyRatePercent}% Perusahaan + {bpjsKesConfig.employeeRatePercent}% Karyawan{' '}
                  (Maks: {formatIDR(bpjsKesConfig.maxWageCap)})
                </p>
                <p>
                  • <strong className='text-foreground'>BPJS TK:</strong> JHT{' '}
                  {(bpjsTkConfig.jhtCompanyPercent + bpjsTkConfig.jhtEmployeePercent).toFixed(1)}% | JKK{' '}
                  {bpjsTkConfig.jkkRatePercent}% | JKM {bpjsTkConfig.jkmRatePercent}% | JP{' '}
                  {(bpjsTkConfig.jpCompanyPercent + bpjsTkConfig.jpEmployeePercent).toFixed(1)}%
                </p>
              </div>
              <div className='mt-3 flex flex-wrap items-center gap-2'>
                <Link
                  to='/payroll/configuration'
                  search={{ subTab: 'bpjs-tk' }}
                  className='inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 underline-offset-2 hover:underline dark:text-blue-400'
                >
                  Open Payroll BPJS Settings
                  <IconExternalLink size={12} />
                </Link>
                <span className='text-[10px] text-muted-foreground'>|</span>
                <Link
                  to='/payroll/configuration'
                  search={{ subTab: 'bpjs-kes' }}
                  className='inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 underline-offset-2 hover:underline dark:text-blue-400'
                >
                  BPJS Kesehatan
                  <IconExternalLink size={12} />
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Modal: Edit Health Data ── */}
      <Dialog open={healthModalOpen} onOpenChange={setHealthModalOpen}>
        <DialogContent className='max-w-md rounded-2xl'>
          <DialogHeader>
            <DialogTitle>Edit BPJS Kesehatan Data</DialogTitle>
            <DialogDescription>
              Update employee participant number, membership class, and primary clinic facility.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveHealth} className='space-y-4 py-2'>
            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold'>Participant Number</Label>
              <Input
                value={healthForm.participantNumber}
                onChange={(e) =>
                  setHealthForm((prev) => ({ ...prev, participantNumber: e.target.value }))
                }
                placeholder='e.g. 0001234567890'
                className='h-9 text-xs'
                required
              />
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold'>Member Since</Label>
                <Input
                  value={healthForm.memberSince}
                  onChange={(e) =>
                    setHealthForm((prev) => ({ ...prev, memberSince: e.target.value }))
                  }
                  placeholder='e.g. 1 June 2023'
                  className='h-9 text-xs'
                />
              </div>
              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold'>Class</Label>
                <select
                  value={healthForm.classLevel}
                  onChange={(e) =>
                    setHealthForm((prev) => ({ ...prev, classLevel: e.target.value }))
                  }
                  className='h-9 w-full rounded-xl border border-input bg-background px-3 text-xs'
                >
                  <option value='Class 1'>Class 1</option>
                  <option value='Class 2'>Class 2</option>
                  <option value='Class 3'>Class 3</option>
                </select>
              </div>
            </div>

            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold'>Healthcare Facility (Faskes Tk. 1)</Label>
              <Input
                value={healthForm.facility}
                onChange={(e) =>
                  setHealthForm((prev) => ({ ...prev, facility: e.target.value }))
                }
                placeholder='e.g. Puskesmas Tanah Abang'
                className='h-9 text-xs'
              />
            </div>

            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold'>Status</Label>
              <select
                value={healthForm.status}
                onChange={(e) =>
                  setHealthForm((prev) => ({
                    ...prev,
                    status: e.target.value as 'Active' | 'Inactive',
                  }))
                }
                className='h-9 w-full rounded-xl border border-input bg-background px-3 text-xs'
              >
                <option value='Active'>Active</option>
                <option value='Inactive'>Inactive</option>
              </select>
            </div>

            <DialogFooter className='pt-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setHealthModalOpen(false)}
                className='h-9 text-xs'
              >
                Cancel
              </Button>
              <Button type='submit' className='h-9 bg-blue-600 text-xs hover:bg-blue-700'>
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Modal: Edit Employment BPJS ── */}
      <Dialog open={employmentModalOpen} onOpenChange={setEmploymentModalOpen}>
        <DialogContent className='max-w-md rounded-2xl'>
          <DialogHeader>
            <DialogTitle>Edit BPJS Ketenagakerjaan Data</DialogTitle>
            <DialogDescription>
              Configure participant number and active social security programs.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveEmployment} className='space-y-4 py-2'>
            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold'>Participant Number</Label>
              <Input
                value={employmentForm.participantNumber}
                onChange={(e) =>
                  setEmploymentForm((prev) => ({ ...prev, participantNumber: e.target.value }))
                }
                placeholder='e.g. 190001234567890'
                className='h-9 text-xs'
                required
              />
            </div>

            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold'>Member Since</Label>
              <Input
                value={employmentForm.memberSince}
                onChange={(e) =>
                  setEmploymentForm((prev) => ({ ...prev, memberSince: e.target.value }))
                }
                placeholder='e.g. 1 June 2023'
                className='h-9 text-xs'
              />
            </div>

            <div className='space-y-2 pt-1'>
              <Label className='text-xs font-semibold'>Active Program Participation</Label>
              <div className='grid grid-cols-2 gap-2 text-xs'>
                <label className='flex items-center gap-2 rounded-xl border p-2.5 cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={employmentForm.jht}
                    onChange={(e) =>
                      setEmploymentForm((prev) => ({ ...prev, jht: e.target.checked }))
                    }
                    className='accent-blue-600'
                  />
                  <span>JHT (Hari Tua)</span>
                </label>
                <label className='flex items-center gap-2 rounded-xl border p-2.5 cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={employmentForm.jkk}
                    onChange={(e) =>
                      setEmploymentForm((prev) => ({ ...prev, jkk: e.target.checked }))
                    }
                    className='accent-blue-600'
                  />
                  <span>JKK (Kecelakaan)</span>
                </label>
                <label className='flex items-center gap-2 rounded-xl border p-2.5 cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={employmentForm.jkm}
                    onChange={(e) =>
                      setEmploymentForm((prev) => ({ ...prev, jkm: e.target.checked }))
                    }
                    className='accent-blue-600'
                  />
                  <span>JKM (Kematian)</span>
                </label>
                <label className='flex items-center gap-2 rounded-xl border p-2.5 cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={employmentForm.jp}
                    onChange={(e) =>
                      setEmploymentForm((prev) => ({ ...prev, jp: e.target.checked }))
                    }
                    className='accent-blue-600'
                  />
                  <span>JP (Pensiun)</span>
                </label>
              </div>
            </div>

            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold'>Status</Label>
              <select
                value={employmentForm.status}
                onChange={(e) =>
                  setEmploymentForm((prev) => ({
                    ...prev,
                    status: e.target.value as 'Active' | 'Inactive',
                  }))
                }
                className='h-9 w-full rounded-xl border border-input bg-background px-3 text-xs'
              >
                <option value='Active'>Active</option>
                <option value='Inactive'>Inactive</option>
              </select>
            </div>

            <DialogFooter className='pt-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setEmploymentModalOpen(false)}
                className='h-9 text-xs'
              >
                Cancel
              </Button>
              <Button type='submit' className='h-9 bg-blue-600 text-xs hover:bg-blue-700'>
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Modal: Add / Edit Dependent ── */}
      <Dialog open={depModalOpen} onOpenChange={setDepModalOpen}>
        <DialogContent className='max-w-md rounded-2xl'>
          <DialogHeader>
            <DialogTitle>{selectedDep ? 'Edit Dependent' : 'Add Registered Dependent'}</DialogTitle>
            <DialogDescription>
              Enter dependent family member details for BPJS Kesehatan coverage.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveDep} className='space-y-4 py-2'>
            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold'>Full Name</Label>
              <Input
                value={depForm.name}
                onChange={(e) => setDepForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder='e.g. Sinta Maharani'
                className='h-9 text-xs'
                required
              />
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold'>Relationship</Label>
                <select
                  value={depForm.relationship}
                  onChange={(e) => setDepForm((prev) => ({ ...prev, relationship: e.target.value }))}
                  className='h-9 w-full rounded-xl border border-input bg-background px-3 text-xs'
                >
                  <option value='Wife'>Wife</option>
                  <option value='Husband'>Husband</option>
                  <option value='Child'>Child</option>
                  <option value='Parent'>Parent</option>
                </select>
              </div>

              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold'>Date of Birth</Label>
                <Input
                  value={depForm.dateOfBirth}
                  onChange={(e) => setDepForm((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
                  placeholder='e.g. 21 Apr 1993'
                  className='h-9 text-xs'
                />
              </div>
            </div>

            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold'>Verification Status</Label>
              <select
                value={depForm.status}
                onChange={(e) =>
                  setDepForm((prev) => ({
                    ...prev,
                    status: e.target.value as 'Active' | 'Pending',
                  }))
                }
                className='h-9 w-full rounded-xl border border-input bg-background px-3 text-xs'
              >
                <option value='Active'>Active</option>
                <option value='Pending'>Pending</option>
              </select>
            </div>

            <DialogFooter className='pt-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setDepModalOpen(false)}
                className='h-9 text-xs'
              >
                Cancel
              </Button>
              <Button type='submit' className='h-9 bg-blue-600 text-xs hover:bg-blue-700'>
                {selectedDep ? 'Update Dependent' : 'Add Dependent'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
