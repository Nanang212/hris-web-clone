import { IconBuildingCommunity, IconMapPin } from '@tabler/icons-react'

import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Map, MapControls, MapGeoJSON, MapMarker, MarkerContent } from '@/shared/components/ui/map'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'

import { createGeoJSONCircle } from './geo-utils'
import type { GeofenceItem } from './types'

interface GeofenceManagementTabProps {
  geofences: GeofenceItem[]
  onEdit: (item: GeofenceItem) => void
}

export function GeofenceManagementTab({ geofences, onEdit }: GeofenceManagementTabProps) {
  return (
    <div className='flex flex-col gap-5'>
      <Card className='gap-0 py-0'>
        <CardHeader className='border-b py-5'>
          <CardTitle>Geofence Directory</CardTitle>
          <CardDescription>
            Configured office, branch, and temporary attendance areas.
          </CardDescription>
        </CardHeader>
        <CardContent className='px-0'>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  {[
                    'Location',
                    'Type',
                    'Center / Address',
                    'Radius',
                    'Employees',
                    'Status',
                    'Action',
                  ].map((label) => (
                    <TableHead key={label}>{label}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {geofences.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className='min-w-44'>
                      <div className='flex items-center gap-2'>
                        <span className='flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'>
                          <IconBuildingCommunity className='size-4' />
                        </span>
                        <span className='text-xs font-semibold'>{item.locationName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant='outline'>{item.type}</Badge>
                    </TableCell>
                    <TableCell className='min-w-64 text-xs text-muted-foreground'>
                      {item.address}
                    </TableCell>
                    <TableCell className='text-xs whitespace-nowrap'>
                      {item.radiusMeters} m
                    </TableCell>
                    <TableCell className='text-xs'>{item.employeesCount}</TableCell>
                    <TableCell>
                      <Badge variant={item.status === 'Active' ? 'green' : 'secondary'}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button type='button' variant='ghost' size='sm' onClick={() => onEdit(item)}>
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className='gap-0 py-0'>
        <CardHeader className='border-b py-5'>
          <CardTitle>Geofence Preview</CardTitle>
          <CardDescription>Interactive map of configured geofence boundaries.</CardDescription>
        </CardHeader>
        <CardContent className='p-5'>
          <div className='relative h-110 overflow-hidden rounded-xl border'>
            <Map center={[109.8, -7.3]} zoom={6.8} className='h-full w-full'>
              <MapControls position='top-right' />
              {geofences.map((item) => (
                <MapGeoJSON
                  key={`geo-circle-${item.id}-${item.longitude}-${item.latitude}-${item.radiusMeters}`}
                  data={createGeoJSONCircle([item.longitude, item.latitude], item.radiusMeters)}
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
                <MapMarker key={item.id} longitude={item.longitude} latitude={item.latitude}>
                  <MarkerContent>
                    <div className='pointer-events-none relative flex items-center justify-center select-none'>
                      <div
                        className='pointer-events-none absolute rounded-full border-2 border-blue-500 bg-blue-500/20 shadow-sm'
                        style={{
                          width: `${Math.max(88, item.radiusMeters * 0.55)}px`,
                          height: `${Math.max(88, item.radiusMeters * 0.55)}px`,
                        }}
                      />
                      <span className='relative z-20 flex size-8 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-white shadow-xl'>
                        <IconMapPin className='size-4' />
                      </span>
                      <div className='absolute top-full z-30 mt-2 rounded-lg border bg-background/95 px-2.5 py-1 text-center whitespace-nowrap shadow-md backdrop-blur-xs'>
                        <p className='text-xs font-bold'>{item.locationName}</p>
                        <p className='mt-0.5 text-[10px] text-muted-foreground'>
                          {item.radiusMeters}m radius · {item.employeesCount} employees
                        </p>
                      </div>
                    </div>
                  </MarkerContent>
                </MapMarker>
              ))}
            </Map>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
