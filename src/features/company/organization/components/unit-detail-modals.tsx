// src/features/company/organization/components/unit-detail-modals.tsx
import {
  IconBuilding,
  IconBriefcase,
  IconHierarchy,
  IconMail,
  IconUsers,
  IconEdit,
  IconSearch,
} from '@tabler/icons-react'
import { useState, useMemo } from 'react'
import { getDummyMembersForUnit } from '../data/mock-org-data'
import type { DivisionRecord, DepartmentRecord, PositionRecord } from '../types'
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
      <DialogContent className='sm:max-w-[580px] p-0 overflow-hidden rounded-2xl'>
        <DialogHeader className='p-6 pb-4 border-b border-border/80 bg-muted/20'>
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
                        ? 'border-emerald-500/30 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20'
                        : 'border-muted-foreground text-muted-foreground'
                    }`}
                  >
                    {division.status}
                  </Badge>
                </div>
                <DialogDescription className='text-xs font-mono text-muted-foreground mt-0.5'>
                  {division.code} • Division Unit
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className='p-6 space-y-5 max-h-[72vh] overflow-y-auto'>
          {/* Quick Metrics */}
          <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
            <div className='p-3 rounded-xl border border-border/80 bg-card'>
              <p className='text-[10px] font-semibold text-muted-foreground'>Cost Center</p>
              <p className='text-xs font-bold font-mono text-foreground mt-0.5'>
                {division.costCenter || '-'}
              </p>
            </div>
            <div className='p-3 rounded-xl border border-border/80 bg-card'>
              <p className='text-[10px] font-semibold text-muted-foreground'>Total Departments</p>
              <p className='text-xs font-bold text-foreground mt-0.5 flex items-center gap-1.5'>
                <IconHierarchy size={14} className='text-emerald-600' />
                {division.totalDepartments} Depts
              </p>
            </div>
            <div className='p-3 rounded-xl border border-border/80 bg-card col-span-2 sm:col-span-1'>
              <p className='text-[10px] font-semibold text-muted-foreground'>Total Headcount</p>
              <p className='text-xs font-bold text-foreground mt-0.5 flex items-center gap-1.5'>
                <IconUsers size={14} className='text-blue-600' />
                {division.totalEmployees} Staff
              </p>
            </div>
          </div>

          {/* Division Head Leader Card */}
          <div className='space-y-1.5'>
            <h5 className='text-xs font-bold text-foreground uppercase tracking-wider'>
              Head of Division
            </h5>
            {division.headOfDivision ? (
              <div className='p-4 rounded-xl border border-border/80 bg-card flex items-center gap-3.5'>
                {division.headOfDivision.avatar ? (
                  <img
                    src={division.headOfDivision.avatar}
                    alt={division.headOfDivision.name}
                    className='size-11 rounded-xl object-cover border border-border shrink-0'
                  />
                ) : (
                  <div className='size-11 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0'>
                    {division.headOfDivision.name.charAt(0)}
                  </div>
                )}
                <div className='min-w-0 flex-1'>
                  <p className='text-xs font-bold text-foreground truncate'>
                    {division.headOfDivision.name}
                  </p>
                  <p className='text-[11px] text-muted-foreground mt-0.5 truncate'>
                    {division.headOfDivision.title}
                  </p>
                  {division.headOfDivision.email && (
                    <p className='text-[10px] text-primary flex items-center gap-1 mt-1 truncate'>
                      <IconMail size={12} className='shrink-0' />
                      {division.headOfDivision.email}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className='p-4 rounded-xl border border-dashed text-xs text-muted-foreground italic text-center'>
                Belum ada kepala divisi yang ditugaskan
              </div>
            )}
          </div>

          {/* Description */}
          <div className='space-y-1.5'>
            <h5 className='text-xs font-bold text-foreground uppercase tracking-wider'>
              Description & Responsibilities
            </h5>
            <div className='p-3.5 rounded-xl border border-border/80 bg-muted/20 text-xs text-foreground leading-relaxed'>
              {division.description || 'Tidak ada deskripsi spesifik untuk divisi ini.'}
            </div>
          </div>

          {/* Assigned Key Personnel (Matching division.totalEmployees) */}
          <div className='space-y-2 pt-2 border-t border-border/80'>
            <div className='flex items-center justify-between text-xs'>
              <h5 className='font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5'>
                <IconUsers size={14} className='text-primary' />
                Daftar Karyawan Divisi ({members.length})
              </h5>
              <span className='text-[10px] text-muted-foreground font-semibold'>Division Level</span>
            </div>

            {members.length > 4 && (
              <div className='relative'>
                <IconSearch size={13} className='absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground' />
                <input
                  type='text'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={`Cari dari ${members.length} karyawan...`}
                  className='w-full h-8 pl-8 pr-2.5 text-xs rounded-xl border border-border/80 bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary'
                />
              </div>
            )}

            <div className='space-y-2 max-h-52 overflow-y-auto pr-1'>
              {filteredMembers.length === 0 ? (
                <div className='p-3 text-center text-xs text-muted-foreground italic rounded-xl border border-dashed'>
                  {search ? 'Tidak ada karyawan yang cocok dengan pencarian.' : 'Belum ada personil yang terdaftar di divisi ini.'}
                </div>
              ) : (
                filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className='p-2.5 rounded-xl border border-border/70 bg-card hover:bg-muted/30 transition-colors flex items-center justify-between gap-3 text-xs'
                  >
                    <div className='flex items-center gap-2.5 min-w-0'>
                      {member.avatar ? (
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className='size-8 rounded-lg object-cover border border-border shrink-0'
                        />
                      ) : (
                        <div className='size-8 rounded-lg bg-blue-500/10 text-blue-600 font-bold flex items-center justify-center text-xs shrink-0'>
                          {member.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className='min-w-0'>
                        <div className='flex items-center gap-1.5'>
                          <p className='font-bold text-foreground truncate text-[12px]'>{member.name}</p>
                          <span className='text-[9px] font-mono px-1 py-0.2 rounded bg-muted text-muted-foreground shrink-0'>
                            {member.nik}
                          </span>
                        </div>
                        <p className='text-[11px] text-muted-foreground truncate'>{member.title}</p>
                      </div>
                    </div>
                    <Badge
                      variant='outline'
                      className={`text-[9px] font-semibold shrink-0 px-1.5 py-0 ${
                        member.status === 'active'
                          ? 'border-emerald-500/30 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20'
                          : member.status === 'probation'
                          ? 'border-amber-500/30 text-amber-600 bg-amber-50/50'
                          : 'border-blue-500/30 text-blue-600 bg-blue-50/50'
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

        <DialogFooter className='p-4 px-6 border-t border-border/80 bg-muted/10 flex items-center justify-end gap-2'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => onOpenChange(false)}
            className='rounded-xl h-9 text-xs'
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
              className='rounded-xl h-9 text-xs font-bold gap-1.5'
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
      <DialogContent className='sm:max-w-[580px] p-0 overflow-hidden rounded-2xl'>
        <DialogHeader className='p-6 pb-4 border-b border-border/80 bg-muted/20'>
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
                        ? 'border-emerald-500/30 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20'
                        : 'border-muted-foreground text-muted-foreground'
                    }`}
                  >
                    {department.status}
                  </Badge>
                </div>
                <DialogDescription className='text-xs font-mono text-muted-foreground mt-0.5'>
                  {department.code} • under {department.divisionName}
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className='p-6 space-y-5 max-h-[72vh] overflow-y-auto'>
          {/* Quick Metrics */}
          <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
            <div className='p-3 rounded-xl border border-border/80 bg-card'>
              <p className='text-[10px] font-semibold text-muted-foreground'>Parent Division</p>
              <p className='text-xs font-bold text-foreground mt-0.5 truncate'>
                {department.divisionName}
              </p>
            </div>
            <div className='p-3 rounded-xl border border-border/80 bg-card'>
              <p className='text-[10px] font-semibold text-muted-foreground'>Total Positions</p>
              <p className='text-xs font-bold text-foreground mt-0.5 flex items-center gap-1.5'>
                <IconBriefcase size={14} className='text-purple-600' />
                {department.totalPositions} Positions
              </p>
            </div>
            <div className='p-3 rounded-xl border border-border/80 bg-card col-span-2 sm:col-span-1'>
              <p className='text-[10px] font-semibold text-muted-foreground'>Total Headcount</p>
              <p className='text-xs font-bold text-foreground mt-0.5 flex items-center gap-1.5'>
                <IconUsers size={14} className='text-emerald-600' />
                {department.totalEmployees} Staff
              </p>
            </div>
          </div>

          {/* Department Head Leader Card */}
          <div className='space-y-1.5'>
            <h5 className='text-xs font-bold text-foreground uppercase tracking-wider'>
              Head of Department
            </h5>
            {department.headOfDepartment ? (
              <div className='p-4 rounded-xl border border-border/80 bg-card flex items-center gap-3.5'>
                {department.headOfDepartment.avatar ? (
                  <img
                    src={department.headOfDepartment.avatar}
                    alt={department.headOfDepartment.name}
                    className='size-11 rounded-xl object-cover border border-border shrink-0'
                  />
                ) : (
                  <div className='size-11 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-sm shrink-0'>
                    {department.headOfDepartment.name.charAt(0)}
                  </div>
                )}
                <div className='min-w-0 flex-1'>
                  <p className='text-xs font-bold text-foreground truncate'>
                    {department.headOfDepartment.name}
                  </p>
                  <p className='text-[11px] text-muted-foreground mt-0.5 truncate'>
                    {department.headOfDepartment.title}
                  </p>
                  {department.headOfDepartment.email && (
                    <p className='text-[10px] text-primary flex items-center gap-1 mt-1 truncate'>
                      <IconMail size={12} className='shrink-0' />
                      {department.headOfDepartment.email}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className='p-4 rounded-xl border border-dashed text-xs text-muted-foreground italic text-center'>
                Belum ada kepala departemen yang ditugaskan
              </div>
            )}
          </div>

          {/* Description */}
          <div className='space-y-1.5'>
            <h5 className='text-xs font-bold text-foreground uppercase tracking-wider'>
              Description & Objectives
            </h5>
            <div className='p-3.5 rounded-xl border border-border/80 bg-muted/20 text-xs text-foreground leading-relaxed'>
              {department.description || 'Tidak ada deskripsi khusus untuk departemen ini.'}
            </div>
          </div>

          {/* Assigned Department Staff (Matching department.totalEmployees) */}
          <div className='space-y-2 pt-2 border-t border-border/80'>
            <div className='flex items-center justify-between text-xs'>
              <h5 className='font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5'>
                <IconUsers size={14} className='text-primary' />
                Daftar Personil Departemen ({members.length})
              </h5>
              <span className='text-[10px] text-muted-foreground font-semibold'>Department Level</span>
            </div>

            {members.length > 4 && (
              <div className='relative'>
                <IconSearch size={13} className='absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground' />
                <input
                  type='text'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={`Cari dari ${members.length} karyawan...`}
                  className='w-full h-8 pl-8 pr-2.5 text-xs rounded-xl border border-border/80 bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary'
                />
              </div>
            )}

            <div className='space-y-2 max-h-52 overflow-y-auto pr-1'>
              {filteredMembers.length === 0 ? (
                <div className='p-3 text-center text-xs text-muted-foreground italic rounded-xl border border-dashed'>
                  {search ? 'Tidak ada karyawan yang cocok dengan pencarian.' : 'Belum ada personil yang terdaftar di departemen ini.'}
                </div>
              ) : (
                filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className='p-2.5 rounded-xl border border-border/70 bg-card hover:bg-muted/30 transition-colors flex items-center justify-between gap-3 text-xs'
                  >
                    <div className='flex items-center gap-2.5 min-w-0'>
                      {member.avatar ? (
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className='size-8 rounded-lg object-cover border border-border shrink-0'
                        />
                      ) : (
                        <div className='size-8 rounded-lg bg-emerald-500/10 text-emerald-600 font-bold flex items-center justify-center text-xs shrink-0'>
                          {member.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className='min-w-0'>
                        <div className='flex items-center gap-1.5'>
                          <p className='font-bold text-foreground truncate text-[12px]'>{member.name}</p>
                          <span className='text-[9px] font-mono px-1 py-0.2 rounded bg-muted text-muted-foreground shrink-0'>
                            {member.nik}
                          </span>
                        </div>
                        <p className='text-[11px] text-muted-foreground truncate'>{member.title}</p>
                      </div>
                    </div>
                    <Badge
                      variant='outline'
                      className={`text-[9px] font-semibold shrink-0 px-1.5 py-0 ${
                        member.status === 'active'
                          ? 'border-emerald-500/30 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20'
                          : member.status === 'probation'
                          ? 'border-amber-500/30 text-amber-600 bg-amber-50/50'
                          : 'border-blue-500/30 text-blue-600 bg-blue-50/50'
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

        <DialogFooter className='p-4 px-6 border-t border-border/80 bg-muted/10 flex items-center justify-end gap-2'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => onOpenChange(false)}
            className='rounded-xl h-9 text-xs'
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
              className='rounded-xl h-9 text-xs font-bold gap-1.5'
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
      <DialogContent className='sm:max-w-[580px] p-0 overflow-hidden rounded-2xl'>
        <DialogHeader className='p-6 pb-4 border-b border-border/80 bg-muted/20'>
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
                        ? 'border-emerald-500/30 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20'
                        : 'border-muted-foreground text-muted-foreground'
                    }`}
                  >
                    {position.status}
                  </Badge>
                </div>
                <DialogDescription className='text-xs font-mono text-muted-foreground mt-0.5'>
                  {position.code} • {position.jobLevel} ({position.jobGrade})
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className='p-6 space-y-5 max-h-[72vh] overflow-y-auto'>
          {/* Quick Metrics */}
          <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
            <div className='p-3 rounded-xl border border-border/80 bg-card'>
              <p className='text-[10px] font-semibold text-muted-foreground'>Department</p>
              <p className='text-xs font-bold text-foreground mt-0.5 truncate'>
                {position.departmentName}
              </p>
              <p className='text-[10px] text-muted-foreground'>{position.divisionName}</p>
            </div>
            <div className='p-3 rounded-xl border border-border/80 bg-card'>
              <p className='text-[10px] font-semibold text-muted-foreground'>Job Grade & Level</p>
              <p className='text-xs font-bold text-foreground mt-0.5'>
                {position.jobLevel} - {position.jobGrade}
              </p>
            </div>
            <div className='p-3 rounded-xl border border-border/80 bg-card col-span-2 sm:col-span-1'>
              <p className='text-[10px] font-semibold text-muted-foreground'>Direct Superior</p>
              <p className='text-xs font-bold text-foreground mt-0.5 truncate'>
                {position.reportsToPositionTitle || 'Direct Management'}
              </p>
            </div>
          </div>

          {/* Headcount Capacity Bar */}
          <div className='p-4 rounded-xl border border-border/80 bg-card space-y-2.5'>
            <div className='flex items-center justify-between text-xs'>
              <span className='font-bold text-foreground flex items-center gap-1.5'>
                <IconUsers size={15} className='text-primary' />
                Headcount Quota Capacity
              </span>
              <span className='font-mono font-bold text-foreground'>
                {position.headcountCurrent} / {position.headcountLimit} Terisi ({percent}%)
              </span>
            </div>
            <Progress value={percent} className='h-2 rounded-full' />
            <div className='flex items-center justify-between text-[11px] text-muted-foreground pt-0.5'>
              <span>Kapasitas Terisi: {position.headcountCurrent} Karyawan</span>
              <span className={position.headcountLimit - position.headcountCurrent > 0 ? 'text-emerald-600 font-semibold' : 'text-muted-foreground'}>
                {position.headcountLimit - position.headcountCurrent > 0
                  ? `${position.headcountLimit - position.headcountCurrent} Slot Lowongan Terbuka`
                  : 'Kapasitas Penuh (0 Slot Terbuka)'}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className='space-y-1.5'>
            <h5 className='text-xs font-bold text-foreground uppercase tracking-wider'>
              Position Description & Tasks
            </h5>
            <div className='p-3.5 rounded-xl border border-border/80 bg-muted/20 text-xs text-foreground leading-relaxed'>
              {position.description || 'Tidak ada uraian tugas posisi yang didefinisikan.'}
            </div>
          </div>

          {/* Assigned Position Holders (Matching position.headcountCurrent) */}
          <div className='space-y-2 pt-2 border-t border-border/80'>
            <div className='flex items-center justify-between text-xs'>
              <h5 className='font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5'>
                <IconUsers size={14} className='text-primary' />
                Daftar Pemegang Jabatan Aktif ({members.length})
              </h5>
              <span className='text-[10px] text-muted-foreground font-semibold'>Position Assigned</span>
            </div>

            {members.length > 4 && (
              <div className='relative'>
                <IconSearch size={13} className='absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground' />
                <input
                  type='text'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={`Cari dari ${members.length} karyawan...`}
                  className='w-full h-8 pl-8 pr-2.5 text-xs rounded-xl border border-border/80 bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary'
                />
              </div>
            )}

            <div className='space-y-2 max-h-52 overflow-y-auto pr-1'>
              {filteredMembers.length === 0 ? (
                <div className='p-3 text-center text-xs text-muted-foreground italic rounded-xl border border-dashed'>
                  {search ? 'Tidak ada karyawan yang cocok dengan pencarian.' : 'Belum ada karyawan aktif yang ditugaskan di posisi ini.'}
                </div>
              ) : (
                filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className='p-2.5 rounded-xl border border-border/70 bg-card hover:bg-muted/30 transition-colors flex items-center justify-between gap-3 text-xs'
                  >
                    <div className='flex items-center gap-2.5 min-w-0'>
                      {member.avatar ? (
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className='size-8 rounded-lg object-cover border border-border shrink-0'
                        />
                      ) : (
                        <div className='size-8 rounded-lg bg-purple-500/10 text-purple-600 font-bold flex items-center justify-center text-xs shrink-0'>
                          {member.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className='min-w-0'>
                        <div className='flex items-center gap-1.5'>
                          <p className='font-bold text-foreground truncate text-[12px]'>{member.name}</p>
                          <span className='text-[9px] font-mono px-1 py-0.2 rounded bg-muted text-muted-foreground shrink-0'>
                            {member.nik}
                          </span>
                        </div>
                        <p className='text-[11px] text-muted-foreground truncate'>{member.title}</p>
                        {member.email && (
                          <p className='text-[10px] text-primary/90 flex items-center gap-1 truncate'>
                            <IconMail size={10} className='shrink-0' />
                            {member.email}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant='outline'
                      className={`text-[9px] font-semibold shrink-0 px-1.5 py-0 ${
                        member.status === 'active'
                          ? 'border-emerald-500/30 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20'
                          : member.status === 'probation'
                          ? 'border-amber-500/30 text-amber-600 bg-amber-50/50'
                          : 'border-blue-500/30 text-blue-600 bg-blue-50/50'
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

        <DialogFooter className='p-4 px-6 border-t border-border/80 bg-muted/10 flex items-center justify-end gap-2'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => onOpenChange(false)}
            className='rounded-xl h-9 text-xs'
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
              className='rounded-xl h-9 text-xs font-bold gap-1.5'
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
