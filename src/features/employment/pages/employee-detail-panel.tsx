import { IconChevronRight } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import type { Employee } from '@/features/employment/types'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card'

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
    <Card className='shadow-sm border-border/60 sticky top-4'>
      <CardHeader className='pb-4 border-b border-border/50'>
        <div className='flex items-start justify-between'>
          <div>
            <span className='text-[10px] font-bold text-muted-foreground uppercase tracking-wider'>
              Selected Employee
            </span>
            <h3 className='text-lg font-bold text-foreground mt-1'>{selectedEmp.fullName}</h3>
            <p className='text-xs text-muted-foreground mt-0.5'>
              NIP {selectedEmp.employeeCode} · {selectedEmp.departmentName}
            </p>
          </div>
          <Badge variant='green'>Active</Badge>
        </div>
      </CardHeader>
      <CardContent className='pt-5 flex flex-col gap-6'>
        <div>
          <h4 className='text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3'>
            Current Employment
          </h4>
          <div className='flex flex-col gap-3 text-xs'>
            <div className='flex justify-between py-1 border-b border-border/30'>
              <span className='text-muted-foreground'>Employment Type</span>
              <span className='font-semibold text-foreground'>
                {CONTRACT_TYPE_LABEL[selectedEmp.contractType] ?? selectedEmp.contractType}
              </span>
            </div>
            <div className='flex justify-between py-1 border-b border-border/30'>
              <span className='text-muted-foreground'>Position</span>
              <span className='font-semibold text-foreground'>{selectedEmp.positionName}</span>
            </div>
            <div className='flex justify-between py-1 border-b border-border/30'>
              <span className='text-muted-foreground'>Department</span>
              <span className='font-semibold text-foreground'>{selectedEmp.departmentName}</span>
            </div>
            <div className='flex justify-between py-1 border-b border-border/30'>
              <span className='text-muted-foreground'>Work Location</span>
              <span className='font-semibold text-foreground'>{selectedEmp.workLocation}</span>
            </div>
            <div className='flex justify-between py-1 border-b border-border/30'>
              <span className='text-muted-foreground'>Supervisor</span>
              <span className='font-semibold text-foreground'>{selectedEmp.managerName ?? '—'}</span>
            </div>
            <div className='flex justify-between py-1 border-b border-border/30'>
              <span className='text-muted-foreground'>Join Date</span>
              <span className='font-semibold text-foreground'>{selectedEmp.joinDate}</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className='text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3'>
            Continue with
          </h4>
          <div className='grid grid-cols-2 gap-2'>
            <Button variant='outline' size='sm' asChild className='hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors duration-200'>
              <Link
                to='/company/employee/contract'
                search={{ employeeId: selectedEmp.id, name: selectedEmp.fullName }}
              >
                Contract
              </Link>
            </Button>
            <Button variant='outline' size='sm' asChild className='hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors duration-200'>
              <Link
                to='/company/employee/mutation'
                search={{ employeeId: selectedEmp.id, name: selectedEmp.fullName }}
              >
                Mutation
              </Link>
            </Button>
            <Button variant='outline' size='sm' asChild className='hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors duration-200'>
              <Link to='/company/employee/promotion'>Promotion</Link>
            </Button>
            <Button variant='outline' size='sm' asChild className='hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors duration-200'>
              <Link to='/company/employee/resignation'>Resignation</Link>
            </Button>
          </div>
          <div className='mt-4 text-center'>
            <Link
              to='/company/employee/history'
              className='text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1'
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
