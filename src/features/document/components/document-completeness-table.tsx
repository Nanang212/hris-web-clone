// document-completeness-table.tsx — Employee document completeness table (Overview tab)
import { IconArrowRight } from '@tabler/icons-react'
import { useState } from 'react'
import type { EmployeeDocumentCompleteness } from '@/features/document/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Button } from '@/shared/components/ui/button'
import { Progress } from '@/shared/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { TablePagination } from '@/features/employment/components/table-pagination'

interface DocumentCompletenessTableProps {
  data: EmployeeDocumentCompleteness[]
  selectedId?: string
  onSelect: (item: EmployeeDocumentCompleteness) => void
  onManage: (item: EmployeeDocumentCompleteness) => void
  isPending?: boolean
  isFetching?: boolean
}

export function DocumentCompletenessTable({
  data,
  selectedId,
  onSelect,
  onManage,
  isPending = false,
  isFetching = false,
}: DocumentCompletenessTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(6)

  const totalItems = data.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const activePage = Math.min(currentPage, totalPages)
  const paginated = data.slice((activePage - 1) * pageSize, activePage * pageSize)
  const startItemIdx = totalItems === 0 ? 0 : (activePage - 1) * pageSize + 1
  const endItemIdx = Math.min(activePage * pageSize, totalItems)

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1)
  }

  return (
    <div className='rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden flex flex-col'>
      {/* Header bar */}
      <div className='border-b border-border/60 px-6 py-4'>
        <h3 className='text-sm font-bold text-foreground'>Employee Document Completeness</h3>
        <p className='text-xs text-muted-foreground mt-0.5'>
          Track mandatory documents per employee and open the record to manage files.
        </p>
      </div>

      {/* Loading bar */}
      <div className={`h-0.5 bg-primary/20 overflow-hidden transition-all ${isFetching && !isPending ? 'opacity-100' : 'opacity-0'}`}>
        <div className='h-full w-1/2 bg-primary animate-[slide-in-out_1.2s_ease-in-out_infinite]' />
      </div>

      <div className='overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow className='bg-muted/30'>
              <TableHead>Employee</TableHead>
              <TableHead className='w-40'>Completeness</TableHead>
              <TableHead className='text-center w-20'>Missing</TableHead>
              <TableHead className='text-center w-20'>Expiring</TableHead>
              <TableHead className='w-28'>Updated</TableHead>
              <TableHead className='text-right w-24'>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending && (
              <TableRow>
                <TableCell colSpan={6} className='py-12 text-center text-sm text-muted-foreground'>
                  Loading document completeness records...
                </TableCell>
              </TableRow>
            )}

            {!isPending && paginated.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className='py-12 text-center text-sm text-muted-foreground'>
                  No employee document records found.
                </TableCell>
              </TableRow>
            )}

            {paginated.map((row) => {
              const isSelected = row.id === selectedId || row.employeeId === selectedId
              const progressPct = (row.completedCount / row.totalRequired) * 100

              return (
                <TableRow
                  key={row.id}
                  onClick={() => onSelect(row)}
                  className={`cursor-pointer transition-colors ${
                    isSelected ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-muted/30'
                  }`}
                >
                  <TableCell>
                    <div className='flex items-center gap-3'>
                      <Avatar className='size-8'>
                        <AvatarImage src={row.photo ?? undefined} />
                        <AvatarFallback className='text-xs bg-primary/10 text-primary font-bold'>
                          {row.fullName
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className='min-w-0'>
                        <p className='text-xs font-semibold text-foreground truncate'>{row.fullName}</p>
                        <p className='text-[11px] text-muted-foreground truncate'>{row.employeeCode} · {row.department}</p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className='flex flex-col gap-1.5'>
                      <div className='flex items-center justify-between text-xs'>
                        <span className='font-semibold text-foreground'>{row.completedCount}/{row.totalRequired}</span>
                        <span className='text-[10px] text-muted-foreground'>{Math.round(progressPct)}%</span>
                      </div>
                      <Progress value={progressPct} className='h-1.5' />
                    </div>
                  </TableCell>

                  <TableCell className='text-center'>
                    {row.missingCount > 0 ? (
                      <span className='inline-flex size-5 items-center justify-center rounded-full bg-rose-50 text-[11px] font-bold text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'>
                        {row.missingCount}
                      </span>
                    ) : (
                      <span className='text-xs text-muted-foreground'>—</span>
                    )}
                  </TableCell>

                  <TableCell className='text-center'>
                    {row.expiringCount > 0 ? (
                      <span className='inline-flex size-5 items-center justify-center rounded-full bg-amber-50 text-[11px] font-bold text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'>
                        {row.expiringCount}
                      </span>
                    ) : (
                      <span className='text-xs text-muted-foreground'>—</span>
                    )}
                  </TableCell>

                  <TableCell className='text-xs text-muted-foreground whitespace-nowrap'>
                    {row.lastUpdated}
                  </TableCell>

                  <TableCell className='text-right'>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-7 px-2 text-xs font-semibold text-primary hover:text-primary'
                      onClick={(e) => {
                        e.stopPropagation()
                        onManage(row)
                      }}
                    >
                      Manage
                      <IconArrowRight size={13} className='ml-1' />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

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
