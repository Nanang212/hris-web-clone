// add-edit-modals.tsx — Form modals for all Master Data entities
import { useState } from 'react'
import { IconX } from '@tabler/icons-react'
import type {
  Department,
  Division,
  Position,
  Grade,
  Shift,
  Holiday,
  LeaveType,
  PayrollComponent,
  MasterDataStatus,
} from '../types'

interface ModalWrapperProps {
  title: string
  onClose: () => void
  onSave: () => void
  isSaving: boolean
  children: React.ReactNode
}

function ModalWrapper({ title, onClose, onSave, isSaving, children }: ModalWrapperProps) {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm'>
      <div className='w-full max-w-md rounded-2xl bg-card p-6 shadow-xl ring-1 ring-foreground/5 animate-in fade-in-50 zoom-in-95 duration-150'>
        <div className='flex items-center justify-between border-b border-border pb-4'>
          <h3 className='text-sm font-bold text-foreground'>{title}</h3>
          <button
            type='button'
            onClick={onClose}
            className='rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground'
          >
            <IconX size={16} />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSave()
          }}
          className='mt-4 flex flex-col gap-4'
        >
          {children}
          <div className='mt-2 flex justify-end gap-2 border-t border-border pt-4'>
            <button
              type='button'
              onClick={onClose}
              className='rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted'
            >
              Batal
            </button>
            <button
              type='submit'
              disabled={isSaving}
              className='rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50'
            >
              {isSaving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// 1. Department Modal
interface DepartmentModalProps {
  item?: Department
  onClose: () => void
  onSave: (data: Omit<Department, 'id'>) => void
  isSaving: boolean
}
export function DepartmentModal({ item, onClose, onSave, isSaving }: DepartmentModalProps) {
  const [form, setForm] = useState({
    code: item?.code ?? '',
    name: item?.name ?? '',
    managerName: item?.managerName ?? '',
    parentDepartmentName: item?.parentDepartmentName ?? '-',
    status: item?.status ?? 'active',
  })

  return (
    <ModalWrapper
      title={item ? 'Edit Department' : 'Tambah Department'}
      onClose={onClose}
      onSave={() => onSave(form)}
      isSaving={isSaving}
    >
      <div>
        <label className='mb-1 block text-xs font-medium text-foreground'>Kode Department</label>
        <input
          type='text'
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
          placeholder='Contoh: IT-ENG'
          required
          className='h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring/50 focus:outline-none'
        />
      </div>
      <div>
        <label className='mb-1 block text-xs font-medium text-foreground'>Nama Department</label>
        <input
          type='text'
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder='Contoh: Engineering'
          required
          className='h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring/50 focus:outline-none'
        />
      </div>
      <div>
        <label className='mb-1 block text-xs font-medium text-foreground'>Manager</label>
        <input
          type='text'
          value={form.managerName}
          onChange={(e) => setForm({ ...form, managerName: e.target.value })}
          placeholder='Contoh: Budi Santoso'
          required
          className='h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring/50 focus:outline-none'
        />
      </div>
      <div>
        <label className='mb-1 block text-xs font-medium text-foreground'>Parent Department</label>
        <select
          value={form.parentDepartmentName}
          onChange={(e) => setForm({ ...form, parentDepartmentName: e.target.value })}
          className='h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring/50 focus:outline-none'
        >
          <option value='-'>-</option>
          <option value='Engineering'>Engineering</option>
          <option value='Human Resource'>Human Resource</option>
        </select>
      </div>
      <div>
        <label className='mb-1 block text-xs font-medium text-foreground'>Status</label>
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value as MasterDataStatus })}
          className='h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring/50 focus:outline-none'
        >
          <option value='active'>Aktif</option>
          <option value='inactive'>Nonaktif</option>
        </select>
      </div>
    </ModalWrapper>
  )
}

// 2. Division Modal
interface DivisionModalProps {
  item?: Division
  onClose: () => void
  onSave: (data: Omit<Division, 'id'>) => void
  isSaving: boolean
}
export function DivisionModal({ item, onClose, onSave, isSaving }: DivisionModalProps) {
  const [form, setForm] = useState({
    code: item?.code ?? '',
    name: item?.name ?? '',
    departmentName: item?.departmentName ?? 'Engineering',
    description: item?.description ?? '',
    status: item?.status ?? 'active',
  })

  return (
    <ModalWrapper
      title={item ? 'Edit Division' : 'Tambah Division'}
      onClose={onClose}
      onSave={() => onSave(form)}
      isSaving={isSaving}
    >
      <div>
        <label className='mb-1 block text-xs font-medium text-foreground'>Kode Division</label>
        <input
          type='text'
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
          placeholder='Contoh: ENG-BE'
          required
          className='h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring/50 focus:outline-none'
        />
      </div>
      <div>
        <label className='mb-1 block text-xs font-medium text-foreground'>Nama Division</label>
        <input
          type='text'
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder='Contoh: Backend Engineering'
          required
          className='h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring/50 focus:outline-none'
        />
      </div>
      <div>
        <label className='mb-1 block text-xs font-medium text-foreground'>Department</label>
        <select
          value={form.departmentName}
          onChange={(e) => setForm({ ...form, departmentName: e.target.value })}
          className='h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring/50 focus:outline-none'
        >
          <option value='Engineering'>Engineering</option>
          <option value='Human Resource'>Human Resource</option>
          <option value='Marketing'>Marketing</option>
          <option value='Finance & Accounting'>Finance & Accounting</option>
        </select>
      </div>
      <div>
        <label className='mb-1 block text-xs font-medium text-foreground'>Deskripsi</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder='Tulis penjelasan singkat mengenai divisi ini...'
          rows={3}
          className='w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring/50 focus:outline-none font-sans'
        />
      </div>
      <div>
        <label className='mb-1 block text-xs font-medium text-foreground'>Status</label>
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value as MasterDataStatus })}
          className='h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring/50 focus:outline-none'
        >
          <option value='active'>Aktif</option>
          <option value='inactive'>Nonaktif</option>
        </select>
      </div>
    </ModalWrapper>
  )
}

// 3. Position Modal
interface PositionModalProps {
  item?: Position
  onClose: () => void
  onSave: (data: Omit<Position, 'id'>) => void
  isSaving: boolean
}
export function PositionModal({ item, onClose, onSave, isSaving }: PositionModalProps) {
  const [form, setForm] = useState({
    code: item?.code ?? '',
    name: item?.name ?? '',
    departmentName: item?.departmentName ?? 'Engineering',
    divisionName: item?.divisionName ?? 'Backend Engineering',
    jobDescription: item?.jobDescription ?? '',
    status: item?.status ?? 'active',
  })

  return (
    <ModalWrapper
      title={item ? 'Edit Position' : 'Tambah Position'}
      onClose={onClose}
      onSave={() => onSave(form)}
      isSaving={isSaving}
    >
      <div>
        <label className='mb-1 block text-xs font-medium text-foreground'>Kode Position</label>
        <input
          type='text'
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
          placeholder='Contoh: ENG-SWE'
          required
          className='h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring/50 focus:outline-none'
        />
      </div>
      <div>
        <label className='mb-1 block text-xs font-medium text-foreground'>Nama Jabatan (Title)</label>
        <input
          type='text'
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder='Contoh: Software Engineer'
          required
          className='h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring/50 focus:outline-none'
        />
      </div>
      <div className='grid grid-cols-2 gap-3'>
        <div>
          <label className='mb-1 block text-xs font-medium text-foreground'>Department</label>
          <select
            value={form.departmentName}
            onChange={(e) => setForm({ ...form, departmentName: e.target.value })}
            className='h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring/50 focus:outline-none'
          >
            <option value='Engineering'>Engineering</option>
            <option value='Human Resource'>Human Resource</option>
          </select>
        </div>
        <div>
          <label className='mb-1 block text-xs font-medium text-foreground'>Division</label>
          <select
            value={form.divisionName}
            onChange={(e) => setForm({ ...form, divisionName: e.target.value })}
            className='h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring/50 focus:outline-none'
          >
            <option value='-'>-</option>
            <option value='Backend Engineering'>Backend Engineering</option>
            <option value='Frontend Engineering'>Frontend Engineering</option>
          </select>
        </div>
      </div>
      <div>
        <label className='mb-1 block text-xs font-medium text-foreground'>Job Description</label>
        <textarea
          value={form.jobDescription}
          onChange={(e) => setForm({ ...form, jobDescription: e.target.value })}
          placeholder='Tulis cakupan tugas dan kualifikasi dasar...'
          rows={3}
          className='w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring/50 focus:outline-none font-sans'
        />
      </div>
      <div>
        <label className='mb-1 block text-xs font-medium text-foreground'>Status</label>
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value as MasterDataStatus })}
          className='h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring/50 focus:outline-none'
        >
          <option value='active'>Aktif</option>
          <option value='inactive'>Nonaktif</option>
        </select>
      </div>
    </ModalWrapper>
  )
}

// 4. Grade Modal
interface GradeModalProps {
  item?: Grade
  onClose: () => void
  onSave: (data: Omit<Grade, 'id'>) => void
  isSaving: boolean
}
export function GradeModal({ item, onClose, onSave, isSaving }: GradeModalProps) {
  const [form, setForm] = useState({
    code: item?.code ?? '',
    name: item?.name ?? '',
    level: item?.level ?? 1,
    minSalary: item?.minSalary ?? 0,
    maxSalary: item?.maxSalary ?? 0,
    status: item?.status ?? 'active',
  })

  return (
    <ModalWrapper
      title={item ? 'Edit Grade' : 'Tambah Grade'}
      onClose={onClose}
      onSave={() => onSave(form)}
      isSaving={isSaving}
    >
      <div className='grid grid-cols-2 gap-3'>
        <div>
          <label className='mb-1 block text-xs font-medium text-foreground'>Kode Grade</label>
          <input
            type='text'
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            placeholder='Contoh: GR-01'
            required
            className='h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring/50 focus:outline-none'
          />
        </div>
        <div>
          <label className='mb-1 block text-xs font-medium text-foreground'>Level Angka</label>
          <input
            type='number'
            value={form.level}
            onChange={(e) => setForm({ ...form, level: parseInt(e.target.value) || 1 })}
            placeholder='Contoh: 1'
            required
            className='h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring/50 focus:outline-none'
          />
        </div>
      </div>
      <div>
        <label className='mb-1 block text-xs font-medium text-foreground'>Nama Grade</label>
        <input
          type='text'
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder='Contoh: Junior Associate'
          required
          className='h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring/50 focus:outline-none'
        />
      </div>
      <div className='grid grid-cols-2 gap-3'>
        <div>
          <label className='mb-1 block text-xs font-medium text-foreground'>Gaji Minimum (Rupiah)</label>
          <input
            type='number'
            value={form.minSalary}
            onChange={(e) => setForm({ ...form, minSalary: parseInt(e.target.value) || 0 })}
            placeholder='Contoh: 5000000'
            required
            className='h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring/50 focus:outline-none'
          />
        </div>
        <div>
          <label className='mb-1 block text-xs font-medium text-foreground'>Gaji Maksimum (Rupiah)</label>
          <input
            type='number'
            value={form.maxSalary}
            onChange={(e) => setForm({ ...form, maxSalary: parseInt(e.target.value) || 0 })}
            placeholder='Contoh: 8000000'
            required
            className='h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring/50 focus:outline-none'
          />
        </div>
      </div>
      <div>
        <label className='mb-1 block text-xs font-medium text-foreground'>Status</label>
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value as MasterDataStatus })}
          className='h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring/50 focus:outline-none'
        >
          <option value='active'>Aktif</option>
          <option value='inactive'>Nonaktif</option>
        </select>
      </div>
    </ModalWrapper>
  )
}

// 5. Shift Modal
interface ShiftModalProps {
  item?: Shift
  onClose: () => void
  onSave: (data: Omit<Shift, 'id'>) => void
  isSaving: boolean
}
export function ShiftModal({ item, onClose, onSave, isSaving }: ShiftModalProps) {
  const [form, setForm] = useState({
    code: item?.code ?? '',
    name: item?.name ?? '',
    startTime: item?.startTime ?? '08:00',
    endTime: item?.endTime ?? '17:00',
    gracePeriod: item?.gracePeriod ?? 15,
    status: item?.status ?? 'active',
  })

  return (
    <ModalWrapper
      title={item ? 'Edit Shift Kerja' : 'Tambah Shift Kerja'}
      onClose={onClose}
      onSave={() => onSave(form)}
      isSaving={isSaving}
    >
      <div className='grid grid-cols-2 gap-3'>
        <div>
          <label className='mb-1 block text-xs font-medium text-foreground'>Kode Shift</label>
          <input
            type='text'
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            placeholder='Contoh: SH-PGI'
            required
            className='h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring/50 focus:outline-none'
          />
        </div>
        <div>
          <label className='mb-1 block text-xs font-medium text-foreground'>Nama Shift</label>
          <input
            type='text'
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder='Contoh: Shift Pagi Standard'
            required
            className='h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring/50 focus:outline-none'
          />
        </div>
      </div>
      <div className='grid grid-cols-3 gap-3'>
        <div>
          <label className='mb-1 block text-xs font-medium text-foreground'>Jam Masuk</label>
          <input
            type='text'
            value={form.startTime}
            onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            placeholder='08:00'
            required
            className='h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring/50 focus:outline-none'
          />
        </div>
        <div>
          <label className='mb-1 block text-xs font-medium text-foreground'>Jam Pulang</label>
          <input
            type='text'
            value={form.endTime}
            onChange={(e) => setForm({ ...form, endTime: e.target.value })}
            placeholder='17:00'
            required
            className='h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring/50 focus:outline-none'
          />
        </div>
        <div>
          <label className='mb-1 block text-xs font-medium text-foreground'>Toleransi (Mnt)</label>
          <input
            type='number'
            value={form.gracePeriod}
            onChange={(e) => setForm({ ...form, gracePeriod: parseInt(e.target.value) || 0 })}
            placeholder='15'
            required
            className='h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring/50 focus:outline-none'
          />
        </div>
      </div>
      <div>
        <label className='mb-1 block text-xs font-medium text-foreground'>Status</label>
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value as MasterDataStatus })}
          className='h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring/50 focus:outline-none'
        >
          <option value='active'>Aktif</option>
          <option value='inactive'>Nonaktif</option>
        </select>
      </div>
    </ModalWrapper>
  )
}

// 6. Holiday Modal
interface HolidayModalProps {
  item?: Holiday
  onClose: () => void
  onSave: (data: Omit<Holiday, 'id'>) => void
  isSaving: boolean
}
export function HolidayModal({ item, onClose, onSave, isSaving }: HolidayModalProps) {
  const [form, setForm] = useState({
    name: item?.name ?? '',
    date: item?.date ?? '',
    type: item?.type ?? ('national' as const),
    description: item?.description ?? '',
    status: item?.status ?? 'active',
  })

  return (
    <ModalWrapper
      title={item ? 'Edit Hari Libur' : 'Tambah Hari Libur'}
      onClose={onClose}
      onSave={() => onSave(form)}
      isSaving={isSaving}
    >
      <div>
        <label className='mb-1 block text-xs font-medium text-foreground'>Nama Hari Libur</label>
        <input
          type='text'
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder='Contoh: Tahun Baru Masehi'
          required
          className='h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring/50 focus:outline-none'
        />
      </div>
      <div className='grid grid-cols-2 gap-3'>
        <div>
          <label className='mb-1 block text-xs font-medium text-foreground'>Tanggal</label>
          <input
            type='date'
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
            className='h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring/50 focus:outline-none'
          />
        </div>
        <div>
          <label className='mb-1 block text-xs font-medium text-foreground'>Jenis Libur</label>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as 'national' | 'company' })}
            className='h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring/50 focus:outline-none'
          >
            <option value='national'>Libur Nasional</option>
            <option value='company'>Libur Khusus Perusahaan</option>
          </select>
        </div>
      </div>
      <div>
        <label className='mb-1 block text-xs font-medium text-foreground'>Deskripsi / Keterangan</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder='Keterangan libur...'
          rows={3}
          className='w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring/50 focus:outline-none font-sans'
        />
      </div>
      <div>
        <label className='mb-1 block text-xs font-medium text-foreground'>Status</label>
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value as MasterDataStatus })}
          className='h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring/50 focus:outline-none'
        >
          <option value='active'>Aktif</option>
          <option value='inactive'>Nonaktif</option>
        </select>
      </div>
    </ModalWrapper>
  )
}

// 7. Leave Type Modal
interface LeaveTypeModalProps {
  item?: LeaveType
  onClose: () => void
  onSave: (data: Omit<LeaveType, 'id'>) => void
  isSaving: boolean
}
export function LeaveTypeModal({ item, onClose, onSave, isSaving }: LeaveTypeModalProps) {
  const [form, setForm] = useState({
    code: item?.code ?? '',
    name: item?.name ?? '',
    defaultAllowance: item?.defaultAllowance ?? 12,
    isPaid: item?.isPaid ?? true,
    canCarryForward: item?.canCarryForward ?? true,
    status: item?.status ?? 'active',
  })

  return (
    <ModalWrapper
      title={item ? 'Edit Tipe Cuti' : 'Tambah Tipe Cuti'}
      onClose={onClose}
      onSave={() => onSave(form)}
      isSaving={isSaving}
    >
      <div className='grid grid-cols-2 gap-3'>
        <div>
          <label className='mb-1 block text-xs font-medium text-foreground'>Kode Cuti</label>
          <input
            type='text'
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            placeholder='Contoh: L-ANN'
            required
            className='h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring/50 focus:outline-none'
          />
        </div>
        <div>
          <label className='mb-1 block text-xs font-medium text-foreground'>Kuota (Hari/Tahun)</label>
          <input
            type='number'
            value={form.defaultAllowance}
            onChange={(e) => setForm({ ...form, defaultAllowance: parseInt(e.target.value) || 0 })}
            placeholder='12'
            required
            className='h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring/50 focus:outline-none'
          />
        </div>
      </div>
      <div>
        <label className='mb-1 block text-xs font-medium text-foreground'>Nama Cuti</label>
        <input
          type='text'
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder='Contoh: Cuti Tahunan'
          required
          className='h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring/50 focus:outline-none'
        />
      </div>
      <div className='grid grid-cols-2 gap-3'>
        <div>
          <label className='mb-1 block text-xs font-medium text-foreground'>Cuti Dibayar (Paid)</label>
          <select
            value={form.isPaid ? 'yes' : 'no'}
            onChange={(e) => setForm({ ...form, isPaid: e.target.value === 'yes' })}
            className='h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring/50 focus:outline-none'
          >
            <option value='yes'>Ya (Dibayar)</option>
            <option value='no'>Tidak (Unpaid)</option>
          </select>
        </div>
        <div>
          <label className='mb-1 block text-xs font-medium text-foreground'>Carry Forward</label>
          <select
            value={form.canCarryForward ? 'yes' : 'no'}
            onChange={(e) => setForm({ ...form, canCarryForward: e.target.value === 'yes' })}
            className='h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring/50 focus:outline-none'
          >
            <option value='yes'>Ya (Bisa ditransfer ke thn depan)</option>
            <option value='no'>Tidak</option>
          </select>
        </div>
      </div>
      <div>
        <label className='mb-1 block text-xs font-medium text-foreground'>Status</label>
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value as MasterDataStatus })}
          className='h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring/50 focus:outline-none'
        >
          <option value='active'>Aktif</option>
          <option value='inactive'>Nonaktif</option>
        </select>
      </div>
    </ModalWrapper>
  )
}

// 8. Payroll Component Modal
interface PayrollComponentModalProps {
  item?: PayrollComponent
  onClose: () => void
  onSave: (data: Omit<PayrollComponent, 'id'>) => void
  isSaving: boolean
}
export function PayrollComponentModal({ item, onClose, onSave, isSaving }: PayrollComponentModalProps) {
  const [form, setForm] = useState({
    code: item?.code ?? '',
    name: item?.name ?? '',
    type: item?.type ?? ('earning' as const),
    defaultValue: item?.defaultValue ?? 0,
    isFormula: item?.isFormula ?? false,
    formula: item?.formula ?? '',
    status: item?.status ?? 'active',
  })

  return (
    <ModalWrapper
      title={item ? 'Edit Komponen Payroll' : 'Tambah Komponen Payroll'}
      onClose={onClose}
      onSave={() => onSave(form)}
      isSaving={isSaving}
    >
      <div className='grid grid-cols-2 gap-3'>
        <div>
          <label className='mb-1 block text-xs font-medium text-foreground'>Kode Komponen</label>
          <input
            type='text'
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            placeholder='Contoh: C-GP'
            required
            className='h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring/50 focus:outline-none'
          />
        </div>
        <div>
          <label className='mb-1 block text-xs font-medium text-foreground'>Jenis Komponen</label>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as 'earning' | 'deduction' })}
            className='h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring/50 focus:outline-none'
          >
            <option value='earning'>Pendapatan (Earning)</option>
            <option value='deduction'>Potongan (Deduction)</option>
          </select>
        </div>
      </div>
      <div>
        <label className='mb-1 block text-xs font-medium text-foreground'>Nama Komponen</label>
        <input
          type='text'
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder='Contoh: Gaji Pokok'
          required
          className='h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring/50 focus:outline-none'
        />
      </div>
      <div className='grid grid-cols-2 gap-3'>
        <div>
          <label className='mb-1 block text-xs font-medium text-foreground'>Nilai Default (Rp)</label>
          <input
            type='number'
            value={form.defaultValue}
            onChange={(e) => setForm({ ...form, defaultValue: parseInt(e.target.value) || 0 })}
            placeholder='5000000'
            required
            className='h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring/50 focus:outline-none'
          />
        </div>
        <div>
          <label className='mb-1 block text-xs font-medium text-foreground'>Gunakan Rumus</label>
          <select
            value={form.isFormula ? 'yes' : 'no'}
            onChange={(e) => setForm({ ...form, isFormula: e.target.value === 'yes' })}
            className='h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring/50 focus:outline-none'
          >
            <option value='no'>Tidak (Nilai Tetap)</option>
            <option value='yes'>Ya (Formula Kustom)</option>
          </select>
        </div>
      </div>
      {form.isFormula && (
        <div>
          <label className='mb-1 block text-xs font-medium text-foreground'>Formula Perhitungan</label>
          <input
            type='text'
            value={form.formula}
            onChange={(e) => setForm({ ...form, formula: e.target.value })}
            placeholder='Contoh: late_minutes * 2000'
            required={form.isFormula}
            className='h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring/50 focus:outline-none font-mono text-xs'
          />
        </div>
      )}
      <div>
        <label className='mb-1 block text-xs font-medium text-foreground'>Status</label>
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value as MasterDataStatus })}
          className='h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring/50 focus:outline-none'
        >
          <option value='active'>Aktif</option>
          <option value='inactive'>Nonaktif</option>
        </select>
      </div>
    </ModalWrapper>
  )
}
