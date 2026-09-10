import { zodResolver } from '@hookform/resolvers/zod'
import { IconInfoCircle, IconMapPin } from '@tabler/icons-react'
import type * as MapLibreGL from 'maplibre-gl'
import { useCallback, useEffect } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import {
  Map,
  MapControls,
  MapGeoJSON,
  MapMarker,
  MarkerContent,
  useMap,
} from '@/shared/components/ui/map'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Textarea } from '@/shared/components/ui/textarea'
import { useSchema } from '@/shared/lib/schema'
import { snackbar } from '@/shared/lib/snackbar'

import { createGeoJSONCircle } from './geo-utils'
import type { GeofenceItem } from './types'

function MapClickHandler({
  onLocationSelect,
}: {
  onLocationSelect: (lat: number, lng: number) => void
}) {
  const { map, isLoaded } = useMap()

  useEffect(() => {
    if (!isLoaded || !map) return
    const handleMapClick = (event: MapLibreGL.MapMouseEvent) => {
      onLocationSelect(Number(event.lngLat.lat.toFixed(6)), Number(event.lngLat.lng.toFixed(6)))
    }
    map.on('click', handleMapClick)
    return () => map.off('click', handleMapClick)
  }, [isLoaded, map, onLocationSelect])

  return null
}

interface GeofenceFormViewProps {
  mode: 'create' | 'edit'
  initialData?: GeofenceItem | null
  onCancel: () => void
  onSave: (data: GeofenceItem) => void
}

const createEmptyGeofence = (): GeofenceItem => ({
  id: crypto.randomUUID(),
  locationName: '',
  type: 'Office',
  address: '',
  latitude: -6.2088,
  longitude: 106.8456,
  radiusMeters: 150,
  accuracyRequirement: '≤ 50 meters',
  employeeScope: '',
  employeesCount: 0,
  status: 'Active',
  policyNote:
    'Employee hanya dapat Clock In/Out bila GPS berada di area ini dan lolos device-integrity check.',
})

export function GeofenceFormView({ mode, initialData, onCancel, onSave }: GeofenceFormViewProps) {
  const formSchema = useSchema((z) => ({
    id: z.string(),
    locationName: z.string().min(1, { message: 'Location name is required.' }),
    type: z.enum(['Office', 'Branch', 'Warehouse', 'Temporary']),
    address: z.string().min(1, { message: 'Address is required.' }),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    radiusMeters: z.number().min(10).max(5000),
    accuracyRequirement: z.string().min(1),
    employeeScope: z.string().min(1, { message: 'Employee scope is required.' }),
    employeesCount: z.number().min(0),
    status: z.enum(['Active', 'Inactive']),
    policyNote: z.string(),
  }))
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ?? createEmptyGeofence(),
  })

  useEffect(() => {
    reset(initialData ?? createEmptyGeofence())
  }, [initialData, mode, reset])

  const latitude = useWatch({ control, name: 'latitude' })
  const longitude = useWatch({ control, name: 'longitude' })
  const radiusMeters = useWatch({ control, name: 'radiusMeters' })
  const locationName = useWatch({ control, name: 'locationName' })
  const accuracyRequirement = useWatch({ control, name: 'accuracyRequirement' })

  const selectLocation = useCallback(
    (lat: number, lng: number) => {
      setValue('latitude', lat, { shouldDirty: true, shouldValidate: true })
      setValue('longitude', lng, { shouldDirty: true, shouldValidate: true })
    },
    [setValue],
  )

  const saveGeofence = (values: z.infer<typeof formSchema>) => {
    onSave(values)
    snackbar.success(
      mode === 'edit' ? 'Geofence updated successfully.' : 'Geofence created successfully.',
    )
  }

  return (
    <form
      onSubmit={handleSubmit(saveGeofence)}
      className='grid items-start gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.9fr)]'
    >
      <Card className='gap-0 py-0'>
        <CardHeader className='border-b py-5'>
          <CardTitle>Geofence Information</CardTitle>
          <CardDescription>
            {mode === 'create'
              ? 'Complete the details for the new attendance area.'
              : 'Update the location, radius, and employee coverage.'}
          </CardDescription>
        </CardHeader>
        <CardContent className='py-6'>
          <FieldGroup className='grid gap-5 sm:grid-cols-2'>
            <Field data-invalid={!!errors.locationName}>
              <FieldLabel htmlFor='geofence-location-name'>Location Name</FieldLabel>
              <Input
                id='geofence-location-name'
                placeholder='Jakarta HQ'
                aria-invalid={!!errors.locationName}
                {...register('locationName')}
              />
              <FieldError errors={[errors.locationName]} />
            </Field>
            <Controller
              control={control}
              name='type'
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Location Type</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className='w-full'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['Office', 'Branch', 'Warehouse', 'Temporary'].map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <Field className='sm:col-span-2' data-invalid={!!errors.address}>
              <FieldLabel htmlFor='geofence-address'>Address</FieldLabel>
              <Input
                id='geofence-address'
                placeholder='Jl. Jend. Sudirman, Jakarta'
                aria-invalid={!!errors.address}
                {...register('address')}
              />
              <FieldError errors={[errors.address]} />
            </Field>
            <Field data-invalid={!!errors.latitude}>
              <FieldLabel htmlFor='geofence-latitude'>Latitude</FieldLabel>
              <Input
                id='geofence-latitude'
                type='number'
                step='any'
                aria-invalid={!!errors.latitude}
                {...register('latitude', { valueAsNumber: true })}
              />
              <FieldError errors={[errors.latitude]} />
            </Field>
            <Field data-invalid={!!errors.longitude}>
              <FieldLabel htmlFor='geofence-longitude'>Longitude</FieldLabel>
              <Input
                id='geofence-longitude'
                type='number'
                step='any'
                aria-invalid={!!errors.longitude}
                {...register('longitude', { valueAsNumber: true })}
              />
              <FieldError errors={[errors.longitude]} />
            </Field>
            <Field data-invalid={!!errors.radiusMeters}>
              <FieldLabel htmlFor='geofence-radius'>Radius (meters)</FieldLabel>
              <Input
                id='geofence-radius'
                type='number'
                min={10}
                max={5000}
                aria-invalid={!!errors.radiusMeters}
                {...register('radiusMeters', { valueAsNumber: true })}
              />
              <FieldError errors={[errors.radiusMeters]} />
            </Field>
            <Controller
              control={control}
              name='accuracyRequirement'
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Accuracy Requirement</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className='w-full'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['≤ 25 meters', '≤ 50 meters', '≤ 100 meters'].map((value) => (
                        <SelectItem key={value} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <Field data-invalid={!!errors.employeeScope}>
              <FieldLabel htmlFor='geofence-employee-scope'>Employee Scope</FieldLabel>
              <Input
                id='geofence-employee-scope'
                placeholder='Jakarta HQ employees'
                aria-invalid={!!errors.employeeScope}
                {...register('employeeScope')}
              />
              <FieldError errors={[errors.employeeScope]} />
            </Field>
            <Controller
              control={control}
              name='status'
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Status</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className='w-full'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='Active'>Active</SelectItem>
                      <SelectItem value='Inactive'>Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <Field className='sm:col-span-2' data-invalid={!!errors.policyNote}>
              <FieldLabel htmlFor='geofence-policy-note'>Attendance Policy Note</FieldLabel>
              <Textarea
                id='geofence-policy-note'
                rows={3}
                aria-invalid={!!errors.policyNote}
                {...register('policyNote')}
              />
              <FieldError errors={[errors.policyNote]} />
            </Field>
          </FieldGroup>

          <div className='mt-6 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4'>
            <IconInfoCircle className='mt-0.5 size-5 shrink-0 text-primary' />
            <div>
              <p className='text-xs font-semibold'>Map interaction</p>
              <p className='mt-1 text-xs leading-relaxed text-muted-foreground'>
                Click the map or drag the marker to update latitude and longitude.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className='justify-end gap-2 border-t py-4'>
          <Button type='button' variant='outline' onClick={onCancel}>
            Cancel
          </Button>
          <Button type='submit'>{mode === 'edit' ? 'Save Changes' : 'Create Geofence'}</Button>
        </CardFooter>
      </Card>

      <Card className='gap-0 py-0'>
        <CardHeader className='border-b py-5'>
          <div className='flex items-start justify-between gap-3'>
            <div>
              <CardTitle>Map Preview</CardTitle>
              <CardDescription>Review and adjust the geofence center point.</CardDescription>
            </div>
            <span className='shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary'>
              {radiusMeters}m radius
            </span>
          </div>
        </CardHeader>
        <CardContent className='p-5'>
          <div className='relative h-120 overflow-hidden rounded-xl border'>
            <Map
              center={[longitude || 106.8456, latitude || -6.2088]}
              zoom={15}
              className='h-full w-full'
            >
              <MapControls position='top-right' />
              <MapClickHandler onLocationSelect={selectLocation} />
              <MapGeoJSON
                key={`circle-${longitude}-${latitude}-${radiusMeters}`}
                data={createGeoJSONCircle(
                  [longitude || 106.8456, latitude || -6.2088],
                  radiusMeters || 150,
                )}
                fillPaint={{ 'fill-color': '#3b82f6', 'fill-opacity': 0.18 }}
                linePaint={{ 'line-color': '#2563eb', 'line-width': 2 }}
              />
              <MapMarker
                longitude={longitude || 106.8456}
                latitude={latitude || -6.2088}
                draggable
                onDragEnd={(position) =>
                  selectLocation(Number(position.lat.toFixed(6)), Number(position.lng.toFixed(6)))
                }
              >
                <MarkerContent>
                  <div className='relative flex cursor-move items-center justify-center select-none'>
                    <span className='relative z-20 flex size-9 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-white shadow-xl'>
                      <IconMapPin className='size-5' />
                    </span>
                    <div className='absolute top-full z-30 mt-2 rounded-lg border bg-background/95 px-2.5 py-1 text-center whitespace-nowrap shadow-md'>
                      <p className='text-xs font-bold text-primary'>
                        {locationName || 'Selected Location'}
                      </p>
                      <p className='text-[10px] text-muted-foreground'>
                        {radiusMeters || 150}m radius
                      </p>
                    </div>
                  </div>
                </MarkerContent>
              </MapMarker>
            </Map>
          </div>
          <dl className='mt-4 grid grid-cols-3 gap-3 text-[11px]'>
            <div>
              <dt className='text-muted-foreground'>Latitude</dt>
              <dd className='mt-1 truncate font-mono font-medium'>{latitude}</dd>
            </div>
            <div>
              <dt className='text-muted-foreground'>Longitude</dt>
              <dd className='mt-1 truncate font-mono font-medium'>{longitude}</dd>
            </div>
            <div>
              <dt className='text-muted-foreground'>Accuracy</dt>
              <dd className='mt-1 truncate font-medium'>{accuracyRequirement}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </form>
  )
}
