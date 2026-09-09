// employee-list-page.tsx — Employee list with stats, search, filter, table

import {
  IconEye,
  IconPencil,
  IconPlus,
  IconSearch,
  IconTrash,
  IconUserCheck,
  IconUsers,
  IconUserStar,
  IconUserX,
} from '@tabler/icons-react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { snackbar } from '@/shared/lib/snackbar'
import { EmployeeStatusBadge } from '@/features/employment/employee/components/employee-status-badge'
import {
  useDeleteEmployee,
  useGetEmployees,
  useGetEmployeeStats,
} from '@/features/employment/employee/hooks'
import type { EmployeeFilterParams, EmployeeStatus } from '@/features/employment/employee/types'
import { m } from '@/i18n/paraglide/messages'

const CONTRACT_TYPE_LABEL: Record<string, string> = {
  permanent: 'Tetap',
  contract: 'Kontrak',
  internship: 'Magang',
  freelance: 'Freelance',
}

export function EmployeeListPage() {
  const navigate = useNavigate()
  const [params, setParams] = useState<EmployeeFilterParams>({ page: 1, limit: 20 })
  const [searchValue, setSearchValue] = useState('')

  const { data: stats, isPending: statsPending } = useGetEmployeeStats()
  const { data: result, isPending, error, refetch } = useGetEmployees(params)
  const { mutate: deleteEmployee } = useDeleteEmployee()

  const statsCards = [
    {
      label: m.employment_stats_total(),
      value: stats?.total ?? 0,
      icon: IconUsers,
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
    },
    {
      label: m.employment_stats_active(),
      value: stats?.active ?? 0,
      icon: IconUserCheck,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    },
    {
      label: m.employment_stats_inactive(),
      value: stats?.inactive ?? 0,
      icon: IconUserX,
      color: 'text-rose-600',
      bg: 'bg-rose-50 dark:bg-rose-950/30',
    },
    {
      label: m.employment_stats_new_this_month(),
      value: stats?.newThisMonth ?? 0,
      icon: IconUserStar,
      color: 'text-amber-600',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
    },
  ]

  const handleSearch = () => {
    setParams((p) => ({ ...p, search: searchValue, page: 1 }))
  }

  const handleStatusFilter = (value: string) => {
    setParams((p) => ({
      ...p,
      status: value === 'all' ? undefined : (value as EmployeeStatus),
      page: 1,
    }))
  }

  const handleDepartmentFilter = (value: string) => {
    setParams((p) => ({
      ...p,
      departmentId: value === 'all' ? undefined : value,
      page: 1,
    }))
  }

  const handleReset = () => {
    setSearchValue('')
    setParams({ page: 1, limit: 20 })
  }

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Hapus karyawan "${name}"?`)) return
    deleteEmployee(id, {
      onSuccess: () => snackbar.success(m.employment_list_delete_success()),
      onError: (err) => snackbar.exception(err),
    })
  }

  const employees = result?.items ?? []

  return (
    <AppMain
      pending={isPending && !result}
      error={error}
      retry={refetch}
      breadcrumbs={[
        { to: '/', label: 'Company' },
        { to: '.', label: m.employment_list_title() },
      ]}
      title={m.employment_list_title()}
      subtitle={m.employment_list_subtitle()}
      actions={
        <Link to='/employment/employee/new'>
          <Button size='sm'>
            <IconPlus data-icon='inline-start' />
            {m.employment_list_add_button()}
          </Button>
        </Link>
      }
    >
      {/* Stats Cards */}
      <div className='mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4'>
        {statsCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className='flex items-center gap-4 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5'
            >
              <div className={`flex size-11 items-center justify-center rounded-xl ${card.bg}`}>
                <Icon size={22} className={card.color} />
              </div>
              <div>
                <p className='text-[11px] font-medium text-muted-foreground'>{card.label}</p>
                <p className={`text-2xl font-extrabold ${card.color}`}>
                  {statsPending ? '—' : card.value}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div className='mb-6 grid grid-cols-1 items-end gap-4 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5 sm:grid-cols-2 lg:grid-cols-5'>
        <div className='flex flex-col gap-1.5'>
          <label htmlFor='search' className='text-xs font-semibold text-muted-foreground'>
            Search
          </label>
          <div className='relative w-full'>
            <IconSearch
              size={16}
              className='pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground'
            />
            <Input
              id='search'
              placeholder='Search by ID, name, or email...'
              className='pl-9'
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
        </div>

        <div className='flex flex-col gap-1.5'>
          <label htmlFor='department' className='text-xs font-semibold text-muted-foreground'>
            Department
          </label>
          <Select onValueChange={handleDepartmentFilter} value={params.departmentId ?? 'all'}>
            <SelectTrigger id='department' className='w-full'>
              <SelectValue placeholder='All Departments' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Departments</SelectItem>
              <SelectItem value='dept-1'>IT & Engineering</SelectItem>
              <SelectItem value='dept-2'>Human Resource</SelectItem>
              <SelectItem value='dept-3'>Finance & Accounting</SelectItem>
              <SelectItem value='dept-4'>Marketing</SelectItem>
              <SelectItem value='dept-5'>Operations</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='flex flex-col gap-1.5'>
          <label htmlFor='status' className='text-xs font-semibold text-muted-foreground'>
            Status
          </label>
          <Select onValueChange={handleStatusFilter} value={params.status ?? 'all'}>
            <SelectTrigger id='status' className='w-full'>
              <SelectValue placeholder='All Status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Status</SelectItem>
              <SelectItem value='active'>Active</SelectItem>
              <SelectItem value='probation'>Probation</SelectItem>
              <SelectItem value='inactive'>Inactive</SelectItem>
              <SelectItem value='resigned'>Resign</SelectItem>
              <SelectItem value='terminated'>Terminated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='flex flex-col gap-1.5'>
          <label htmlFor='contractType' className='text-xs font-semibold text-muted-foreground'>
            Employment Type
          </label>
          <Select
            onValueChange={(val) =>
              setParams((p) => ({
                ...p,
                contractType: val === 'all' ? undefined : (val as ContractType),
                page: 1,
              }))
            }
            value={params.contractType ?? 'all'}
          >
            <SelectTrigger id='contractType' className='w-full'>
              <SelectValue placeholder='All Types' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Types</SelectItem>
              <SelectItem value='permanent'>Permanent</SelectItem>
              <SelectItem value='contract'>Contract</SelectItem>
              <SelectItem value='internship'>Internship</SelectItem>
              <SelectItem value='freelance'>Freelance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='flex w-full gap-2'>
          <Button className='flex-1' size='sm' onClick={handleSearch}>
            <IconSearch data-icon='inline-start' />
            Search
          </Button>
          <Button variant='outline' size='sm' onClick={handleReset} title='Reset Filters'>
            Reset
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className='overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-foreground/5'>
        <Table>
          <TableHeader>
            <TableRow className='bg-muted/40'>
              <TableHead className='w-[260px]'>Karyawan</TableHead>
              <TableHead>Kode</TableHead>
              <TableHead>Departemen</TableHead>
              <TableHead>Jabatan</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Kontrak</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tanggal Masuk</TableHead>
              <TableHead className='text-right'>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.length === 0 && !isPending && (
              <TableRow>
                <TableCell colSpan={9} className='py-12 text-center text-sm text-muted-foreground'>
                  Tidak ada data karyawan.
                </TableCell>
              </TableRow>
            )}
            {employees.map((emp) => (
              <TableRow
                key={emp.id}
                className='cursor-pointer transition-colors hover:bg-muted/30'
                onClick={() => navigate({ to: '/employment/employee/$id', params: { id: emp.id } })}
              >
                <TableCell>
                  <div className='flex items-center gap-3'>
                    <Avatar className='size-9'>
                      <AvatarImage src={emp.photo ?? undefined} alt={emp.fullName} />
                      <AvatarFallback className='bg-primary/10 text-xs font-semibold text-primary'>
                        {emp.fullName
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className='text-sm leading-none font-semibold text-foreground'>
                        {emp.fullName}
                      </p>
                      <p className='mt-0.5 text-xs text-muted-foreground'>{emp.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <code className='rounded bg-muted px-1.5 py-0.5 text-xs'>{emp.employeeCode}</code>
                </TableCell>
                <TableCell className='text-sm text-muted-foreground'>
                  {emp.departmentName}
                </TableCell>
                <TableCell className='text-sm'>{emp.positionName}</TableCell>
                <TableCell>
                  <Badge variant='outline' className='text-xs'>
                    {emp.gradeName}
                  </Badge>
                </TableCell>
                <TableCell className='text-xs text-muted-foreground'>
                  {CONTRACT_TYPE_LABEL[emp.contractType] ?? emp.contractType}
                </TableCell>
                <TableCell>
                  <EmployeeStatusBadge status={emp.status} />
                </TableCell>
                <TableCell className='text-sm text-muted-foreground'>{emp.joinDate}</TableCell>
                <TableCell>
                  <div
                    className='flex items-center justify-end gap-1'
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button variant='ghost' size='icon' className='size-8' asChild>
                      <Link to='/employment/employee/$id' params={{ id: emp.id }}>
                        <IconEye size={15} />
                      </Link>
                    </Button>
                    <Button variant='ghost' size='icon' className='size-8' asChild>
                      <Link to='/employment/employee/update' search={{ id: emp.id }}>
                        <IconPencil size={15} />
                      </Link>
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='size-8 text-destructive hover:text-destructive'
                      onClick={() => handleDelete(emp.id, emp.fullName)}
                    >
                      <IconTrash size={15} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination info */}
      {result && (
        <div className='mt-3 flex items-center justify-between text-xs text-muted-foreground'>
          <span>Menampilkan {employees.length} karyawan</span>
          {result.hasNext && (
            <Button
              variant='outline'
              size='sm'
              onClick={() => setParams((p) => ({ ...p, page: (p.page ?? 1) + 1 }))}
            >
              Muat lebih banyak
            </Button>
          )}
        </div>
      )}
    </AppMain>
  )
}
