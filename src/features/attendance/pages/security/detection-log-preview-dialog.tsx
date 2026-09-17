// detection-log-preview-dialog.tsx — Interactive GPS Security Incident & Location Map Preview Dialog
import {
  IconAlertTriangle,
  IconBuildingCommunity,
  IconDeviceMobile,
  IconMapPin,
  IconShieldX,
  IconUser,
} from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'

import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Map, MapControls, MapGeoJSON, MapMarker, MarkerContent } from '@/shared/components/ui/map'

import { createGeoJSONCircle } from './geo-utils'
import type { SecurityEventLog } from './types'

interface DetectionLogPreviewDialogProps {
  log: SecurityEventLog | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DetectionLogPreviewDialog({
  log,
  open,
  onOpenChange,
}: DetectionLogPreviewDialogProps) {
  if (!log) return null

  const centerLng = log.detectedLongitude ?? log.officeLongitude ?? 106.8095
  const centerLat = log.detectedLatitude ?? log.officeLatitude ?? -6.2255

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex h-[86vh] max-h-[860px] !w-[94vw] !max-w-6xl flex-col gap-0 overflow-hidden rounded-2xl border-border/80 bg-card p-0 shadow-2xl sm:!max-w-6xl md:!max-w-6xl lg:!max-w-6xl'>
        {/* Header */}
        <DialogHeader className='flex-shrink-0 border-b border-border/70 bg-card p-6 pb-4'>
          <div className='flex flex-wrap items-center justify-between gap-4 pr-8'>
            <div className='flex items-center gap-3.5'>
              <div
                className={`flex size-11 flex-shrink-0 items-center justify-center rounded-xl ${
                  log.severity === 'high'
                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    : log.severity === 'medium'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                }`}
              >
                {log.severity === 'high' ? (
                  <IconShieldX size={24} />
                ) : (
                  <IconAlertTriangle size={24} />
                )}
              </div>
              <div>
                <DialogTitle className='flex flex-wrap items-center gap-2.5 text-base font-bold text-foreground'>
                  <span>Security Incident: {log.eventType}</span>
                  <Badge
                    variant={
                      log.severity === 'high' ? 'red' : log.severity === 'medium' ? 'amber' : 'blue'
                    }
                    className='px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase'
                  >
                    {log.severity} severity
                  </Badge>
                </DialogTitle>
                <DialogDescription className='mt-0.5 text-xs text-muted-foreground'>
                  Detected at: <span className='font-mono font-medium'>{log.timestamp}</span> ·
                  Reference ID: <span className='font-mono font-medium'>{log.id}</span>
                </DialogDescription>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <Badge
                variant={log.actionTaken === 'Blocked' ? 'red' : 'amber'}
                className='rounded-lg px-3.5 py-1 text-xs font-semibold'
              >
                Action: {log.actionTaken}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        {/* Content Body: Map + Dossier */}
        <div className='grid min-h-0 flex-1 grid-cols-1 overflow-hidden bg-muted/10 lg:grid-cols-[1.4fr_1fr]'>
          {/* Left: Map Preview */}
          <div className='relative h-full min-h-[350px] w-full overflow-hidden border-r border-border/60 bg-slate-100 dark:bg-slate-900'>
            <Map center={[centerLng, centerLat]} zoom={14.8} className='h-full w-full'>
              <MapControls position='top-right' />

              {/* Office Geofence Circle Boundary */}
              {log.officeLongitude && log.officeLatitude && log.officeRadius && (
                <MapGeoJSON
                  key={`office-zone-${log.id}`}
                  data={createGeoJSONCircle(
                    [log.officeLongitude, log.officeLatitude],
                    log.officeRadius,
                  )}
                  fillPaint={{
                    'fill-color': '#3b82f6',
                    'fill-opacity': 0.18,
                  }}
                  linePaint={{
                    'line-color': '#2563eb',
                    'line-width': 2.5,
                  }}
                />
              )}

              {/* Office Center Marker */}
              {log.officeLongitude && log.officeLatitude && (
                <MapMarker longitude={log.officeLongitude} latitude={log.officeLatitude}>
                  <MarkerContent>
                    <div className='pointer-events-none relative flex items-center justify-center select-none'>
                      <span className='z-10 flex size-8 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-white shadow-md'>
                        <IconBuildingCommunity size={16} />
                      </span>
                      <div className='absolute top-full mt-1.5 rounded-md border border-border/80 bg-background/95 px-2.5 py-1 text-[11px] font-bold whitespace-nowrap text-blue-600 shadow-md backdrop-blur-xs dark:text-blue-400'>
                        {log.officeName} ({log.officeRadius}m radius)
                      </div>
                    </div>
                  </MarkerContent>
                </MapMarker>
              )}

              {/* Detected Employee Violation Marker */}
              {log.detectedLongitude && log.detectedLatitude && (
                <MapMarker longitude={log.detectedLongitude} latitude={log.detectedLatitude}>
                  <MarkerContent>
                    <div className='pointer-events-none relative flex items-center justify-center select-none'>
                      {/* Pulse circle for violation point */}
                      <div className='absolute size-14 animate-ping rounded-full bg-rose-500/30' />
                      <span className='relative z-20 flex size-9 items-center justify-center rounded-full border-2 border-white bg-rose-600 text-white shadow-xl'>
                        <IconMapPin size={20} />
                      </span>
                      <div className='absolute top-full z-30 mt-2 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold whitespace-nowrap text-white shadow-lg'>
                        <span>{log.employeeName}</span>
                        {log.distanceFromPerimeter && (
                          <span className='mt-0.5 block text-[10px] font-normal opacity-90'>
                            {log.distanceFromPerimeter}
                          </span>
                        )}
                      </div>
                    </div>
                  </MarkerContent>
                </MapMarker>
              )}
            </Map>
          </div>

          {/* Right: Incident Details Sidebar */}
          <div className='flex min-w-[340px] flex-col justify-between space-y-5 overflow-y-auto bg-card p-6'>
            <div className='space-y-5'>
              {/* Employee Info Card */}
              <div className='rounded-xl border border-border/80 bg-muted/20 p-4 shadow-xs'>
                <div className='flex items-center gap-3.5'>
                  <div className='flex size-11 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-bold text-primary'>
                    <IconUser size={20} />
                  </div>
                  <div>
                    <h4 className='text-sm font-bold text-foreground'>{log.employeeName}</h4>
                    <p className='mt-0.5 text-xs text-muted-foreground'>
                      {log.employeeCode} · {log.department}
                    </p>
                  </div>
                </div>
              </div>

              {/* Location & Detection Specs */}
              <div className='space-y-2'>
                <h5 className='text-[11px] font-bold tracking-wider text-muted-foreground uppercase'>
                  Location Details
                </h5>
                <div className='space-y-3 rounded-xl border border-border/80 bg-background p-4 text-xs'>
                  <div className='flex flex-col gap-0.5'>
                    <span className='text-[11px] font-medium text-muted-foreground'>
                      Detection Summary
                    </span>
                    <span className='text-xs leading-relaxed font-semibold text-foreground'>
                      {log.locationDetected}
                    </span>
                  </div>

                  <div className='grid grid-cols-2 gap-3 border-t border-border/50 pt-2'>
                    <div className='flex flex-col gap-0.5'>
                      <span className='text-[11px] font-medium text-muted-foreground'>
                        Assigned Office
                      </span>
                      <span className='text-xs font-semibold text-foreground'>
                        {log.officeName || 'Jakarta HQ'}
                      </span>
                    </div>

                    <div className='flex flex-col gap-0.5'>
                      <span className='text-[11px] font-medium text-muted-foreground'>
                        GPS Accuracy
                      </span>
                      <span className='font-mono text-xs font-semibold text-foreground'>
                        {log.accuracy}
                      </span>
                    </div>
                  </div>

                  <div className='flex flex-col gap-0.5 border-t border-border/50 pt-2'>
                    <span className='text-[11px] font-medium text-muted-foreground'>
                      Coordinates
                    </span>
                    <span className='font-mono text-xs font-semibold text-foreground'>
                      {log.detectedLatitude?.toFixed(6)}, {log.detectedLongitude?.toFixed(6)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Device & Integrity Audit */}
              <div className='space-y-2'>
                <h5 className='text-[11px] font-bold tracking-wider text-muted-foreground uppercase'>
                  Device Integrity Audit
                </h5>
                <div className='space-y-3 rounded-xl border border-border/80 bg-background p-4 text-xs'>
                  <div className='flex flex-col gap-0.5'>
                    <span className='text-[11px] font-medium text-muted-foreground'>
                      Device Model
                    </span>
                    <span className='flex items-center gap-1.5 text-xs font-semibold text-foreground'>
                      <IconDeviceMobile size={14} className='flex-shrink-0 text-muted-foreground' />
                      {log.deviceModel || 'Samsung Galaxy S23'}
                    </span>
                  </div>

                  <div className='grid grid-cols-2 gap-3 border-t border-border/50 pt-2'>
                    <div className='flex flex-col gap-0.5'>
                      <span className='text-[11px] font-medium text-muted-foreground'>
                        Mock Location
                      </span>
                      <span
                        className={`text-xs font-bold ${
                          log.isMockLocation ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {log.isMockLocation ? 'Detected (Spoofed)' : 'Passed (Clean)'}
                      </span>
                    </div>

                    <div className='flex flex-col gap-0.5'>
                      <span className='text-[11px] font-medium text-muted-foreground'>
                        Root / Jailbreak
                      </span>
                      <span
                        className={`text-xs font-bold ${
                          log.isRooted ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {log.isRooted ? 'Rooted Device' : 'Clean Device'}
                      </span>
                    </div>
                  </div>

                  <div className='flex flex-col gap-0.5 border-t border-border/50 pt-2'>
                    <span className='text-[11px] font-medium text-muted-foreground'>
                      Client IP Address
                    </span>
                    <span className='font-mono text-xs font-semibold text-foreground'>
                      {log.ipAddress || '182.253.14.88'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Close */}
            <div className='flex justify-end gap-2 border-t border-border/70 pt-4'>
              <Button
                asChild
                variant='outline'
                size='sm'
                className='h-9 rounded-xl px-4 text-xs font-semibold'
              >
                <Link to='/attendance/gps-security/events/$eventId' params={{ eventId: log.id }}>
                  View Full Event
                </Link>
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => onOpenChange(false)}
                className='h-9 rounded-xl px-6 text-xs font-semibold'
              >
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
