import { useState } from 'react'
import {
  IconBolt,
  IconCheck,
  IconChevronRight,
  IconClock,
  IconLoader2,
  IconUser,
} from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { snackbar } from '@/shared/lib/snackbar'
import { cn } from '@/shared/lib/utils'
import { useTestWorkflow, useWorkflow } from '../hooks'
import { moduleLabels } from '../data'
import type { ApproverType, ModuleType, TestResult } from '../types'

const approverTypeColor: Record<ApproverType, string> = {
  direct_manager: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  department_head: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  role: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  user: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  dynamic: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
}

const approverTypeLabels: Record<ApproverType, string> = {
  direct_manager: 'Direct Manager',
  department_head: 'Dept. Head',
  role: 'Role',
  user: 'User',
  dynamic: 'Dinamis',
}

interface TestWorkflowPageProps {
  workflowId: string
}

export function TestWorkflowPage({ workflowId }: TestWorkflowPageProps) {
  const { data: workflow, isPending, error } = useWorkflow(workflowId)
  const { mutateAsync: runSimulation, isPending: loading } = useTestWorkflow(workflowId)

  const [form, setForm] = useState({
    requesterName: 'Rina Marlina',
    requesterDepartment: 'Engineering',
    requesterPosition: 'Software Engineer',
    requestType: 'leave' as ModuleType,
    requestDays: 3,
    requestAmount: 0,
    reason: 'Keperluan keluarga',
  })

  const [result, setResult] = useState<TestResult | null>(null)

  const handleTest = async () => {
    try {
      const res = await runSimulation({
        requesterName: form.requesterName,
        requesterDepartment: form.requesterDepartment,
        requesterPosition: form.requesterPosition,
        requestType: form.requestType,
        requestDays: form.requestDays,
        reason: form.reason,
      })
      setResult(res)
    } catch (err) {
      snackbar.exception(err)
    }
  }

  if (isPending || error || !workflow) {
    return <AppMain pending={isPending} error={error} notFound={!workflow} />
  }

  return (
    <AppMain
      breadcrumbs={[
        { to: '/', label: 'Pengaturan' },
        { to: '/settings/approval-workflow', label: 'Approval Workflow' },
        { to: '.', label: 'Test Workflow' },
      ]}
      title='Test Workflow'
      subtitle={`${workflow?.name} — Simulasikan pengajuan untuk melihat alur approval`}
    >

      <div className='grid grid-cols-1 gap-5 lg:grid-cols-[1fr_380px]'>
        {/* Test Form */}
        <div className='flex flex-col gap-4'>
          <div className='rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5'>
            <h3 className='mb-4 text-sm font-semibold'>Skenario Pengajuan</h3>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <div>
                <label className='mb-1.5 block text-xs font-medium'>Nama Pemohon</label>
                <input
                  type='text'
                  value={form.requesterName}
                  onChange={(e) => setForm((f) => ({ ...f, requesterName: e.target.value }))}
                  className='h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50'
                />
              </div>
              <div>
                <label className='mb-1.5 block text-xs font-medium'>Departemen</label>
                <input
                  type='text'
                  value={form.requesterDepartment}
                  onChange={(e) => setForm((f) => ({ ...f, requesterDepartment: e.target.value }))}
                  className='h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50'
                />
              </div>
              <div>
                <label className='mb-1.5 block text-xs font-medium'>Jabatan</label>
                <input
                  type='text'
                  value={form.requesterPosition}
                  onChange={(e) => setForm((f) => ({ ...f, requesterPosition: e.target.value }))}
                  className='h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50'
                />
              </div>
              <div>
                <label className='mb-1.5 block text-xs font-medium'>Tipe Pengajuan</label>
                <select
                  value={form.requestType}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, requestType: e.target.value as ModuleType }))
                  }
                  className='h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50'
                >
                  {Object.entries(moduleLabels).map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              {(form.requestType === 'leave' || form.requestType === 'overtime') && (
                <div>
                  <label className='mb-1.5 block text-xs font-medium'>
                    Jumlah Hari / Jam
                  </label>
                  <input
                    type='number'
                    value={form.requestDays}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, requestDays: parseInt(e.target.value) || 1 }))
                    }
                    min={1}
                    className='h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50'
                  />
                </div>
              )}
              {(form.requestType === 'reimbursement' || form.requestType === 'loan') && (
                <div>
                  <label className='mb-1.5 block text-xs font-medium'>Jumlah (Rp)</label>
                  <input
                    type='number'
                    value={form.requestAmount}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, requestAmount: parseInt(e.target.value) || 0 }))
                    }
                    className='h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50'
                  />
                </div>
              )}
              <div className='sm:col-span-2'>
                <label className='mb-1.5 block text-xs font-medium'>Alasan</label>
                <textarea
                  value={form.reason}
                  onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
                  rows={2}
                  className='w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50'
                />
              </div>
            </div>
          </div>

          <button
            type='button'
            onClick={handleTest}
            disabled={loading}
            className={cn(
              'flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-primary-foreground transition-all',
              loading ? 'cursor-not-allowed bg-primary/70' : 'bg-primary hover:bg-primary/90 active:scale-[0.98]',
            )}
          >
            {loading ? (
              <>
                <IconLoader2 size={16} className='animate-spin' />
                Mensimulasikan...
              </>
            ) : (
              <>
                <IconBolt size={16} />
                Jalankan Simulasi
              </>
            )}
          </button>

          {/* Result — Preview Summary */}
          {result && !loading && (
            <div className='rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5'>
              <div className='mb-4 flex items-center justify-between'>
                <h3 className='text-sm font-semibold'>Hasil Simulasi</h3>
                <span className='rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'>
                  Dapat diproses
                </span>
              </div>

              {/* Matched conditions */}
              {result.matchedConditions.length > 0 && (
                <div className='mb-4 rounded-xl bg-blue-50 p-3.5 dark:bg-blue-900/20'>
                  <p className='mb-2 text-xs font-semibold text-blue-800 dark:text-blue-300'>
                    Kondisi yang terpenuhi:
                  </p>
                  <div className='flex flex-wrap gap-1.5'>
                    {result.matchedConditions.map((cond) => (
                      <span
                        key={cond}
                        className='rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                      >
                        {cond}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Approval flow */}
              <div className='flex flex-col gap-1'>
                <p className='mb-2 text-xs font-medium text-muted-foreground'>Alur Persetujuan:</p>
                
                {/* Disetujui (Estimasi selesai) at the top */}
                <div>
                  <div className='flex items-center gap-2'>
                    <div className='flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40'>
                      <IconCheck size={14} className='text-emerald-600 dark:text-emerald-400' />
                    </div>
                    <div>
                      <p className='text-xs font-semibold text-emerald-700 dark:text-emerald-400'>
                        Disetujui
                      </p>
                      <p className='text-[11px] text-muted-foreground'>Estimasi selesai</p>
                    </div>
                  </div>
                </div>

                {/* Levels mapped in reverse */}
                {[...result.levels].reverse().map((level) => (
                  <div key={level.level}>
                    <div className='ml-4 flex h-5 items-center'>
                      <div className='h-full w-px border-l-2 border-dashed border-border' />
                      <IconChevronRight size={12} className='text-border' />
                    </div>
                    <div className='flex items-center gap-2'>
                      <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary'>
                        {level.level}
                      </div>
                      <div className='flex flex-1 items-center justify-between gap-2'>
                        <div>
                          <p className='text-xs font-semibold'>{level.name}</p>
                          <p className='text-[11px] text-muted-foreground'>{level.approver}</p>
                        </div>
                        <div className='flex items-center gap-2'>
                          <span
                            className={cn(
                              'rounded-full px-2 py-0.5 text-[10px] font-medium',
                              approverTypeColor[level.approverType],
                            )}
                          >
                            {approverTypeLabels[level.approverType]}
                          </span>
                          <span className='flex items-center gap-0.5 text-[10px] text-muted-foreground'>
                            <IconClock size={10} />~{level.estimatedDays}h
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Pemohon at the bottom */}
                <div>
                  <div className='ml-4 flex h-5 items-center'>
                    <div className='h-full w-px border-l-2 border-dashed border-border' />
                    <IconChevronRight size={12} className='text-border' />
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className='flex h-8 w-8 items-center justify-center rounded-full bg-muted'>
                      <IconUser size={14} className='text-muted-foreground' />
                    </div>
                    <span className='text-xs font-medium'>{form.requesterName}</span>
                    <span className='text-[10px] text-muted-foreground'>(Pemohon)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className='flex flex-col gap-4'>
          {/* Summary */}
          {result && !loading && (
            <div className='rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5'>
              <h3 className='mb-4 text-sm font-semibold'>Ringkasan Estimasi</h3>
              <div className='flex flex-col gap-3'>
                <div className='flex justify-between text-xs'>
                  <span className='text-muted-foreground'>Workflow</span>
                  <span className='font-medium'>{result.workflowName}</span>
                </div>
                <div className='flex justify-between text-xs'>
                  <span className='text-muted-foreground'>Total Level</span>
                  <span className='font-bold text-primary'>{result.levels.length}</span>
                </div>
                <div className='flex justify-between text-xs'>
                  <span className='text-muted-foreground'>Estimasi Total</span>
                  <span className='font-bold text-emerald-600 dark:text-emerald-400'>
                    ~{result.totalEstimatedDays} hari
                  </span>
                </div>
                <div className='flex justify-between text-xs'>
                  <span className='text-muted-foreground'>Status</span>
                  <span className='font-medium text-emerald-600 dark:text-emerald-400'>
                    ✓ Dapat diproses
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Approver summary */}
          {result && !loading && (
            <div className='rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5'>
              <h3 className='mb-3 text-sm font-semibold'>Approver yang Terlibat</h3>
              <div className='flex flex-col gap-2'>
                {[...result.levels].reverse().map((level) => (
                  <div
                    key={level.level}
                    className='flex items-center gap-3 rounded-xl bg-muted/40 p-3'
                  >
                    <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary'>
                      {level.level}
                    </div>
                    <div className='flex-1'>
                      <p className='text-xs font-semibold'>{level.approver}</p>
                      <p className='text-[11px] text-muted-foreground'>{level.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Workflow info */}
          <div className='rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5'>
            <h3 className='mb-3 text-sm font-semibold'>Info Workflow</h3>
            <div className='flex flex-col gap-2 text-xs'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Nama</span>
                <span className='font-medium'>{workflow?.name}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Modul</span>
                <span className='font-medium'>{moduleLabels[workflow?.module ?? 'leave']}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Total Level</span>
                <span className='font-medium'>{workflow?.totalLevels}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Avg. Proses</span>
                <span className='font-medium'>{workflow?.avgProcessingDays} hari</span>
              </div>
            </div>
          </div>

          <Link
            to='/settings/approval-workflow'
            className='flex w-full items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted'
          >
            Kembali ke Daftar Workflow
          </Link>
        </div>
      </div>
    </AppMain>
  )
}
