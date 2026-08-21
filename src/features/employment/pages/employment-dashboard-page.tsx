// employment-dashboard-page.tsx — Dashboard Master-Detail view for Employment

import { IconSearch } from '@tabler/icons-react'
import { useState } from 'react'

import { useGetEmployees } from '@/features/employment/hooks'
import type { ContractType } from '@/features/employment/types'
import { EmployeeDetailPanel } from './employee-detail-panel'
import { AppMain } from '@/shared/components/app-layout/app-main'
import { Button } from '@/shared/components/ui/button'
import { Card } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { EmployeeTable } from '@/features/employment/components/employee-table'

export function EmploymentDashboardPage() {
  const [searchInput, setSearchInput] = useState('')
  const [searchValue, setSearchValue] = useState('')
  const [selectedId, setSelectedId] = useState<string>('emp-1')
  const [departmentId, setDepartmentId] = useState<string>('all')
  const [contractType, setContractType] = useState<string>('all')

  const handleSearch = () => {
    setSearchValue(searchInput)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setSearchValue(searchInput)
    }
  }

  const handleReset = () => {
    setSearchInput('')
    setSearchValue('')
    setDepartmentId('all')
    setContractType('all')
  }

  const { data: result, isPending, error, refetch } = useGetEmployees({
    search: searchValue || undefined,
    departmentId: departmentId === 'all' ? undefined : departmentId,
    contractType: contractType === 'all' ? undefined : (contractType as ContractType),
  })

  const employees = result?.items ?? []
  const selectedEmp = employees.find((e) => e.id === selectedId) ?? employees[0]

  // Stats summary for the cards
  const totalCount = employees.length
  const contractCount = employees.filter((e) => e.contractType === 'contract').length
  const permanentCount = employees.filter((e) => e.contractType === 'permanent').length

  const statsCards = [
    {
      title: 'Employees',
      value: totalCount.toLocaleString(),
      desc: 'Active employee records',
      bg: 'bg-blue-50/50 dark:bg-blue-950/20',
    },
    {
      title: 'Contract Employees',
      value: contractCount.toLocaleString(),
      desc: totalCount > 0 ? `${Math.round((contractCount / totalCount) * 100)}% of employees` : '0% of employees',
      bg: 'bg-amber-50/50 dark:bg-amber-950/20',
    },
    {
      title: 'Permanent',
      value: permanentCount.toLocaleString(),
      desc: totalCount > 0 ? `${Math.round((permanentCount / totalCount) * 100)}% of employees` : '0% of employees',
      bg: 'bg-emerald-50/50 dark:bg-emerald-950/20',
    },
    {
      title: 'Upcoming Changes',
      value: '23',
      desc: 'Effective within 30 days',
      bg: 'bg-purple-50/50 dark:bg-purple-950/20',
    },
  ]

  return (
    <AppMain
      pending={isPending && !result}
      error={error}
      retry={refetch}
      breadcrumbs={[
        { to: '/', label: 'Company' },
        { to: '.', label: 'Employment' },
      ]}
      title='Employment'
      subtitle='View employee employment data first, then continue to contract, mutation, promotion, resignation, or employment history.'
    >
      {/* Stats Cards */}
      <div className='mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {statsCards.map((card, idx) => (
          <div
            key={idx}
            className={`flex flex-col gap-1 rounded-2xl p-5 border border-border/50 shadow-sm ${card.bg}`}
          >
            <div className='flex items-center justify-between'>
              <span className='text-xs font-semibold text-muted-foreground'>{card.title}</span>
            </div>
            <div className='mt-2 flex items-baseline gap-2'>
              <span className='text-2xl font-extrabold text-foreground'>{card.value}</span>
            </div>
            <span className='text-[11px] text-muted-foreground'>{card.desc}</span>
          </div>
        ))}
      </div>

      {/* Filters Bar */}
      <div className='mb-6 flex flex-wrap items-center gap-3 rounded-2xl bg-card p-4 border border-border/60 shadow-sm'>
        <div className='flex flex-1 min-w-[320px] gap-2'>
          <div className='relative flex-1'>
            <IconSearch
              size={16}
              className='pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground'
            />
            <Input
              placeholder='Search employee / NIP / position...'
              className='pl-9'
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <Button onClick={handleSearch}>Search</Button>
          <Button variant='outline' onClick={handleReset}>Reset</Button>
        </div>

        <Select
          onValueChange={(val) => setDepartmentId(val)}
          value={departmentId}
        >
          <SelectTrigger className='w-44'>
            <SelectValue placeholder='All departments' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All departments</SelectItem>
            <SelectItem value='dept-1'>IT &amp; Engineering</SelectItem>
            <SelectItem value='dept-2'>Human Resource</SelectItem>
            <SelectItem value='dept-3'>Finance &amp; Accounting</SelectItem>
          </SelectContent>
        </Select>

        <Select
          onValueChange={(val) => setContractType(val)}
          value={contractType}
        >
          <SelectTrigger className='w-44'>
            <SelectValue placeholder='Employment type' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All types</SelectItem>
            <SelectItem value='permanent'>Permanent</SelectItem>
            <SelectItem value='contract'>Contract</SelectItem>
            <SelectItem value='internship'>Internship</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main Content Layout */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* Left Side: Employee List Table */}
        <div className='lg:col-span-2'>
          <EmployeeTable
            employees={employees}
            isPending={isPending && employees.length === 0}
            selectedId={selectedId ?? selectedEmp?.id}
            onSelectEmployee={setSelectedId}
          />
        </div>

        {/* Right Side: Selected Employee Details Panel */}
        <div>
          {selectedEmp ? (
            <EmployeeDetailPanel selectedEmp={selectedEmp} />
          ) : (
            <Card className='p-6 text-center text-sm text-muted-foreground'>
              Select an employee from the table to see details.
            </Card>
          )}
        </div>
      </div>
    </AppMain>
  )
}
