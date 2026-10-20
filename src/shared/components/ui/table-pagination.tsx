import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { m } from '@/i18n/paraglide/messages'
import { Button } from '@/shared/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
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
  const resolvedLabel = itemLabel || m.table_pagination_entries()
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
          {m.table_pagination_showing()}{' '}
          <span className='font-bold text-foreground'>{startItem}</span> -{' '}
          <span className='font-bold text-foreground'>{endItem}</span>{' '}
          {m.table_pagination_of()}{' '}
          <span className='font-bold text-foreground'>{totalItems}</span> {resolvedLabel}
        </p>

        {onPageSizeChange && (
          <div className='flex items-center gap-1.5'>
            <Select
              value={String(pageSize)}
              onValueChange={(value) => {
                onPageSizeChange(Number(value))
                onPageChange(1)
              }}
            >
              <SelectTrigger
                size='sm'
                aria-label={m.table_pagination_per_page()}
                className='w-auto'
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {pageSizeOptions.map((option) => (
                    <SelectItem key={option} value={String(option)}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
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
          <IconChevronLeft data-icon='inline-start' />
          {m.table_pagination_previous()}
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
          {m.table_pagination_next()}
          <IconChevronRight data-icon='inline-end' />
        </Button>
      </div>
    </div>
  )
}
