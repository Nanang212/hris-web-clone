// configure-levels-page.tsx
import { useEffect, useState } from 'react'
import {
  IconArrowLeft,
  IconChevronDown,
  IconChevronUp,
  IconEdit,
  IconGripVertical,
  IconInfoCircle,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'

import { cn } from '@/shared/lib/utils'
import type { ApprovalLevel, ApproverType, Workflow } from '../types'
import { saveApprovalLevels } from '../api'
import { AddLevelPanel } from './components/add-level-panel'

const approverTypeLabels: Record<ApproverType, string> = {
  direct_manager: 'Direct Manager',
  department_head: 'Department Head',
  role: 'Berdasarkan Role',
  user: 'Pengguna Spesifik',
  dynamic: 'Dinamis (Kondisional)',
}

const approverTypeBadge: Record<ApproverType, string> = {
  direct_manager: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  department_head: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  role: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  user: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  dynamic: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
}

const timeoutActionLabels: Record<string, string> = {
  escalate: 'Eskalasi ke level atas',
  auto_approve: 'Auto Approve',
  auto_reject: 'Auto Reject',
}


interface ConfigureLevelsPageProps {
  workflowId: string
  workflow: Workflow
  levels: ApprovalLevel[]
}

export function ConfigureLevelsPage({ workflowId, workflow, levels }: ConfigureLevelsPageProps) {
  const [showAddPanel, setShowAddPanel] = useState(false)
  const [editLevel, setEditLevel] = useState<ApprovalLevel | undefined>()
  const [localLevels, setLocalLevels] = useState<ApprovalLevel[]>(levels)

  useEffect(() => {
    saveApprovalLevels(workflowId, localLevels).catch(console.error)
  }, [localLevels, workflowId])

  const openEdit = (level: ApprovalLevel) => {
    setEditLevel(level)
    setShowAddPanel(true)
  }

  const openAdd = () => {
    setEditLevel(undefined)
    setShowAddPanel(true)
  }

  const moveLevelUp = (idx: number) => {
    if (idx === 0) return
    setLocalLevels((prev) => {
      const next = [...prev]
      const temp = next[idx]
      next[idx] = next[idx - 1]
      next[idx - 1] = temp
      return next.map((item, i) => ({ ...item, level: i + 1 }))
    })
  }

  const moveLevelDown = (idx: number) => {
    if (idx === localLevels.length - 1) return
    setLocalLevels((prev) => {
      const next = [...prev]
      const temp = next[idx]
      next[idx] = next[idx + 1]
      next[idx + 1] = temp
      return next.map((item, i) => ({ ...item, level: i + 1 }))
    })
  }

  const deleteLevel = (id: string) => {
    setLocalLevels((prev) => {
      const filtered = prev.filter((item) => item.id !== id)
      return filtered.map((item, i) => ({ ...item, level: i + 1 }))
    })
  }

  const handleSaveLevel = (
    newLevel: Omit<ApprovalLevel, 'id' | 'level' | 'workflowId'> & {
      id?: string
      level?: number
    },
  ) => {
    if (newLevel.id) {
      setLocalLevels((prev) =>
        prev.map((item) =>
          item.id === newLevel.id ? ({ ...item, ...newLevel } as ApprovalLevel) : item,
        ),
      )
    } else {
      const nextLevelNumber = localLevels.length + 1
      const levelObj: ApprovalLevel = {
        ...newLevel,
        id: `lvl-${Date.now()}`,
        workflowId,
        level: nextLevelNumber,
      } as ApprovalLevel
      setLocalLevels((prev) => [...prev, levelObj])
    }
  }

  return (
    <>
      <div className='flex flex-col gap-5 p-5 lg:p-6'>
        {/* Header */}
        <div className='flex flex-col justify-between gap-3 sm:flex-row sm:items-start'>
          <div className='flex items-center gap-3'>
            <Link
              to='/settings/approval-workflow'
              className='flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:text-foreground'
            >
              <IconArrowLeft size={18} />
            </Link>
            <div>
              <p className='text-xs text-muted-foreground'>
                Pengaturan / Approval Workflow / Configure Levels
              </p>
              <h2 className='text-2xl font-bold tracking-tight'>Configure Approval Levels</h2>
              <p className='mt-1 text-sm text-muted-foreground'>
                {workflow?.name} — Atur urutan dan approver untuk setiap level
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Link
              to='/settings/approval-workflow/$id/conditions'
              params={{ id: workflowId }}
              className='inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted'
            >
              Conditions & Routing
            </Link>
            <button
              type='button'
              onClick={openAdd}
              className='inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-95'
            >
              <IconPlus size={16} stroke={2.5} />
              Tambah Level
            </button>
          </div>
        </div>

        <div className='grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px]'>
          {/* Levels List */}
          <div className='flex flex-col gap-3'>
            {localLevels.length === 0 && (
              <div className='flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border py-16 text-center'>
                <p className='text-sm text-muted-foreground'>Belum ada level approver</p>
                <button
                  type='button'
                  onClick={openAdd}
                  className='inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90'
                >
                  <IconPlus size={14} />
                  Tambah Level Pertama
                </button>
              </div>
            )}

            {localLevels.map((level, idx) => (
              <div
                key={level.id}
                className='group flex items-start gap-3 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5 transition-all hover:ring-primary/20'
              >
                {/* Drag handle */}
                <div className='mt-1 cursor-grab text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100'>
                  <IconGripVertical size={16} />
                </div>

                {/* Level number */}
                <div className='flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary'>
                  {level.level}
                </div>

                {/* Content */}
                <div className='flex flex-1 flex-col gap-2'>
                  <div className='flex items-center justify-between gap-2'>
                    <p className='text-sm font-semibold'>{level.name}</p>
                    <div className='flex items-center gap-1'>
                      <button
                        type='button'
                        onClick={() => openEdit(level)}
                        className='flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
                      >
                        <IconEdit size={14} />
                      </button>
                      <button
                        type='button'
                        onClick={() => moveLevelUp(idx)}
                        disabled={idx === 0}
                        className='flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30'
                      >
                        <IconChevronUp size={14} />
                      </button>
                      <button
                        type='button'
                        onClick={() => moveLevelDown(idx)}
                        disabled={idx === localLevels.length - 1}
                        className='flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30'
                      >
                        <IconChevronDown size={14} />
                      </button>
                      <button
                        type='button'
                        onClick={() => deleteLevel(level.id)}
                        className='flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20'
                      >
                        <IconTrash size={14} />
                      </button>
                    </div>
                  </div>

                  <div className='flex flex-wrap items-center gap-2'>
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-0.5 text-xs font-medium',
                        approverTypeBadge[level.approverType],
                      )}
                    >
                      {approverTypeLabels[level.approverType]}
                    </span>
                    {level.approverValue &&
                      level.approverType !== 'direct_manager' &&
                      level.approverType !== 'department_head' && (
                        <span className='rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground'>
                          {level.approverValue}
                        </span>
                      )}
                    <span className='rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground'>
                      Timeout {level.timeoutDays}h
                    </span>
                    <span className='rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground'>
                      {timeoutActionLabels[level.timeoutAction]}
                    </span>
                  </div>

                  <div className='flex gap-4 text-[11px] text-muted-foreground'>
                    {level.requireNote && <span>✓ Wajib catatan</span>}
                    {level.canDelegate && <span>✓ Bisa delegasi</span>}
                  </div>
                </div>
              </div>
            ))}

            {/* Add level button */}
            {localLevels.length > 0 && (
              <button
                type='button'
                onClick={openAdd}
                className='flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border py-4 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary'
              >
                <IconPlus size={16} />
                Tambah Level
              </button>
            )}
          </div>

          {/* Summary sidebar */}
          <div className='flex flex-col gap-4'>
            <div className='rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5'>
              <h3 className='mb-3 text-sm font-semibold'>Ringkasan Workflow</h3>
              <div className='flex flex-col gap-2.5'>
                <div className='flex justify-between text-xs'>
                  <span className='text-muted-foreground'>Nama</span>
                  <span className='font-medium'>{workflow?.name}</span>
                </div>
                <div className='flex justify-between text-xs'>
                  <span className='text-muted-foreground'>Total Level</span>
                  <span className='font-bold text-primary'>{localLevels.length}</span>
                </div>
                <div className='flex justify-between text-xs'>
                  <span className='text-muted-foreground'>Estimasi Proses</span>
                  <span className='font-medium'>
                    {localLevels.reduce((s, l) => s + l.timeoutDays, 0)} hari
                  </span>
                </div>
                <div className='flex justify-between text-xs'>
                  <span className='text-muted-foreground'>Status</span>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-xs font-medium',
                      workflow?.status === 'active'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {workflow?.status === 'active' ? 'Aktif' : workflow?.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Flow preview */}
            <div className='rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5'>
              <h3 className='mb-3 text-sm font-semibold'>Alur Persetujuan</h3>
              <div className='flex flex-col gap-1'>
                <div className='flex items-center gap-2'>
                  <div className='flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'>
                    P
                  </div>
                  <span className='text-xs text-muted-foreground'>Pemohon (Karyawan)</span>
                </div>
                {localLevels.map((level) => (
                  <div key={level.id}>
                    <div className='ml-3 h-4 w-px bg-border' />
                    <div className='flex items-center gap-2'>
                      <div className='flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary'>
                        {level.level}
                      </div>
                      <span className='text-xs font-medium'>{level.name}</span>
                    </div>
                  </div>
                ))}
                {localLevels.length > 0 && (
                  <>
                    <div className='ml-3 h-4 w-px bg-border' />
                    <div className='flex items-center gap-2'>
                      <div className='flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'>
                        ✓
                      </div>
                      <span className='text-xs text-muted-foreground'>Selesai / Disetujui</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className='rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20'>
              <div className='flex gap-2'>
                <IconInfoCircle
                  size={15}
                  className='mt-0.5 flex-shrink-0 text-blue-600 dark:text-blue-400'
                />
                <p className='text-[11px] text-blue-700 dark:text-blue-400'>
                  Seret dan lepas level untuk mengatur urutan approval. Perubahan akan disimpan
                  otomatis.
                </p>
              </div>
            </div>

            <Link
              to='/settings/approval-workflow/$id/conditions'
              params={{ id: workflowId }}
              className='flex w-full items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted'
            >
              Atur Conditions & Routing
            </Link>
          </div>
        </div>
      </div>

      {showAddPanel && (
        <AddLevelPanel
          workflowId={workflowId}
          onClose={() => setShowAddPanel(false)}
          onSave={handleSaveLevel}
          editLevel={editLevel}
        />
      )}
    </>
  )
}
