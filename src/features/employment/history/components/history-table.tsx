// history-table.tsx — Employment history table list with pagination
import { IconDotsVertical, IconDownload, IconEye } from '@tabler/icons-react'
import { useState } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import type { EmployeeEmploymentHistory } from '@/features/employment/history/types'

import { TablePagination } from '@/features/employment/components/table-pagination'

interface HistoryTableProps {
  histories: EmployeeEmploymentHistory[]
  isPending?: boolean
  isFetching?: boolean
  onSelect: (history: EmployeeEmploymentHistory) => void
  onExport: (history: EmployeeEmploymentHistory, format: 'pdf' | 'excel') => void
  defaultPageSize?: number
}

export function HistoryTable({
  histories,
  isPending = false,
  isFetching = false,
  onSelect,
  onExport,
  defaultPageSize = 5,
}: HistoryTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(defaultPageSize)

  const totalItems = histories.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const activePage = Math.min(currentPage, totalPages)
  const paginated = histories.slice((activePage - 1) * pageSize, activePage * pageSize)
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
            <TableHead>Department</TableHead>
            <TableHead>Join Date</TableHead>
            <TableHead>Events</TableHead>
            <TableHead>Documents</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className='w-16 text-right'>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isPending && (
            <TableRow>
              <TableCell colSpan={9} className='py-12 text-center text-sm text-muted-foreground'>
                Loading employment history...
              </TableCell>
            </TableRow>
          )}
          {!isPending && paginated.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className='py-12 text-center text-sm text-muted-foreground'>
                No employment history found.
              </TableCell>
            </TableRow>
          )}
          {paginated.map((item, index) => (
            <TableRow key={item.id} className='transition-colors hover:bg-muted/30'>
              <TableCell className='text-center text-xs font-semibold text-muted-foreground'>
                {(activePage - 1) * pageSize + index + 1}
              </TableCell>
              <TableCell>
                <div className='flex items-center gap-3'>
                  <Avatar className='size-8'>
                    <AvatarImage src={item.photo ?? undefined} />
                    <AvatarFallback className='bg-primary/10 text-xs font-bold text-primary'>
                      {item.fullName
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className='text-xs font-semibold text-foreground'>{item.fullName}</p>
                    <p className='text-[11px] text-muted-foreground'>{item.employeeCode}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className='text-xs'>{item.position}</TableCell>
              <TableCell className='text-xs text-muted-foreground'>{item.department}</TableCell>
              <TableCell className='text-xs font-medium'>{item.joinDate}</TableCell>
              <TableCell className='text-xs font-semibold text-primary'>
                {item.timeline.length} events
              </TableCell>
              <TableCell className='text-xs text-muted-foreground'>
                {item.documents.length} docs
              </TableCell>
              <TableCell>
                <Badge
                  variant={item.status === 'active' ? 'green' : 'amber'}
                  className='text-xs capitalize'
                >
                  {item.status}
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
                  <DropdownMenuContent align='end' className='w-48 text-xs'>
                    <DropdownMenuItem onClick={() => onSelect(item)}>
                      <IconEye size={14} className='mr-2 text-primary' />
                      View History
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onExport(item, 'pdf')}>
                      <IconDownload size={14} className='mr-2 text-blue-600' />
                      Export PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onExport(item, 'excel')}>
                      <IconDownload size={14} className='mr-2 text-emerald-600' />
                      Export Excel
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <TablePagination
        itemLabel='records'
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
