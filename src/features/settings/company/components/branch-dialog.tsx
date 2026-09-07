import {
  IconBuilding,
  IconCheck,
  IconGitBranch,
  IconUser,
  IconX,
} from '@tabler/icons-react'
import { useState, useEffect } from 'react'
import { useCompanyStore } from '../data/company-store'
import type { BranchStatus, BranchType, CompanyBranch } from '../types'
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
import { snackbar } from '@/shared/lib/snackbar'

interface BranchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  branchToEdit?: CompanyBranch | null
}

const mockEmployeePics = [
  { name: 'Vania Yulius', email: 'vania.yulius@bintangfajar.co.id' },
  { name: 'Dinta Maharani', email: 'dinta.maharani@bintangfajar.co.id' },
  { name: 'Budi Setiawan', email: 'budi.setiawan@bintangfajar.co.id' },
  { name: 'Dewi Sartika', email: 'dewi.sartika@bintangfajar.co.id' },
  { name: 'Andi Pratama', email: 'andi.pratama@bintangfajar.co.id' },
  { name: 'Rian Hidayat', email: 'rian.hidayat@bintangfajar.co.id' },
]

export function BranchDialog({ open, onOpenChange, branchToEdit }: BranchDialogProps) {
  const { locations, addBranch, updateBranch } = useCompanyStore()

  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [type, setType] = useState<BranchType>('Branch')
  const [linkedOffice, setLinkedOffice] = useState('Jakarta HQ')
  const [city, setCity] = useState('')
  const [picName, setPicName] = useState('Andi Pratama')
  const [status, setStatus] = useState<BranchStatus>('Active')

  useEffect(() => {
    if (branchToEdit) {
      setName(branchToEdit.name)
      setCode(branchToEdit.code)
      setType(branchToEdit.type)
      setLinkedOffice(branchToEdit.linkedOffice)
      setCity(branchToEdit.city)
      setPicName(branchToEdit.picName)
      setStatus(branchToEdit.status)
    } else {
      setName('')
      setCode('')
      setType('Branch')
      setLinkedOffice(locations[0]?.name || 'Jakarta HQ')
      setCity('')
      setPicName('Andi Pratama')
      setStatus('Active')
    }
  }, [branchToEdit, open, locations])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !city.trim()) {
      snackbar.error('Mohon lengkapi seluruh kolom wajib.')
      return
    }

    const branchCode = code.trim() ? code.toUpperCase() : name.slice(0, 3).toUpperCase()
    const selectedPic = mockEmployeePics.find((p) => p.name === picName)

    if (branchToEdit) {
      updateBranch(branchToEdit.id, {
        name,
        code: branchCode,
        type,
        linkedOffice,
        city,
        picName,
        picEmail: selectedPic?.email || `${name.toLowerCase().replace(/\s+/g, '')}@bintangfajar.co.id`,
        status,
      })
      snackbar.success(`Cabang ${name} berhasil diperbarui.`)
    } else {
      addBranch({
        name,
        code: branchCode,
        type,
        linkedOffice,
        city,
        picName,
        picEmail: selectedPic?.email || 'pic@bintangfajar.co.id',
        employeesCount: 0,
        status,
      })
      snackbar.success(`Cabang baru ${name} berhasil ditambahkan.`)
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px] p-0 rounded-3xl overflow-hidden border-border/80'>
        {/* Header */}
        <div className='p-6 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-background border-b border-border/80'>
          <div className='flex items-center gap-3'>
            <div className='size-12 rounded-2xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs'>
              <IconGitBranch size={24} />
            </div>
            <div>
              <DialogTitle className='text-base font-bold text-foreground'>
                {branchToEdit ? 'Edit Branch' : 'Add Branch'}
              </DialogTitle>
              <DialogDescription className='text-xs text-muted-foreground mt-0.5'>
                Register a new company branch and link its office location.
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className='p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto'>
          {/* Branch Name */}
          <div className='space-y-1.5'>
            <label className='font-semibold text-foreground'>Branch Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='e.g. Yogyakarta Branch'
              className='h-9 rounded-xl text-xs bg-background'
              required
            />
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3.5'>
            {/* Branch Code */}
            <div className='space-y-1.5'>
              <label className='font-semibold text-foreground'>Branch Code</label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder='e.g. YGY'
                className='h-9 rounded-xl text-xs font-mono uppercase bg-background'
              />
            </div>

            {/* Branch Type */}
            <div className='space-y-1.5'>
              <label className='font-semibold text-foreground'>Branch Type</label>
              <Select value={type} onValueChange={(val: any) => setType(val)}>
                <SelectTrigger className='h-9 rounded-xl text-xs bg-background'>
                  <SelectValue placeholder='Select type' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='Head Office'>Head Office</SelectItem>
                  <SelectItem value='Branch'>Branch</SelectItem>
                  <SelectItem value='Regional'>Regional</SelectItem>
                  <SelectItem value='Representative'>Representative</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Linked Office Location */}
          <div className='space-y-1.5'>
            <label className='font-semibold text-foreground'>Linked Office Location</label>
            <Select value={linkedOffice} onValueChange={setLinkedOffice}>
              <SelectTrigger className='h-9 rounded-xl text-xs bg-background'>
                <SelectValue placeholder='Select office location' />
              </SelectTrigger>
              <SelectContent>
                {locations.map((loc) => (
                  <SelectItem key={loc.id} value={loc.name}>
                    {loc.name} ({loc.city})
                  </SelectItem>
                ))}
                <SelectItem value='Yogyakarta Office'>Yogyakarta Office (Yogyakarta)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* City */}
          <div className='space-y-1.5'>
            <label className='font-semibold text-foreground'>City</label>
            <Input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder='e.g. Yogyakarta'
              className='h-9 rounded-xl text-xs bg-background'
              required
            />
          </div>

          {/* Branch Head / PIC */}
          <div className='space-y-1.5'>
            <label className='font-semibold text-foreground'>Branch Head / PIC</label>
            <Select value={picName} onValueChange={setPicName}>
              <SelectTrigger className='h-9 rounded-xl text-xs bg-background'>
                <SelectValue placeholder='Select PIC' />
              </SelectTrigger>
              <SelectContent>
                {mockEmployeePics.map((pic) => (
                  <SelectItem key={pic.name} value={pic.name}>
                    {pic.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Total Employees Note */}
          <div className='space-y-1.5'>
            <label className='font-semibold text-foreground'>Total Employees</label>
            <Input
              disabled
              value={branchToEdit ? `${branchToEdit.employeesCount} employees` : '0 - calculated automatically'}
              className='h-9 rounded-xl text-xs bg-muted/40 cursor-not-allowed font-mono'
            />
            <span className='text-[10px] text-muted-foreground'>
              Employees will be synced from Employee Master.
            </span>
          </div>

          {/* Status */}
          <div className='flex items-center justify-between pt-1'>
            <label className='font-semibold text-foreground text-xs'>Status Cabang</label>
            <div className='flex items-center gap-2'>
              <button
                type='button'
                onClick={() => setStatus('Active')}
                className={`px-3 py-1 rounded-xl text-xs font-bold border transition-colors ${
                  status === 'Active'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-muted/40 text-muted-foreground border-border/80'
                }`}
              >
                Active
              </button>
              <button
                type='button'
                onClick={() => setStatus('Inactive')}
                className={`px-3 py-1 rounded-xl text-xs font-bold border transition-colors ${
                  status === 'Inactive'
                    ? 'bg-rose-50 text-rose-700 border-rose-300'
                    : 'bg-muted/40 text-muted-foreground border-border/80'
                }`}
              >
                Inactive
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <DialogFooter className='p-4 -mx-6 -mb-6 border-t border-border/80 bg-muted/10 flex items-center justify-between'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => onOpenChange(false)}
              className='rounded-xl h-9 text-xs'
            >
              Cancel
            </Button>
            <Button
              type='submit'
              size='sm'
              className='rounded-xl h-9 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-xs'
            >
              <IconCheck size={14} />
              Save Branch
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
