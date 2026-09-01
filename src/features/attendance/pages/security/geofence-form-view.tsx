import { IconMapPin, IconInfoCircle } from '@tabler/icons-react'
import { useState, useEffect } from 'react'
import type * as MapLibreGL from 'maplibre-gl'
import { createGeoJSONCircle } from './geo-utils'
import type { GeofenceItem } from './types'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Map, MapControls, MapMarker, MarkerContent, MapGeoJSON, useMap } from '@/shared/components/ui/map'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { snackbar } from '@/shared/lib/snackbar'

/** Subcomponent to capture map click events and update form coordinates */
function MapClickHandler({
  onLocationSelect,
}: {
  onLocationSelect: (lat: number, lng: number) => void
}) {
  const { map, isLoaded } = useMap()

  useEffect(() => {
    if (!isLoaded || !map) return

    const handleMapClick = (e: MapLibreGL.MapMouseEvent) => {
      onLocationSelect(
        Number(e.lngLat.lat.toFixed(6)),
        Number(e.lngLat.lng.toFixed(6)),
      )
    }

    map.on('click', handleMapClick)
    return () => {
      map.off('click', handleMapClick)
    }
  }, [map, isLoaded, onLocationSelect])

  return null
}

interface GeofenceFormViewProps {
  mode: 'create' | 'edit'
  initialData?: GeofenceItem | null
  onCancel: () => void
  onSave: (data: GeofenceItem) => void
}

export function GeofenceFormView({
  mode,
  initialData,
  onCancel,
  onSave,
}: GeofenceFormViewProps) {
  const [formData, setFormData] = useState<GeofenceItem>(() => {
    if (mode === 'edit' && initialData) {
      return initialData
    }
    // Clean empty initial form data for Create mode
    return {
      id: `geo-${Date.now()}`,
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
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.locationName.trim()) {
      snackbar.error('Location name is required.')
      return
    }
    onSave(formData)
    snackbar.success(
      mode === 'edit'
        ? 'Geofence updated successfully!'
        : 'Geofence created successfully!',
    )
  }

  return (
    <form onSubmit={handleSubmit} className='grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-6'>
      {/* ── Left Column: Geofence Information ─────────────────────────────── */}
      <div className='rounded-2xl border border-border/80 bg-card p-6 shadow-sm flex flex-col justify-between'>
        <div className='space-y-5'>
          <div>
            <h3 className='text-sm font-bold text-foreground tracking-tight'>
              Geofence Information
            </h3>
            <p className='text-xs text-muted-foreground mt-0.5'>
              {mode === 'create'
                ? 'Isi formulir berikut untuk mendaftarkan geofence baru.'
                : 'Perbarui informasi dan radius geofence kantor ini.'}
            </p>
          </div>

          {/* Row 1: Location Name & Type */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div className='space-y-1.5'>
              <label className='text-xs font-semibold text-foreground'>
                Location Name <span className='text-destructive'>*</span>
              </label>
              <Input
                value={formData.locationName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, locationName: e.target.value }))
                }
                placeholder='e.g. Jakarta HQ'
                className='h-10 text-xs bg-background border border-input shadow-xs hover:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary rounded-xl'
                required
              />
            </div>

            <div className='space-y-1.5'>
              <label className='text-xs font-semibold text-foreground'>
                Type
              </label>
              <Select
                value={formData.type}
                onValueChange={(val) =>
                  setFormData((prev) => ({ ...prev, type: val as GeofenceItem['type'] }))
                }
              >
                <SelectTrigger className='h-10 text-xs bg-background border border-input shadow-xs hover:border-primary/50 focus:ring-1 focus:ring-primary rounded-xl'>
                  <SelectValue placeholder='Select type' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='Office'>Office</SelectItem>
                  <SelectItem value='Branch'>Branch</SelectItem>
                  <SelectItem value='Warehouse'>Warehouse</SelectItem>
                  <SelectItem value='Temporary'>Temporary</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2: Address */}
          <div className='space-y-1.5'>
            <label className='text-xs font-semibold text-foreground'>
              Address
            </label>
            <Input
              value={formData.address}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, address: e.target.value }))
              }
              placeholder='e.g. Jl. Sudirman Kav. 52–53, Jakarta'
              className='h-10 text-xs bg-background border border-input shadow-xs hover:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary rounded-xl'
            />
          </div>

          {/* Row 3: Latitude & Longitude */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div className='space-y-1.5'>
              <label className='text-xs font-semibold text-foreground'>
                Latitude
              </label>
              <Input
                type='number'
                step='any'
                value={formData.latitude || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    latitude: parseFloat(e.target.value) || 0,
                  }))
                }
                placeholder='-6.2088'
                className='h-10 text-xs bg-background border border-input shadow-xs hover:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary rounded-xl'
              />
            </div>

            <div className='space-y-1.5'>
              <label className='text-xs font-semibold text-foreground'>
                Longitude
              </label>
              <Input
                type='number'
                step='any'
                value={formData.longitude || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    longitude: parseFloat(e.target.value) || 0,
                  }))
                }
                placeholder='106.8456'
                className='h-10 text-xs bg-background border border-input shadow-xs hover:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary rounded-xl'
              />
            </div>
          </div>

          {/* Row 4: Radius & Accuracy Requirement */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div className='space-y-1.5'>
              <label className='text-xs font-semibold text-foreground'>
                Radius (meters)
              </label>
              <Input
                type='number'
                value={formData.radiusMeters || ''}
                onChange={(e) => {
                  const num = parseInt(e.target.value, 10) || 0
                  setFormData((prev) => ({ ...prev, radiusMeters: num }))
                }}
                placeholder='150'
                className='h-10 text-xs bg-background border border-input shadow-xs hover:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary rounded-xl'
              />
            </div>

            <div className='space-y-1.5'>
              <label className='text-xs font-semibold text-foreground'>
                Accuracy Requirement
              </label>
              <Input
                value={formData.accuracyRequirement}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    accuracyRequirement: e.target.value,
                  }))
                }
                placeholder='≤ 50 meters'
                className='h-10 text-xs bg-background border border-input shadow-xs hover:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary rounded-xl'
              />
            </div>
          </div>

          {/* Row 5: Employee Scope */}
          <div className='space-y-1.5'>
            <label className='text-xs font-semibold text-foreground'>
              Employee Scope
            </label>
            <Input
              value={formData.employeeScope}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, employeeScope: e.target.value }))
              }
              placeholder='e.g. Jakarta HQ employees / All Branch'
              className='h-10 text-xs bg-background border border-input shadow-xs hover:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary rounded-xl'
            />
          </div>

          {/* Row 6: Attendance Policy Callout Box */}
          <div className='rounded-xl border border-blue-200/80 bg-blue-50/70 p-4 dark:border-blue-900/60 dark:bg-blue-950/30'>
            <div className='flex items-start gap-2.5'>
              <IconInfoCircle className='size-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0' />
              <div>
                <h5 className='text-xs font-bold text-blue-950 dark:text-blue-300'>
                  Attendance Policy
                </h5>
                <p className='text-xs text-blue-900/90 dark:text-blue-300/90 mt-1 leading-relaxed'>
                  Employee hanya dapat Clock In/Out bila GPS berada di area ini dan lolos
                  device-integrity check.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Action Buttons */}
        <div className='flex items-center justify-end gap-3 pt-6 mt-6 border-t border-border/80'>
          <Button
            type='button'
            variant='outline'
            onClick={onCancel}
            className='h-9.5 px-5 text-xs font-semibold rounded-xl'
          >
            Cancel
          </Button>
          <Button
            type='submit'
            className='h-9.5 px-6 text-xs font-semibold rounded-xl shadow-xs'
          >
            {mode === 'edit' ? 'Save Changes' : 'Create Geofence'}
          </Button>
        </div>
      </div>

      {/* ── Right Column: Map Preview ─────────────────────────────────────── */}
      <div className='rounded-2xl border border-border/80 bg-card p-6 shadow-sm flex flex-col'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-sm font-bold text-foreground tracking-tight'>
            Map Preview
          </h3>
          <span className='text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 rounded-full'>
            {formData.radiusMeters}m radius
          </span>
        </div>

        <div className='relative flex-1 min-h-[420px] rounded-xl overflow-hidden border border-border/80'>
          <Map
            center={[formData.longitude || 106.8456, formData.latitude || -6.2088]}
            zoom={15}
            className='h-full w-full'
          >
            <MapControls position='top-right' />

            {/* Click to select/pick location on map */}
            <MapClickHandler
              onLocationSelect={(lat, lng) => {
                setFormData((prev) => ({
                  ...prev,
                  latitude: lat,
                  longitude: lng,
                }))
              }}
            />

            {/* Geodesic Geofence Radius Circle Layer */}
            <MapGeoJSON
              key={`circle-${formData.longitude}-${formData.latitude}-${formData.radiusMeters}`}
              data={createGeoJSONCircle(
                [formData.longitude || 106.8456, formData.latitude || -6.2088],
                formData.radiusMeters || 150,
              )}
              fillPaint={{
                'fill-color': '#3b82f6',
                'fill-opacity': 0.18,
              }}
              linePaint={{
                'line-color': '#2563eb',
                'line-width': 2,
              }}
            />

            <MapMarker
              longitude={formData.longitude || 106.8456}
              latitude={formData.latitude || -6.2088}
              draggable
              onDragEnd={(lngLat) => {
                setFormData((prev) => ({
                  ...prev,
                  longitude: Number(lngLat.lng.toFixed(6)),
                  latitude: Number(lngLat.lat.toFixed(6)),
                }))
              }}
            >
              <MarkerContent>
                <div className='relative flex items-center justify-center cursor-move select-none'>
                  {/* Prominent Geofence Radius Circle Boundary */}
                  <div
                    className='absolute rounded-full border-2 border-blue-500 bg-blue-500/20 pointer-events-none shadow-md'
                    style={{
                      width: `${Math.max(140, Math.min(300, (formData.radiusMeters || 150) * 1.1))}px`,
                      height: `${Math.max(140, Math.min(300, (formData.radiusMeters || 150) * 1.1))}px`,
                    }}
                  />

                  {/* Center Location Pin - Strictly centered on coordinate */}
                  <span className='relative flex size-9 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl border-2 border-white z-20'>
                    <IconMapPin size={20} />
                  </span>

                  {/* Info Tooltip Bubble floating underneath */}
                  <div className='absolute top-full mt-2 whitespace-nowrap rounded-lg bg-background/95 backdrop-blur-xs px-2.5 py-1 text-[11px] font-bold shadow-md border border-border/80 text-foreground z-30 text-center'>
                    <p className='text-blue-600 dark:text-blue-400 font-bold'>
                      {formData.locationName || 'Location'}
                    </p>
                    <p className='text-[10px] text-muted-foreground font-normal'>
                      {formData.radiusMeters || 150}m radius (Drag pin to move)
                    </p>
                  </div>
                </div>
              </MarkerContent>
            </MapMarker>
          </Map>
        </div>

        <div className='mt-3 flex items-center justify-between text-[11px] text-muted-foreground px-1'>
          <span>Lat: {formData.latitude}</span>
          <span>Lng: {formData.longitude}</span>
          <span>Acc: {formData.accuracyRequirement}</span>
        </div>
      </div>
    </form>
  )
}
