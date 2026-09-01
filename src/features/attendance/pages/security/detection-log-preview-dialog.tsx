// detection-log-preview-dialog.tsx — Interactive GPS Security Incident & Location Map Preview Dialog
import {
  IconAlertTriangle,
  IconMapPin,
  IconShieldX,
  IconDeviceMobile,
  IconUser,
  IconBuildingCommunity,
} from '@tabler/icons-react'
import { createGeoJSONCircle } from './geo-utils'
import type { SecurityEventLog } from './types'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/ui/dialog'
import { Map, MapControls, MapMarker, MarkerContent, MapGeoJSON } from '@/shared/components/ui/map'

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
      <DialogContent className='!w-[94vw] !max-w-6xl sm:!max-w-6xl md:!max-w-6xl lg:!max-w-6xl h-[86vh] max-h-[860px] p-0 overflow-hidden rounded-2xl gap-0 border-border/80 flex flex-col shadow-2xl bg-card'>
        {/* Header */}
        <DialogHeader className='p-6 pb-4 border-b border-border/70 bg-card flex-shrink-0'>
          <div className='flex flex-wrap items-center justify-between gap-4 pr-8'>
            <div className='flex items-center gap-3.5'>
              <div
                className={`flex size-11 items-center justify-center rounded-xl flex-shrink-0 ${
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
                <DialogTitle className='text-base font-bold text-foreground flex items-center gap-2.5 flex-wrap'>
                  <span>Security Incident: {log.eventType}</span>
                  <Badge
                    variant={
                      log.severity === 'high'
                        ? 'red'
                        : log.severity === 'medium'
                          ? 'amber'
                          : 'blue'
                    }
                    className='text-[10px] px-2.5 py-0.5 font-bold uppercase tracking-wider'
                  >
                    {log.severity} severity
                  </Badge>
                </DialogTitle>
                <DialogDescription className='text-xs text-muted-foreground mt-0.5'>
                  Detected at: <span className='font-mono font-medium'>{log.timestamp}</span> · Reference ID: <span className='font-mono font-medium'>{log.id}</span>
                </DialogDescription>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <Badge
                variant={log.actionTaken === 'Blocked' ? 'red' : 'amber'}
                className='text-xs px-3.5 py-1 font-semibold rounded-lg'
              >
                Action: {log.actionTaken}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        {/* Content Body: Map + Dossier */}
        <div className='flex-1 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] min-h-0 overflow-hidden bg-muted/10'>
          {/* Left: Map Preview */}
          <div className='relative h-full w-full bg-slate-100 dark:bg-slate-900 border-r border-border/60 overflow-hidden min-h-[350px]'>
            <Map
              center={[centerLng, centerLat]}
              zoom={14.8}
              className='h-full w-full'
            >
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
                <MapMarker
                  longitude={log.officeLongitude}
                  latitude={log.officeLatitude}
                >
                  <MarkerContent>
                    <div className='relative flex items-center justify-center pointer-events-none select-none'>
                      <span className='flex size-8 items-center justify-center rounded-full bg-blue-600 text-white shadow-md border-2 border-white z-10'>
                        <IconBuildingCommunity size={16} />
                      </span>
                      <div className='absolute top-full mt-1.5 whitespace-nowrap rounded-md bg-background/95 backdrop-blur-xs px-2.5 py-1 text-[11px] font-bold shadow-md border border-border/80 text-blue-600 dark:text-blue-400'>
                        {log.officeName} ({log.officeRadius}m radius)
                      </div>
                    </div>
                  </MarkerContent>
                </MapMarker>
              )}

              {/* Detected Employee Violation Marker */}
              {log.detectedLongitude && log.detectedLatitude && (
                <MapMarker
                  longitude={log.detectedLongitude}
                  latitude={log.detectedLatitude}
                >
                  <MarkerContent>
                    <div className='relative flex items-center justify-center pointer-events-none select-none'>
                      {/* Pulse circle for violation point */}
                      <div className='absolute size-14 rounded-full bg-rose-500/30 animate-ping' />
                      <span className='relative flex size-9 items-center justify-center rounded-full bg-rose-600 text-white shadow-xl border-2 border-white z-20'>
                        <IconMapPin size={20} />
                      </span>
                      <div className='absolute top-full mt-2 whitespace-nowrap rounded-lg bg-rose-600 text-white px-3 py-1.5 text-xs font-bold shadow-lg z-30'>
                        <span>{log.employeeName}</span>
                        {log.distanceFromPerimeter && (
                          <span className='block text-[10px] font-normal opacity-90 mt-0.5'>
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
          <div className='p-6 space-y-5 flex flex-col justify-between overflow-y-auto bg-card min-w-[340px]'>
            <div className='space-y-5'>
              {/* Employee Info Card */}
              <div className='rounded-xl border border-border/80 p-4 bg-muted/20 shadow-xs'>
                <div className='flex items-center gap-3.5'>
                  <div className='flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-base flex-shrink-0'>
                    <IconUser size={20} />
                  </div>
                  <div>
                    <h4 className='text-sm font-bold text-foreground'>{log.employeeName}</h4>
                    <p className='text-xs text-muted-foreground mt-0.5'>
                      {log.employeeCode} · {log.department}
                    </p>
                  </div>
                </div>
              </div>

              {/* Location & Detection Specs */}
              <div className='space-y-2'>
                <h5 className='font-bold text-[11px] uppercase tracking-wider text-muted-foreground'>
                  Location Details
                </h5>
                <div className='space-y-3 rounded-xl border border-border/80 bg-background p-4 text-xs'>
                  <div className='flex flex-col gap-0.5'>
                    <span className='text-[11px] font-medium text-muted-foreground'>
                      Detection Summary
                    </span>
                    <span className='font-semibold text-foreground text-xs leading-relaxed'>
                      {log.locationDetected}
                    </span>
                  </div>

                  <div className='grid grid-cols-2 gap-3 pt-2 border-t border-border/50'>
                    <div className='flex flex-col gap-0.5'>
                      <span className='text-[11px] font-medium text-muted-foreground'>
                        Assigned Office
                      </span>
                      <span className='font-semibold text-foreground text-xs'>
                        {log.officeName || 'Jakarta HQ'}
                      </span>
                    </div>

                    <div className='flex flex-col gap-0.5'>
                      <span className='text-[11px] font-medium text-muted-foreground'>
                        GPS Accuracy
                      </span>
                      <span className='font-mono font-semibold text-foreground text-xs'>
                        {log.accuracy}
                      </span>
                    </div>
                  </div>

                  <div className='flex flex-col gap-0.5 pt-2 border-t border-border/50'>
                    <span className='text-[11px] font-medium text-muted-foreground'>
                      Coordinates
                    </span>
                    <span className='font-mono font-semibold text-foreground text-xs'>
                      {log.detectedLatitude?.toFixed(6)}, {log.detectedLongitude?.toFixed(6)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Device & Integrity Audit */}
              <div className='space-y-2'>
                <h5 className='font-bold text-[11px] uppercase tracking-wider text-muted-foreground'>
                  Device Integrity Audit
                </h5>
                <div className='space-y-3 rounded-xl border border-border/80 bg-background p-4 text-xs'>
                  <div className='flex flex-col gap-0.5'>
                    <span className='text-[11px] font-medium text-muted-foreground'>
                      Device Model
                    </span>
                    <span className='font-semibold text-foreground text-xs flex items-center gap-1.5'>
                      <IconDeviceMobile size={14} className='text-muted-foreground flex-shrink-0' />
                      {log.deviceModel || 'Samsung Galaxy S23'}
                    </span>
                  </div>

                  <div className='grid grid-cols-2 gap-3 pt-2 border-t border-border/50'>
                    <div className='flex flex-col gap-0.5'>
                      <span className='text-[11px] font-medium text-muted-foreground'>
                        Mock Location
                      </span>
                      <span
                        className={`font-bold text-xs ${
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
                        className={`font-bold text-xs ${
                          log.isRooted ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {log.isRooted ? 'Rooted Device' : 'Clean Device'}
                      </span>
                    </div>
                  </div>

                  <div className='flex flex-col gap-0.5 pt-2 border-t border-border/50'>
                    <span className='text-[11px] font-medium text-muted-foreground'>
                      Client IP Address
                    </span>
                    <span className='font-mono font-semibold text-foreground text-xs'>
                      {log.ipAddress || '182.253.14.88'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Close */}
            <div className='pt-4 border-t border-border/70 flex justify-end'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => onOpenChange(false)}
                className='text-xs font-semibold rounded-xl px-6 h-9'
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
