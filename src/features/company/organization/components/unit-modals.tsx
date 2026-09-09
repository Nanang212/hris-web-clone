// src/features/company/organization/components/unit-modals.tsx
import {
  IconAlertTriangle,
  IconBuilding,
  IconHierarchy,
  IconTrash,
} from '@tabler/icons-react'
import { useEffect, useState } from 'react'

import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Textarea } from '@/shared/components/ui/textarea'

import type { AddEditUnitPayload, MoveUnitPayload, OrgLevel, OrgNode, OrgStatus } from '../types'

// ─── 1. Add / Edit Unit Modal ────────────────────────────────────────────────
interface AddEditUnitModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'add' | 'edit'
  initialParent?: OrgNode | null
  initialNode?: OrgNode | null
  allNodes: { id: string; name: string; level: OrgLevel }[]
  onSave: (payload: AddEditUnitPayload) => void
}

export function AddEditUnitModal({
  open,
  onOpenChange,
  mode,
  initialParent,
  initialNode,
  allNodes,
  onSave,
}: AddEditUnitModalProps) {
  const [level, setLevel] = useState<OrgLevel>('department')
  const [parentId, setParentId] = useState<string>('')
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [headName, setHeadName] = useState('')
  const [headTitle, setHeadTitle] = useState('')
  const [costCenter, setCostCenter] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<OrgStatus>('active')

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && initialNode) {
        setLevel(initialNode.level)
        setParentId(initialNode.parentId || '')
        setName(initialNode.name)
        setCode(initialNode.code)
        setHeadName(initialNode.headOfUnit?.name || '')
        setHeadTitle(initialNode.headOfUnit?.title || '')
        setCostCenter(initialNode.costCenter || '')
        setDescription(initialNode.description || '')
        setStatus(initialNode.status)
      } else {
        // Add mode
        const defaultLevel: OrgLevel =
          initialParent?.level === 'company'
            ? 'division'
            : initialParent?.level === 'division'
              ? 'department'
              : 'position'
        setLevel(defaultLevel)
        setParentId(initialParent?.id || '')
        setName('')
        setCode('')
        setHeadName('')
        setHeadTitle('')
        setCostCenter('')
        setDescription('')
        setStatus('active')
      }
    }
  }, [open, mode, initialNode, initialParent])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      id: initialNode?.id,
      name,
      code,
      level,
      parentId: parentId || null,
      headOfUnitName: headName,
      headOfUnitTitle: headTitle,
      costCenter,
      description,
      status,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='overflow-hidden rounded-2xl p-0 sm:max-w-[560px]'>
        <form onSubmit={handleSubmit}>
          <DialogHeader className='border-b border-border/80 bg-muted/20 p-6 pb-4'>
            <div className='flex items-center gap-2.5'>
              <div className='flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                <IconBuilding size={20} />
              </div>
              <div>
                <DialogTitle className='text-sm font-bold text-foreground'>
                  {mode === 'add' ? 'Add Organization Unit' : 'Edit Organization Unit'}
                </DialogTitle>
                <DialogDescription className='mt-0.5 text-xs text-muted-foreground'>
                  {mode === 'add'
                    ? 'Buat unit organisasi baru dalam struktur hierarki perusahaan'
                    : `Perbarui informasi data untuk ${initialNode?.name || 'unit'}`}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className='max-h-[70vh] space-y-4 overflow-y-auto p-6'>
            {/* Level & Parent Selection */}
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <div className='space-y-1.5'>
                <label className='text-xs font-semibold text-foreground'>Unit Level *</label>
                <Select
                  value={level}
                  onValueChange={(val: OrgLevel) => setLevel(val)}
                  disabled={mode === 'edit' && initialNode?.level === 'company'}
                >
                  <SelectTrigger className='h-9.5 rounded-xl bg-background text-xs'>
                    <SelectValue placeholder='Pilih Tingkat Unit' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='division'>Division (Divisi)</SelectItem>
                    <SelectItem value='department'>Department (Departemen)</SelectItem>
                    <SelectItem value='position'>Position (Jabatan/Posisi)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-1.5'>
                <label className='text-xs font-semibold text-foreground'>Parent Unit *</label>
                <Select value={parentId} onValueChange={setParentId}>
                  <SelectTrigger className='h-9.5 rounded-xl bg-background text-xs'>
                    <SelectValue placeholder='Pilih Unit Induk' />
                  </SelectTrigger>
                  <SelectContent>
                    {allNodes
                      .filter((n) => n.id !== initialNode?.id)
                      .map((node) => (
                        <SelectItem key={node.id} value={node.id}>
                          <span className='font-medium capitalize'>[{node.level}]</span> {node.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Code and Name */}
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
              <div className='space-y-1.5 sm:col-span-1'>
                <label className='text-xs font-semibold text-foreground'>Unit Code *</label>
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder='e.g. DEP-SE'
                  className='h-9.5 rounded-xl bg-background font-mono text-xs uppercase'
                  required
                />
              </div>

              <div className='space-y-1.5 sm:col-span-2'>
                <label className='text-xs font-semibold text-foreground'>Unit Name *</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder='e.g. Software Engineering'
                  className='h-9.5 rounded-xl bg-background text-xs font-medium'
                  required
                />
              </div>
            </div>

            {/* Leader / Head of Unit */}
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <div className='space-y-1.5'>
                <label className='text-xs font-semibold text-foreground'>
                  Head of Unit (Leader)
                </label>
                <Input
                  value={headName}
                  onChange={(e) => setHeadName(e.target.value)}
                  placeholder='e.g. Rizky Pratama, S.Kom.'
                  className='h-9.5 rounded-xl bg-background text-xs'
                />
              </div>

              <div className='space-y-1.5'>
                <label className='text-xs font-semibold text-foreground'>Leader Job Title</label>
                <Input
                  value={headTitle}
                  onChange={(e) => setHeadTitle(e.target.value)}
                  placeholder='e.g. Head of Software Engineering'
                  className='h-9.5 rounded-xl bg-background text-xs'
                />
              </div>
            </div>

            {/* Cost Center & Status */}
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <div className='space-y-1.5'>
                <label className='text-xs font-semibold text-foreground'>Cost Center Code</label>
                <Input
                  value={costCenter}
                  onChange={(e) => setCostCenter(e.target.value)}
                  placeholder='e.g. CC-TECH-101'
                  className='h-9.5 rounded-xl bg-background font-mono text-xs'
                />
              </div>

              <div className='space-y-1.5'>
                <label className='text-xs font-semibold text-foreground'>Status *</label>
                <Select value={status} onValueChange={(val: OrgStatus) => setStatus(val)}>
                  <SelectTrigger className='h-9.5 rounded-xl bg-background text-xs'>
                    <SelectValue placeholder='Status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='active'>Active (Aktif)</SelectItem>
                    <SelectItem value='inactive'>Inactive (Non-aktif)</SelectItem>
                    <SelectItem value='draft'>Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className='space-y-1.5'>
              <label className='text-xs font-semibold text-foreground'>
                Description & Responsibilities
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder='Tuliskan ringkasan tugas dan fungsi unit organisasi ini...'
                className='min-h-[80px] rounded-xl bg-background text-xs'
              />
            </div>
          </div>

          <DialogFooter className='gap-2 border-t border-border/70 bg-muted/10 p-6 pt-3 sm:gap-0'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              className='h-9 rounded-xl text-xs font-semibold'
            >
              Cancel
            </Button>
            <Button type='submit' className='h-9 rounded-xl px-5 text-xs font-semibold shadow-xs'>
              {mode === 'add' ? 'Create Unit' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── 2. Move Unit Modal ──────────────────────────────────────────────────────
interface MoveUnitModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  node: OrgNode | null
  allNodes: { id: string; name: string; level: OrgLevel }[]
  onConfirmMove: (payload: MoveUnitPayload) => void
}

export function MoveUnitModal({
  open,
  onOpenChange,
  node,
  allNodes,
  onConfirmMove,
}: MoveUnitModalProps) {
  const [newParentId, setNewParentId] = useState('')
  const [reason, setReason] = useState('')

  useEffect(() => {
    if (open) {
      setNewParentId('')
      setReason('')
    }
  }, [open])

  const handleMove = (e: React.FormEvent) => {
    e.preventDefault()
    if (!node || !newParentId) return
    onConfirmMove({
      unitId: node.id,
      newParentId,
      reason,
    })
    onOpenChange(false)
  }

  // Filter available targets (cannot move to itself or invalid node)
  const validTargets = allNodes.filter((n) => n.id !== node?.id && n.id !== node?.parentId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='overflow-hidden rounded-2xl p-0 sm:max-w-[500px]'>
        <form onSubmit={handleMove}>
          <DialogHeader className='border-b border-border/80 bg-muted/20 p-6 pb-4'>
            <div className='flex items-center gap-2.5'>
              <div className='flex size-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600'>
                <IconHierarchy size={20} />
              </div>
              <div>
                <DialogTitle className='text-sm font-bold text-foreground'>
                  Move Organization Unit
                </DialogTitle>
                <DialogDescription className='mt-0.5 text-xs text-muted-foreground'>
                  Pindahkan posisi hierarki unit dalam struktur organisasi
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className='space-y-4 p-6'>
            {/* Target Unit Info */}
            <div className='flex items-center justify-between rounded-xl border border-border/70 bg-card p-3.5'>
              <div>
                <span className='text-[10px] font-bold tracking-wider text-muted-foreground uppercase'>
                  Unit yang dipindahkan
                </span>
                <h5 className='mt-0.5 text-xs font-bold text-foreground'>{node?.name}</h5>
                <p className='mt-0.5 font-mono text-[11px] text-muted-foreground'>
                  Code: {node?.code}
                </p>
              </div>
              <span className='rounded-lg bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary uppercase'>
                {node?.level}
              </span>
            </div>

            {/* Current vs New Parent */}
            <div className='space-y-3'>
              <div className='space-y-1.5'>
                <label className='text-xs font-semibold text-foreground'>Current Parent Unit</label>
                <Input
                  value={node?.parentName || 'Root Company'}
                  disabled
                  className='h-9 rounded-xl bg-muted/40 text-xs font-medium'
                />
              </div>

              <div className='space-y-1.5'>
                <label className='text-xs font-semibold text-foreground'>
                  Select New Parent Unit *
                </label>
                <Select value={newParentId} onValueChange={setNewParentId} required>
                  <SelectTrigger className='h-9.5 rounded-xl bg-background text-xs'>
                    <SelectValue placeholder='Pilih Unit Induk Baru' />
                  </SelectTrigger>
                  <SelectContent>
                    {validTargets.map((target) => (
                      <SelectItem key={target.id} value={target.id}>
                        <span className='font-medium capitalize'>[{target.level}]</span>{' '}
                        {target.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-1.5'>
                <label className='text-xs font-semibold text-foreground'>
                  Reason / Notes for Restructuring
                </label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder='Alasan pemindahan struktur organisasi...'
                  className='min-h-[60px] rounded-xl bg-background text-xs'
                />
              </div>
            </div>

            {/* Warning Alert Banner */}
            <div className='flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300'>
              <IconAlertTriangle className='mt-0.5 size-5 shrink-0 text-amber-600' />
              <div className='space-y-1'>
                <p className='font-bold'>Pemberitahuan Restrukturisasi Hierarki</p>
                <p className='text-[11px] leading-relaxed opacity-90'>
                  Memindahkan unit ini akan otomatis memperbarui rantai pelaporan (reporting line),
                  hak akses jabatan, serta seluruh sub-unit ({node?.totalSubUnits || 0} sub-unit) di
                  bawahnya.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className='gap-2 border-t border-border/70 bg-muted/10 p-6 pt-3 sm:gap-0'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              className='h-9 rounded-xl text-xs font-semibold'
            >
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={!newParentId}
              className='h-9 rounded-xl bg-amber-600 px-5 text-xs font-semibold text-white shadow-xs hover:bg-amber-700'
            >
              Confirm Move
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── 3. Delete Unit Confirmation Dialog ──────────────────────────────────────
interface DeleteUnitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  node: OrgNode | null
  onConfirmDelete: (nodeId: string) => void
}

export function DeleteUnitDialog({
  open,
  onOpenChange,
  node,
  onConfirmDelete,
}: DeleteUnitDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='rounded-2xl p-6 sm:max-w-[440px]'>
        <div className='flex items-start gap-3.5'>
          <div className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive'>
            <IconTrash size={22} />
          </div>
          <div className='space-y-1.5'>
            <DialogTitle className='text-sm font-bold text-foreground'>
              Delete Organization Unit
            </DialogTitle>
            <DialogDescription className='text-xs leading-relaxed text-muted-foreground'>
              Apakah Anda yakin ingin menghapus unit{' '}
              <strong className='text-foreground'>{node?.name}</strong>?
              {node && node.totalEmployees > 0 && (
                <span className='mt-1 block font-medium text-destructive'>
                  Unit ini saat ini memiliki {node.totalEmployees} karyawan aktif.
                </span>
              )}
            </DialogDescription>
          </div>
        </div>

        <DialogFooter className='mt-2 gap-2 border-t border-border/70 pt-4 sm:gap-0'>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
            className='h-9 rounded-xl text-xs font-semibold'
          >
            Cancel
          </Button>
          <Button
            type='button'
            variant='destructive'
            onClick={() => {
              if (node) onConfirmDelete(node.id)
              onOpenChange(false)
            }}
            className='h-9 rounded-xl text-xs font-semibold shadow-xs'
          >
            Delete Unit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
