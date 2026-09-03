import {
  IconBuilding,
  IconCheck,
  IconCompass,
  IconMapPin,
  IconRadioactive,
  IconTarget,
  IconX,
} from '@tabler/icons-react'
import { useState, useEffect, useMemo } from 'react'
import { useCompanyStore } from '../data/company-store'
import type { OfficeLocation, OfficeLocationType, OfficeStatus } from '../types'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import {
  Map,
  MapControls,
  MapGeoJSON,
  MapMarker,
  MarkerContent,
} from '@/shared/components/ui/map'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Textarea } from '@/shared/components/ui/textarea'
import { snackbar } from '@/shared/lib/snackbar'

interface OfficeLocationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  locationToEdit?: OfficeLocation | null
}

const cityCoordinates: Record<string, [number, number]> = {
  jakarta: [106.8456, -6.2088],
  surabaya: [112.7521, -7.2575],
  bandung: [107.6191, -6.9175],
  singapore: [103.8519, 1.2843],
  bekasi: [107.1685, -6.3688],
  cikarang: [107.1685, -6.3688],
  denpasar: [115.2126, -8.6705],
  bali: [115.2126, -8.6705],
  medan: [98.6722, 3.5952],
  yogyakarta: [110.3695, -7.7956],
}

function createGeoJSONCircle(
  center: [number, number],
  radiusInMeters: number,
  points = 64,
): GeoJSON.Feature<GeoJSON.Polygon> {
  const [lng, lat] = center
  const coords: [number, number][] = []
  const distanceX = radiusInMeters / (111.32 * 1000 * Math.cos((lat * Math.PI) / 180))
  const distanceY = radiusInMeters / (110.574 * 1000)

  for (let i = 0; i <= points; i++) {
    const theta = (i / points) * (2 * Math.PI)
    const x = distanceX * Math.cos(theta)
    const y = distanceY * Math.sin(theta)
    coords.push([lng + x, lat + y])
  }

  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [coords],
    },
  }
}

export function OfficeLocationDialog({
  open,
  onOpenChange,
  locationToEdit,
}: OfficeLocationDialogProps) {
  const { branches, addLocation, updateLocation } = useCompanyStore()

  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [branchName, setBranchName] = useState('Jakarta HQ')
  const [type, setType] = useState<OfficeLocationType>('Branch')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [geofenceRadius, setGeofenceRadius] = useState(100)
  const [status, setStatus] = useState<OfficeStatus>('Active')
  const [showMapPreview, setShowMapPreview] = useState(false)

  useEffect(() => {
    if (locationToEdit) {
      setName(locationToEdit.name)
      setCode(locationToEdit.code)
      setBranchName(locationToEdit.branchName)
      setType(locationToEdit.type)
      setCity(locationToEdit.city)
      setAddress(locationToEdit.address)
      setGeofenceRadius(locationToEdit.geofenceRadius)
      setStatus(locationToEdit.status)
    } else {
      setName('')
      setCode('')
      setBranchName(branches[0]?.name || 'Jakarta HQ')
      setType('Branch')
      setCity('')
      setAddress('')
      setGeofenceRadius(100)
      setStatus('Active')
    }
    setShowMapPreview(false)
  }, [locationToEdit, open, branches])

  const cityKey = city.toLowerCase().trim()
  const coords: [number, number] = cityCoordinates[cityKey] || [106.8456, -6.2088]

  const geofenceCircle = useMemo(() => {
    return createGeoJSONCircle(coords, geofenceRadius)
  }, [coords, geofenceRadius])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !city.trim() || !address.trim()) {
      snackbar.error('Mohon lengkapi seluruh kolom wajib.')
      return
    }

    const locCode = code.trim() ? code.toUpperCase() : name.slice(0, 3).toUpperCase()

    if (locationToEdit) {
      updateLocation(locationToEdit.id, {
        name,
        code: locCode,
        branchName,
        type,
        city,
        address,
        geofenceRadius,
        status,
        latitude: coords[1],
        longitude: coords[0],
      })
      snackbar.success(`Lokasi kantor ${name} berhasil diperbarui.`)
    } else {
      addLocation({
        name,
        code: locCode,
        branchName,
        type,
        city,
        address,
        employeesCount: 0,
        geofenceRadius,
        status,
        latitude: coords[1],
        longitude: coords[0],
      })
      snackbar.success(`Lokasi kantor baru ${name} berhasil ditambahkan.`)
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[540px] p-0 rounded-3xl overflow-hidden border-border/80'>
        {/* Header with extra padding-right (pr-14) so close button doesn't collide */}
        <div className='p-6 pr-14 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-background border-b border-border/80'>
          <div className='flex items-center gap-3'>
            <div className='size-12 rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0 shadow-xs'>
              <IconMapPin size={24} />
            </div>
            <div>
              <DialogTitle className='text-base font-bold text-foreground'>
                {locationToEdit ? 'Edit Office Location' : 'Add Office Location'}
              </DialogTitle>
              <DialogDescription className='text-xs text-muted-foreground mt-0.5'>
                Create a new work location and attendance geofence.
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className='p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto'>
          {/* Location Name */}
          <div className='space-y-1.5'>
            <label className='font-semibold text-foreground'>Location Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='e.g. Yogyakarta Office'
              className='h-9 rounded-xl text-xs bg-background'
              required
            />
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3.5'>
            {/* Linked Branch */}
            <div className='space-y-1.5'>
              <label className='font-semibold text-foreground'>Linked Branch</label>
              <Select value={branchName} onValueChange={setBranchName}>
                <SelectTrigger className='h-9 rounded-xl text-xs bg-background'>
                  <SelectValue placeholder='Select branch' />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.name}>
                      {b.name}
                    </SelectItem>
                  ))}
                  <SelectItem value='Yogyakarta Branch'>Yogyakarta Branch</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location Type */}
            <div className='space-y-1.5'>
              <label className='font-semibold text-foreground'>Location Type</label>
              <Select value={type} onValueChange={(val: any) => setType(val)}>
                <SelectTrigger className='h-9 rounded-xl text-xs bg-background'>
                  <SelectValue placeholder='Select type' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='Head Office'>Head Office</SelectItem>
                  <SelectItem value='Branch'>Branch</SelectItem>
                  <SelectItem value='Regional'>Regional</SelectItem>
                  <SelectItem value='Warehouse'>Warehouse</SelectItem>
                  <SelectItem value='Remote Hub'>Remote Hub</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* City */}
            <div className='space-y-1.5'>
              <label className='font-semibold text-foreground'>City</label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder='e.g. Yogyakarta'
                className='h-9 rounded-xl text-xs bg-background'
                required
              />
            </div>

            {/* Location Code */}
            <div className='space-y-1.5'>
              <label className='font-semibold text-foreground'>Location Code</label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder='e.g. YGY'
                className='h-9 rounded-xl text-xs font-mono uppercase bg-background'
              />
            </div>
          </div>

          {/* Address */}
          <div className='space-y-1.5'>
            <label className='font-semibold text-foreground'>Full Address</label>
            <Textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder='e.g. Jl. Malioboro No. 50, Gedong Tengen, Kota Yogyakarta'
              className='rounded-xl text-xs bg-background'
              required
            />
          </div>

          {/* Geofence Radius */}
          <div className='space-y-2 p-3.5 rounded-2xl bg-muted/30 border border-border/80'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-1.5'>
                <IconTarget size={15} className='text-amber-600' />
                <span className='font-bold text-foreground text-xs'>Geofence Radius</span>
              </div>
              <span className='font-mono font-bold text-xs text-amber-600'>
                {geofenceRadius} meter
              </span>
            </div>

            <input
              type='range'
              min='50'
              max='500'
              step='10'
              value={geofenceRadius}
              onChange={(e) => setGeofenceRadius(Number(e.target.value))}
              className='w-full accent-amber-600 cursor-pointer h-1.5 bg-muted rounded-lg'
            />

            <div className='flex items-center justify-between text-[10px] text-muted-foreground pt-1'>
              <span>Min: 50m (Presisi Kantor)</span>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => setShowMapPreview(!showMapPreview)}
                className='h-6 text-[10px] rounded-lg px-2 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
              >
                {showMapPreview ? 'Sembunyikan Map' : 'Map & Geofence Preview'}
              </Button>
            </div>

            {/* Interactive MapLibre Map Preview */}
            {showMapPreview && (
              <div className='relative mt-2.5 h-44 rounded-xl overflow-hidden border border-border/80 shadow-inner'>
                <Map center={coords} zoom={15} className='h-full w-full'>
                  <MapControls position='top-right' />
                  <MapGeoJSON
                    data={geofenceCircle}
                    fillPaint={{
                      'fill-color': '#d97706',
                      'fill-opacity': 0.22,
                    }}
                    linePaint={{
                      'line-color': '#d97706',
                      'line-width': 2,
                      'line-dasharray': [2, 2],
                    }}
                  />
                  <MapMarker longitude={coords[0]} latitude={coords[1]}>
                    <MarkerContent>
                      <div className='flex items-center justify-center size-8 rounded-full bg-amber-600 text-white shadow-xl border-2 border-white ring-4 ring-amber-500/30'>
                        <IconMapPin size={16} />
                      </div>
                    </MarkerContent>
                  </MapMarker>
                </Map>
                <div className='absolute bottom-2 left-2 px-2.5 py-0.5 rounded-lg bg-background/90 backdrop-blur-xs border border-border/70 text-[9px] font-mono text-foreground font-semibold shadow-xs z-10'>
                  {city || 'Lokasi'} · Radius: {geofenceRadius}m
                </div>
              </div>
            )}
          </div>

          {/* Status */}
          <div className='flex items-center justify-between pt-1'>
            <label className='font-semibold text-foreground text-xs'>Status Lokasi</label>
            <div className='flex items-center gap-2'>
              <button
                type='button'
                onClick={() => setStatus('Active')}
                className={`px-3 py-1 rounded-xl text-xs font-bold border transition-colors ${
                  status === 'Active'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-muted/40 text-muted-foreground border-border/80'
                }`}
              >
                Active
              </button>
              <button
                type='button'
                onClick={() => setStatus('Inactive')}
                className={`px-3 py-1 rounded-xl text-xs font-bold border transition-colors ${
                  status === 'Inactive'
                    ? 'bg-rose-50 text-rose-700 border-rose-300'
                    : 'bg-muted/40 text-muted-foreground border-border/80'
                }`}
              >
                Inactive
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <DialogFooter className='p-4 -mx-6 -mb-6 border-t border-border/80 bg-muted/10 flex items-center justify-between'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => onOpenChange(false)}
              className='rounded-xl h-9 text-xs'
            >
              Cancel
            </Button>
            <Button
              type='submit'
              size='sm'
              className='rounded-xl h-9 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white gap-1.5 shadow-xs'
            >
              <IconCheck size={14} />
              Save Location
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
