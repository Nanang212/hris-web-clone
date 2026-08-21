// contract-table.tsx — Standalone contract list table with pagination
import {
  IconDotsVertical,
  IconEye,
  IconFileCheck,
  IconSignature,
  IconRefresh,
  IconFileDiff,
} from '@tabler/icons-react'
import { useState } from 'react'
import type { EmployeeContract, ContractStatus } from '@/features/employment/types'
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
import { TablePagination } from './table-pagination'

const STATUS_CONFIG: Record<
  ContractStatus,
  { label: string; variant: 'green' | 'amber' | 'gray' | 'red' }
> = {
  active: { label: 'Active', variant: 'green' },
  expiring: { label: 'Expiring', variant: 'amber' },
  draft: { label: 'Draft', variant: 'gray' },
  unsigned: { label: 'Unsigned', variant: 'red' },
}

type ContractAction = 'detail' | 'review' | 'signature' | 'renewal' | 'amendment'

interface ContractTableProps {
  contracts: EmployeeContract[]
  isPending?: boolean
  onAction: (contract: EmployeeContract, action: ContractAction) => void
  /** Default page size. Defaults to 5. */
  defaultPageSize?: number
}

export function ContractTable({
  contracts,
  isPending = false,
  onAction,
  defaultPageSize = 5,
}: ContractTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(defaultPageSize)

  // Pagination calculations
  const totalItems = contracts.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const activePage = Math.min(currentPage, totalPages)
  const paginatedContracts = contracts.slice(
    (activePage - 1) * pageSize,
    activePage * pageSize,
  )
  const startItemIdx = totalItems === 0 ? 0 : (activePage - 1) * pageSize + 1
  const endItemIdx = Math.min(activePage * pageSize, totalItems)

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1)
  }

  return (
    <div className='rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden'>
      <Table>
        <TableHeader>
          <TableRow className='bg-muted/30'>
            <TableHead className='w-12 text-center'>No</TableHead>
            <TableHead>Employee</TableHead>
            <TableHead>Contract Number</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className='text-right w-16'>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isPending && (
            <TableRow>
              <TableCell colSpan={9} className='py-12 text-center text-sm text-muted-foreground'>
                Loading contracts...
              </TableCell>
            </TableRow>
          )}
          {!isPending && paginatedContracts.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className='py-12 text-center text-sm text-muted-foreground'>
                No contracts found.
              </TableCell>
            </TableRow>
          )}
          {paginatedContracts.map((ctr, index) => {
            const status =
              STATUS_CONFIG[ctr.status as ContractStatus] ?? {
                label: ctr.status,
                variant: 'gray' as const,
              }
            return (
              <TableRow key={ctr.id} className='hover:bg-muted/30 transition-colors'>
                <TableCell className='text-center text-xs font-semibold text-muted-foreground'>
                  {(activePage - 1) * pageSize + index + 1}
                </TableCell>
                <TableCell>
                  <div className='flex items-center gap-3'>
                    <Avatar className='size-8'>
                      <AvatarImage src={ctr.photo ?? undefined} />
                      <AvatarFallback className='text-xs bg-primary/10 text-primary font-bold'>
                        {ctr.fullName
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className='text-xs font-semibold text-foreground'>{ctr.fullName}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <code className='rounded bg-muted px-1.5 py-0.5 text-[11px]'>
                    {ctr.contractNumber}
                  </code>
                </TableCell>
                <TableCell className='text-xs text-muted-foreground'>{ctr.contractType}</TableCell>
                <TableCell className='text-xs'>{ctr.startDate}</TableCell>
                <TableCell className='text-xs text-muted-foreground'>{ctr.endDate}</TableCell>
                <TableCell className='text-xs'>{ctr.positionName}</TableCell>
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
                    <DropdownMenuContent align='end' className='w-56 text-xs'>
                      <DropdownMenuItem onClick={() => onAction(ctr, 'detail')}>
                        <IconEye size={14} className='mr-2 text-primary' />
                        View Detail
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAction(ctr, 'review')}>
                        <IconFileCheck size={14} className='mr-2 text-blue-600' />
                        Review &amp; Confirm
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAction(ctr, 'signature')}>
                        <IconSignature size={14} className='mr-2 text-indigo-600' />
                        Signature &amp; Completion
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAction(ctr, 'renewal')}>
                        <IconRefresh size={14} className='mr-2 text-emerald-600' />
                        Renewal &amp; Extension
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAction(ctr, 'amendment')}>
                        <IconFileDiff size={14} className='mr-2 text-purple-600' />
                        Amendment &amp; Signature
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      <TablePagination
        itemLabel='contracts'
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
