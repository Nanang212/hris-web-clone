// resignation-table.tsx — Resignation list table with pagination
import { IconDotsVertical, IconEye, IconFileCheck } from '@tabler/icons-react'
import { useState } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import type { EmployeeResignation, ResignationStatus } from '@/features/employment/resignation/types'

import { TablePagination } from '@/features/employment/components/table-pagination'

const STATUS_CONFIG: Record<
  ResignationStatus,
  { label: string; variant: 'amber' | 'green' | 'red' | 'blue' | 'default' }
> = {
  submitted: { label: 'Submitted', variant: 'amber' },
  clearance: { label: 'Clearance', variant: 'blue' },
  exit_interview: { label: 'Exit Interview', variant: 'default' },
  completed: { label: 'Completed', variant: 'green' },
  cancelled: { label: 'Cancelled', variant: 'red' },
}

export type ResignationAction = 'detail' | 'review'

interface ResignationTableProps {
  resignations: EmployeeResignation[]
  isPending?: boolean
  isFetching?: boolean
  onAction: (resignation: EmployeeResignation, action: ResignationAction) => void
  defaultPageSize?: number
}

export function ResignationTable({
  resignations,
  isPending = false,
  isFetching = false,
  onAction,
  defaultPageSize = 5,
}: ResignationTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(defaultPageSize)

  const totalItems = resignations.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const activePage = Math.min(currentPage, totalPages)
  const paginated = resignations.slice((activePage - 1) * pageSize, activePage * pageSize)
  const startItemIdx = totalItems === 0 ? 0 : (activePage - 1) * pageSize + 1
  const endItemIdx = Math.min(activePage * pageSize, totalItems)

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1)
  }

  return (
    <div className='overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm'>
      {/* Search loading bar */}
      <div
        className={`h-0.5 overflow-hidden bg-primary/20 transition-all ${isFetching && !isPending ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className='h-full w-1/2 animate-[slide-in-out_1.2s_ease-in-out_infinite] bg-primary' />
      </div>

      <Table>
        <TableHeader>
          <TableRow className='bg-muted/30'>
            <TableHead className='w-12 text-center'>No</TableHead>
            <TableHead>Employee</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Resignation Type</TableHead>
            <TableHead>Notice Period</TableHead>
            <TableHead>Last Working Day</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className='w-16 text-right'>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isPending && (
            <TableRow>
              <TableCell colSpan={8} className='py-12 text-center text-sm text-muted-foreground'>
                Loading resignation cases...
              </TableCell>
            </TableRow>
          )}
          {!isPending && paginated.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className='py-12 text-center text-sm text-muted-foreground'>
                No resignation cases found.
              </TableCell>
            </TableRow>
          )}
          {paginated.map((res, index) => {
            const status = STATUS_CONFIG[res.status] ?? {
              label: res.status,
              variant: 'default' as const,
            }
            const isActive = res.status !== 'completed' && res.status !== 'cancelled'
            return (
              <TableRow key={res.id} className='transition-colors hover:bg-muted/30'>
                <TableCell className='text-center text-xs font-semibold text-muted-foreground'>
                  {(activePage - 1) * pageSize + index + 1}
                </TableCell>
                <TableCell>
                  <div className='flex items-center gap-3'>
                    <Avatar className='size-8'>
                      <AvatarImage src={res.photo ?? undefined} />
                      <AvatarFallback className='bg-rose-100 text-xs font-bold text-rose-700'>
                        {res.fullName
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className='text-xs font-semibold text-foreground'>{res.fullName}</p>
                      <p className='text-[11px] text-muted-foreground'>{res.employeeCode}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className='text-xs'>{res.position}</TableCell>
                <TableCell className='text-xs'>{res.resignationType}</TableCell>
                <TableCell className='text-xs text-muted-foreground'>{res.noticePeriod}</TableCell>
                <TableCell className='text-xs font-medium'>{res.lastWorkingDate}</TableCell>
                <TableCell>
                  <Badge variant={status.variant as 'amber' | 'green' | 'red' | 'blue' | 'default'}>
                    {status.label}
                  </Badge>
                </TableCell>
                <TableCell className='text-right'>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='size-8 text-muted-foreground hover:text-foreground'
                      >
                        <IconDotsVertical size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end' className='w-52 text-xs'>
                      <DropdownMenuItem onClick={() => onAction(res, 'detail')}>
                        <IconEye size={14} className='mr-2 text-primary' />
                        View Detail
                      </DropdownMenuItem>
                      {isActive && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onAction(res, 'review')}>
                            <IconFileCheck size={14} className='mr-2 text-blue-600' />
                            Review Resignation
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      <TablePagination
        itemLabel='cases'
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
