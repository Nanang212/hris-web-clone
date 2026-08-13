// levels/components/add-level-panel.tsx
import { useState } from 'react'
import {
  IconCheck,
  IconX,
} from '@tabler/icons-react'

import { cn } from '@/shared/lib/utils'
import { snackbar } from '@/shared/lib/snackbar'
import type { ApprovalLevel, ApproverType } from '../../types'

const approverTypeLabels: Record<ApproverType, string> = {
  direct_manager: 'Direct Manager',
  department_head: 'Department Head',
  role: 'Berdasarkan Role',
  user: 'Pengguna Spesifik',
  dynamic: 'Dinamis (Kondisional)',
}

export interface AddLevelPanelProps {
  workflowId: string
  onClose: () => void
  onSave: (level: Omit<ApprovalLevel, 'id' | 'level' | 'workflowId'> & { id?: string; level?: number }) => void
  editLevel?: ApprovalLevel
}

export function AddLevelPanel({ onClose, onSave, editLevel }: AddLevelPanelProps) {
  const [form, setForm] = useState({
    name: editLevel?.name ?? '',
    approverType: (editLevel?.approverType ?? 'direct_manager') as ApproverType,
    approverValue: editLevel?.approverValue ?? '',
    approvalType: editLevel?.approvalType ?? 'any_one',
    timeoutDays: editLevel?.timeoutDays ?? 2,
    timeoutAction: editLevel?.timeoutAction ?? 'escalate',
    requireNote: editLevel?.requireNote ?? false,
    canDelegate: editLevel?.canDelegate ?? true,
  })

  const handleSubmit = () => {
    if (!form.name.trim()) {
      snackbar.error('Nama level harus diisi!')
      return
    }
    if (
      (form.approverType === 'role' || form.approverType === 'user') &&
      !form.approverValue.trim()
    ) {
      snackbar.error(
        form.approverType === 'role' ? 'Nama role harus diisi!' : 'Nama pengguna harus diisi!',
      )
      return
    }
    onSave({
      ...(editLevel ? { id: editLevel.id, level: editLevel.level } : {}),
      name: form.name,
      approverType: form.approverType,
      approverValue: form.approverValue,
      approvalType: form.approvalType,
      timeoutDays: form.timeoutDays,
      timeoutAction: form.timeoutAction,
      requireNote: form.requireNote,
      canDelegate: form.canDelegate,
    })
    onClose()
  }

  return (
    <div className='fixed inset-0 z-50 flex justify-end'>
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black/30 backdrop-blur-sm'
        onClick={onClose}
      />

      {/* Panel */}
      <div className='relative flex h-full w-full max-w-md flex-col overflow-y-auto bg-card shadow-2xl'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-border p-5'>
          <div>
            <h3 className='text-sm font-semibold'>
              {editLevel ? 'Edit Level Approver' : 'Tambah Level Approver'}
            </h3>
            <p className='text-xs text-muted-foreground'>
              Konfigurasi level persetujuan baru
            </p>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground hover:text-foreground'
          >
            <IconX size={16} />
          </button>
        </div>

        {/* Body */}
        <div className='flex flex-1 flex-col gap-4 p-5'>
          {/* Level Name */}
          <div>
            <label className='mb-1.5 block text-xs font-medium'>
              Nama Level <span className='text-destructive'>*</span>
            </label>
            <input
              type='text'
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder='Contoh: Direct Manager'
              className='h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50'
            />
          </div>

          {/* Approver Type */}
          <div>
            <label className='mb-1.5 block text-xs font-medium'>Tipe Approver</label>
            <div className='grid grid-cols-1 gap-1.5'>
              {(Object.entries(approverTypeLabels) as [ApproverType, string][]).map(
                ([type, label]) => (
                  <button
                    key={type}
                    type='button'
                    onClick={() => setForm((f) => ({ ...f, approverType: type }))}
                    className={cn(
                      'flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-left transition-all',
                      form.approverType === type
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border hover:border-primary/30',
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-4 w-4 items-center justify-center rounded-full border-2',
                        form.approverType === type
                          ? 'border-primary bg-primary'
                          : 'border-muted-foreground',
                      )}
                    >
                      {form.approverType === type && (
                        <div className='h-1.5 w-1.5 rounded-full bg-white' />
                      )}
                    </div>
                    <span className='text-xs font-medium'>{label}</span>
                  </button>
                ),
              )}
            </div>
          </div>

          {/* Approver Value (if role or user) */}
          {(form.approverType === 'role' || form.approverType === 'user') && (
            <div>
              <label className='mb-1.5 block text-xs font-medium'>
                {form.approverType === 'role' ? 'Nama Role' : 'Nama Pengguna'}{' '}
                <span className='text-destructive'>*</span>
              </label>
              <input
                type='text'
                value={form.approverValue}
                onChange={(e) => setForm((f) => ({ ...f, approverValue: e.target.value }))}
                placeholder={
                  form.approverType === 'role' ? 'Contoh: HR Manager' : 'Cari pengguna...'
                }
                className='h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50'
              />
            </div>
          )}

          {/* Approval Type */}
          <div>
            <label className='mb-1.5 block text-xs font-medium'>Tipe Persetujuan</label>
            <select
              value={form.approvalType}
              onChange={(e) =>
                setForm((f) => ({ ...f, approvalType: e.target.value as typeof form.approvalType }))
              }
              className='h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50'
            >
              <option value='sequential'>Sequential (berurutan)</option>
              <option value='parallel'>Parallel (semua harus approve)</option>
              <option value='any_one'>Any One (salah satu cukup)</option>
            </select>
          </div>

          {/* Timeout */}
          <div>
            <label className='mb-1.5 block text-xs font-medium'>Batas Waktu (hari)</label>
            <div className='flex gap-2'>
              <input
                type='number'
                value={form.timeoutDays}
                onChange={(e) =>
                  setForm((f) => ({ ...f, timeoutDays: parseInt(e.target.value) || 1 }))
                }
                min={1}
                max={30}
                className='h-10 w-24 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50'
              />
              <select
                value={form.timeoutAction}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    timeoutAction: e.target.value as typeof form.timeoutAction,
                  }))
                }
                className='h-10 flex-1 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50'
              >
                <option value='escalate'>Eskalasi ke level atas</option>
                <option value='auto_approve'>Auto Approve</option>
                <option value='auto_reject'>Auto Reject</option>
              </select>
            </div>
          </div>

          {/* Toggles */}
          <div className='flex flex-col gap-2'>
            {[
              { key: 'requireNote', label: 'Wajib isi catatan saat approve/reject' },
              { key: 'canDelegate', label: 'Approver dapat mendelegasikan' },
            ].map((item) => (
              <label
                key={item.key}
                className='flex cursor-pointer items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-muted/30'
              >
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
                      ? 'border-primary bg-primary text-white'
                      : 'border-border',
                  )}
                >
                  {form[item.key as keyof typeof form] && <IconCheck size={12} stroke={3} />}
                </div>
                <span className='text-xs font-medium'>{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className='border-t border-border p-5'>
          <div className='flex gap-2'>
            <button
              type='button'
              onClick={handleSubmit}
              className='flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90'
            >
              {editLevel ? 'Simpan Perubahan' : 'Tambah Level'}
            </button>
            <button
              type='button'
              onClick={onClose}
              className='flex-1 rounded-xl border border-border py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted'
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
