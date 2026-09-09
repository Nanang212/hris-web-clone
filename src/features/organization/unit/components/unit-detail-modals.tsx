// src/features/organization/unit/components/unit-detail-modals.tsx
import {
  IconBriefcase,
  IconBuilding,
  IconEdit,
  IconHierarchy,
  IconMail,
  IconSearch,
  IconUsers,
} from '@tabler/icons-react'
import { useMemo, useState } from 'react'

import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Progress } from '@/shared/components/ui/progress'

import { getDummyMembersForUnit } from '../data/mock-org-data'
import type { DepartmentRecord, DivisionRecord, PositionRecord } from '../types'

// ─── 1. Division Detail Modal ────────────────────────────────────────────────
interface DivisionDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  division: DivisionRecord | null
  onEdit?: (division: DivisionRecord) => void
}

export function DivisionDetailModal({
  open,
  onOpenChange,
  division,
  onEdit,
}: DivisionDetailModalProps) {
  const [search, setSearch] = useState('')

  const members = useMemo(() => {
    if (!division) return []
    return getDummyMembersForUnit(
      division.id,
      division.code,
      division.name,
      'division',
      division.totalEmployees,
      division.headOfDivision,
    )
  }, [division])

  const filteredMembers = useMemo(() => {
    if (!search.trim()) return members
    const q = search.toLowerCase()
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.nik.toLowerCase().includes(q) ||
        m.title.toLowerCase().includes(q),
    )
  }, [members, search])

  if (!division) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='overflow-hidden rounded-2xl p-0 sm:max-w-[580px]'>
        <DialogHeader className='border-b border-border/80 bg-muted/20 p-6 pb-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='flex size-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400'>
                <IconBuilding size={22} />
              </div>
              <div>
                <div className='flex items-center gap-2'>
                  <DialogTitle className='text-base font-bold text-foreground'>
                    {division.name}
                  </DialogTitle>
                  <Badge
                    variant='outline'
                    className={`text-[10px] font-bold ${
                      division.status === 'active'
                        ? 'border-emerald-500/30 bg-emerald-50/50 text-emerald-600 dark:bg-emerald-950/20'
                        : 'border-muted-foreground text-muted-foreground'
                    }`}
                  >
                    {division.status}
                  </Badge>
                </div>
                <DialogDescription className='mt-0.5 font-mono text-xs text-muted-foreground'>
                  {division.code} • Division Unit
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className='max-h-[72vh] space-y-5 overflow-y-auto p-6'>
          {/* Quick Metrics */}
          <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
            <div className='rounded-xl border border-border/80 bg-card p-3'>
              <p className='text-[10px] font-semibold text-muted-foreground'>Cost Center</p>
              <p className='mt-0.5 font-mono text-xs font-bold text-foreground'>
                {division.costCenter || '-'}
              </p>
            </div>
            <div className='rounded-xl border border-border/80 bg-card p-3'>
              <p className='text-[10px] font-semibold text-muted-foreground'>Total Departments</p>
              <p className='mt-0.5 flex items-center gap-1.5 text-xs font-bold text-foreground'>
                <IconHierarchy size={14} className='text-emerald-600' />
                {division.totalDepartments} Depts
              </p>
            </div>
            <div className='col-span-2 rounded-xl border border-border/80 bg-card p-3 sm:col-span-1'>
              <p className='text-[10px] font-semibold text-muted-foreground'>Total Headcount</p>
              <p className='mt-0.5 flex items-center gap-1.5 text-xs font-bold text-foreground'>
                <IconUsers size={14} className='text-blue-600' />
                {division.totalEmployees} Staff
              </p>
            </div>
          </div>

          {/* Division Head Leader Card */}
          <div className='space-y-1.5'>
            <h5 className='text-xs font-bold tracking-wider text-foreground uppercase'>
              Head of Division
            </h5>
            {division.headOfDivision ? (
              <div className='flex items-center gap-3.5 rounded-xl border border-border/80 bg-card p-4'>
                {division.headOfDivision.avatar ? (
                  <img
                    src={division.headOfDivision.avatar}
                    alt={division.headOfDivision.name}
                    className='size-11 shrink-0 rounded-xl border border-border object-cover'
                  />
                ) : (
                  <div className='flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-sm font-bold text-blue-600'>
                    {division.headOfDivision.name.charAt(0)}
                  </div>
                )}
                <div className='min-w-0 flex-1'>
                  <p className='truncate text-xs font-bold text-foreground'>
                    {division.headOfDivision.name}
                  </p>
                  <p className='mt-0.5 truncate text-[11px] text-muted-foreground'>
                    {division.headOfDivision.title}
                  </p>
                  {division.headOfDivision.email && (
                    <p className='mt-1 flex items-center gap-1 truncate text-[10px] text-primary'>
                      <IconMail size={12} className='shrink-0' />
                      {division.headOfDivision.email}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className='rounded-xl border border-dashed p-4 text-center text-xs text-muted-foreground italic'>
                Belum ada kepala divisi yang ditugaskan
              </div>
            )}
          </div>

          {/* Description */}
          <div className='space-y-1.5'>
            <h5 className='text-xs font-bold tracking-wider text-foreground uppercase'>
              Description & Responsibilities
            </h5>
            <div className='rounded-xl border border-border/80 bg-muted/20 p-3.5 text-xs leading-relaxed text-foreground'>
              {division.description || 'Tidak ada deskripsi spesifik untuk divisi ini.'}
            </div>
          </div>

          {/* Assigned Key Personnel (Matching division.totalEmployees) */}
          <div className='space-y-2 border-t border-border/80 pt-2'>
            <div className='flex items-center justify-between text-xs'>
              <h5 className='flex items-center gap-1.5 font-bold tracking-wider text-foreground uppercase'>
                <IconUsers size={14} className='text-primary' />
                Daftar Karyawan Divisi ({members.length})
              </h5>
              <span className='text-[10px] font-semibold text-muted-foreground'>
                Division Level
              </span>
            </div>

            {members.length > 4 && (
              <div className='relative'>
                <IconSearch
                  size={13}
                  className='absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground'
                />
                <input
                  type='text'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={`Cari dari ${members.length} karyawan...`}
                  className='h-8 w-full rounded-xl border border-border/80 bg-background pr-2.5 pl-8 text-xs placeholder:text-muted-foreground focus:ring-1 focus:ring-primary focus:outline-none'
                />
              </div>
            )}

            <div className='max-h-52 space-y-2 overflow-y-auto pr-1'>
              {filteredMembers.length === 0 ? (
                <div className='rounded-xl border border-dashed p-3 text-center text-xs text-muted-foreground italic'>
                  {search
                    ? 'Tidak ada karyawan yang cocok dengan pencarian.'
                    : 'Belum ada personil yang terdaftar di divisi ini.'}
                </div>
              ) : (
                filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className='flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-card p-2.5 text-xs transition-colors hover:bg-muted/30'
                  >
                    <div className='flex min-w-0 items-center gap-2.5'>
                      {member.avatar ? (
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className='size-8 shrink-0 rounded-lg border border-border object-cover'
                        />
                      ) : (
                        <div className='flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-xs font-bold text-blue-600'>
                          {member.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className='min-w-0'>
                        <div className='flex items-center gap-1.5'>
                          <p className='truncate text-[12px] font-bold text-foreground'>
                            {member.name}
                          </p>
                          <span className='py-0.2 shrink-0 rounded bg-muted px-1 font-mono text-[9px] text-muted-foreground'>
                            {member.nik}
                          </span>
                        </div>
                        <p className='truncate text-[11px] text-muted-foreground'>{member.title}</p>
                      </div>
                    </div>
                    <Badge
                      variant='outline'
                      className={`shrink-0 px-1.5 py-0 text-[9px] font-semibold ${
                        member.status === 'active'
                          ? 'border-emerald-500/30 bg-emerald-50/50 text-emerald-600 dark:bg-emerald-950/20'
                          : member.status === 'probation'
                            ? 'border-amber-500/30 bg-amber-50/50 text-amber-600'
                            : 'border-blue-500/30 bg-blue-50/50 text-blue-600'
                      }`}
                    >
                      {member.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <DialogFooter className='flex items-center justify-end gap-2 border-t border-border/80 bg-muted/10 p-4 px-6'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => onOpenChange(false)}
            className='h-9 rounded-xl text-xs'
          >
            Close
          </Button>
          {onEdit && (
            <Button
              type='button'
              size='sm'
              onClick={() => {
                onOpenChange(false)
                onEdit(division)
              }}
              className='h-9 gap-1.5 rounded-xl text-xs font-bold'
            >
              <IconEdit size={14} />
              Edit Division
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── 2. Department Detail Modal ──────────────────────────────────────────────
interface DepartmentDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  department: DepartmentRecord | null
  onEdit?: (department: DepartmentRecord) => void
}

export function DepartmentDetailModal({
  open,
  onOpenChange,
  department,
  onEdit,
}: DepartmentDetailModalProps) {
  const [search, setSearch] = useState('')

  const members = useMemo(() => {
    if (!department) return []
    return getDummyMembersForUnit(
      department.id,
      department.code,
      department.name,
      'department',
      department.totalEmployees,
      department.headOfDepartment,
    )
  }, [department])

  const filteredMembers = useMemo(() => {
    if (!search.trim()) return members
    const q = search.toLowerCase()
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.nik.toLowerCase().includes(q) ||
        m.title.toLowerCase().includes(q),
    )
  }, [members, search])

  if (!department) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='overflow-hidden rounded-2xl p-0 sm:max-w-[580px]'>
        <DialogHeader className='border-b border-border/80 bg-muted/20 p-6 pb-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'>
                <IconHierarchy size={22} />
              </div>
              <div>
                <div className='flex items-center gap-2'>
                  <DialogTitle className='text-base font-bold text-foreground'>
                    {department.name}
                  </DialogTitle>
                  <Badge
                    variant='outline'
                    className={`text-[10px] font-bold ${
                      department.status === 'active'
                        ? 'border-emerald-500/30 bg-emerald-50/50 text-emerald-600 dark:bg-emerald-950/20'
                        : 'border-muted-foreground text-muted-foreground'
                    }`}
                  >
                    {department.status}
                  </Badge>
                </div>
                <DialogDescription className='mt-0.5 font-mono text-xs text-muted-foreground'>
                  {department.code} • under {department.divisionName}
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className='max-h-[72vh] space-y-5 overflow-y-auto p-6'>
          {/* Quick Metrics */}
          <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
            <div className='rounded-xl border border-border/80 bg-card p-3'>
              <p className='text-[10px] font-semibold text-muted-foreground'>Parent Division</p>
              <p className='mt-0.5 truncate text-xs font-bold text-foreground'>
                {department.divisionName}
              </p>
            </div>
            <div className='rounded-xl border border-border/80 bg-card p-3'>
              <p className='text-[10px] font-semibold text-muted-foreground'>Total Positions</p>
              <p className='mt-0.5 flex items-center gap-1.5 text-xs font-bold text-foreground'>
                <IconBriefcase size={14} className='text-purple-600' />
                {department.totalPositions} Positions
              </p>
            </div>
            <div className='col-span-2 rounded-xl border border-border/80 bg-card p-3 sm:col-span-1'>
              <p className='text-[10px] font-semibold text-muted-foreground'>Total Headcount</p>
              <p className='mt-0.5 flex items-center gap-1.5 text-xs font-bold text-foreground'>
                <IconUsers size={14} className='text-emerald-600' />
                {department.totalEmployees} Staff
              </p>
            </div>
          </div>

          {/* Department Head Leader Card */}
          <div className='space-y-1.5'>
            <h5 className='text-xs font-bold tracking-wider text-foreground uppercase'>
              Head of Department
            </h5>
            {department.headOfDepartment ? (
              <div className='flex items-center gap-3.5 rounded-xl border border-border/80 bg-card p-4'>
                {department.headOfDepartment.avatar ? (
                  <img
                    src={department.headOfDepartment.avatar}
                    alt={department.headOfDepartment.name}
                    className='size-11 shrink-0 rounded-xl border border-border object-cover'
                  />
                ) : (
                  <div className='flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-sm font-bold text-emerald-600'>
                    {department.headOfDepartment.name.charAt(0)}
                  </div>
                )}
                <div className='min-w-0 flex-1'>
                  <p className='truncate text-xs font-bold text-foreground'>
                    {department.headOfDepartment.name}
                  </p>
                  <p className='mt-0.5 truncate text-[11px] text-muted-foreground'>
                    {department.headOfDepartment.title}
                  </p>
                  {department.headOfDepartment.email && (
                    <p className='mt-1 flex items-center gap-1 truncate text-[10px] text-primary'>
                      <IconMail size={12} className='shrink-0' />
                      {department.headOfDepartment.email}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className='rounded-xl border border-dashed p-4 text-center text-xs text-muted-foreground italic'>
                Belum ada kepala departemen yang ditugaskan
              </div>
            )}
          </div>

          {/* Description */}
          <div className='space-y-1.5'>
            <h5 className='text-xs font-bold tracking-wider text-foreground uppercase'>
              Description & Objectives
            </h5>
            <div className='rounded-xl border border-border/80 bg-muted/20 p-3.5 text-xs leading-relaxed text-foreground'>
              {department.description || 'Tidak ada deskripsi khusus untuk departemen ini.'}
            </div>
          </div>

          {/* Assigned Department Staff (Matching department.totalEmployees) */}
          <div className='space-y-2 border-t border-border/80 pt-2'>
            <div className='flex items-center justify-between text-xs'>
              <h5 className='flex items-center gap-1.5 font-bold tracking-wider text-foreground uppercase'>
                <IconUsers size={14} className='text-primary' />
                Daftar Personil Departemen ({members.length})
              </h5>
              <span className='text-[10px] font-semibold text-muted-foreground'>
                Department Level
              </span>
            </div>

            {members.length > 4 && (
              <div className='relative'>
                <IconSearch
                  size={13}
                  className='absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground'
                />
                <input
                  type='text'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={`Cari dari ${members.length} karyawan...`}
                  className='h-8 w-full rounded-xl border border-border/80 bg-background pr-2.5 pl-8 text-xs placeholder:text-muted-foreground focus:ring-1 focus:ring-primary focus:outline-none'
                />
              </div>
            )}

            <div className='max-h-52 space-y-2 overflow-y-auto pr-1'>
              {filteredMembers.length === 0 ? (
                <div className='rounded-xl border border-dashed p-3 text-center text-xs text-muted-foreground italic'>
                  {search
                    ? 'Tidak ada karyawan yang cocok dengan pencarian.'
                    : 'Belum ada personil yang terdaftar di departemen ini.'}
                </div>
              ) : (
                filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className='flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-card p-2.5 text-xs transition-colors hover:bg-muted/30'
                  >
                    <div className='flex min-w-0 items-center gap-2.5'>
                      {member.avatar ? (
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className='size-8 shrink-0 rounded-lg border border-border object-cover'
                        />
                      ) : (
                        <div className='flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-xs font-bold text-emerald-600'>
                          {member.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className='min-w-0'>
                        <div className='flex items-center gap-1.5'>
                          <p className='truncate text-[12px] font-bold text-foreground'>
                            {member.name}
                          </p>
                          <span className='py-0.2 shrink-0 rounded bg-muted px-1 font-mono text-[9px] text-muted-foreground'>
                            {member.nik}
                          </span>
                        </div>
                        <p className='truncate text-[11px] text-muted-foreground'>{member.title}</p>
                      </div>
                    </div>
                    <Badge
                      variant='outline'
                      className={`shrink-0 px-1.5 py-0 text-[9px] font-semibold ${
                        member.status === 'active'
                          ? 'border-emerald-500/30 bg-emerald-50/50 text-emerald-600 dark:bg-emerald-950/20'
                          : member.status === 'probation'
                            ? 'border-amber-500/30 bg-amber-50/50 text-amber-600'
                            : 'border-blue-500/30 bg-blue-50/50 text-blue-600'
                      }`}
                    >
                      {member.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <DialogFooter className='flex items-center justify-end gap-2 border-t border-border/80 bg-muted/10 p-4 px-6'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => onOpenChange(false)}
            className='h-9 rounded-xl text-xs'
          >
            Close
          </Button>
          {onEdit && (
            <Button
              type='button'
              size='sm'
              onClick={() => {
                onOpenChange(false)
                onEdit(department)
              }}
              className='h-9 gap-1.5 rounded-xl text-xs font-bold'
            >
              <IconEdit size={14} />
              Edit Department
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── 3. Position Detail Modal ────────────────────────────────────────────────
interface PositionDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  position: PositionRecord | null
  onEdit?: (position: PositionRecord) => void
}

export function PositionDetailModal({
  open,
  onOpenChange,
  position,
  onEdit,
}: PositionDetailModalProps) {
  const [search, setSearch] = useState('')

  const members = useMemo(() => {
    if (!position) return []
    return getDummyMembersForUnit(
      position.id,
      position.code,
      position.title,
      'position',
      position.headcountCurrent,
      null,
    )
  }, [position])

  const filteredMembers = useMemo(() => {
    if (!search.trim()) return members
    const q = search.toLowerCase()
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.nik.toLowerCase().includes(q) ||
        m.title.toLowerCase().includes(q),
    )
  }, [members, search])

  if (!position) return null

  const percent = Math.min(
    100,
    Math.round((position.headcountCurrent / position.headcountLimit) * 100),
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='overflow-hidden rounded-2xl p-0 sm:max-w-[580px]'>
        <DialogHeader className='border-b border-border/80 bg-muted/20 p-6 pb-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='flex size-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400'>
                <IconBriefcase size={22} />
              </div>
              <div>
                <div className='flex items-center gap-2'>
                  <DialogTitle className='text-base font-bold text-foreground'>
                    {position.title}
                  </DialogTitle>
                  <Badge
                    variant='outline'
                    className={`text-[10px] font-bold ${
                      position.status === 'active'
                        ? 'border-emerald-500/30 bg-emerald-50/50 text-emerald-600 dark:bg-emerald-950/20'
                        : 'border-muted-foreground text-muted-foreground'
                    }`}
                  >
                    {position.status}
                  </Badge>
                </div>
                <DialogDescription className='mt-0.5 font-mono text-xs text-muted-foreground'>
                  {position.code} • {position.jobLevel} ({position.jobGrade})
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className='max-h-[72vh] space-y-5 overflow-y-auto p-6'>
          {/* Quick Metrics */}
          <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
            <div className='rounded-xl border border-border/80 bg-card p-3'>
              <p className='text-[10px] font-semibold text-muted-foreground'>Department</p>
              <p className='mt-0.5 truncate text-xs font-bold text-foreground'>
                {position.departmentName}
              </p>
              <p className='text-[10px] text-muted-foreground'>{position.divisionName}</p>
            </div>
            <div className='rounded-xl border border-border/80 bg-card p-3'>
              <p className='text-[10px] font-semibold text-muted-foreground'>Job Grade & Level</p>
              <p className='mt-0.5 text-xs font-bold text-foreground'>
                {position.jobLevel} - {position.jobGrade}
              </p>
            </div>
            <div className='col-span-2 rounded-xl border border-border/80 bg-card p-3 sm:col-span-1'>
              <p className='text-[10px] font-semibold text-muted-foreground'>Direct Superior</p>
              <p className='mt-0.5 truncate text-xs font-bold text-foreground'>
                {position.reportsToPositionTitle || 'Direct Management'}
              </p>
            </div>
          </div>

          {/* Headcount Capacity Bar */}
          <div className='space-y-2.5 rounded-xl border border-border/80 bg-card p-4'>
            <div className='flex items-center justify-between text-xs'>
              <span className='flex items-center gap-1.5 font-bold text-foreground'>
                <IconUsers size={15} className='text-primary' />
                Headcount Quota Capacity
              </span>
              <span className='font-mono font-bold text-foreground'>
                {position.headcountCurrent} / {position.headcountLimit} Terisi ({percent}%)
              </span>
            </div>
            <Progress value={percent} className='h-2 rounded-full' />
            <div className='flex items-center justify-between pt-0.5 text-[11px] text-muted-foreground'>
              <span>Kapasitas Terisi: {position.headcountCurrent} Karyawan</span>
              <span
                className={
                  position.headcountLimit - position.headcountCurrent > 0
                    ? 'font-semibold text-emerald-600'
                    : 'text-muted-foreground'
                }
              >
                {position.headcountLimit - position.headcountCurrent > 0
                  ? `${position.headcountLimit - position.headcountCurrent} Slot Lowongan Terbuka`
                  : 'Kapasitas Penuh (0 Slot Terbuka)'}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className='space-y-1.5'>
            <h5 className='text-xs font-bold tracking-wider text-foreground uppercase'>
              Position Description & Tasks
            </h5>
            <div className='rounded-xl border border-border/80 bg-muted/20 p-3.5 text-xs leading-relaxed text-foreground'>
              {position.description || 'Tidak ada uraian tugas posisi yang didefinisikan.'}
            </div>
          </div>

          {/* Assigned Position Holders (Matching position.headcountCurrent) */}
          <div className='space-y-2 border-t border-border/80 pt-2'>
            <div className='flex items-center justify-between text-xs'>
              <h5 className='flex items-center gap-1.5 font-bold tracking-wider text-foreground uppercase'>
                <IconUsers size={14} className='text-primary' />
                Daftar Pemegang Jabatan Aktif ({members.length})
              </h5>
              <span className='text-[10px] font-semibold text-muted-foreground'>
                Position Assigned
              </span>
            </div>

            {members.length > 4 && (
              <div className='relative'>
                <IconSearch
                  size={13}
                  className='absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground'
                />
                <input
                  type='text'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={`Cari dari ${members.length} karyawan...`}
                  className='h-8 w-full rounded-xl border border-border/80 bg-background pr-2.5 pl-8 text-xs placeholder:text-muted-foreground focus:ring-1 focus:ring-primary focus:outline-none'
                />
              </div>
            )}

            <div className='max-h-52 space-y-2 overflow-y-auto pr-1'>
              {filteredMembers.length === 0 ? (
                <div className='rounded-xl border border-dashed p-3 text-center text-xs text-muted-foreground italic'>
                  {search
                    ? 'Tidak ada karyawan yang cocok dengan pencarian.'
                    : 'Belum ada karyawan aktif yang ditugaskan di posisi ini.'}
                </div>
              ) : (
                filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className='flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-card p-2.5 text-xs transition-colors hover:bg-muted/30'
                  >
                    <div className='flex min-w-0 items-center gap-2.5'>
                      {member.avatar ? (
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className='size-8 shrink-0 rounded-lg border border-border object-cover'
                        />
                      ) : (
                        <div className='flex size-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-xs font-bold text-purple-600'>
                          {member.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className='min-w-0'>
                        <div className='flex items-center gap-1.5'>
                          <p className='truncate text-[12px] font-bold text-foreground'>
                            {member.name}
                          </p>
                          <span className='py-0.2 shrink-0 rounded bg-muted px-1 font-mono text-[9px] text-muted-foreground'>
                            {member.nik}
                          </span>
                        </div>
                        <p className='truncate text-[11px] text-muted-foreground'>{member.title}</p>
                        {member.email && (
                          <p className='flex items-center gap-1 truncate text-[10px] text-primary/90'>
                            <IconMail size={10} className='shrink-0' />
                            {member.email}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant='outline'
                      className={`shrink-0 px-1.5 py-0 text-[9px] font-semibold ${
                        member.status === 'active'
                          ? 'border-emerald-500/30 bg-emerald-50/50 text-emerald-600 dark:bg-emerald-950/20'
                          : member.status === 'probation'
                            ? 'border-amber-500/30 bg-amber-50/50 text-amber-600'
                            : 'border-blue-500/30 bg-blue-50/50 text-blue-600'
                      }`}
                    >
                      {member.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <DialogFooter className='flex items-center justify-end gap-2 border-t border-border/80 bg-muted/10 p-4 px-6'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => onOpenChange(false)}
            className='h-9 rounded-xl text-xs'
          >
            Close
          </Button>
          {onEdit && (
            <Button
              type='button'
              size='sm'
              onClick={() => {
                onOpenChange(false)
                onEdit(position)
              }}
              className='h-9 gap-1.5 rounded-xl text-xs font-bold'
            >
              <IconEdit size={14} />
              Edit Position
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
