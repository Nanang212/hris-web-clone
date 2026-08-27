// document-overview-tab.tsx — Overview tab with Stats, Filters, Completeness table, and Employee snapshot card
import { IconSearch } from '@tabler/icons-react'
import { useState } from 'react'
import {
  DocumentStatsCards,
  type DocumentStatCardItem,
} from '@/features/document/components/document-stats-cards'
import { DocumentCompletenessTable } from '@/features/document/components/document-completeness-table'
import { DocumentEmployeeSnapshot } from '@/features/document/components/document-employee-snapshot'
import {
  useGetDocumentCompletenessList,
  useGetDocumentOverviewStats,
} from '@/features/document/hooks'
import type { EmployeeDocumentCompleteness } from '@/features/document/types'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'

interface DocumentOverviewTabProps {
  onManageEmployee: (emp: EmployeeDocumentCompleteness) => void
}

export function DocumentOverviewTab({ onManageEmployee }: DocumentOverviewTabProps) {
  // ─── Filter State ──────────────────────────────────────────────────────────
  const [searchInput, setSearchInput] = useState('')
  const [searchValue, setSearchValue] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [completenessFilter, setCompletenessFilter] = useState('all')

  const [selectedItem, setSelectedItem] = useState<EmployeeDocumentCompleteness | null>(null)

  // ─── Queries ───────────────────────────────────────────────────────────────
  const { data: stats } = useGetDocumentOverviewStats()
  const {
    data: list = [],
    isPending,
    isFetching,
    refetch,
  } = useGetDocumentCompletenessList(
    searchValue || undefined,
    departmentFilter !== 'all' ? departmentFilter : undefined,
    statusFilter !== 'all' ? statusFilter : undefined,
    completenessFilter !== 'all' ? completenessFilter : undefined,
  )

  const handleSearch = () => setSearchValue(searchInput)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') setSearchValue(searchInput)
  }
  const handleReset = () => {
    setSearchInput('')
    setSearchValue('')
    setDepartmentFilter('all')
    setStatusFilter('all')
    setCompletenessFilter('all')
  }

  // Selected item sync (pick first item if none selected)
  const activeSelected =
    selectedItem && list.some((i) => i.id === selectedItem.id)
      ? selectedItem
      : list[0] ?? null

  const statItems: DocumentStatCardItem[] = [
    {
      id: 'stat-total',
      label: 'Employee Records',
      value: (stats?.totalEmployees ?? 1248).toLocaleString(),
      subtext: 'Across active entities',
      iconBadgeText: 'EMP',
      iconBgClass: 'bg-blue-50 dark:bg-blue-950/50',
      iconTextClass: 'text-blue-600 dark:text-blue-400',
    },
    {
      id: 'stat-complete',
      label: 'Complete',
      value: (stats?.completedCount ?? 1086).toLocaleString(),
      subtext: `${stats?.completedPercentage ?? 87}% complete`,
      iconBadgeText: 'OK',
      iconBgClass: 'bg-emerald-50 dark:bg-emerald-950/50',
      iconTextClass: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      id: 'stat-missing',
      label: 'Missing Documents',
      value: stats?.missingDocumentsCount ?? 162,
      subtext: 'Needs follow-up',
      iconBadgeText: '!',
      iconBgClass: 'bg-rose-50 dark:bg-rose-950/50',
      iconTextClass: 'text-rose-600 dark:text-rose-400',
    },
    {
      id: 'stat-expiring',
      label: 'Expiring in 30 Days',
      value: stats?.expiringCount ?? 42,
      subtext: 'MCU/Certificate',
      iconBadgeText: 'EXP',
      iconBgClass: 'bg-amber-50 dark:bg-amber-950/50',
      iconTextClass: 'text-amber-600 dark:text-amber-400',
    },
  ]

  return (
    <div className='flex flex-col gap-6'>
      {/* Metric Cards */}
      <DocumentStatsCards items={statItems} />

      {/* Filter Bar */}
      <div className='flex flex-wrap items-center gap-3'>
        <div className='relative min-w-[240px] flex-1'>
          <IconSearch
            size={15}
            className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'
          />
          <Input
            className='h-9 pl-9 pr-4 text-xs'
            placeholder='Search employee / NIP...'
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className='h-9 w-40 text-xs'>
            <SelectValue placeholder='All departments' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All departments</SelectItem>
            <SelectItem value='IT & Engineering'>IT & Engineering</SelectItem>
            <SelectItem value='Human Resource'>Human Resource</SelectItem>
            <SelectItem value='Marketing & Design'>Marketing & Design</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className='h-9 w-36 text-xs'>
            <SelectValue placeholder='All status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All status</SelectItem>
            <SelectItem value='complete'>Complete</SelectItem>
            <SelectItem value='missing'>Missing docs</SelectItem>
            <SelectItem value='expiring'>Expiring docs</SelectItem>
          </SelectContent>
        </Select>

        <Select value={completenessFilter} onValueChange={setCompletenessFilter}>
          <SelectTrigger className='h-9 w-36 text-xs'>
            <SelectValue placeholder='Completeness' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Completeness: All</SelectItem>
            <SelectItem value='6/6'>Complete (6/6)</SelectItem>
            <SelectItem value='incomplete'>Incomplete (&lt;6/6)</SelectItem>
          </SelectContent>
        </Select>

        <Button variant='outline' size='sm' onClick={handleSearch} className='text-xs'>
          Filter
        </Button>
        <Button variant='ghost' size='sm' onClick={handleReset} className='text-xs text-muted-foreground'>
          Reset
        </Button>
      </div>

      {/* Main Split Grid */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        <div className='lg:col-span-2'>
          <DocumentCompletenessTable
            data={list}
            selectedId={activeSelected?.id}
            onSelect={(item) => setSelectedItem(item)}
            onManage={onManageEmployee}
            isPending={isPending}
            isFetching={isFetching}
          />
        </div>

        <div className='lg:col-span-1'>
          <DocumentEmployeeSnapshot
            selected={activeSelected}
            onManage={onManageEmployee}
          />
        </div>
      </div>
    </div>
  )
}
