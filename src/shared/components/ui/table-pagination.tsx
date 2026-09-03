import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { getLocale } from '@/i18n/paraglide/runtime'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'

export interface TablePaginationProps {
  itemLabel?: string
  totalItems: number
  currentPage: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (size: number) => void
  pageSizeOptions?: number[]
  className?: string
}

export function TablePagination({
  itemLabel,
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
  className,
}: TablePaginationProps) {
  const isEn = getLocale() === 'en'
  const defaultLabel = isEn ? 'entries' : 'data'
  const resolvedLabel = itemLabel || defaultLabel
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  // Generate visible page numbers
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
      }
    }
    return pages
  }

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 px-4 border-t border-border/80 bg-muted/10 text-xs text-muted-foreground',
        className,
      )}
    >
      {/* Left: Info and Page Size Selector */}
      <div className='flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-start'>
        <p>
          {isEn ? 'Showing ' : 'Menampilkan '}
          <span className='font-bold text-foreground'>{startItem}</span> -{' '}
          <span className='font-bold text-foreground'>{endItem}</span>{' '}
          {isEn ? 'of ' : 'dari '}
          <span className='font-bold text-foreground'>{totalItems}</span> {resolvedLabel}
        </p>

        {onPageSizeChange && (
          <div className='flex items-center gap-1.5'>
            <span className='text-[11px] text-muted-foreground'>
              {isEn ? 'Per page:' : 'Per halaman:'}
            </span>
            <select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value))
                onPageChange(1)
              }}
              className='h-7 cursor-pointer rounded-lg border border-border/80 bg-background px-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary'
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Page Navigation Buttons */}
      <div className='flex items-center gap-1 shrink-0'>
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage <= 1}
          className='h-8 px-2 text-xs font-semibold rounded-lg'
        >
          <IconChevronLeft size={14} className='mr-1' />
          Prev
        </Button>

        {getPageNumbers().map((p, idx) => {
          if (p === '...') {
            return (
              <span key={`dots-${idx}`} className='px-1.5 text-muted-foreground text-xs'>
                ...
              </span>
            )
          }

          const pageNum = Number(p)
          const isCurrent = currentPage === pageNum

          return (
            <Button
              key={pageNum}
              type='button'
              size='sm'
              variant={isCurrent ? 'default' : 'outline'}
              onClick={() => onPageChange(pageNum)}
              className={cn(
                'size-8 p-0 text-xs font-bold rounded-lg',
                isCurrent && 'shadow-xs bg-primary text-primary-foreground font-bold',
              )}
            >
              {pageNum}
            </Button>
          )
        })}

        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage >= totalPages}
          className='h-8 px-2 text-xs font-semibold rounded-lg'
        >
          Next
          <IconChevronRight size={14} className='ml-1' />
        </Button>
      </div>
    </div>
  )
}
