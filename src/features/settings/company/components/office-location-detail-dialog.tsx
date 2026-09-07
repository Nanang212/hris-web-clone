import {
  IconBuilding,
  IconBuildingSkyscraper,
  IconChevronLeft,
  IconChevronRight,
  IconCompass,
  IconFilter,
  IconMail,
  IconMapPin,
  IconSearch,
  IconTarget,
  IconUser,
  IconUsers,
} from '@tabler/icons-react'
import { useState, useMemo } from 'react'
import { getEmployeesForLocation } from '../data/mock-employees'
import type { OfficeLocation } from '../types'
import { Badge } from '@/shared/components/ui/badge'
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

interface OfficeLocationDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  location: OfficeLocation | null
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

/**
 * Generate a GeoJSON Polygon circle around [longitude, latitude] for geofence rendering
 */
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

export function OfficeLocationDetailDialog({
  open,
  onOpenChange,
  location,
}: OfficeLocationDetailDialogProps) {
  const [empSearch, setEmpSearch] = useState('')
  const [empPage, setEmpPage] = useState(1)
  const pageSize = 10

  const cityKey = location?.city?.toLowerCase()?.trim() || 'jakarta'
  const coords: [number, number] = useMemo(() => {
    if (!location) return [106.8456, -6.2088]
    if (location.longitude && location.latitude) {
      return [location.longitude, location.latitude]
    }
    return cityCoordinates[cityKey] || [106.8456, -6.2088]
  }, [location, cityKey])

  const geofenceCircle = useMemo(() => {
    return createGeoJSONCircle(coords, location?.geofenceRadius || 100)
  }, [coords, location?.geofenceRadius])

  // Get employee list matching the exact employeesCount
  const allEmployees = useMemo(() => {
    if (!location) return []
    return getEmployeesForLocation(location.id, location.name, location.employeesCount)
  }, [location])

  const filteredEmployees = useMemo(() => {
    if (!empSearch.trim()) return allEmployees
    const q = empSearch.toLowerCase()
    return allEmployees.filter(
      (emp) =>
        emp.name.toLowerCase().includes(q) ||
        emp.position.toLowerCase().includes(q) ||
        emp.department.toLowerCase().includes(q) ||
        emp.empCode.toLowerCase().includes(q),
    )
  }, [allEmployees, empSearch])

  const totalEmpPages = Math.ceil(filteredEmployees.length / pageSize) || 1
  const paginatedEmployees = useMemo(() => {
    const start = (empPage - 1) * pageSize
    return filteredEmployees.slice(start, start + pageSize)
  }, [filteredEmployees, empPage, pageSize])

  const handleSearchChange = (val: string) => {
    setEmpSearch(val)
    setEmpPage(1)
  }

  if (!location) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[580px] p-0 rounded-3xl overflow-hidden border-border/80'>
        {/* Header with extra padding-right (pr-14) so close button doesn't collide */}
        <div className='p-6 pr-14 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-background border-b border-border/80'>
          <div className='flex items-center justify-between gap-3'>
            <div className='flex items-center gap-3 min-w-0'>
              <div className='size-12 rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0 shadow-xs font-bold'>
                <IconBuildingSkyscraper size={24} />
              </div>
              <div className='min-w-0'>
                <DialogTitle className='text-base font-bold text-foreground truncate'>
                  {location.name}
                </DialogTitle>
                <DialogDescription className='text-xs text-muted-foreground mt-0.5'>
                  Kode: {location.code} · {location.city}
                </DialogDescription>
              </div>
            </div>

            <Badge
              variant='outline'
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase shrink-0 ${
                location.status === 'Active'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-muted text-muted-foreground border-border/80'
              }`}
            >
              {location.status}
            </Badge>
          </div>
        </div>

        {/* Content Body */}
        <div className='p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto'>
          {/* Main Info Grid */}
          <div className='grid grid-cols-2 gap-3.5 p-4 rounded-2xl bg-muted/30 border border-border/70'>
            <div>
              <span className='text-muted-foreground text-[11px] block font-medium'>
                Tipe Lokasi
              </span>
              <p className='font-bold text-foreground mt-0.5'>{location.type}</p>
            </div>
            <div>
              <span className='text-muted-foreground text-[11px] block font-medium'>
                Cabang Induk (Branch)
              </span>
              <p className='font-bold text-foreground mt-0.5'>{location.branchName}</p>
            </div>
            <div>
              <span className='text-muted-foreground text-[11px] block font-medium'>Kota</span>
              <p className='font-bold text-foreground mt-0.5'>{location.city}</p>
            </div>
            <div>
              <span className='text-muted-foreground text-[11px] block font-medium'>
                Karyawan Terdaftar
              </span>
              <p className='font-bold text-foreground mt-0.5 font-mono text-amber-600'>
                {location.employeesCount} orang
              </p>
            </div>
          </div>

          {/* Full Address */}
          <div className='p-3.5 rounded-xl border border-border/70 space-y-1 bg-card'>
            <div className='flex items-center gap-1.5 text-muted-foreground font-semibold text-[11px]'>
              <IconMapPin size={13} className='text-amber-600' />
              <span>Alamat Lengkap</span>
            </div>
            <p className='text-foreground font-medium leading-relaxed'>{location.address}</p>
          </div>

          {/* Interactive Map & Geofence Section */}
          <div className='p-3.5 rounded-2xl bg-card border border-border/80 space-y-3'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-1.5 text-amber-700 dark:text-amber-300 font-bold'>
                <IconTarget size={15} />
                <span>Peta Lokasi & Geofence Presensi</span>
              </div>
              <Badge
                variant='outline'
                className='font-mono font-bold text-[10px] bg-amber-500/10 text-amber-700 border-amber-300'
              >
                Radius: {location.geofenceRadius} m
              </Badge>
            </div>

            {/* MapLibre Map: Marker and Geofence Circle attach strictly to coordinates */}
            <div className='relative h-44 w-full rounded-xl overflow-hidden border border-border/70 shadow-inner'>
              <Map center={coords} zoom={15} className='h-full w-full'>
                <MapControls position='top-right' />

                {/* GeoJSON Geofence Layer */}
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

                {/* Marker with MarkerContent */}
                <MapMarker longitude={coords[0]} latitude={coords[1]}>
                  <MarkerContent>
                    <div className='flex items-center justify-center size-8 rounded-full bg-amber-600 text-white shadow-xl border-2 border-white ring-4 ring-amber-500/30'>
                      <IconMapPin size={16} />
                    </div>
                  </MarkerContent>
                </MapMarker>
              </Map>

              {/* Coordinates Pill */}
              <div className='absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-background/90 backdrop-blur-xs border border-border/70 text-[10px] font-mono text-foreground font-semibold shadow-xs z-10'>
                {coords[1].toFixed(4)}, {coords[0].toFixed(4)} · {location.city}
              </div>
            </div>
          </div>

          {/* ── Assigned Employees Section ──────────────────────────────── */}
          <div className='p-4 rounded-2xl bg-card border border-border/80 space-y-3'>
            <div className='flex items-center justify-between gap-2'>
              <div className='flex items-center gap-2'>
                <div className='size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold'>
                  <IconUsers size={15} />
                </div>
                <div>
                  <h4 className='font-bold text-foreground text-xs'>Daftar Karyawan di Lokasi Ini</h4>
                  <p className='text-[10px] text-muted-foreground'>
                    Karyawan aktif yang ditugaskan ke {location.name}
                  </p>
                </div>
              </div>
              <Badge
                variant='outline'
                className='font-mono font-bold text-[10px] bg-primary/10 text-primary border-primary/20 shrink-0'
              >
                Total: {allEmployees.length} Karyawan
              </Badge>
            </div>

            {/* Mini Search Input */}
            <div className='relative'>
              <IconSearch className='absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground' />
              <Input
                value={empSearch}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder='Cari nama, NIP, jabatan, atau divisi karyawan...'
                className='h-8 pl-8 text-[11px] rounded-xl bg-muted/20'
              />
            </div>

            {/* Scrollable Employee List */}
            <div className='divide-y divide-border/60 max-h-56 overflow-y-auto rounded-xl border border-border/70 bg-muted/10'>
              {filteredEmployees.length === 0 ? (
                <div className='py-6 text-center text-muted-foreground italic text-[11px]'>
                  Tidak ada karyawan yang sesuai kata kunci pencarian.
                </div>
              ) : (
                paginatedEmployees.map((emp) => (
                  <div
                    key={emp.id}
                    className='flex items-center justify-between p-2.5 hover:bg-muted/30 transition-colors'
                  >
                    <div className='flex items-center gap-2.5 min-w-0'>
                      <div className='size-8 rounded-full bg-primary/15 text-primary font-bold flex items-center justify-center text-[11px] shrink-0 border border-primary/20'>
                        {emp.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className='min-w-0'>
                        <div className='flex items-center gap-1.5'>
                          <p className='font-bold text-foreground text-[11px] truncate'>{emp.name}</p>
                          <span className='font-mono text-[9px] text-muted-foreground'>
                            ({emp.empCode})
                          </span>
                        </div>
                        <p className='text-[10px] text-muted-foreground truncate'>
                          {emp.position} · <span className='text-foreground font-medium'>{emp.department}</span>
                        </p>
                      </div>
                    </div>

                    <div className='flex items-center gap-2 shrink-0 ml-2'>
                      <Badge
                        variant='outline'
                        className={`text-[9px] px-1.5 py-0 font-bold rounded-md ${
                          emp.contractType === 'PKWTT'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : emp.contractType === 'PKWT'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {emp.contractType}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Mini Employee Pagination Toolbar */}
            {filteredEmployees.length > pageSize && (
              <div className='flex items-center justify-between pt-1 text-[10px] text-muted-foreground'>
                <span>
                  Menampilkan {(empPage - 1) * pageSize + 1}-
                  {Math.min(empPage * pageSize, filteredEmployees.length)} dari{' '}
                  <strong className='text-foreground font-mono font-bold'>{filteredEmployees.length}</strong> karyawan
                </span>
                <div className='flex items-center gap-1'>
                  <Button
                    type='button'
                    variant='outline'
                    size='icon'
                    disabled={empPage <= 1}
                    onClick={() => setEmpPage((p) => Math.max(1, p - 1))}
                    className='size-6 rounded-md'
                  >
                    <IconChevronLeft size={12} />
                  </Button>
                  <span className='px-1.5 font-mono font-medium'>
                    {empPage} / {totalEmpPages}
                  </span>
                  <Button
                    type='button'
                    variant='outline'
                    size='icon'
                    disabled={empPage >= totalEmpPages}
                    onClick={() => setEmpPage((p) => Math.min(totalEmpPages, p + 1))}
                    className='size-6 rounded-md'
                  >
                    <IconChevronRight size={12} />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer (Only Tutup button for read-only detail) */}
        <DialogFooter className='p-4 px-6 border-t border-border/80 bg-muted/10 flex items-center justify-end'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => onOpenChange(false)}
            className='rounded-xl h-9 text-xs px-5'
          >
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
