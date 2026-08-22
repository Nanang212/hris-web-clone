// employee-table.tsx — Standalone employee list table with pagination
import { IconCheck } from '@tabler/icons-react'
import { useState } from 'react'
import type { Employee } from '@/features/employment/types'
import { cn } from '@/shared/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Button } from '@/shared/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { TablePagination } from './table-pagination'

const CONTRACT_TYPE_LABEL: Record<string, string> = {
  permanent: 'Permanent',
  contract: 'Contract',
  internship: 'Internship',
  freelance: 'Freelance',
}

interface EmployeeTableProps {
  employees: Employee[]
  isPending?: boolean
  isFetching?: boolean
  /** Currently selected employee id */
  selectedId?: string
  onSelectEmployee: (id: string) => void
  /** Default page size. Defaults to 5. */
  defaultPageSize?: number
}

export function EmployeeTable({
  employees,
  isPending = false,
  isFetching = false,
  selectedId,
  onSelectEmployee,
  defaultPageSize = 5,
}: EmployeeTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(defaultPageSize)

  // Pagination calculations
  const totalItems = employees.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const activePage = Math.min(currentPage, totalPages)
  const paginatedEmployees = employees.slice(
    (activePage - 1) * pageSize,
    activePage * pageSize,
  )
  const startItemIdx = totalItems === 0 ? 0 : (activePage - 1) * pageSize + 1
  const endItemIdx = Math.min(activePage * pageSize, totalItems)

  // Reset to page 1 whenever the employee list changes (after filter/search)
  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1)
  }

  return (
    <div className='rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm'>
      {/* Search loading bar */}
      <div className={`h-0.5 bg-primary/20 overflow-hidden transition-all ${isFetching && !isPending ? 'opacity-100' : 'opacity-0'}`}>
        <div className='h-full w-1/2 bg-primary animate-[slide-in-out_1.2s_ease-in-out_infinite]' />
      </div>
      {/* Table Header Info */}
      <div className='p-5 border-b border-border/60'>
        <h3 className='text-sm font-bold text-foreground'>Employee Employment Data</h3>
        <p className='text-xs text-muted-foreground mt-0.5'>
          Select an employee to view the current employment snapshot and available actions.
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow className='bg-muted/30'>
            <TableHead className='w-12 text-center'>No</TableHead>
            <TableHead>Employee</TableHead>
            <TableHead>NIP</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className='text-right'>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isPending && (
            <TableRow>
              <TableCell colSpan={7} className='py-12 text-center text-sm text-muted-foreground'>
                Loading employees...
              </TableCell>
            </TableRow>
          )}
          {!isPending && paginatedEmployees.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className='py-12 text-center text-sm text-muted-foreground'>
                No employees found.
              </TableCell>
            </TableRow>
          )}
          {paginatedEmployees.map((emp, index) => {
            const isSelected = selectedId === emp.id
            return (
              <TableRow
                key={emp.id}
                className={cn(
                  'cursor-pointer transition-colors hover:bg-muted/30',
                  isSelected && 'bg-primary/5 hover:bg-primary/5',
                )}
                onClick={() => onSelectEmployee(emp.id)}
              >
                <TableCell className='text-center text-xs font-semibold text-muted-foreground'>
                  {(activePage - 1) * pageSize + index + 1}
                </TableCell>
                <TableCell>
                  <div className='flex items-center gap-3'>
                    <Avatar className='size-8'>
                      <AvatarImage src={emp.photo ?? undefined} />
                      <AvatarFallback className='text-xs bg-primary/10 text-primary font-bold'>
                        {emp.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className='text-xs font-semibold text-foreground'>{emp.fullName}</span>
                  </div>
                </TableCell>
                <TableCell className='text-xs font-medium'>{emp.employeeCode}</TableCell>
                <TableCell className='text-xs text-muted-foreground'>{emp.departmentName}</TableCell>
                <TableCell className='text-xs'>{emp.positionName}</TableCell>
                <TableCell className='text-xs text-muted-foreground'>
                  {CONTRACT_TYPE_LABEL[emp.contractType] ?? emp.contractType}
                </TableCell>
                <TableCell className='text-right'>
                  {isSelected ? (
                    <div className='inline-flex items-center justify-center size-6 rounded-full bg-primary/10 text-primary'>
                      <IconCheck size={14} />
                    </div>
                  ) : (
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-7 text-xs px-2.5 font-bold hover:bg-muted'
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectEmployee(emp.id)
                      }}
                    >
                      Open
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      <TablePagination
        itemLabel='employees'
        startItemIdx={startItemIdx}
        endItemIdx={endItemIdx}
        totalItems={totalItems}
        activePage={activePage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  )
}
