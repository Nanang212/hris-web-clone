import {
  IconAlertTriangle,
  IconCalendarEvent,
  IconClipboardCheck,
  IconDownload,
  IconFileText,
  IconHistory,
  IconPlus,
  IconReceipt,
} from '@tabler/icons-react'
import dayjs from 'dayjs'
import { useState } from 'react'

import 'dayjs/locale/en'
import 'dayjs/locale/id'

import { Alert, AlertAction, AlertDescription, AlertIcon } from '@/shared/components/ui/alert'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/components/ui/empty'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { EmployeeEmploymentDocumentDialog } from '@/features/employment/employee-profile/components/employee-employment-document-dialog'
import { EmployeeEmploymentScreeningDialog } from '@/features/employment/employee-profile/components/employee-employment-screening-dialog'
import { useGetEmployeeEmploymentPeriods } from '@/features/employment/employee-profile/hooks'
import { m } from '@/i18n/paraglide/messages'
import { getLocale } from '@/i18n/paraglide/runtime'

export function EmployeeEmploymentHistory({ employeeId }: { employeeId: string }) {
  const query = useGetEmployeeEmploymentPeriods(employeeId)
  const [action, setAction] = useState<{
    kind: 'document' | 'screening'
    periodId: string
    periodLabel: string
  } | null>(null)
  const screeningResults = {
    passed: m.employee_history_result_passed(),
    follow_up: m.employee_history_result_follow_up(),
    not_recommended: m.employee_history_result_not_recommended(),
  }
  if (query.isPending)
    return (
      <div className='grid min-w-0 items-start gap-4 xl:grid-cols-2' aria-busy='true'>
        {[0, 1].map((item) => (
          <Skeleton key={item} className='h-64 w-full rounded-2xl' />
        ))}
      </div>
    )
  if (query.error)
    return (
      <Alert variant='destructive' className='flex-wrap items-start'>
        <AlertIcon>
          <IconAlertTriangle />
        </AlertIcon>
        <AlertDescription className='min-w-0 flex-1 wrap-break-word'>
          {query.error.message}
        </AlertDescription>
        <AlertAction>
          <Button
            type='button'
            variant='outline'
            size='sm'
            disabled={query.isFetching}
            onClick={() => void query.refetch()}
          >
            {m.app_layout_main_error_retry()}
          </Button>
        </AlertAction>
      </Alert>
    )
  if (!query.data?.items.length)
    return (
      <Card>
        <CardContent>
          <Empty className='px-4 py-10'>
            <EmptyHeader>
              <EmptyMedia variant='icon'>
                <IconHistory />
              </EmptyMedia>
              <EmptyTitle>{m.payroll_revision_history()}</EmptyTitle>
              <EmptyDescription>{m.payroll_revision_history_empty()}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
      </Card>
    )
  return (
    <>
      <div className='grid min-w-0 items-start gap-4 xl:grid-cols-2'>
        {query.data.items.map((period) => (
          <Card key={period.id} className='min-w-0'>
            <CardHeader>
              <CardTitle className='flex items-start gap-2'>
                <IconCalendarEvent className='size-4 shrink-0' />
                <span className='min-w-0 wrap-break-word'>
                  {dayjs(period.startDate).locale(getLocale()).format('DD MMM YYYY')} –{' '}
                  {period.endDate
                    ? dayjs(period.endDate).locale(getLocale()).format('DD MMM YYYY')
                    : m.employee_information_status_active()}
                </span>
              </CardTitle>
              <CardDescription className='flex min-w-0 flex-col gap-1 wrap-break-word'>
                <span>
                  {period.contractReference || m.employee_information_detail_not_available()}
                </span>
                {period.reason && <span>{period.reason}</span>}
              </CardDescription>
            </CardHeader>
            <CardContent className='flex min-w-0 flex-col gap-5'>
              <section className='flex min-w-0 flex-col gap-3'>
                <h3 className='flex flex-wrap items-center gap-2 text-xs font-semibold'>
                  <IconFileText className='size-4 shrink-0' />
                  {m.employment_detail_tab_documents()}
                  <Badge variant='secondary'>{period.documents.length}</Badge>
                </h3>
                {period.documents.map((document, index) => (
                  <div
                    key={`${document.fileName}-${index}`}
                    className='flex min-w-0 flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between'
                  >
                    <div className='flex min-w-0 flex-1 flex-col gap-1 text-xs wrap-anywhere'>
                      <span>{document.title || document.fileName}</span>
                      {document.title && <span className='text-muted-foreground'>{document.fileName}</span>}
                      {document.notes && <p className='whitespace-pre-wrap text-muted-foreground'>{document.notes}</p>}
                    </div>
                    {document.url && (
                      <Button asChild variant='outline' size='sm' className='shrink-0 self-start'>
                        <a href={document.url} download>
                          <IconDownload data-icon='inline-start' />
                          {m.employee_information_detail_document_download()}
                        </a>
                      </Button>
                    )}
                  </div>
                ))}
                {period.documents.length === 0 && (
                  <p className='text-xs text-muted-foreground'>
                    {m.employee_information_detail_not_available()}
                  </p>
                )}
              </section>
              <section className='flex min-w-0 flex-col gap-3'>
                <h3 className='flex flex-wrap items-center gap-2 text-xs font-semibold'>
                  <IconReceipt className='size-4 shrink-0' />
                  {m.payroll_tab_payslip()}
                  <Badge variant='secondary'>{period.payslips.length}</Badge>
                </h3>
                {period.payslips.map((slip) => (
                  <div
                    key={slip.id}
                    className='flex min-w-0 flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between'
                  >
                    <span className='min-w-0 flex-1 text-xs wrap-anywhere'>{slip.period}</span>
                    {slip.downloadUrl && (
                      <Button asChild variant='outline' size='sm' className='shrink-0 self-start'>
                        <a href={slip.downloadUrl} download>
                          <IconDownload data-icon='inline-start' />
                          {m.payroll_tab_payslip()}
                        </a>
                      </Button>
                    )}
                  </div>
                ))}
                {period.payslips.length === 0 && (
                  <p className='text-xs text-muted-foreground'>
                    {m.employee_information_detail_not_available()}
                  </p>
                )}
              </section>
              <section className='flex min-w-0 flex-col gap-3'>
                <h3 className='flex flex-wrap items-center gap-2 text-xs font-semibold'>
                  <IconClipboardCheck className='size-4 shrink-0' />
                  {m.employee_history_screening()}
                  <Badge variant='secondary'>{period.screenings?.length ?? 0}</Badge>
                </h3>
                {(period.screenings ?? []).map((screening) => (
                  <div
                    key={screening.id}
                    className='flex min-w-0 flex-col gap-2 rounded-xl border p-3'
                  >
                    <div className='flex flex-wrap items-center justify-between gap-2'>
                      <span className='text-xs'>
                        {dayjs(screening.screeningDate).locale(getLocale()).format('DD MMM YYYY')}
                      </span>
                      <Badge
                        variant={
                          screening.result === 'passed'
                            ? 'green'
                            : screening.result === 'follow_up'
                              ? 'amber'
                              : 'red'
                        }
                      >
                        {screeningResults[screening.result]}
                      </Badge>
                    </div>
                    <p className='text-xs wrap-anywhere whitespace-pre-wrap'>{screening.notes}</p>
                    <p className='text-xs wrap-anywhere text-muted-foreground'>
                      {m.employee_history_reviewer({ name: screening.reviewerName })}
                    </p>
                  </div>
                ))}
                {!period.screenings?.length && (
                  <p className='text-xs text-muted-foreground'>
                    {m.employee_history_no_screenings()}
                  </p>
                )}
              </section>
            </CardContent>
            <CardFooter className='flex flex-wrap gap-2'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() =>
                  setAction({
                    kind: 'document',
                    periodId: period.id,
                    periodLabel: `${dayjs(period.startDate).locale(getLocale()).format('DD MMM YYYY')} – ${period.endDate ? dayjs(period.endDate).locale(getLocale()).format('DD MMM YYYY') : m.employee_information_status_active()}`,
                  })
                }
              >
                <IconPlus data-icon='inline-start' />
                {m.employee_history_add_document()}
              </Button>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() =>
                  setAction({
                    kind: 'screening',
                    periodId: period.id,
                    periodLabel: `${dayjs(period.startDate).locale(getLocale()).format('DD MMM YYYY')} – ${period.endDate ? dayjs(period.endDate).locale(getLocale()).format('DD MMM YYYY') : m.employee_information_status_active()}`,
                  })
                }
              >
                <IconClipboardCheck data-icon='inline-start' />
                {m.employee_history_record_screening()}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      {action?.kind === 'document' && (
        <EmployeeEmploymentDocumentDialog
          key={`${employeeId}-${action.periodId}`}
          employeeId={employeeId}
          periodId={action.periodId}
          periodLabel={action.periodLabel}
          onClose={() => setAction(null)}
        />
      )}
      {action?.kind === 'screening' && (
        <EmployeeEmploymentScreeningDialog
          key={`${employeeId}-${action.periodId}`}
          employeeId={employeeId}
          periodId={action.periodId}
          periodLabel={action.periodLabel}
          onClose={() => setAction(null)}
        />
      )}
    </>
  )
}
