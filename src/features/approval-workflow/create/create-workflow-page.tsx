// create-workflow-page.tsx
import { IconGitBranch, IconInfoCircle } from '@tabler/icons-react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { snackbar } from '@/shared/lib/snackbar'
import { cn } from '@/shared/lib/utils'

import { createWorkflow, updateWorkflow } from '../api'
import { moduleLabels } from '../data'
import type { ModuleType, Workflow, WorkflowStatus } from '../types'

const moduleOptions: { value: ModuleType; label: string; description: string }[] = [
  { value: 'leave', label: 'Cuti', description: 'Pengajuan cuti dan izin karyawan' },
  { value: 'overtime', label: 'Lembur', description: 'Pengajuan jam kerja tambahan' },
  { value: 'reimbursement', label: 'Reimburse', description: 'Klaim penggantian biaya' },
  { value: 'loan', label: 'Pinjaman', description: 'Pengajuan pinjaman karyawan' },
  { value: 'resignation', label: 'Pengunduran Diri', description: 'Proses resign karyawan' },
  { value: 'transfer', label: 'Transfer', description: 'Perpindahan unit / lokasi kerja' },
  { value: 'promotion', label: 'Promosi', description: 'Kenaikan jabatan karyawan' },
]

const moduleColorMap: Record<string, string> = {
  leave: 'border-blue-400 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
  overtime: 'border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300',
  reimbursement:
    'border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300',
  loan: 'border-purple-400 bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300',
  resignation: 'border-red-400 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300',
  transfer: 'border-cyan-400 bg-cyan-50 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-300',
  promotion:
    'border-orange-400 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300',
}

interface CreateWorkflowPageProps {
  mode?: 'create' | 'edit'
  workflowId?: string
  workflow?: Workflow
}

export function CreateWorkflowPage({
  mode = 'create',
  workflowId,
  workflow,
}: Readonly<CreateWorkflowPageProps>) {
  const [form, setForm] = useState({
    name: workflow?.name ?? '',
    description: workflow?.description ?? '',
    module: (workflow?.module ?? '') as ModuleType | '',
    status: (workflow?.status ?? 'draft') as WorkflowStatus,
    applyToAllEmployee: true,
    allowDelegation: true,
    notifyRequester: true,
    notifyApprover: true,
    notes: '',
  })

  const navigate = useNavigate()

  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!form.name.trim()) {
      snackbar.error('Nama workflow harus diisi!')
      return
    }
    if (!form.module) {
      snackbar.error('Modul aplikasi harus dipilih!')
      return
    }

    setIsSaving(true)
    try {
      if (isEdit && workflowId) {
        await updateWorkflow(workflowId, {
          name: form.name,
          description: form.description,
          module: form.module,
          status: form.status,
        })
        snackbar.success('Workflow berhasil diperbarui!')
        navigate({ to: '/settings/approval-workflow' })
      } else {
        const newWorkflow = await createWorkflow({
          name: form.name,
          description: form.description,
          module: form.module,
          status: form.status,
        })
        snackbar.success('Workflow berhasil dibuat!')
        navigate({
          to: '/settings/approval-workflow/$id/levels',
          params: { id: newWorkflow.id },
        })
      }
    } catch {
      snackbar.error('Gagal menyimpan workflow.')
    } finally {
      setIsSaving(false)
    }
  }

  const isEdit = mode === 'edit'

  return (
    <AppMain
      breadcrumbs={[
        { to: '/', label: 'Pengaturan' },
        { to: '/settings/approval-workflow', label: 'Approval Workflow' },
        { to: '.', label: isEdit ? 'Edit Workflow' : 'Buat Workflow' },
      ]}
      title={isEdit ? 'Edit Workflow' : 'Buat Workflow Baru'}
      subtitle={
        isEdit
          ? 'Perbarui konfigurasi workflow approval'
          : 'Konfigurasikan alur persetujuan baru untuk pengajuan karyawan'
      }
      actions={
        <>
          {isEdit && workflow && (
            <div className='ml-auto flex items-center gap-2'>
              <Link
                to='/settings/approval-workflow/$id/levels'
                params={{ id: workflowId! }}
                className='inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted'
              >
                Configure Levels
              </Link>
            </div>
          )}
        </>
      }
    >
      <div className='grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]'>
        {/* Main Form */}
        <div className='flex flex-col gap-4'>
          {/* Basic Info */}
          <div className='rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5'>
            <h3 className='mb-4 text-sm font-semibold'>Informasi Dasar</h3>
            <div className='flex flex-col gap-4'>
              <div>
                <label className='mb-1.5 block text-xs font-medium text-foreground'>
                  Nama Workflow <span className='text-destructive'>*</span>
                </label>
                <input
                  type='text'
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder='Contoh: Leave Approval'
                  className='h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring/50 focus:outline-none'
                />
              </div>
              <div>
                <label className='mb-1.5 block text-xs font-medium text-foreground'>
                  Deskripsi
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder='Jelaskan tujuan dan cakupan workflow ini...'
                  rows={3}
                  className='w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-ring/50 focus:outline-none'
                />
              </div>
              <div>
                <label className='mb-1.5 block text-xs font-medium text-foreground'>Status</label>
                <div className='flex gap-2'>
                  {(['active', 'inactive', 'draft'] as WorkflowStatus[]).map((s) => (
                    <button
                      key={s}
                      type='button'
                      onClick={() => setForm((f) => ({ ...f, status: s }))}
                      className={cn(
                        'flex-1 rounded-xl border py-2 text-xs font-medium capitalize transition-all',
                        form.status === s
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-background text-muted-foreground hover:border-primary/50',
                      )}
                    >
                      {s === 'active' ? 'Aktif' : s === 'inactive' ? 'Nonaktif' : 'Draft'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Module Selection */}
          <div className='rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5'>
            <h3 className='mb-1 text-sm font-semibold'>Modul Aplikasi</h3>
            <p className='mb-4 text-xs text-muted-foreground'>
              Pilih modul yang akan menggunakan workflow ini
            </p>
            <div className='grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4'>
              {moduleOptions.map((opt) => {
                const isSelected = form.module === opt.value
                return (
                  <button
                    key={opt.value}
                    type='button'
                    onClick={() => setForm((f) => ({ ...f, module: opt.value }))}
                    className={cn(
                      'flex flex-col items-start gap-1 rounded-xl border-2 p-3 text-left transition-all',
                      isSelected
                        ? moduleColorMap[opt.value]
                        : 'border-border bg-background hover:border-primary/30',
                    )}
                  >
                    <span className='text-xs font-semibold'>{opt.label}</span>
                    <span className='text-[10px] leading-tight text-muted-foreground'>
                      {opt.description}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Settings */}
          <div className='rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5'>
            <h3 className='mb-4 text-sm font-semibold'>Pengaturan Tambahan</h3>
            <div className='flex flex-col gap-3'>
              {[
                {
                  key: 'applyToAllEmployee',
                  label: 'Berlaku untuk semua karyawan',
                  desc: 'Workflow ini diterapkan ke seluruh karyawan tanpa filter',
                },
                {
                  key: 'allowDelegation',
                  label: 'Izinkan delegasi approval',
                  desc: 'Approver dapat mendelegasikan ke orang lain jika tidak tersedia',
                },
                {
                  key: 'notifyRequester',
                  label: 'Notifikasi ke pemohon',
                  desc: 'Kirim notifikasi ke karyawan saat status berubah',
                },
                {
                  key: 'notifyApprover',
                  label: 'Notifikasi ke approver',
                  desc: 'Kirim reminder ke approver saat ada request baru',
                },
              ].map((item) => (
                <label
                  key={item.key}
                  className='flex cursor-pointer items-start gap-3 rounded-xl border border-border p-3.5 transition-colors hover:bg-muted/30'
                >
                  <div className='mt-0.5'>
                    <div
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          [item.key]: !f[item.key as keyof typeof f],
                        }))
                      }
                      className={cn(
                        'flex h-5 w-5 cursor-pointer items-center justify-center rounded-md border-2 transition-all',
                        form[item.key as keyof typeof form]
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border',
                      )}
                    >
                      {form[item.key as keyof typeof form] && (
                        <svg
                          viewBox='0 0 10 10'
                          fill='none'
                          className='h-3 w-3 stroke-current'
                          strokeWidth={2}
                        >
                          <path d='M2 5l2.5 2.5L8 3' />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className='text-xs font-medium'>{item.label}</p>
                    <p className='text-[11px] text-muted-foreground'>{item.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className='rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5'>
            <h3 className='mb-1 text-sm font-semibold'>Catatan Internal</h3>
            <p className='mb-3 text-xs text-muted-foreground'>
              Catatan ini hanya terlihat oleh administrator
            </p>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder='Tambahkan catatan untuk admin lainnya...'
              rows={3}
              className='w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-ring/50 focus:outline-none'
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className='flex flex-col gap-4'>
          {/* Preview card */}
          <div className='rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5'>
            <h3 className='mb-3 text-sm font-semibold'>Preview Workflow</h3>
            <div className='flex flex-col gap-3'>
              <div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10'>
                <IconGitBranch size={28} className='text-primary' />
              </div>
              <div>
                <p className='text-base font-bold'>{form.name || 'Nama Workflow'}</p>
                <p className='mt-1 text-xs text-muted-foreground'>
                  {form.description || 'Deskripsi workflow akan tampil di sini'}
                </p>
              </div>
              {form.module && (
                <span
                  className={cn(
                    'w-fit rounded-full px-2.5 py-0.5 text-xs font-medium',
                    moduleColorMap[form.module],
                  )}
                >
                  {moduleLabels[form.module]}
                </span>
              )}
              <div className='rounded-xl bg-muted/50 p-3'>
                <p className='text-[11px] text-muted-foreground'>
                  Status:{' '}
                  <span className='font-medium text-foreground'>
                    {form.status === 'active'
                      ? 'Aktif'
                      : form.status === 'inactive'
                        ? 'Nonaktif'
                        : 'Draft'}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Info box */}
          <div className='rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20'>
            <div className='flex gap-2'>
              <IconInfoCircle
                size={16}
                className='mt-0.5 flex-shrink-0 text-blue-600 dark:text-blue-400'
              />
              <div>
                <p className='text-xs font-semibold text-blue-800 dark:text-blue-300'>
                  Langkah Selanjutnya
                </p>
                <p className='mt-1 text-[11px] text-blue-700 dark:text-blue-400'>
                  Setelah menyimpan, konfigurasi level approver di menu{' '}
                  <strong>Configure Levels</strong> dan atur kondisi routing jika diperlukan.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className='flex flex-col gap-2'>
            <button
              type='button'
              onClick={handleSave}
              disabled={isSaving}
              className='w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50'
            >
              {isSaving
                ? 'Menyimpan...'
                : isEdit
                  ? 'Simpan Perubahan'
                  : 'Simpan & Konfigurasi Level'}
            </button>
            <button
              type='button'
              className='w-full rounded-xl border border-border py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted'
              onClick={() => navigate({ to: '/settings/approval-workflow' })}
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </AppMain>
  )
}
