import { IconChevronRight } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'

import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card'
import type { Employee } from '@/features/employment/employee/types'

const CONTRACT_TYPE_LABEL: Record<string, string> = {
  permanent: 'Permanent',
  contract: 'Contract',
  internship: 'Internship',
  freelance: 'Freelance',
}

interface EmployeeDetailPanelProps {
  selectedEmp: Employee
}

export function EmployeeDetailPanel({ selectedEmp }: EmployeeDetailPanelProps) {
  return (
    <Card className='sticky top-4 border-border/60 shadow-sm'>
      <CardHeader className='border-b border-border/50 pb-4'>
        <div className='flex items-start justify-between'>
          <div>
            <span className='text-[10px] font-bold tracking-wider text-muted-foreground uppercase'>
              Selected Employee
            </span>
            <h3 className='mt-1 text-lg font-bold text-foreground'>{selectedEmp.fullName}</h3>
            <p className='mt-0.5 text-xs text-muted-foreground'>
              NIP {selectedEmp.employeeCode} · {selectedEmp.departmentName}
            </p>
          </div>
          <Badge variant='green'>Active</Badge>
        </div>
      </CardHeader>
      <CardContent className='flex flex-col gap-6 pt-5'>
        <div>
          <h4 className='mb-3 text-[10px] font-bold tracking-wider text-muted-foreground uppercase'>
            Current Employment
          </h4>
          <div className='flex flex-col gap-3 text-xs'>
            <div className='flex justify-between border-b border-border/30 py-1'>
              <span className='text-muted-foreground'>Employment Type</span>
              <span className='font-semibold text-foreground'>
                {CONTRACT_TYPE_LABEL[selectedEmp.contractType] ?? selectedEmp.contractType}
              </span>
            </div>
            <div className='flex justify-between border-b border-border/30 py-1'>
              <span className='text-muted-foreground'>Position</span>
              <span className='font-semibold text-foreground'>{selectedEmp.positionName}</span>
            </div>
            <div className='flex justify-between border-b border-border/30 py-1'>
              <span className='text-muted-foreground'>Department</span>
              <span className='font-semibold text-foreground'>{selectedEmp.departmentName}</span>
            </div>
            <div className='flex justify-between border-b border-border/30 py-1'>
              <span className='text-muted-foreground'>Work Location</span>
              <span className='font-semibold text-foreground'>{selectedEmp.workLocation}</span>
            </div>
            <div className='flex justify-between border-b border-border/30 py-1'>
              <span className='text-muted-foreground'>Supervisor</span>
              <span className='font-semibold text-foreground'>
                {selectedEmp.managerName ?? '—'}
              </span>
            </div>
            <div className='flex justify-between border-b border-border/30 py-1'>
              <span className='text-muted-foreground'>Join Date</span>
              <span className='font-semibold text-foreground'>{selectedEmp.joinDate}</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className='mb-3 text-[10px] font-bold tracking-wider text-muted-foreground uppercase'>
            Continue with
          </h4>
          <div className='grid grid-cols-2 gap-2'>
            <Button
              variant='outline'
              size='sm'
              asChild
              className='transition-colors duration-200 hover:border-primary hover:bg-primary hover:text-primary-foreground'
            >
              <Link
                to='/employment/contract'
                search={{ employeeId: selectedEmp.id, name: selectedEmp.fullName }}
              >
                Contract
              </Link>
            </Button>
            <Button
              variant='outline'
              size='sm'
              asChild
              className='transition-colors duration-200 hover:border-primary hover:bg-primary hover:text-primary-foreground'
            >
              <Link
                to='/employment/rotation'
                search={{ employeeId: selectedEmp.id, name: selectedEmp.fullName }}
              >
                Mutation
              </Link>
            </Button>
            <Button
              variant='outline'
              size='sm'
              asChild
              className='transition-colors duration-200 hover:border-primary hover:bg-primary hover:text-primary-foreground'
            >
              <Link
                to='/employment/promotion'
                search={{ employeeId: selectedEmp.id, name: selectedEmp.fullName }}
              >
                Promotion
              </Link>
            </Button>
            <Button
              variant='outline'
              size='sm'
              asChild
              className='transition-colors duration-200 hover:border-primary hover:bg-primary hover:text-primary-foreground'
            >
              <Link
                to='/employment/resignation'
                search={{ employeeId: selectedEmp.id, name: selectedEmp.fullName }}
              >
                Resignation
              </Link>
            </Button>
          </div>
          <div className='mt-4 text-center'>
            <Link
              to='/employment/history'
              search={{ employeeId: selectedEmp.id, name: selectedEmp.fullName }}
              className='inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline'
            >
              Employment History
              <IconChevronRight size={12} />
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
