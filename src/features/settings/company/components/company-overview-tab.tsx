import {
  IconArrowRight,
  IconBriefcase,
  IconBuilding,
  IconBuildingSkyscraper,
  IconCalendar,
  IconChartPie,
  IconClock,
  IconCoin,
  IconCreditCard,
  IconDeviceLaptop,
  IconFileText,
  IconGitBranch,
  IconGlobe,
  IconLanguage,
  IconMail,
  IconMapPin,
  IconPhone,
  IconReceipt2,
  IconUsers,
} from '@tabler/icons-react'
import { useCompanyStore } from '../data/company-store'
import type { CompanyTab } from '../types'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'

interface CompanyOverviewTabProps {
  onNavigateTab: (tab: CompanyTab) => void
}

export function CompanyOverviewTab({ onNavigateTab }: CompanyOverviewTabProps) {
  const { profile, corporateSettings, locations, branches, getStats } = useCompanyStore()
  const stats = getStats()

  return (
    <div className='space-y-6 w-full max-w-full min-w-0'>
      {/* ── Top 4 Metric Cards ────────────────────────────────────────────── */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        {/* Card 1: Profile Completion */}
        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-muted-foreground'>Profile Completion</p>
            <h3 className='text-2xl font-black text-foreground mt-0.5'>
              {stats.profileCompletion}%
            </h3>
            <p className='text-[10px] text-emerald-600 font-semibold mt-0.5'>Almost complete</p>
          </div>
          <div className='size-11 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center shrink-0'>
            <IconChartPie size={22} />
          </div>
        </div>

        {/* Card 2: Branches */}
        <div
          onClick={() => onNavigateTab('branches')}
          className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between cursor-pointer hover:border-primary/50 transition-colors'
        >
          <div>
            <p className='text-xs font-semibold text-muted-foreground'>Branches</p>
            <h3 className='text-2xl font-black text-foreground mt-0.5'>{stats.totalBranches}</h3>
            <p className='text-[10px] text-muted-foreground font-medium mt-0.5'>
              {stats.activeBranches} active branches
            </p>
          </div>
          <div className='size-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0'>
            <IconGitBranch size={22} />
          </div>
        </div>

        {/* Card 3: Office Locations */}
        <div
          onClick={() => onNavigateTab('locations')}
          className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between cursor-pointer hover:border-primary/50 transition-colors'
        >
          <div>
            <p className='text-xs font-semibold text-muted-foreground'>Office Locations</p>
            <h3 className='text-2xl font-black text-foreground mt-0.5'>{stats.totalLocations}</h3>
            <p className='text-[10px] text-muted-foreground font-medium mt-0.5'>
              Across {stats.citiesCount} cities
            </p>
          </div>
          <div className='size-11 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center shrink-0'>
            <IconMapPin size={22} />
          </div>
        </div>

        {/* Card 4: Employees */}
        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-muted-foreground'>Employees</p>
            <h3 className='text-2xl font-black text-foreground mt-0.5'>
              {stats.totalEmployees.toLocaleString()}
            </h3>
            <p className='text-[10px] text-indigo-600 font-semibold mt-0.5'>Active workforce</p>
          </div>
          <div className='size-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center shrink-0'>
            <IconUsers size={22} />
          </div>
        </div>
      </div>

      {/* ── Middle 2-Column Section: Company Profile & Office Locations ──── */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
        {/* Left: Company Profile Card (Col 7) */}
        <div className='lg:col-span-7 rounded-2xl border border-border/80 bg-card shadow-xs p-6 flex flex-col justify-between'>
          <div>
            <div className='flex items-center justify-between pb-4 border-b border-border/80'>
              <div className='flex items-center gap-3.5'>
                <div className='size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-lg shadow-xs border border-primary/20 shrink-0'>
                  🏢
                </div>
                <div>
                  <h4 className='text-base font-bold text-foreground'>{profile.name}</h4>
                  <p className='text-xs text-muted-foreground'>
                    {profile.code} · {profile.industry}
                  </p>
                </div>
              </div>
              <Badge
                variant='outline'
                className='rounded-full px-3 py-1 text-xs font-bold bg-emerald-50 text-emerald-700 border-emerald-200 uppercase tracking-wide'
              >
                {profile.status}
              </Badge>
            </div>

            {/* Profile Info Details Grid */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 py-5 text-xs'>
              <div>
                <span className='text-muted-foreground block text-[11px] font-medium'>
                  Legal Name
                </span>
                <p className='font-bold text-foreground mt-0.5'>{profile.legalName}</p>
              </div>

              <div>
                <span className='text-muted-foreground block text-[11px] font-medium'>Industry</span>
                <p className='font-bold text-foreground mt-0.5'>{profile.industry}</p>
              </div>

              <div>
                <span className='text-muted-foreground block text-[11px] font-medium'>
                  Established
                </span>
                <p className='font-bold text-foreground mt-0.5'>{profile.establishedDate}</p>
              </div>

              <div>
                <span className='text-muted-foreground block text-[11px] font-medium'>
                  Tax ID / NPWP
                </span>
                <p className='font-bold font-mono text-foreground mt-0.5'>{profile.taxId}</p>
              </div>

              <div>
                <span className='text-muted-foreground block text-[11px] font-medium'>
                  Head Office
                </span>
                <p className='font-bold text-foreground mt-0.5'>{profile.headOfficeName}, {profile.country}</p>
              </div>

              <div>
                <span className='text-muted-foreground block text-[11px] font-medium'>
                  Total Employees
                </span>
                <p className='font-bold text-foreground mt-0.5'>
                  {profile.totalEmployees.toLocaleString()} active employees
                </p>
              </div>
            </div>
          </div>

          {/* Description Footer Note */}
          <div className='pt-4 border-t border-border/80 flex items-start gap-2 text-xs text-muted-foreground bg-muted/20 p-3 rounded-xl'>
            <IconBriefcase size={15} className='text-primary shrink-0 mt-0.5' />
            <p className='leading-relaxed'>{profile.description}</p>
          </div>
        </div>

        {/* Right: Office Locations List Card (Col 5) */}
        <div className='lg:col-span-5 rounded-2xl border border-border/80 bg-card shadow-xs p-6 flex flex-col justify-between'>
          <div>
            <div className='flex items-center justify-between pb-4 border-b border-border/80'>
              <div>
                <h4 className='text-sm font-bold text-foreground'>Office Locations</h4>
                <p className='text-xs text-muted-foreground mt-0.5'>
                  {locations.length} total offices registered
                </p>
              </div>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => onNavigateTab('locations')}
                className='text-xs text-primary font-bold hover:bg-primary/10 rounded-xl h-8 px-2.5 gap-1'
              >
                <span>View all</span>
                <IconArrowRight size={14} />
              </Button>
            </div>

            {/* Office Locations Quick List */}
            <div className='divide-y divide-border/60'>
              {locations.slice(0, 4).map((loc) => (
                <div
                  key={loc.id}
                  className='py-3 flex items-center justify-between hover:bg-muted/20 px-2 rounded-xl transition-colors'
                >
                  <div className='flex items-center gap-3 min-w-0'>
                    <div className='size-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center shrink-0'>
                      <IconBuildingSkyscraper size={18} />
                    </div>
                    <div className='min-w-0'>
                      <h5 className='font-bold text-foreground text-xs truncate'>{loc.name}</h5>
                      <p className='text-[11px] text-muted-foreground truncate'>
                        {loc.city} · {loc.employeesCount} employees
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant='outline'
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0 ${
                      loc.type === 'Head Office'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : loc.type === 'Regional'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : 'bg-muted/60 text-muted-foreground border-border/80'
                    }`}
                  >
                    {loc.type}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div className='pt-3 border-t border-border/80 flex items-center justify-between text-[11px] text-muted-foreground'>
            <span>Active Locations: {stats.activeLocations} of {stats.totalLocations}</span>
            <span
              onClick={() => onNavigateTab('locations')}
              className='text-primary font-semibold cursor-pointer hover:underline'
            >
              Manage geofencing →
            </span>
          </div>
        </div>
      </div>

      {/* ── Bottom Card: Corporate Settings ─────────────────────────────── */}
      <div className='rounded-2xl border border-border/80 bg-card shadow-xs p-6'>
        <div className='flex items-center justify-between pb-4 border-b border-border/80 mb-5'>
          <div>
            <h4 className='text-sm font-bold text-foreground'>Corporate Settings</h4>
            <p className='text-xs text-muted-foreground mt-0.5'>
              Default settings applied to company operations
            </p>
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={() => onNavigateTab('edit')}
            className='rounded-xl text-xs font-semibold h-8'
          >
            Adjust Settings
          </Button>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-xs'>
          {/* Item 1: Timezone */}
          <div className='p-3.5 rounded-xl border border-border/70 bg-muted/20 flex items-center justify-between'>
            <div className='flex items-center gap-2.5'>
              <IconClock size={16} className='text-primary' />
              <span className='font-medium text-muted-foreground'>Timezone</span>
            </div>
            <span className='font-bold text-foreground font-mono'>
              {corporateSettings.timezone}
            </span>
          </div>

          {/* Item 2: Working Week */}
          <div className='p-3.5 rounded-xl border border-border/70 bg-muted/20 flex items-center justify-between'>
            <div className='flex items-center gap-2.5'>
              <IconCalendar size={16} className='text-primary' />
              <span className='font-medium text-muted-foreground'>Working Week</span>
            </div>
            <span className='font-bold text-foreground'>{corporateSettings.workingWeek}</span>
          </div>

          {/* Item 3: Default Currency */}
          <div className='p-3.5 rounded-xl border border-border/70 bg-muted/20 flex items-center justify-between'>
            <div className='flex items-center gap-2.5'>
              <IconCoin size={16} className='text-primary' />
              <span className='font-medium text-muted-foreground'>Default Currency</span>
            </div>
            <span className='font-bold text-foreground font-mono'>
              {corporateSettings.defaultCurrency}
            </span>
          </div>

          {/* Item 4: Payroll Cutoff */}
          <div className='p-3.5 rounded-xl border border-border/70 bg-muted/20 flex items-center justify-between'>
            <div className='flex items-center gap-2.5'>
              <IconCreditCard size={16} className='text-primary' />
              <span className='font-medium text-muted-foreground'>Payroll Cutoff</span>
            </div>
            <span className='font-bold text-foreground font-mono'>
              {corporateSettings.payrollCutoff}
            </span>
          </div>

          {/* Item 5: Fiscal Year */}
          <div className='p-3.5 rounded-xl border border-border/70 bg-muted/20 flex items-center justify-between'>
            <div className='flex items-center gap-2.5'>
              <IconReceipt2 size={16} className='text-primary' />
              <span className='font-medium text-muted-foreground'>Fiscal Year</span>
            </div>
            <span className='font-bold text-foreground'>{corporateSettings.fiscalYear}</span>
          </div>

          {/* Item 6: Language */}
          <div className='p-3.5 rounded-xl border border-border/70 bg-muted/20 flex items-center justify-between'>
            <div className='flex items-center gap-2.5'>
              <IconLanguage size={16} className='text-primary' />
              <span className='font-medium text-muted-foreground'>Language</span>
            </div>
            <span className='font-bold text-foreground'>{corporateSettings.language}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
