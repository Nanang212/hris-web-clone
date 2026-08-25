import dayjs from 'dayjs'

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
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Empty, EmptyContent, EmptyHeader, EmptyTitle } from '@/shared/components/ui/empty'
import { Skeleton } from '@/shared/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { useGetAuditTrailDetail } from '@/features/settings/security/hooks'
import type { AuditTrailDetailData, AuditTrailResult } from '@/features/settings/security/types'
import { m } from '@/i18n/paraglide/messages'

interface AuditEventDetailDialogProps {
  eventId: string
  onOpenChange: (open: boolean) => void
}

interface DetailItem {
  label: string
  value: string
}

function DetailList({ items }: Readonly<{ items: DetailItem[] }>) {
  return (
    <dl className='grid gap-x-4 gap-y-3 text-sm sm:grid-cols-[minmax(7rem,auto)_minmax(0,1fr)]'>
      {items.map((item) => (
        <div key={item.label} className='grid min-w-0 gap-1 sm:col-span-2 sm:grid-cols-subgrid'>
          <dt className='text-muted-foreground'>{item.label}</dt>
          <dd className='min-w-0 break-words'>{item.value || '—'}</dd>
        </div>
      ))}
    </dl>
  )
}

function getResultLabel(result: AuditTrailResult) {
  return result === 'Success' ? m.security_audit_result_success() : m.security_audit_result_failed()
}

function DetailSkeleton() {
  return (
    <div className='grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(16rem,1fr)]'>
      <Card>
        <CardHeader>
          <Skeleton className='h-5 w-40' />
        </CardHeader>
        <CardContent className='flex flex-col gap-3'>
          {Array.from({ length: 8 }, (_, index) => (
            <Skeleton key={`audit-detail-summary-${index}`} className='h-4 w-full' />
          ))}
        </CardContent>
      </Card>
      <div className='flex flex-col gap-4'>
        {Array.from({ length: 2 }, (_, index) => (
          <Card key={`audit-detail-context-${index}`}>
            <CardHeader>
              <Skeleton className='h-5 w-32' />
            </CardHeader>
            <CardContent className='flex flex-col gap-3'>
              {Array.from({ length: 4 }, (_, rowIndex) => (
                <Skeleton
                  key={`audit-detail-context-${index}-${rowIndex}`}
                  className='h-4 w-full'
                />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function AuditDetailContent({ detail }: Readonly<{ detail: AuditTrailDetailData }>) {
  const summaryItems: DetailItem[] = [
    { label: m.security_audit_detail_event_id(), value: detail.summary.eventId },
    {
      label: m.security_audit_detail_timestamp(),
      value: dayjs(detail.summary.occurredAt).format('DD MMM YYYY · HH:mm:ss'),
    },
    {
      label: m.security_audit_detail_actor(),
      value: `${detail.summary.actorName} · ${detail.summary.actorRole}`,
    },
    { label: m.security_audit_detail_module(), value: detail.summary.module },
    { label: m.security_audit_detail_action(), value: detail.summary.action },
    { label: m.security_audit_detail_entity(), value: detail.summary.entityName },
    { label: m.security_audit_detail_record_id(), value: detail.summary.recordId },
    { label: m.security_audit_detail_source(), value: detail.summary.source },
    { label: m.security_audit_detail_ip_address(), value: detail.summary.ipAddress },
    {
      label: m.security_audit_detail_correlation_id(),
      value: detail.summary.correlationId,
    },
  ]
  const contextItems: DetailItem[] = [
    { label: m.security_audit_detail_company(), value: detail.context.companyName },
    { label: m.security_audit_detail_branch(), value: detail.context.branchName },
    { label: m.security_audit_detail_session(), value: detail.context.sessionId },
    { label: m.security_audit_detail_device(), value: detail.context.device },
    { label: m.security_audit_detail_result(), value: getResultLabel(detail.context.result) },
  ]
  const metadataItems: DetailItem[] = [
    {
      label: m.security_audit_detail_request_source(),
      value: detail.requestMetadata.requestSource,
    },
    {
      label: m.security_audit_detail_request_path(),
      value: detail.requestMetadata.requestPath,
    },
    { label: m.security_audit_detail_reason(), value: detail.requestMetadata.reason },
    {
      label: m.security_audit_detail_permission(),
      value: detail.requestMetadata.permissionUsed,
    },
    {
      label: m.security_audit_detail_classification(),
      value: detail.requestMetadata.dataClassification,
    },
  ]

  return (
    <div className='grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(16rem,1fr)]'>
      <Card className='min-w-0'>
        <CardHeader className='flex-row items-center justify-between gap-3'>
          <CardTitle>{m.security_audit_detail_summary_title()}</CardTitle>
          <Badge variant={detail.context.result === 'Success' ? 'green' : 'red'}>
            {getResultLabel(detail.context.result)}
          </Badge>
        </CardHeader>
        <CardContent className='flex min-w-0 flex-col gap-6'>
          <DetailList items={summaryItems} />

          <div className='flex min-w-0 flex-col gap-3'>
            <CardTitle>{m.security_audit_detail_changes_title()}</CardTitle>
            {detail.changes.length === 0 ? (
              <CardDescription>{m.security_audit_detail_changes_empty()}</CardDescription>
            ) : (
              <div className='min-w-0 overflow-hidden rounded-xl border'>
                <Table className='table-fixed'>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='w-[34%] whitespace-normal'>
                        {m.security_audit_detail_field()}
                      </TableHead>
                      <TableHead className='w-[33%] whitespace-normal'>
                        {m.security_audit_detail_before()}
                      </TableHead>
                      <TableHead className='w-[33%] whitespace-normal'>
                        {m.security_audit_detail_after()}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detail.changes.map((change) => (
                      <TableRow key={change.field}>
                        <TableCell className='whitespace-normal'>{change.field}</TableCell>
                        <TableCell className='whitespace-normal'>
                          {change.beforeValue === null ? (
                            '—'
                          ) : (
                            <Badge variant='red' className='max-w-full whitespace-normal'>
                              {change.beforeValue}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className='whitespace-normal'>
                          {change.afterValue === null ? (
                            '—'
                          ) : (
                            <Badge variant='green' className='max-w-full whitespace-normal'>
                              {change.afterValue}
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className='flex min-w-0 flex-col gap-4'>
        <Card>
          <CardHeader>
            <CardTitle>{m.security_audit_detail_context_title()}</CardTitle>
          </CardHeader>
          <CardContent>
            <DetailList items={contextItems} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{m.security_audit_detail_metadata_title()}</CardTitle>
          </CardHeader>
          <CardContent>
            <DetailList items={metadataItems} />
          </CardContent>
          {detail.requestMetadata.immutable && (
            <CardFooter>
              <CardDescription>{m.security_audit_detail_immutable()}</CardDescription>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  )
}

export function AuditEventDetailDialog({
  eventId,
  onOpenChange,
}: Readonly<AuditEventDetailDialogProps>) {
  const detailQuery = useGetAuditTrailDetail(eventId)

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className='max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-5xl'
      >
        <DialogHeader>
          <DialogTitle>{m.security_audit_detail_title()}</DialogTitle>
          <DialogDescription>{m.security_audit_detail_description()}</DialogDescription>
        </DialogHeader>

        {detailQuery.isPending && <DetailSkeleton />}
        {detailQuery.error && (
          <Empty className='border py-10'>
            <EmptyHeader>
              <EmptyTitle>{m.security_audit_detail_error()}</EmptyTitle>
            </EmptyHeader>
            <EmptyContent>
              <Button type='button' variant='outline' onClick={() => void detailQuery.refetch()}>
                {m.security_audit_detail_retry()}
              </Button>
            </EmptyContent>
          </Empty>
        )}
        {detailQuery.data && <AuditDetailContent detail={detailQuery.data} />}

        <DialogFooter>
          <DialogClose asChild>
            <Button type='button' variant='outline'>
              {m.security_audit_detail_close()}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
