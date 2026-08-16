import { IconCircleCheck, IconUserPlus } from '@tabler/icons-react'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Button } from '@/shared/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'

const people = [
  ['Rama Aditya', '3 face samples', '96 / 100', '3', '12 May 2024', 'Enrolled'],
  ['Sinta Maharani', '3 face samples', '93 / 100', '3', '10 May 2024', 'Enrolled'],
  ['Budi Setiawan', '1 face sample', '71 / 100', '1', '03 May 2024', 'Re-enroll'],
]
export function FaceRecognitionPage() {
  return (
    <AppMain
      title='Face Enrollment & Management'
      subtitle='Kelola enrollment, quality, reset, dan status biometric employee.'
      className='gap-5 bg-muted/30'
      actions={
        <Button>
          <IconUserPlus />
          Enroll Employee
        </Button>
      }
    >
      <div className='flex gap-2'>
        {['Overview', 'Enrollment', 'Verification', 'Logs', 'Reset'].map((label, index) => (
          <Button key={label} size='sm' variant={index === 0 ? 'secondary' : 'outline'}>
            {label}
          </Button>
        ))}
      </div>
      <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        {[
          ['1,172', 'Enrolled', 'text-emerald-600'],
          ['76', 'Not Enrolled', 'text-orange-600'],
          ['8', 'Needs Re-enroll', 'text-rose-600'],
          ['94.8%', 'Avg Quality', 'text-primary'],
        ].map(([value, label, color]) => (
          <section key={label} className='rounded-2xl border bg-card p-4'>
            <IconCircleCheck className={`float-right size-4 ${color}`} />
            <p className='text-2xl font-bold'>{value}</p>
            <p className='text-xs text-muted-foreground'>{label}</p>
          </section>
        ))}
      </div>
      <section className='overflow-hidden rounded-2xl border bg-card shadow-sm'>
        <Table>
          <TableHeader>
            <TableRow>
              {[
                'Employee',
                'Enrollment',
                'Quality',
                'Samples',
                'Last Update',
                'Status',
                'Action',
              ].map((v) => (
                <TableHead key={v}>{v}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {people.map((row) => (
              <TableRow key={row[0]}>
                {row.map((value, index) => (
                  <TableCell
                    key={value}
                    className={index === 0 ? 'text-xs font-semibold' : 'text-xs'}
                  >
                    {index === 5 ? (
                      <span className='rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-600'>
                        {value}
                      </span>
                    ) : (
                      value
                    )}
                  </TableCell>
                ))}
                <TableCell className='text-xs'>View</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
      <section className='rounded-2xl border bg-card p-5 shadow-sm'>
        <h2 className='font-bold'>Face Recognition Settings</h2>
        <div className='mt-6 grid gap-6 md:grid-cols-3'>
          {[
            ['Similarity Threshold', '85%'],
            ['Liveness Detection', 'Enabled'],
            ['Blink Detection', 'Enabled'],
            ['Head Movement', 'Enabled'],
            ['Face Quality Minimum', '75 / 100'],
            ['Photo Retention', '30 days'],
          ].map(([label, value]) => (
            <p key={label} className='text-xs text-muted-foreground'>
              {label}
              <b className='mt-2 block text-foreground'>{value}</b>
            </p>
          ))}
        </div>
      </section>
    </AppMain>
  )
}
