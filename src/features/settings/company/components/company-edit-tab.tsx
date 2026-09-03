import {
  IconAlertCircle,
  IconBuilding,
  IconCheck,
  IconInfoCircle,
  IconMapPin,
  IconPhoto,
  IconUpload,
} from '@tabler/icons-react'
import { useState } from 'react'
import { useCompanyStore } from '../data/company-store'
import type { CompanyProfile, CompanyTab } from '../types'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import { snackbar } from '@/shared/lib/snackbar'

interface CompanyEditTabProps {
  onCancel: () => void
  onSaved: () => void
}

export function CompanyEditTab({ onCancel, onSaved }: CompanyEditTabProps) {
  const { profile, updateProfile, getStats } = useCompanyStore()
  const stats = getStats()

  const [formData, setFormData] = useState<CompanyProfile>({ ...profile })

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    updateProfile(formData)
    snackbar.success('Company profile and settings were updated successfully.')
    onSaved()
  }

  return (
    <form onSubmit={handleSave} className='space-y-6 w-full max-w-full min-w-0'>
      {/* ── Top Header Actions ────────────────────────────────────────────── */}
      <div className='flex items-center justify-between p-4 rounded-2xl border border-border/80 bg-card shadow-xs'>
        <div>
          <h3 className='text-base font-bold text-foreground'>Edit Company</h3>
          <p className='text-xs text-muted-foreground mt-0.5'>
            Perbarui informasi perusahaan, lokasi utama, dan pengaturan dasar.
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={onCancel}
            className='rounded-xl h-9 text-xs'
          >
            Cancel
          </Button>
          <Button
            type='submit'
            size='sm'
            className='rounded-xl h-9 text-xs font-bold bg-primary text-primary-foreground gap-1.5'
          >
            <IconCheck size={15} />
            Save Changes
          </Button>
        </div>
      </div>

      {/* ── Two Column Edit Forms ────────────────────────────────────────── */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
        {/* Left Card: Company Information (Col 7) */}
        <div className='lg:col-span-7 rounded-2xl border border-border/80 bg-card shadow-xs p-6 space-y-4'>
          <div className='pb-3 border-b border-border/80'>
            <h4 className='text-sm font-bold text-foreground'>Company Information</h4>
            <p className='text-xs text-muted-foreground mt-0.5'>
              Informasi legal dan identitas resmi perusahaan.
            </p>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs'>
            {/* Company Name */}
            <div className='space-y-1.5'>
              <label className='font-semibold text-foreground'>Company Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className='h-9 rounded-xl text-xs bg-background'
                placeholder='e.g. Bintang Fajar Persada'
                required
              />
            </div>

            {/* Legal Name */}
            <div className='space-y-1.5'>
              <label className='font-semibold text-foreground'>Legal Name</label>
              <Input
                value={formData.legalName}
                onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                className='h-9 rounded-xl text-xs bg-background'
                placeholder='e.g. PT Bintang Fajar Persada'
                required
              />
            </div>

            {/* Industry */}
            <div className='space-y-1.5'>
              <label className='font-semibold text-foreground'>Industry</label>
              <Input
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className='h-9 rounded-xl text-xs bg-background'
                placeholder='e.g. Technology & Professional Services'
                required
              />
            </div>

            {/* Company Email */}
            <div className='space-y-1.5'>
              <label className='font-semibold text-foreground'>Company Email</label>
              <Input
                type='email'
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className='h-9 rounded-xl text-xs bg-background'
                placeholder='info@bintangfajar.co.id'
                required
              />
            </div>

            {/* Phone */}
            <div className='space-y-1.5'>
              <label className='font-semibold text-foreground'>Phone</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className='h-9 rounded-xl text-xs bg-background'
                placeholder='+62 21 1234 5678'
              />
            </div>

            {/* Website */}
            <div className='space-y-1.5'>
              <label className='font-semibold text-foreground'>Website</label>
              <Input
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className='h-9 rounded-xl text-xs bg-background'
                placeholder='www.bintangfajar.co.id'
              />
            </div>

            {/* NPWP / Tax ID */}
            <div className='space-y-1.5'>
              <label className='font-semibold text-foreground'>NPWP / Tax ID</label>
              <Input
                value={formData.taxId}
                onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                className='h-9 rounded-xl text-xs font-mono bg-background'
                placeholder='01.234.567.6-081.000'
              />
            </div>

            {/* Established Date */}
            <div className='space-y-1.5'>
              <label className='font-semibold text-foreground'>Established Date</label>
              <Input
                value={formData.establishedDate}
                onChange={(e) => setFormData({ ...formData, establishedDate: e.target.value })}
                className='h-9 rounded-xl text-xs bg-background'
                placeholder='12 March 2010'
              />
            </div>

            {/* Total Employees */}
            <div className='space-y-1.5'>
              <label className='font-semibold text-foreground'>Total Employees</label>
              <Input
                disabled
                value={`${formData.totalEmployees.toLocaleString()} active employees`}
                className='h-9 rounded-xl text-xs bg-muted/40 cursor-not-allowed'
              />
              <span className='text-[10px] text-muted-foreground'>
                Calculated automatically from active employee master.
              </span>
            </div>

            {/* Company Code */}
            <div className='space-y-1.5'>
              <label className='font-semibold text-foreground'>Company Code</label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className='h-9 rounded-xl text-xs font-mono uppercase bg-background'
                placeholder='COMP-001'
              />
              <span className='text-[10px] text-muted-foreground'>Unique company identifier.</span>
            </div>
          </div>

          {/* Company Description */}
          <div className='space-y-1.5 pt-2'>
            <label className='font-semibold text-foreground text-xs'>Company Description</label>
            <Textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className='rounded-xl text-xs bg-background'
              placeholder='Tuliskan deskripsi ringkas profil dan operasional perusahaan...'
            />
          </div>

          {/* Audit Trail Note */}
          <div className='p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300'>
            <IconAlertCircle size={15} className='shrink-0' />
            <span>Changes are recorded in the Audit Trail.</span>
          </div>
        </div>

        {/* Right Card: Brand & Location (Col 5) */}
        <div className='lg:col-span-5 rounded-2xl border border-border/80 bg-card shadow-xs p-6 space-y-4'>
          <div className='pb-3 border-b border-border/80'>
            <h4 className='text-sm font-bold text-foreground'>Brand & Location</h4>
            <p className='text-xs text-muted-foreground mt-0.5'>
              Logo dan head office utama.
            </p>
          </div>

          {/* Company Logo Box */}
          <div className='p-4 rounded-2xl border-2 border-dashed border-border/80 bg-muted/10 flex flex-col items-center justify-center text-center space-y-2'>
            <div className='size-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-2xl shadow-xs'>
              🏢
            </div>
            <div>
              <p className='text-xs font-bold text-foreground'>Company Logo</p>
              <p className='text-[10px] text-muted-foreground'>PNG, JPG, or SVG up to 2MB</p>
            </div>
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='rounded-xl text-xs h-8 gap-1.5'
              onClick={() => snackbar.info('Logo upload simulation triggered')}
            >
              <IconUpload size={13} />
              Upload Logo
            </Button>
          </div>

          {/* Head Office Form */}
          <div className='space-y-3 text-xs'>
            <div className='space-y-1.5'>
              <label className='font-semibold text-foreground'>Head Office Name</label>
              <Input
                value={formData.headOfficeName}
                onChange={(e) => setFormData({ ...formData, headOfficeName: e.target.value })}
                className='h-9 rounded-xl text-xs bg-background'
                placeholder='e.g. Jakarta HQ'
                required
              />
            </div>

            <div className='space-y-1.5'>
              <label className='font-semibold text-foreground'>City / Province</label>
              <Input
                value={formData.cityProvince}
                onChange={(e) => setFormData({ ...formData, cityProvince: e.target.value })}
                className='h-9 rounded-xl text-xs bg-background'
                placeholder='Jakarta - DKI Jakarta'
                required
              />
            </div>

            <div className='space-y-1.5'>
              <label className='font-semibold text-foreground'>Country</label>
              <Input
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className='h-9 rounded-xl text-xs bg-background'
                placeholder='Indonesia'
                required
              />
            </div>

            <div className='space-y-1.5'>
              <label className='font-semibold text-foreground'>Head Office Address</label>
              <Textarea
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className='rounded-xl text-xs bg-background'
                placeholder='Jl. Sudirman No. 123, Jakarta 12190, Indonesia'
                required
              />
            </div>
          </div>

          {/* Linked Summary Badge */}
          <div className='pt-2'>
            <div className='p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-between text-xs'>
              <span className='font-bold text-emerald-800 dark:text-emerald-300'>
                {stats.totalBranches} branches · {stats.totalLocations} office locations
              </span>
              <span className='text-[10px] text-emerald-700 dark:text-emerald-400 font-medium'>
                Linked total employees
              </span>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
