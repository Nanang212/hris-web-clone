import {
  IconBuilding,
  IconCompass,
  IconExternalLink,
  IconInfoCircle,
  IconMapPin,
  IconPencil,
  IconPlus,
  IconSearch,
  IconTarget,
  IconTrash,
  IconUsers,
} from '@tabler/icons-react'
import { useMemo, useState } from 'react'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Alert, AlertDescription, AlertIcon, AlertTitle } from '@/shared/components/ui/alert'
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
import { Checkbox } from '@/shared/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import {
  Map,
  MapControls,
  MapGeoJSON,
  MapMarker,
  MarkerContent,
} from '@/shared/components/ui/map'
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { Textarea } from '@/shared/components/ui/textarea'
import { snackbar } from '@/shared/lib/snackbar'
import { cn } from '@/shared/lib/utils'
import { getAttendanceBreadcrumbs } from '@/features/attendance/components/attendance-breadcrumbs'
import { AttendanceTabs } from '@/features/attendance/components/attendance-tabs'
import {
  useAttendanceLocationStore,
  type AttendanceLocation,
  type AttendanceLocationEmployee,
} from '@/features/attendance/data/attendance-location-store'

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

export function AttendanceLocationsPage() {
  const {
    locations,
    availableEmployees,
    addLocation,
    updateLocation,
    deleteLocation,
    parseCoordinatesInput,
  } = useAttendanceLocationStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [scopeFilter, setScopeFilter] = useState<'all' | 'specific' | 'any'>('any')

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingLocation, setEditingLocation] = useState<AttendanceLocation | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedDetailLocation, setSelectedDetailLocation] = useState<AttendanceLocation | null>(
    null,
  )

  // Form State
  const [addMethod, setAddMethod] = useState<'search' | 'coordinates'>('search')
  const [formName, setFormName] = useState('')
  const [formCode, setFormCode] = useState('')
  const [formCity, setFormCity] = useState('Jakarta')
  const [formAddress, setFormAddress] = useState('')
  const [formLatitude, setFormLatitude] = useState(-6.2088)
  const [formLongitude, setFormLongitude] = useState(106.8456)
  const [formRadius, setFormRadius] = useState(50)
  const [formScope, setFormScope] = useState<'all' | 'specific'>('specific')
  const [formAssignedEmployeeIds, setFormAssignedEmployeeIds] = useState<string[]>([])
  const [rawCoordPaste, setRawCoordPaste] = useState('')

  // Map Circle GeoJSON
  const mapCircleGeoJSON = useMemo(() => {
    return createGeoJSONCircle([formLongitude, formLatitude], formRadius)
  }, [formLongitude, formLatitude, formRadius])

  // Open Add Dialog
  const handleOpenAdd = () => {
    setEditingLocation(null)
    setAddMethod('search')
    setFormName('')
    setFormCode(`LOC-${Date.now().toString().slice(-4)}`)
    setFormCity('Jakarta')
    setFormAddress('')
    setFormLatitude(-6.2088)
    setFormLongitude(106.8456)
    setFormRadius(50)
    setFormScope('specific')
    setFormAssignedEmployeeIds([])
    setRawCoordPaste('')
    setDialogOpen(true)
  }

  // Open Edit Dialog
  const handleOpenEdit = (loc: AttendanceLocation) => {
    setEditingLocation(loc)
    setAddMethod('search')
    setFormName(loc.name)
    setFormCode(loc.code)
    setFormCity(loc.city)
    setFormAddress(loc.address)
    setFormLatitude(loc.latitude)
    setFormLongitude(loc.longitude)
    setFormRadius(loc.radius)
    setFormScope(loc.scope)
    setFormAssignedEmployeeIds(loc.assignedEmployees.map((e) => e.id))
    setRawCoordPaste(`${loc.latitude}, ${loc.longitude}`)
    setDialogOpen(true)
  }

  // Open Detail Dialog
  const handleOpenDetail = (loc: AttendanceLocation) => {
    setSelectedDetailLocation(loc)
    setDetailDialogOpen(true)
  }

  // Handle Paste / Parsing coordinates from WhatsApp shareloc or Google Maps
  const handleParseCoordinates = () => {
    const parsed = parseCoordinatesInput(rawCoordPaste)
    if (parsed) {
      setFormLatitude(parsed.lat)
      setFormLongitude(parsed.lng)
      snackbar.success(`Koordinat terdeteksi: Lat ${parsed.lat}, Lng ${parsed.lng}`)
    } else {
      snackbar.error('Format koordinat tidak valid. Contoh: -6.2088, 106.8456')
    }
  }

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim() || !formAddress.trim()) {
      snackbar.error('Nama Lokasi dan Alamat wajib diisi.')
      return
    }

    const assignedEmps: AttendanceLocationEmployee[] =
      formScope === 'all'
        ? []
        : availableEmployees.filter((emp) => formAssignedEmployeeIds.includes(emp.id))

    const payload = {
      code: formCode.trim() || `LOC-${Date.now().toString().slice(-4)}`,
      name: formName.trim(),
      city: formCity.trim(),
      address: formAddress.trim(),
      latitude: Number(formLatitude),
      longitude: Number(formLongitude),
      radius: Number(formRadius),
      scope: formScope,
      assignedEmployees: assignedEmps,
      assignedProjects: [],
      status: 'Active' as const,
    }

    if (editingLocation) {
      updateLocation(editingLocation.id, payload)
      snackbar.success(`Titik lokasi "${payload.name}" berhasil diperbarui.`)
    } else {
      addLocation(payload)
      snackbar.success(`Titik lokasi baru "${payload.name}" berhasil didaftarkan.`)
    }
    setDialogOpen(false)
  }

  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      if (scopeFilter !== 'any' && loc.scope !== scopeFilter) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          loc.name.toLowerCase().includes(q) ||
          loc.address.toLowerCase().includes(q) ||
          loc.city.toLowerCase().includes(q) ||
          loc.code.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [locations, scopeFilter, searchQuery])

  // Count employees who have multiple assigned locations
  const multiSiteEmployeeCount = useMemo(() => {
    const employeeLocationCount: Record<string, number> = {}
    locations.forEach((loc) => {
      loc.assignedEmployees.forEach((emp) => {
        employeeLocationCount[emp.id] = (employeeLocationCount[emp.id] || 0) + 1
      })
    })
    return Object.values(employeeLocationCount).filter((c) => c > 1).length
  }, [locations])

  return (
    <AppMain
      title='Lokasi Kehadiran'
      subtitle='Daftarkan titik lokasi geofence presensi masuk/pulang. Satu karyawan dapat memiliki banyak titik kehadiran (multi-site penempatan outsourcing).'
      breadcrumbs={getAttendanceBreadcrumbs('Lokasi Kehadiran')}
      className='gap-6 bg-muted/20'
      actions={
        <Button onClick={handleOpenAdd} className='gap-2 shadow-xs'>
          <IconPlus className='size-4' />
          Tambah Lokasi Baru
        </Button>
      }
    >
      <AttendanceTabs active='locations' />

      {/* Guide Alert Banner Sesuai Lampiran 3 (BAB 5-Lokasi Kehadiran) */}
      <Alert variant='info' className='border-amber-200 bg-amber-50/60 text-amber-950'>
        <AlertIcon>
          <IconInfoCircle className='size-5 text-amber-600' />
        </AlertIcon>
        <div className='min-w-0'>
          <AlertTitle className='font-semibold text-amber-950'>
            Pedoman Titik Lokasi Kehadiran (Sesuai Lampiran 3)
          </AlertTitle>
          <AlertDescription className='mt-1 text-xs leading-relaxed text-amber-900/90'>
            • <b>Fleksibilitas Tanpa Batas</b>: Jumlah lokasi yang didaftarkan tidak terbatas. Wajib
            memiliki minimal 1 lokasi aktif di akun perusahaan.
            <br />• <b>Radius Presensi</b>: Minimal radius 10 meter, maksimal disarankan 100 meter
            agar presensi akurat di dalam batas gedung/site.
            <br />• <b>Multi Titik per Karyawan</b>: Lokasi dapat berlaku untuk <b>Semua Karyawan</b>{' '}
            (Global) atau <b>Spesifik Karyawan Tertentu</b>. Karyawan lapangan/supervisi outsourcing
            dapat didaftarkan di beberapa titik site sekaligus sehingga bebas absen di lokasi mana
            pun yang ditugaskan.
          </AlertDescription>
        </div>
      </Alert>

      {/* Top Metric Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-muted-foreground'>Total Titik Lokasi</p>
            <h3 className='text-2xl font-black text-foreground mt-0.5'>{locations.length}</h3>
            <p className='text-[11px] text-muted-foreground mt-1'>Titik presensi terdaftar</p>
          </div>
          <div className='size-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0'>
            <IconMapPin size={22} />
          </div>
        </div>

        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-muted-foreground'>Multi-Site Personil</p>
            <h3 className='text-2xl font-black text-emerald-600 mt-0.5'>
              {multiSiteEmployeeCount} Karyawan
            </h3>
            <p className='text-[11px] text-muted-foreground mt-1'>Punya &gt;1 titik absensi</p>
          </div>
          <div className='size-11 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0'>
            <IconUsers size={22} />
          </div>
        </div>

        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-muted-foreground'>Titik Khusus Site</p>
            <h3 className='text-2xl font-black text-foreground mt-0.5'>
              {locations.filter((l) => l.scope === 'specific').length}
            </h3>
            <p className='text-[11px] text-muted-foreground mt-1'>Project / Client Site spesifik</p>
          </div>
          <div className='size-11 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0'>
            <IconTarget size={22} />
          </div>
        </div>

        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-muted-foreground'>Titik Company-Wide</p>
            <h3 className='text-2xl font-black text-foreground mt-0.5'>
              {locations.filter((l) => l.scope === 'all').length}
            </h3>
            <p className='text-[11px] text-muted-foreground mt-1'>Berlaku semua karyawan</p>
          </div>
          <div className='size-11 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0'>
            <IconBuilding size={22} />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/80 pb-3'>
        <div className='flex items-center gap-2'>
          <Select
            value={scopeFilter}
            onValueChange={(v) => setScopeFilter(v as 'all' | 'specific' | 'any')}
          >
            <SelectTrigger className='h-9 w-48 text-xs bg-background'>
              <SelectValue placeholder='Filter Cakupan' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='any'>Semua Cakupan</SelectItem>
              <SelectItem value='all'>Berlaku Semua Karyawan</SelectItem>
              <SelectItem value='specific'>Spesifik Karyawan / Site</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='relative w-full sm:w-80'>
          <IconSearch className='absolute left-3 top-2.5 size-4 text-muted-foreground' />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Cari nama kantor, jalan, atau daerah...'
            className='h-9 pl-9 text-xs bg-background'
          />
        </div>
      </div>

      {/* Grid of Location Cards */}
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3'>
        {filteredLocations.map((loc) => {
          const coords: [number, number] = [loc.longitude, loc.latitude]
          const circleGeoJSON = createGeoJSONCircle(coords, loc.radius)

          return (
            <Card
              key={loc.id}
              className='flex flex-col justify-between border-border/80 shadow-xs hover:border-primary/50 transition-all overflow-hidden'
            >
              {/* Mini Map Preview Header */}
              <div className='h-36 w-full relative bg-muted/40 border-b border-border/60 overflow-hidden'>
                <Map
                  center={coords}
                  zoom={15}
                  interactive={false}
                  attributionControl={false}
                  className='h-full w-full'
                >
                  <MapGeoJSON
                    data={circleGeoJSON}
                    fillPaint={{
                      'fill-color': '#3b82f6',
                      'fill-opacity': 0.25,
                    }}
                    linePaint={{
                      'line-color': '#2563eb',
                      'line-width': 2,
                    }}
                  />
                  <MapMarker longitude={coords[0]} latitude={coords[1]}>
                    <MarkerContent>
                      <div className='size-5 rounded-full bg-primary border-2 border-white shadow-md flex items-center justify-center text-white'>
                        <div className='size-1.5 rounded-full bg-white' />
                      </div>
                    </MarkerContent>
                  </MapMarker>
                </Map>

                {/* Floating Radius Badge on Map */}
                <div className='absolute bottom-2.5 left-2.5 bg-background/90 backdrop-blur-md px-2 py-1 rounded-lg border border-border/70 text-[10px] font-semibold text-foreground flex items-center gap-1.5 shadow-xs'>
                  <IconTarget className='size-3 text-primary' />
                  Radius: {loc.radius} meter
                </div>

                <div className='absolute top-2.5 right-2.5'>
                  {loc.scope === 'all' ? (
                    <Badge className='bg-blue-600/90 text-white backdrop-blur-md text-[10px] shadow-xs'>
                      Semua Karyawan
                    </Badge>
                  ) : (
                    <Badge className='bg-amber-600/90 text-white backdrop-blur-md text-[10px] shadow-xs'>
                      {loc.assignedEmployees.length} Karyawan Spesifik
                    </Badge>
                  )}
                </div>
              </div>

              <CardHeader className='pb-2 pt-4'>
                <div className='flex items-start justify-between gap-2'>
                  <div>
                    <Badge variant='outline' className='font-mono text-[10px] mb-1'>
                      {loc.code}
                    </Badge>
                    <CardTitle className='text-base font-bold text-foreground leading-tight'>
                      {loc.name}
                    </CardTitle>
                  </div>
                </div>
                <CardDescription className='text-xs text-muted-foreground line-clamp-2 mt-1'>
                  {loc.address}
                </CardDescription>
              </CardHeader>

              <CardContent className='space-y-3 pt-0'>
                {/* Meta details */}
                <div className='p-2.5 rounded-xl bg-muted/40 border border-border/60 text-xs space-y-1.5'>
                  <div className='flex items-center justify-between text-[11px]'>
                    <span className='text-muted-foreground'>Koordinat GPS:</span>
                    <span className='font-mono font-medium text-foreground'>
                      {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                    </span>
                  </div>
                  <div className='flex items-center justify-between text-[11px]'>
                    <span className='text-muted-foreground'>Kota / Wilayah:</span>
                    <span className='font-medium text-foreground'>{loc.city}</span>
                  </div>
                </div>

                {/* Assigned Personnel Snippet */}
                {loc.scope === 'specific' && (
                  <div>
                    <span className='text-[11px] font-semibold text-muted-foreground mb-1 block'>
                      Personil Diizinkan ({loc.assignedEmployees.length}):
                    </span>
                    <div className='flex flex-wrap gap-1'>
                      {loc.assignedEmployees.slice(0, 3).map((emp) => (
                        <Badge
                          key={emp.id}
                          variant='secondary'
                          className='text-[10px] font-normal py-0.5'
                        >
                          {emp.name}
                        </Badge>
                      ))}
                      {loc.assignedEmployees.length > 3 && (
                        <Badge variant='outline' className='text-[10px] py-0.5'>
                          +{loc.assignedEmployees.length - 3} lainnya
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className='border-t border-border/70 pt-3 flex items-center justify-between text-xs'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => handleOpenDetail(loc)}
                  className='h-8 px-2.5 text-xs text-primary gap-1'
                >
                  <IconExternalLink className='size-3.5' />
                  Lihat Detail
                </Button>
                <div className='flex items-center gap-1'>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => handleOpenEdit(loc)}
                    className='h-8 px-2 text-xs gap-1'
                  >
                    <IconPencil className='size-3.5' />
                    Edit
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => {
                      if (confirm(`Hapus titik lokasi "${loc.name}"?`)) {
                        deleteLocation(loc.id)
                        snackbar.success('Titik lokasi berhasil dihapus.')
                      }
                    }}
                    className='h-8 px-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50'
                  >
                    <IconTrash className='size-3.5' />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {/* ─── MODAL: TAMBAH / EDIT LOKASI KEHADIRAN (SESUAI LAMPIRAN 3) ──────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className='sm:max-w-[700px] max-h-[85vh] overflow-y-auto p-0 rounded-3xl'>
          <div className='p-6 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-background border-b border-border/80'>
            <div className='flex items-center gap-3'>
              <div className='size-11 rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0'>
                <IconMapPin size={22} />
              </div>
              <div>
                <DialogTitle className='text-base font-bold text-foreground'>
                  {editingLocation ? 'Ubah Titik Lokasi Kehadiran' : 'Tambah Titik Lokasi Baru'}
                </DialogTitle>
                <DialogDescription className='text-xs text-muted-foreground mt-0.5'>
                  Mendaftarkan lokasi acuan presensi GPS dengan radius geofence dan penetapan karyawan (Lampiran 3).
                </DialogDescription>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className='p-6 space-y-4 text-xs'>
            {/* Cara Input Pilihan: Sesuai Cara 1 & Cara 2 Lampiran 3 */}
            <div className='space-y-1.5'>
              <Label className='font-semibold'>Metode Input Lokasi (Sesuai Lampiran 3)</Label>
              <Tabs
                value={addMethod}
                onValueChange={(v) => setAddMethod(v as 'search' | 'coordinates')}
              >
                <TabsList className='grid grid-cols-2 w-full'>
                  <TabsTrigger value='search'>Cara 1: Search & Peta Langsung</TabsTrigger>
                  <TabsTrigger value='coordinates'>
                    Cara 2: Paste Koordinat (WhatsApp / Maps)
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Nama & Kode Lokasi */}
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
              <div className='sm:col-span-2 space-y-1.5'>
                <Label htmlFor='loc-name' className='font-semibold'>
                  Nama Titik Lokasi <span className='text-rose-500'>*</span>
                </Label>
                <Input
                  id='loc-name'
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder='Contoh: Client Site Menara Astra, Warehouse Cikarang'
                  className='h-9 bg-background'
                  required
                />
              </div>
              <div className='space-y-1.5'>
                <Label htmlFor='loc-code' className='font-semibold'>
                  Kode Lokasi
                </Label>
                <Input
                  id='loc-code'
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  placeholder='LOC-01'
                  className='h-9 bg-background font-mono'
                />
              </div>
            </div>

            {/* Jika Cara 2 dipilih: Paste Lat/Long dari WA Shareloc atau Google Maps */}
            {addMethod === 'coordinates' ? (
              <div className='p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3'>
                <div className='flex items-center gap-2 text-amber-950 font-bold'>
                  <IconCompass className='size-4 text-amber-600' />
                  Paste Koordinat Garis Lintang (Latitude) & Garis Bujur (Longitude)
                </div>
                <p className='text-[11px] text-amber-900'>
                  Salin koordinat dari Google Maps atau share location WhatsApp (Ciri: <code>-6.xxxxxxx, 106.xxxxxxx</code>) lalu klik 'Terapkan'.
                </p>
                <div className='flex gap-2'>
                  <Input
                    value={rawCoordPaste}
                    onChange={(e) => setRawCoordPaste(e.target.value)}
                    placeholder='Contoh: -6.2053, 106.8227'
                    className='h-9 bg-white font-mono text-xs'
                  />
                  <Button
                    type='button'
                    onClick={handleParseCoordinates}
                    size='sm'
                    className='h-9 px-4 shrink-0'
                  >
                    Terapkan
                  </Button>
                </div>
              </div>
            ) : null}

            {/* Lat, Long, City */}
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
              <div className='space-y-1.5'>
                <Label className='font-semibold'>Latitude (Garis Lintang)</Label>
                <Input
                  type='number'
                  step='any'
                  value={formLatitude}
                  onChange={(e) => setFormLatitude(Number(e.target.value))}
                  className='h-9 bg-background font-mono'
                />
              </div>
              <div className='space-y-1.5'>
                <Label className='font-semibold'>Longitude (Garis Bujur)</Label>
                <Input
                  type='number'
                  step='any'
                  value={formLongitude}
                  onChange={(e) => setFormLongitude(Number(e.target.value))}
                  className='h-9 bg-background font-mono'
                />
              </div>
              <div className='space-y-1.5'>
                <Label className='font-semibold'>Kota / Wilayah</Label>
                <Input
                  value={formCity}
                  onChange={(e) => setFormCity(e.target.value)}
                  placeholder='Jakarta Selatan'
                  className='h-9 bg-background'
                />
              </div>
            </div>

            {/* Alamat Lengkap */}
            <div className='space-y-1.5'>
              <Label className='font-semibold'>
                Alamat Lengkap Kantor / Site <span className='text-rose-500'>*</span>
              </Label>
              <Textarea
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
                placeholder='Tuliskan alamat lokasi (nama jalan, gedung, daerah)...'
                className='min-h-16 bg-background text-xs'
                required
              />
            </div>

            {/* Interactive Map Preview with Radius Geofence */}
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <Label className='font-semibold'>
                  Radius Titik Lokasi Presensi (Poin 6 Lampiran 3)
                </Label>
                <span className='font-bold text-primary font-mono'>{formRadius} Meter</span>
              </div>
              <div className='flex items-center gap-3'>
                <input
                  type='range'
                  min={10}
                  max={250}
                  step={5}
                  value={formRadius}
                  onChange={(e) => setFormRadius(Number(e.target.value))}
                  className='w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer'
                />
              </div>
              <p className='text-[11px] text-muted-foreground'>
                Rekomendasi radius: 10 ~ 100 meter agar karyawan wajib berada di sekitar area site saat clock-in.
              </p>

              <div className='h-48 w-full rounded-2xl overflow-hidden border border-border/80 relative mt-2'>
                <Map
                  center={[formLongitude, formLatitude]}
                  zoom={15}
                  className='h-full w-full'
                >
                  <MapControls />
                  <MapGeoJSON
                    data={mapCircleGeoJSON}
                    fillPaint={{
                      'fill-color': '#f59e0b',
                      'fill-opacity': 0.25,
                    }}
                    linePaint={{
                      'line-color': '#d97706',
                      'line-width': 2,
                    }}
                  />
                  <MapMarker longitude={formLongitude} latitude={formLatitude}>
                    <MarkerContent>
                      <div className='size-5 rounded-full bg-amber-500 border-2 border-white shadow-lg flex items-center justify-center text-white'>
                        <div className='size-1.5 rounded-full bg-white' />
                      </div>
                    </MarkerContent>
                  </MapMarker>
                </Map>
              </div>
            </div>

            {/* Pengaturan Multi Titik Kehadiran untuk Karyawan (Poin 4 Lampiran 3) */}
            <div className='p-4 rounded-2xl border border-border/80 bg-muted/30 space-y-3'>
              <Label className='font-semibold text-foreground block'>
                Cakupan Penugasan Lokasi (Poin 4 Lampiran 3)
              </Label>
              <RadioGroup
                value={formScope}
                onValueChange={(v) => setFormScope(v as 'all' | 'specific')}
                className='grid grid-cols-1 sm:grid-cols-2 gap-3'
              >
                <label
                  className={cn(
                    'flex items-start gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-colors',
                    formScope === 'all'
                      ? 'bg-primary/5 border-primary text-foreground font-medium'
                      : 'border-border/60 hover:bg-muted/50 text-muted-foreground',
                  )}
                >
                  <RadioGroupItem value='all' id='scope-all' className='mt-0.5' />
                  <div>
                    <span className='font-bold text-foreground block'>Semua Karyawan</span>
                    <span className='text-[10px] leading-tight block text-muted-foreground mt-0.5'>
                      Semua personil perusahaan diizinkan absen di titik ini (misal: Head Office).
                    </span>
                  </div>
                </label>

                <label
                  className={cn(
                    'flex items-start gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-colors',
                    formScope === 'specific'
                      ? 'bg-primary/5 border-primary text-foreground font-medium'
                      : 'border-border/60 hover:bg-muted/50 text-muted-foreground',
                  )}
                >
                  <RadioGroupItem value='specific' id='scope-specific' className='mt-0.5' />
                  <div>
                    <span className='font-bold text-foreground block'>
                      Spesifik Karyawan / Site
                    </span>
                    <span className='text-[10px] leading-tight block text-muted-foreground mt-0.5'>
                      Hanya personil terpilih (1 karyawan bisa didaftarkan di banyak titik).
                    </span>
                  </div>
                </label>
              </RadioGroup>

              {/* Personnel Multi-Selector if Specific */}
              {formScope === 'specific' && (
                <div className='pt-2 space-y-2'>
                  <div className='flex items-center justify-between'>
                    <span className='text-[11px] font-semibold text-foreground'>
                      Pilih Karyawan yang Berhak Absen ({formAssignedEmployeeIds.length} dipilih):
                    </span>
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={() => {
                        if (formAssignedEmployeeIds.length === availableEmployees.length) {
                          setFormAssignedEmployeeIds([])
                        } else {
                          setFormAssignedEmployeeIds(availableEmployees.map((e) => e.id))
                        }
                      }}
                      className='h-6 text-[10px]'
                    >
                      {formAssignedEmployeeIds.length === availableEmployees.length
                        ? 'Deselect All'
                        : 'Select All'}
                    </Button>
                  </div>

                  <div className='max-h-36 overflow-y-auto border border-border/80 rounded-xl p-2 space-y-1.5 bg-background'>
                    {availableEmployees.map((emp) => {
                      const isChecked = formAssignedEmployeeIds.includes(emp.id)
                      return (
                        <label
                          key={emp.id}
                          className={cn(
                            'flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-colors',
                            isChecked ? 'bg-primary/5 border-primary/30' : 'border-border/50 hover:bg-muted/40',
                          )}
                        >
                          <div className='flex items-center gap-2'>
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={(c) => {
                                if (c) {
                                  setFormAssignedEmployeeIds([...formAssignedEmployeeIds, emp.id])
                                } else {
                                  setFormAssignedEmployeeIds(
                                    formAssignedEmployeeIds.filter((id) => id !== emp.id),
                                  )
                                }
                              }}
                            />
                            <div>
                              <span className='font-semibold text-foreground block text-xs'>
                                {emp.name}
                              </span>
                              <span className='text-[10px] text-muted-foreground'>
                                {emp.nik} · {emp.project}
                              </span>
                            </div>
                          </div>
                          <Badge variant='outline' className='text-[10px]'>
                            {emp.department}
                          </Badge>
                        </label>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className='pt-2'>
              <Button type='button' variant='outline' onClick={() => setDialogOpen(false)}>
                Batal
              </Button>
              <Button type='submit' className='bg-amber-600 hover:bg-amber-700 text-white'>
                Simpan Titik Lokasi
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── MODAL DETAIL TITIK LOKASI ───────────────────────────────────────── */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        {selectedDetailLocation && (
          <DialogContent className='sm:max-w-[620px] max-h-[85vh] overflow-y-auto p-0 rounded-3xl'>
            <div className='h-48 w-full relative bg-muted/50 border-b border-border/80'>
              <Map
                center={[selectedDetailLocation.longitude, selectedDetailLocation.latitude]}
                zoom={15}
                className='h-full w-full'
              >
                <MapControls />
                <MapGeoJSON
                  data={createGeoJSONCircle(
                    [selectedDetailLocation.longitude, selectedDetailLocation.latitude],
                    selectedDetailLocation.radius,
                  )}
                  fillPaint={{
                    'fill-color': '#3b82f6',
                    'fill-opacity': 0.25,
                  }}
                  linePaint={{
                    'line-color': '#2563eb',
                    'line-width': 2,
                  }}
                />
                <MapMarker
                  longitude={selectedDetailLocation.longitude}
                  latitude={selectedDetailLocation.latitude}
                >
                  <MarkerContent>
                    <div className='size-6 rounded-full bg-primary border-2 border-white shadow-xl flex items-center justify-center text-white'>
                      <div className='size-2 rounded-full bg-white' />
                    </div>
                  </MarkerContent>
                </MapMarker>
              </Map>
              <div className='absolute bottom-3 left-3 bg-background/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-border/80 text-xs font-semibold text-foreground flex items-center gap-1.5 shadow-sm'>
                <IconTarget className='size-4 text-primary' />
                Radius: {selectedDetailLocation.radius} meter
              </div>
            </div>

            <div className='p-6 space-y-4 text-xs'>
              <div>
                <div className='flex items-center gap-2'>
                  <Badge variant='outline' className='font-mono'>
                    {selectedDetailLocation.code}
                  </Badge>
                  {selectedDetailLocation.scope === 'all' ? (
                    <Badge className='bg-blue-600 text-white text-[10px]'>Semua Karyawan</Badge>
                  ) : (
                    <Badge className='bg-amber-600 text-white text-[10px]'>
                      Khusus Personil Tertentu
                    </Badge>
                  )}
                </div>
                <h3 className='text-lg font-bold text-foreground mt-1'>
                  {selectedDetailLocation.name}
                </h3>
                <p className='text-xs text-muted-foreground mt-0.5'>
                  {selectedDetailLocation.address}
                </p>
              </div>

              <div className='grid grid-cols-2 gap-3 p-3 rounded-2xl bg-muted/40 border border-border/60'>
                <div>
                  <span className='text-[11px] text-muted-foreground block'>Koordinat Lintang</span>
                  <span className='font-mono font-semibold'>{selectedDetailLocation.latitude}</span>
                </div>
                <div>
                  <span className='text-[11px] text-muted-foreground block'>Koordinat Bujur</span>
                  <span className='font-mono font-semibold'>
                    {selectedDetailLocation.longitude}
                  </span>
                </div>
              </div>

              {selectedDetailLocation.scope === 'specific' ? (
                <div className='space-y-2'>
                  <span className='font-semibold text-foreground block'>
                    Daftar Karyawan Terdaftar di Titik Ini (
                    {selectedDetailLocation.assignedEmployees.length}):
                  </span>
                  <div className='space-y-1.5 max-h-48 overflow-y-auto border border-border/70 rounded-xl p-2'>
                    {selectedDetailLocation.assignedEmployees.map((emp) => (
                      <div
                        key={emp.id}
                        className='flex items-center justify-between p-2 rounded-lg bg-background border border-border/50 text-xs'
                      >
                        <div>
                          <span className='font-semibold block text-foreground'>{emp.name}</span>
                          <span className='text-[10px] text-muted-foreground font-mono'>
                            {emp.nik} · {emp.department}
                          </span>
                        </div>
                        <Badge variant='outline' className='text-[10px]'>
                          {emp.project}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <Alert variant='info' className='bg-blue-50/50 border-blue-200 text-blue-900'>
                  <AlertIcon>
                    <IconInfoCircle className='size-4 text-blue-600' />
                  </AlertIcon>
                  <AlertDescription className='text-xs'>
                    Titik lokasi ini bersifat <b>Company-Wide</b> (terbuka untuk seluruh karyawan
                    perusahaan). Setiap personil yang berada di dalam radius dapat melakukan
                    clock-in/out tanpa batasan penugasan.
                  </AlertDescription>
                </Alert>
              )}

              <DialogFooter className='pt-2'>
                <Button variant='outline' onClick={() => setDetailDialogOpen(false)}>
                  Tutup
                </Button>
                <Button
                  onClick={() => {
                    setDetailDialogOpen(false)
                    handleOpenEdit(selectedDetailLocation)
                  }}
                  className='gap-1.5'
                >
                  <IconPencil className='size-3.5' />
                  Edit Titik Ini
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </AppMain>
  )
}
