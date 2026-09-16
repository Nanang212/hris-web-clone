import { IconBriefcase, IconCalendar, IconMapPin } from '@tabler/icons-react'
import dayjs from 'dayjs'
import * as React from 'react'

import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Map, MapControls, MapMarker, MarkerContent } from '@/shared/components/ui/map'
import { dummyClients } from '@/features/company/client/data/dummy-clients'
import { m } from '@/i18n/paraglide/messages'

import type { Project, ProjectStatus } from '../types'

interface ProjectDetailDialogProps {
  project: Project | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const statusVariant: Record<ProjectStatus, 'blue' | 'green' | 'yellow' | 'slate' | 'red'> = {
  PLANNING: 'blue',
  ONGOING: 'green',
  ON_HOLD: 'yellow',
  COMPLETED: 'slate',
  CANCELLED: 'red',
}

function getStatusLabel(status: ProjectStatus) {
  return {
    PLANNING: m.company_project_status_planning(),
    ONGOING: m.company_project_status_ongoing(),
    ON_HOLD: m.company_project_status_on_hold(),
    COMPLETED: m.company_project_status_completed(),
    CANCELLED: m.company_project_status_cancelled(),
  }[status]
}

function formatDate(value?: string | null) {
  return value ? dayjs(value).format('DD MMM YYYY') : '-'
}

export function ProjectDetailDialog({
  project,
  open,
  onOpenChange,
}: Readonly<ProjectDetailDialogProps>) {
  if (!project) return null

  const client = dummyClients.find((item) => item.id === project.clientId)
  const defaultAddress = project.addresses[0]
  const mapLat = defaultAddress?.latitude ?? -6.2247
  const mapLng = defaultAddress?.longitude ?? 106.8099

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] max-w-3xl overflow-y-auto p-0 sm:max-w-4xl'>
        {/* Header */}
        <div className='sticky top-0 z-20 flex items-center justify-between border-b border-border/60 bg-background/95 px-6 py-4 backdrop-blur-xs'>
          <div className='flex items-center gap-3'>
            <div className='flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary'>
              <IconBriefcase className='size-5' />
            </div>
            <div>
              <div className='flex items-center gap-2.5'>
                <DialogTitle className='text-lg font-bold text-foreground'>
                  {project.name}
                </DialogTitle>
                <Badge variant={statusVariant[project.status]}>
                  {getStatusLabel(project.status)}
                </Badge>
              </div>
              <DialogDescription className='mt-0.5 font-mono text-xs text-muted-foreground'>
                {project.code}
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className='space-y-6 px-6 py-5'>
          {/* Main Info Grid */}
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4 rounded-xl border border-border/60 bg-muted/20 p-4'>
            <div>
              <p className='text-[11px] font-medium text-muted-foreground uppercase tracking-wider'>
                {m.company_project_client()}
              </p>
              <p className='mt-1 text-sm font-semibold text-foreground'>
                {client?.name ?? project.clientId}
              </p>
            </div>
            <div>
              <p className='text-[11px] font-medium text-muted-foreground uppercase tracking-wider'>
                {m.company_project_industry()}
              </p>
              <p className='mt-1 text-sm font-semibold text-foreground'>
                {project.industryField || '-'}
              </p>
            </div>
            <div>
              <p className='text-[11px] font-medium text-muted-foreground uppercase tracking-wider'>
                {m.company_project_table_period()}
              </p>
              <div className='mt-1 flex items-center gap-1.5 text-sm font-semibold text-foreground'>
                <IconCalendar className='size-4 text-muted-foreground' />
                <span>
                  {formatDate(project.startDate)} - {formatDate(project.endDate)}
                </span>
              </div>
            </div>
            <div>
              <p className='text-[11px] font-medium text-muted-foreground uppercase tracking-wider'>
                {m.company_project_stat_locations()}
              </p>
              <p className='mt-1 text-sm font-semibold text-foreground'>
                {project.addresses.length} Lokasi
              </p>
            </div>
          </div>

          {/* Description */}
          {project.description && (
            <div>
              <h4 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                {m.company_project_description()}
              </h4>
              <p className='mt-1.5 rounded-lg border border-border/50 bg-card p-3 text-sm text-foreground leading-relaxed'>
                {project.description}
              </p>
            </div>
          )}

          {/* Location & Map Section */}
          <div>
            <h4 className='mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
              {m.company_project_table_location()} ({project.addresses.length})
            </h4>

            <div className='grid gap-4 lg:grid-cols-[1fr_320px]'>
              {/* Addresses List */}
              <div className='space-y-3'>
                {project.addresses.map((address, idx) => (
                  <div
                    key={address.id ?? idx}
                    className='rounded-xl border border-border/70 bg-card p-4 shadow-2xs'
                  >
                    <div className='flex items-center gap-2 text-xs font-bold text-foreground'>
                      <IconMapPin className='size-4 text-primary' />
                      <span>{m.company_project_address_number({ number: idx + 1 })}</span>
                      {address.geofenceRadiusMeters && (
                        <span className='ml-auto rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'>
                          Radius {address.geofenceRadiusMeters}m
                        </span>
                      )}
                    </div>
                    <p className='mt-1.5 text-xs text-foreground leading-normal'>{address.address}</p>
                    <div className='mt-2.5 flex items-center gap-4 text-[11px] font-mono text-muted-foreground border-t border-border/40 pt-2'>
                      <span>Lat: {address.latitude ?? '-'}</span>
                      <span>Lng: {address.longitude ?? '-'}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Map Preview */}
              <div className='h-64 overflow-hidden rounded-xl border border-border/80 shadow-xs lg:h-auto lg:min-h-[220px]'>
                <Map
                  className='h-full w-full'
                  viewport={{
                    center: [mapLng, mapLat],
                    zoom: 13,
                  }}
                >
                  <MapControls position='top-right' showCompass showFullscreen />
                  {project.addresses.map((addr, idx) => {
                    const lat = addr.latitude ?? mapLat
                    const lng = addr.longitude ?? mapLng
                    return (
                      <MapMarker key={addr.id ?? idx} longitude={lng} latitude={lat}>
                        <MarkerContent>
                          <div className='flex size-7 items-center justify-center rounded-full border-2 border-white bg-primary text-primary-foreground shadow-lg'>
                            <IconMapPin className='size-4' />
                          </div>
                        </MarkerContent>
                      </MapMarker>
                    )
                  })}
                </Map>
              </div>
            </div>
          </div>
        </div>

        {/* Footer: View-only with Close button only */}
        <div className='flex justify-end border-t border-border/60 bg-muted/20 px-6 py-3.5'>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
            className='min-w-[100px] text-xs font-semibold'
          >
            {m.company_action_cancel ? m.company_action_cancel() : 'Tutup'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
