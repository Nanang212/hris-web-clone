import {
  IconBuilding,
  IconBuildingSkyscraper,
  IconEdit,
  IconGitBranch,
  IconMapPin,
  IconSparkles,
} from '@tabler/icons-react'
import { useState } from 'react'
import { BranchesTab } from './components/branches-tab'
import { CompanyEditTab } from './components/company-edit-tab'
import { CompanyOverviewTab } from './components/company-overview-tab'
import { OfficeLocationsTab } from './components/office-locations-tab'
import { useCompanyStore } from './data/company-store'
import type { CompanyTab } from './types'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'

export function CompanySettingsPage() {
  const [activeTab, setActiveTab] = useState<CompanyTab>('overview')
  const { getStats } = useCompanyStore()
  const stats = getStats()

  return (
    <div className='flex flex-col gap-6 p-4 sm:p-6 max-w-[1600px] mx-auto w-full'>
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div>
          <h1 className='text-xl sm:text-2xl font-black text-foreground tracking-tight'>
            {activeTab === 'overview' && 'Company'}
            {activeTab === 'locations' && 'Office Locations'}
            {activeTab === 'branches' && 'Branches'}
            {activeTab === 'edit' && 'Edit Company'}
          </h1>
          <p className='text-xs text-muted-foreground mt-1'>
            {activeTab === 'overview' &&
              'Kelola profil perusahaan, cabang, lokasi kantor, dan informasi legal.'}
            {activeTab === 'locations' &&
              'Kelola lokasi kerja, alamat, geofence, dan distribusi karyawan.'}
            {activeTab === 'branches' &&
              'Kelola cabang perusahaan, lokasi, PIC, dan jumlah karyawan.'}
            {activeTab === 'edit' &&
              'Perbarui informasi perusahaan, lokasi utama, dan pengaturan dasar.'}
          </p>
        </div>

        {/* Right Header Actions */}
        {activeTab === 'overview' && (
          <Button
            type='button'
            size='sm'
            onClick={() => setActiveTab('edit')}
            className='rounded-xl h-9 text-xs font-bold bg-primary text-primary-foreground gap-1.5 shadow-xs shrink-0'
          >
            <IconEdit size={15} />
            Edit Company
          </Button>
        )}
      </div>

      {/* ── Tab Pills Sub-navigation ──────────────────────────────────────── */}
      {activeTab !== 'edit' && (
        <div className='flex items-center gap-1.5 p-1 rounded-2xl bg-muted/30 border border-border/80 w-fit max-w-full overflow-x-auto'>
          {/* Tab 1: Overview */}
          <button
            type='button'
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-card text-foreground shadow-xs border border-border/80'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
            }`}
          >
            <IconBuilding size={15} className={activeTab === 'overview' ? 'text-primary' : ''} />
            <span>Company Profile</span>
          </button>

          {/* Tab 2: Office Locations */}
          <button
            type='button'
            onClick={() => setActiveTab('locations')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'locations'
                ? 'bg-card text-foreground shadow-xs border border-border/80'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
            }`}
          >
            <IconMapPin size={15} className={activeTab === 'locations' ? 'text-amber-600' : ''} />
            <span>Office Locations</span>
            <Badge
              variant='outline'
              className={`rounded-full px-1.5 py-0 text-[10px] font-mono font-bold ${
                activeTab === 'locations'
                  ? 'bg-amber-500/10 text-amber-700 border-amber-300'
                  : 'bg-muted/60 text-muted-foreground'
              }`}
            >
              {stats.totalLocations}
            </Badge>
          </button>

          {/* Tab 3: Branches */}
          <button
            type='button'
            onClick={() => setActiveTab('branches')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'branches'
                ? 'bg-card text-foreground shadow-xs border border-border/80'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
            }`}
          >
            <IconGitBranch size={15} className={activeTab === 'branches' ? 'text-emerald-600' : ''} />
            <span>Branches</span>
            <Badge
              variant='outline'
              className={`rounded-full px-1.5 py-0 text-[10px] font-mono font-bold ${
                activeTab === 'branches'
                  ? 'bg-emerald-500/10 text-emerald-700 border-emerald-300'
                  : 'bg-muted/60 text-muted-foreground'
              }`}
            >
              {stats.totalBranches}
            </Badge>
          </button>
        </div>
      )}

      {/* ── Active Tab Component Rendering ────────────────────────────────── */}
      {activeTab === 'overview' && <CompanyOverviewTab onNavigateTab={setActiveTab} />}
      {activeTab === 'locations' && <OfficeLocationsTab />}
      {activeTab === 'branches' && <BranchesTab />}
      {activeTab === 'edit' && (
        <CompanyEditTab
          onCancel={() => setActiveTab('overview')}
          onSaved={() => setActiveTab('overview')}
        />
      )}
    </div>
  )
}
