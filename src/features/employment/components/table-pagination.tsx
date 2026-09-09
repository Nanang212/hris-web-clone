// table-pagination.tsx — Reusable pagination footer for employment tables
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'

interface TablePaginationProps {
  /** Label at the end of "Showing X - Y of Z ___" */
  itemLabel?: string
  startItemIdx: number
  endItemIdx: number
  totalItems: number
  activePage: number
  totalPages: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

export function TablePagination({
  itemLabel = 'items',
  startItemIdx,
  endItemIdx,
  totalItems,
  activePage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: TablePaginationProps) {
  return (
    <div className='flex flex-col items-center justify-between gap-4 border-t border-border/50 bg-muted/5 px-6 py-4 sm:flex-row'>
      {/* Left: info + rows per page */}
      <div className='flex flex-col items-center gap-4 text-xs text-muted-foreground sm:flex-row'>
        <p>
          Showing <span className='font-semibold text-foreground'>{startItemIdx}</span> -{' '}
          <span className='font-semibold text-foreground'>{endItemIdx}</span> of{' '}
          <span className='font-semibold text-foreground'>{totalItems}</span> {itemLabel}
        </p>

        <div className='hidden h-3 w-px bg-border sm:block' />

        <div className='flex items-center gap-1.5'>
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className='h-7 cursor-pointer rounded-lg border border-border bg-background px-1.5 text-xs text-foreground transition-colors hover:bg-muted focus:outline-none'
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
          </select>
        </div>
      </div>

      {/* Right: page buttons */}
      <div className='flex items-center gap-1.5'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => onPageChange(Math.max(activePage - 1, 1))}
          disabled={activePage === 1}
          className='h-8 text-xs font-semibold'
        >
          Previous
        </Button>

        {Array.from({ length: totalPages }).map((_, i) => {
          const pageNum = i + 1
          const isCurrent = activePage === pageNum
          return (
            <Button
              key={pageNum}
              size='sm'
              variant={isCurrent ? 'default' : 'outline'}
              onClick={() => onPageChange(pageNum)}
              className={cn('h-8 w-8 p-0 text-xs font-bold', isCurrent && 'shadow-sm')}
            >
              {pageNum}
            </Button>
          )
        })}

        <Button
          variant='outline'
          size='sm'
          onClick={() => onPageChange(Math.min(activePage + 1, totalPages))}
          disabled={activePage === totalPages}
          className='h-8 text-xs font-semibold'
        >
          Next
        </Button>
      </div>
    </div>
  )
}
