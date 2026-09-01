// geofence-management-tab.tsx — Geofence directory table & multi-zone preview
import { IconMapPin, IconBuildingCommunity } from '@tabler/icons-react'
import type { GeofenceItem } from './types'
import { Badge } from '@/shared/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { Map, MapControls, MapMarker, MarkerContent, MapGeoJSON } from '@/shared/components/ui/map'
import { createGeoJSONCircle } from './geo-utils'

interface GeofenceManagementTabProps {
  geofences: GeofenceItem[]
  onEdit: (item: GeofenceItem) => void
}

export function GeofenceManagementTab({
  geofences,
  onEdit,
}: GeofenceManagementTabProps) {
  return (
    <div className='flex flex-col gap-6'>
      {/* ── 1. Geofence Directory Table ───────────────────────────────────── */}
      <div className='rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden'>
        <Table>
          <TableHeader>
            <TableRow className='bg-muted/30 hover:bg-muted/30 border-b border-border/60 text-xs'>
              <TableHead className='font-bold text-muted-foreground py-3.5 pl-6'>
                Location
              </TableHead>
              <TableHead className='font-bold text-muted-foreground py-3.5'>Type</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3.5'>
                Center / Address
              </TableHead>
              <TableHead className='font-bold text-muted-foreground py-3.5'>Radius</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3.5'>
                Employees
              </TableHead>
              <TableHead className='font-bold text-muted-foreground py-3.5'>Status</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3.5 pr-6 text-right'>
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {geofences.map((item) => (
              <TableRow key={item.id} className='hover:bg-muted/20 border-b border-border/40 text-xs'>
                <TableCell className='font-bold text-foreground py-4 pl-6'>
                  <div className='flex items-center gap-2'>
                    <IconBuildingCommunity size={15} className='text-primary/70' />
                    <span>{item.locationName}</span>
                  </div>
                </TableCell>
                <TableCell className='text-muted-foreground py-4'>{item.type}</TableCell>
                <TableCell className='text-muted-foreground py-4'>{item.address}</TableCell>
                <TableCell className='text-muted-foreground py-4 font-medium'>
                  {item.radiusMeters} m
                </TableCell>
                <TableCell className='text-muted-foreground py-4 font-medium'>
                  {item.employeesCount}
                </TableCell>
                <TableCell className='py-4'>
                  <Badge
                    variant={item.type === 'Temporary' ? 'blue' : 'green'}
                    className='text-[10px] px-2.5 py-0.5 font-semibold capitalize'
                  >
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell className='py-4 pr-6 text-right'>
                  <button
                    type='button'
                    onClick={() => onEdit(item)}
                    className='text-xs font-semibold text-primary hover:underline cursor-pointer'
                  >
                    Edit
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* ── 2. Geofence Preview Interactive Map Card ────────────────────── */}
      <div className='rounded-2xl border border-border/60 bg-card p-6 shadow-sm flex flex-col'>
        <div className='flex items-center justify-between mb-4'>
          <div>
            <h3 className='text-sm font-bold text-foreground tracking-tight'>
              Geofence Preview
            </h3>
            <p className='text-xs text-muted-foreground mt-0.5'>
              Live interactive map of configured geofence boundaries across office locations.
            </p>
          </div>
        </div>

        <div className='relative h-[440px] rounded-xl overflow-hidden border border-border/60'>
          <Map
            center={[109.8, -7.3]}
            zoom={6.8}
            className='h-full w-full'
          >
            <MapControls position='top-right' />

            {/* Render exact geodesic circle polygon for each geofence */}
            {geofences.map((item) => (
              <MapGeoJSON
                key={`geo-circle-${item.id}-${item.longitude}-${item.latitude}-${item.radiusMeters}`}
                data={createGeoJSONCircle(
                  [item.longitude, item.latitude],
                  item.radiusMeters,
                )}
                fillPaint={{
                  'fill-color': item.type === 'Temporary' ? '#3b82f6' : '#2563eb',
                  'fill-opacity': 0.22,
                }}
                linePaint={{
                  'line-color': item.type === 'Temporary' ? '#3b82f6' : '#2563eb',
                  'line-width': 2.5,
                }}
              />
            ))}

            {geofences.map((item) => (
              <MapMarker
                key={item.id}
                longitude={item.longitude}
                latitude={item.latitude}
              >
                <MarkerContent>
                  <div className='relative flex items-center justify-center pointer-events-none select-none'>
                    {/* Always visible visual circular geofence boundary */}
                    <div
                      className='absolute rounded-full border-2 border-blue-500 bg-blue-500/20 pointer-events-none shadow-sm'
                      style={{
                        width: `${Math.max(88, item.radiusMeters * 0.55)}px`,
                        height: `${Math.max(88, item.radiusMeters * 0.55)}px`,
                      }}
                    />

                    {/* Marker Pin Icon - Centered directly on [lng, lat] */}
                    <span className='relative flex size-8 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl border-2 border-white z-20'>
                      <IconMapPin size={18} />
                    </span>

                    {/* Floating location label placed underneath without altering pin center */}
                    <div className='absolute top-full mt-2 whitespace-nowrap rounded-lg bg-background/95 backdrop-blur-xs px-2.5 py-1 text-xs font-bold shadow-md border border-border/80 text-foreground z-30 text-center'>
                      <p className='text-xs font-bold text-foreground leading-tight'>
                        {item.locationName}
                      </p>
                      <p className='text-[10px] font-normal text-muted-foreground mt-0.5'>
                        {item.radiusMeters}m radius · {item.employeesCount} emp
                      </p>
                    </div>
                  </div>
                </MarkerContent>
              </MapMarker>
            ))}
          </Map>
        </div>
      </div>
    </div>
  )
}
