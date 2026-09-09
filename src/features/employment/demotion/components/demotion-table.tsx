// demotion-table.tsx — Standalone demotion list table with pagination
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
import type { DemotionStatus, EmployeeDemotion } from '@/features/employment/demotion/types'

import { TablePagination } from '@/features/employment/components/table-pagination'

const STATUS_CONFIG: Record<
  DemotionStatus,
  { label: string; variant: 'amber' | 'green' | 'red' | 'blue' }
> = {
  pending: { label: 'Pending', variant: 'amber' },
  approved: { label: 'Approved', variant: 'green' },
  rejected: { label: 'Rejected', variant: 'red' },
  scheduled: { label: 'Scheduled', variant: 'blue' },
}

export type DemotionAction = 'detail' | 'review' | 'edit'

interface DemotionTableProps {
  demotions: EmployeeDemotion[]
  isPending?: boolean
  isFetching?: boolean
  onAction: (demotion: EmployeeDemotion, action: DemotionAction) => void
  defaultPageSize?: number
}

export function DemotionTable({
  demotions,
  isPending = false,
  isFetching = false,
  onAction,
  defaultPageSize = 5,
}: DemotionTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(defaultPageSize)

  const totalItems = demotions.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const activePage = Math.min(currentPage, totalPages)
  const paginated = demotions.slice((activePage - 1) * pageSize, activePage * pageSize)
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
            <TableHead>Current Position</TableHead>
            <TableHead>New Position</TableHead>
            <TableHead>Current Grade</TableHead>
            <TableHead>New Grade</TableHead>
            <TableHead>Effective Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className='w-16 text-right'>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isPending && (
            <TableRow>
              <TableCell colSpan={9} className='py-12 text-center text-sm text-muted-foreground'>
                Loading demotions...
              </TableCell>
            </TableRow>
          )}
          {!isPending && paginated.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className='py-12 text-center text-sm text-muted-foreground'>
                No demotion proposals found.
              </TableCell>
            </TableRow>
          )}
          {paginated.map((pro, index) => {
            const status = STATUS_CONFIG[pro.status] ?? {
              label: pro.status,
              variant: 'amber' as const,
            }
            const isPendingStatus = pro.status === 'pending'
            return (
              <TableRow key={pro.id} className='transition-colors hover:bg-muted/30'>
                <TableCell className='text-center text-xs font-semibold text-muted-foreground'>
                  {(activePage - 1) * pageSize + index + 1}
                </TableCell>
                <TableCell>
                  <div className='flex items-center gap-3'>
                    <Avatar className='size-8'>
                      <AvatarImage src={pro.photo ?? undefined} />
                      <AvatarFallback className='bg-primary/10 text-xs font-bold text-primary'>
                        {pro.fullName
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className='text-xs font-semibold text-foreground'>{pro.fullName}</p>
                      <p className='text-[11px] text-muted-foreground'>{pro.employeeCode}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className='text-xs'>{pro.currentPosition}</TableCell>
                <TableCell className='text-xs font-medium text-primary'>
                  {pro.newPosition}
                </TableCell>
                <TableCell className='text-xs text-muted-foreground'>{pro.currentGrade}</TableCell>
                <TableCell className='text-xs font-semibold text-foreground'>
                  {pro.newGrade}
                </TableCell>
                <TableCell className='text-xs'>{pro.effectiveDate}</TableCell>
                <TableCell>
                  <Badge variant={status.variant}>{status.label}</Badge>
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
                      <DropdownMenuItem onClick={() => onAction(pro, 'detail')}>
                        <IconEye size={14} className='mr-2 text-primary' />
                        View Detail
                      </DropdownMenuItem>
                      {isPendingStatus && (
                        <>
                          <DropdownMenuItem onClick={() => onAction(pro, 'edit')}>
                            <IconFileCheck size={14} className='mr-2 text-indigo-600' />
                            Demotion Proposal
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onAction(pro, 'review')}>
                            <IconFileCheck size={14} className='mr-2 text-blue-600' />
                            Review Demotion
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
        itemLabel='demotions'
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
