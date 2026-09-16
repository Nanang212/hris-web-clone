import { zodResolver } from '@hookform/resolvers/zod'
import {
  IconLoader2,
  IconMapPin,
  IconPlus,
  IconSearch,
  IconTrash,
} from '@tabler/icons-react'
import { Link, useNavigate } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Controller,
  type FieldError,
  useFieldArray,
  useForm,
  type UseFormRegister,
  type UseFormSetValue,
  useWatch,
} from 'react-hook-form'
import { z } from 'zod'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { DatePicker } from '@/shared/components/ui/date-picker'
import { Field, FieldError as UIFieldError, FieldGroup, FieldLabel } from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import { Map, MapControls, MapMarker, MarkerContent, useMap } from '@/shared/components/ui/map'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Textarea } from '@/shared/components/ui/textarea'
import { useSchema } from '@/shared/lib/schema'
import { snackbar } from '@/shared/lib/snackbar'
import { useClients } from '@/features/company/client/data/dummy-clients'
import { useGetEmployees } from '@/features/employment/employee/hooks'
import { m } from '@/i18n/paraglide/messages'

import { addProject, updateProject, useProjects } from '../data/dummy-projects'
import type { Project, ProjectStatus } from '../types'

interface ProjectFormPageProps {
  projectId?: string
}

// Geocoding helper functions
async function searchAddressGeocode(
  query: string,
): Promise<{ lat: number; lng: number; displayName: string } | null> {
  if (!query || query.trim().length < 3) return null
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query.trim(),
      )}&limit=1&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'id,en',
        },
      },
    )
    if (!res.ok) return null
    const data = await res.json()
    if (Array.isArray(data) && data.length > 0) {
      return {
        lat: Number.parseFloat(data[0].lat),
        lng: Number.parseFloat(data[0].lon),
        displayName: data[0].display_name,
      }
    }
  } catch (error) {
    console.error('Failed to search address:', error)
  }
  return null
}

async function reverseGeocodeCoords(lat: number, lng: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'id,en',
        },
      },
    )
    if (!res.ok) return null
    const data = await res.json()
    if (data?.display_name) {
      return data.display_name
    }
  } catch (error) {
    console.error('Failed to reverse geocode coordinate:', error)
  }
  return null
}

// Map event listener & viewport controller component
function MapEventsController({
  onClick,
  center,
}: {
  onClick?: (coords: { lat: number; lng: number }) => void
  center?: [number, number]
}) {
  const { map } = useMap()

  useEffect(() => {
    if (!map) return
    const timer = setTimeout(() => {
      map.resize()
    }, 120)
    return () => clearTimeout(timer)
  }, [map])

  useEffect(() => {
    if (!map || !onClick) return
    const handleClick = (e: { lngLat: { lat: number; lng: number } }) => {
      onClick({ lat: e.lngLat.lat, lng: e.lngLat.lng })
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(map as any).on('click', handleClick)
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(map as any).off('click', handleClick)
    }
  }, [map, onClick])

  const centerLng = center?.[0]
  const centerLat = center?.[1]

  useEffect(() => {
    if (!map || centerLng === undefined || centerLat === undefined) return
    map.flyTo({ center: [centerLng, centerLat], zoom: Math.max(map.getZoom() || 14, 14), duration: 800 })
  }, [map, centerLng, centerLat])

  return null
}

type FormValues = {
  clientId: string
  code: string
  name: string
  description?: string
  industryField?: string
  startDate: string
  endDate?: string
  status: 'PLANNING' | 'ONGOING' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED'
  employeeIds?: string[]
  assignmentStartDate?: string
  assignmentEndDate?: string
  addresses: Array<{
    address: string
    latitude?: string
    longitude?: string
    geofenceRadiusMeters?: string
  }>
}

function buildNewProject(values: FormValues): Project {
  const timestamp = Date.now()
  const nowIso = new Date().toISOString()
  return {
    id: `project-${timestamp}`,
    clientId: values.clientId,
    code: values.code,
    name: values.name,
    description: values.description || null,
    industryField: values.industryField || null,
    startDate: values.startDate,
    endDate: values.endDate || null,
    status: values.status,
    employeeIds: values.employeeIds || [],
    assignmentStartDate: values.assignmentStartDate || null,
    assignmentEndDate: values.assignmentEndDate || null,
    addresses: values.addresses.map((addr, idx) => ({
      id: `addr-${timestamp}-${idx}`,
      address: addr.address,
      latitude: addr.latitude ? Number.parseFloat(addr.latitude) : null,
      longitude: addr.longitude ? Number.parseFloat(addr.longitude) : null,
      geofenceRadiusMeters: addr.geofenceRadiusMeters
        ? Number.parseInt(addr.geofenceRadiusMeters, 10)
        : null,
    })),
    createdAt: nowIso,
    updatedAt: nowIso,
  }
}

function buildUpdatedProject(values: FormValues): Partial<Project> {
  const timestamp = Date.now()
  return {
    clientId: values.clientId,
    code: values.code,
    name: values.name,
    description: values.description || null,
    industryField: values.industryField || null,
    startDate: values.startDate,
    endDate: values.endDate || null,
    status: values.status,
    employeeIds: values.employeeIds || [],
    assignmentStartDate: values.assignmentStartDate || null,
    assignmentEndDate: values.assignmentEndDate || null,
    addresses: values.addresses.map((addr, idx) => ({
      id: `addr-${timestamp}-${idx}`,
      address: addr.address,
      latitude: addr.latitude ? Number.parseFloat(addr.latitude) : null,
      longitude: addr.longitude ? Number.parseFloat(addr.longitude) : null,
      geofenceRadiusMeters: addr.geofenceRadiusMeters
        ? Number.parseInt(addr.geofenceRadiusMeters, 10)
        : null,
    })),
  }
}

interface ProjectLocationItemProps {
  index: number
  fieldId: string
  canRemove: boolean
  onRemove: () => void
  register: UseFormRegister<FormValues>
  setValue: UseFormSetValue<FormValues>
  watchAddress?: string
  watchLatitude?: string
  watchLongitude?: string
  errorAddress?: FieldError
}

function ProjectLocationItem({
  index,
  fieldId,
  canRemove,
  onRemove,
  register,
  setValue,
  watchAddress = '',
  watchLatitude = '',
  watchLongitude = '',
  errorAddress,
}: Readonly<ProjectLocationItemProps>) {
  const [isSearching, setIsSearching] = useState(false)
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  const latNum = Number.parseFloat(watchLatitude) || -6.2247
  const lngNum = Number.parseFloat(watchLongitude) || 106.8099

  // Debounced forward geocoding on address typing
  const handleAddressChange = (text: string) => {
    setValue(`addresses.${index}.address`, text, { shouldValidate: true })

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    if (!text || text.trim().length < 4) return

    debounceTimerRef.current = setTimeout(async () => {
      setIsSearching(true)
      const result = await searchAddressGeocode(text)
      if (result) {
        setValue(`addresses.${index}.latitude`, result.lat.toFixed(6), { shouldValidate: true })
        setValue(`addresses.${index}.longitude`, result.lng.toFixed(6), { shouldValidate: true })
      }
      setIsSearching(false)
    }, 1000)
  }

  // Search location handler
  const handleManualSearch = async (queryToSearch: string) => {
    const q = queryToSearch.trim()
    if (!q) return
    setIsSearching(true)
    const result = await searchAddressGeocode(q)
    if (result) {
      setValue(`addresses.${index}.address`, result.displayName, { shouldValidate: true })
      setValue(`addresses.${index}.latitude`, result.lat.toFixed(6), { shouldValidate: true })
      setValue(`addresses.${index}.longitude`, result.lng.toFixed(6), { shouldValidate: true })
    } else {
      snackbar.error('Lokasi tidak ditemukan. Coba gunakan nama tempat atau kata kunci yang lebih spesifik.')
    }
    setIsSearching(false)
  }

  // Reverse geocoding on map click or marker drag
  const handleMapPointSelect = async (coords: { lat: number; lng: number }) => {
    setValue(`addresses.${index}.latitude`, coords.lat.toFixed(6), { shouldValidate: true })
    setValue(`addresses.${index}.longitude`, coords.lng.toFixed(6), { shouldValidate: true })

    setIsReverseGeocoding(true)
    const resolved = await reverseGeocodeCoords(coords.lat, coords.lng)
    if (resolved) {
      setValue(`addresses.${index}.address`, resolved, { shouldValidate: true })
    }
    setIsReverseGeocoding(false)
  }

  return (
    <div className='rounded-2xl border border-border/70 bg-card p-5 shadow-xs space-y-4'>
      {/* Location Header */}
      <div className='flex items-center justify-between pb-3 border-b border-border/40'>
        <div className='flex items-center gap-2.5'>
          <div className='flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-xs'>
            <IconMapPin className='size-4' />
          </div>
          <div>
            <h4 className='text-sm font-semibold text-foreground'>
              {m.company_project_address_number({ number: index + 1 })}
            </h4>
            <p className='text-xs text-muted-foreground'>
              Tentukan alamat dan titik koordinat proyek
            </p>
          </div>
          {isSearching && (
            <span className='ml-2 inline-flex items-center gap-1.5 text-xs text-primary font-medium animate-pulse'>
              <IconLoader2 className='size-3.5 animate-spin' />
              Mencari lokasi...
            </span>
          )}
          {isReverseGeocoding && (
            <span className='ml-2 inline-flex items-center gap-1.5 text-xs text-primary font-medium animate-pulse'>
              <IconLoader2 className='size-3.5 animate-spin' />
              Mendeteksi alamat dari peta...
            </span>
          )}
        </div>
        {canRemove && (
          <Button
            type='button'
            variant='ghost'
            size='icon-sm'
            onClick={onRemove}
            className='text-muted-foreground hover:text-destructive'
            aria-label={m.company_project_remove_address()}
          >
            <IconTrash className='size-4' />
          </Button>
        )}
      </div>

      {/* 2-Column Grid: Form Inputs (Left) and Live Interactive Map (Right) */}
      <div className='grid gap-5 lg:grid-cols-12 items-start'>
        {/* Left Column: Inputs */}
        <div className='space-y-4 lg:col-span-6 xl:col-span-5'>
          <Field data-invalid={!!errorAddress}>
            <FieldLabel htmlFor={`project-address-${index}`}>
              {m.company_project_address()}
            </FieldLabel>
            <Textarea
              id={`project-address-${index}`}
              aria-invalid={!!errorAddress}
              value={watchAddress}
              onChange={(e) => handleAddressChange(e.target.value)}
              placeholder='Ketik alamat lengkap atau klik langsung titik di peta...'
              className='min-h-[88px] resize-y text-xs'
            />
            <UIFieldError errors={errorAddress ? [errorAddress] : undefined} />
          </Field>

          <div className='grid gap-3 sm:grid-cols-2'>
            <Field>
              <FieldLabel htmlFor={`project-latitude-${index}`}>
                {m.company_project_latitude()}
              </FieldLabel>
              <Input
                id={`project-latitude-${index}`}
                inputMode='decimal'
                {...register(`addresses.${index}.latitude`)}
                placeholder='-6.224700'
                className='text-xs font-mono'
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`project-longitude-${index}`}>
                {m.company_project_longitude()}
              </FieldLabel>
              <Input
                id={`project-longitude-${index}`}
                inputMode='decimal'
                {...register(`addresses.${index}.longitude`)}
                placeholder='106.809900'
                className='text-xs font-mono'
              />
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor={`project-radius-${index}`}>
              {m.company_project_geofence_radius()}
            </FieldLabel>
            <Input
              id={`project-radius-${index}`}
              inputMode='numeric'
              {...register(`addresses.${index}.geofenceRadiusMeters`)}
              placeholder='50'
              className='text-xs'
            />
          </Field>

          <div className='rounded-xl border border-border/60 bg-muted/20 p-3 text-xs text-muted-foreground leading-relaxed'>
            💡 <strong>Interaktif:</strong> Klik titik mana saja di peta samping atau geser pin untuk menentukan koordinat dan alamat secara langsung.
          </div>
        </div>

        {/* Right Column: Embedded Live Map */}
        <div className='space-y-2 lg:col-span-6 xl:col-span-7'>
          {/* Quick Search Bar above map */}
          <div className='flex items-center gap-2'>
            <div className='relative flex-1'>
              <IconSearch className='absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground' />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleManualSearch(searchQuery)
                  }
                }}
                placeholder='Cari nama tempat / jalan di peta (contoh: SCBD, Monas)...'
                className='h-8 pl-8 text-xs bg-background'
              />
            </div>
            <Button
              type='button'
              variant='secondary'
              size='sm'
              onClick={() => handleManualSearch(searchQuery)}
              disabled={isSearching || !searchQuery.trim()}
              className='h-8 text-xs gap-1 shrink-0'
            >
              {isSearching ? (
                <IconLoader2 className='size-3.5 animate-spin' />
              ) : (
                <IconSearch className='size-3.5' />
              )}
              Cari Lokasi
            </Button>
          </div>

          {/* Map View */}
          <div className='relative h-[310px] w-full overflow-hidden rounded-xl border border-border/80 shadow-xs bg-muted/20'>
            <Map
              key={`location-map-${fieldId}`}
              className='h-full w-full'
              viewport={{
                center: [lngNum, latNum],
                zoom: 14,
              }}
            >
              <MapControls
                position='top-right'
                showCompass
                showZoom
                showFullscreen
                showLocate
                onLocate={(coords) => {
                  handleMapPointSelect({ lat: coords.latitude, lng: coords.longitude })
                }}
              />
              <MapEventsController
                onClick={handleMapPointSelect}
                center={[lngNum, latNum]}
              />
              <MapMarker
                longitude={lngNum}
                latitude={latNum}
                draggable
                onDragEnd={({ lng, lat }) => {
                  handleMapPointSelect({ lat, lng })
                }}
              >
                <MarkerContent>
                  <div className='flex size-7 items-center justify-center rounded-full border-2 border-white bg-primary text-primary-foreground shadow-xl transition-transform hover:scale-110 cursor-grab active:cursor-grabbing'>
                    <IconMapPin className='size-4' />
                  </div>
                </MarkerContent>
              </MapMarker>
            </Map>

            {/* Live reverse geocoding indicator */}
            {isReverseGeocoding && (
              <div className='absolute top-3 left-3 z-10 flex items-center gap-2 rounded-lg bg-background/95 px-3 py-1.5 text-xs font-medium text-foreground shadow-md backdrop-blur-xs'>
                <IconLoader2 className='size-3.5 animate-spin text-primary' />
                <span>Memperbarui alamat...</span>
              </div>
            )}

            {/* Helper pill */}
            <div className='pointer-events-none absolute bottom-2 left-2 z-10 rounded-md bg-background/85 px-2.5 py-1 text-[11px] font-medium text-muted-foreground backdrop-blur-xs border border-border/50'>
              📍 Klik peta atau geser pin untuk atur titik
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ProjectFormPage({ projectId }: Readonly<ProjectFormPageProps>) {
  const navigate = useNavigate()
  const projects = useProjects()
  const project = projectId ? projects.find((item) => item.id === projectId) : undefined
  const isEdit = Boolean(projectId)
  const formSchema = useSchema(() => ({
    clientId: z.string().min(1, { message: m.company_project_client_required() }),
    code: z.string().min(1, { message: m.company_project_code_required() }),
    name: z.string().min(1, { message: m.company_project_name_required() }),
    description: z.string().optional(),
    industryField: z.string().optional(),
    startDate: z.string().min(1, { message: m.company_project_start_date_required() }),
    endDate: z.string().optional(),
    status: z.enum(['PLANNING', 'ONGOING', 'ON_HOLD', 'COMPLETED', 'CANCELLED']),
    employeeIds: z.array(z.string()).optional(),
    assignmentStartDate: z.string().optional(),
    assignmentEndDate: z.string().optional(),
    addresses: z
      .array(
        z.object({
          address: z.string().min(1, { message: m.company_project_address_required() }),
          latitude: z.string().optional(),
          longitude: z.string().optional(),
          geofenceRadiusMeters: z.string().optional(),
        }),
      )
      .min(1, { message: m.company_project_address_required() }),
  }))

  const clients = useClients()
  const { data: employeesResult } = useGetEmployees({})
  const allEmployees = useMemo(() => employeesResult?.items ?? [], [employeesResult?.items])
  const [employeeSearch, setEmployeeSearch] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('ALL')

  const {
    control,
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientId: project?.clientId ?? '',
      code: project?.code ?? '',
      name: project?.name ?? '',
      description: project?.description ?? '',
      industryField: project?.industryField ?? '',
      startDate: project?.startDate ?? '',
      endDate: project?.endDate ?? '',
      status: project?.status ?? 'PLANNING',
      employeeIds: project?.employeeIds ?? [],
      assignmentStartDate: project?.assignmentStartDate ?? '',
      assignmentEndDate: project?.assignmentEndDate ?? '',
      addresses: project?.addresses.length
        ? project.addresses.map((address) => ({
            address: address.address,
            latitude: address.latitude?.toString() ?? '',
            longitude: address.longitude?.toString() ?? '',
            geofenceRadiusMeters: address.geofenceRadiusMeters?.toString() ?? '',
          }))
        : [{ address: '', latitude: '', longitude: '', geofenceRadiusMeters: '' }],
    },
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'addresses' })
  const addressValues = useWatch({ control, name: 'addresses' })
  const selectedEmployeeIds = useWatch({ control, name: 'employeeIds' }) ?? []
  const watchProjectName = useWatch({ control, name: 'name' })

  const toggleEmployee = (empId: string) => {
    const current = selectedEmployeeIds
    if (current.includes(empId)) {
      setValue(
        'employeeIds',
        current.filter((id) => id !== empId),
        { shouldValidate: true },
      )
    } else {
      setValue('employeeIds', [...current, empId], { shouldValidate: true })
    }
  }

  const departmentOptions = useMemo(() => {
    const set = new Set<string>()
    allEmployees.forEach((emp) => {
      if (emp.departmentName) set.add(emp.departmentName)
    })
    return Array.from(set)
  }, [allEmployees])

  const filteredEmployees = useMemo(() => {
    const q = employeeSearch.trim().toLowerCase()
    return allEmployees.filter((emp) => {
      const matchDept =
        selectedDepartment === 'ALL' || emp.departmentName === selectedDepartment
      if (!matchDept) return false

      if (!q) return true
      return (
        emp.fullName.toLowerCase().includes(q) ||
        emp.employeeCode.toLowerCase().includes(q) ||
        (emp.departmentName && emp.departmentName.toLowerCase().includes(q)) ||
        (emp.positionName && emp.positionName.toLowerCase().includes(q))
      )
    })
  }, [allEmployees, employeeSearch, selectedDepartment])

  if (isEdit && !project) return <AppMain notFound />

  const onSubmit = (values: FormValues) => {
    if (isEdit && projectId) {
      updateProject(projectId, buildUpdatedProject(values))
      snackbar.success(m.company_project_toast_updated())
    } else {
      addProject(buildNewProject(values))
      snackbar.success(m.company_project_toast_created())
    }

    navigate({ to: '/company/project' })
  }

  const statusOptions: Array<{ value: ProjectStatus; label: string }> = [
    { value: 'PLANNING', label: m.company_project_status_planning() },
    { value: 'ONGOING', label: m.company_project_status_ongoing() },
    { value: 'ON_HOLD', label: m.company_project_status_on_hold() },
    { value: 'COMPLETED', label: m.company_project_status_completed() },
    { value: 'CANCELLED', label: m.company_project_status_cancelled() },
  ]

  return (
    <AppMain
      title={isEdit ? m.company_project_edit_title() : m.company_project_create_title()}
      subtitle={m.company_project_form_description()}
      breadcrumbs={[
        { to: '/', label: m.app_layout_nav_company() },
        { to: '/company/project', label: m.app_layout_nav_company_project() },
        {
          to: '.',
          label: isEdit ? m.company_project_edit_title() : m.company_project_create_title(),
        },
      ]}
      backTo='/company/project'
      className='w-full max-w-full min-w-0 gap-6'
    >
      <form className='w-full' onSubmit={handleSubmit(onSubmit)} noValidate>
        <Card>
          <CardContent className='pt-6'>
            <FieldGroup className='grid gap-6 md:grid-cols-2'>
              <Field data-invalid={!!errors.code}>
                <FieldLabel htmlFor='project-code'>{m.company_project_code()}</FieldLabel>
                <Input id='project-code' aria-invalid={!!errors.code} {...register('code')} />
                <UIFieldError errors={errors.code ? [errors.code] : undefined} />
              </Field>
              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor='project-name'>{m.company_project_name()}</FieldLabel>
                <Input id='project-name' aria-invalid={!!errors.name} {...register('name')} />
                <UIFieldError errors={errors.name ? [errors.name] : undefined} />
              </Field>
              <Field data-invalid={!!errors.clientId}>
                <FieldLabel htmlFor='project-client'>{m.company_project_client()}</FieldLabel>
                <Controller
                  name='clientId'
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id='project-client' aria-invalid={!!errors.clientId}>
                        <SelectValue placeholder={m.company_project_client_placeholder()} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
                <UIFieldError errors={errors.clientId ? [errors.clientId] : undefined} />
              </Field>
              <Field>
                <FieldLabel htmlFor='project-industry'>{m.company_project_industry()}</FieldLabel>
                <Input id='project-industry' {...register('industryField')} />
              </Field>
              <Field data-invalid={!!errors.startDate}>
                <FieldLabel>{m.company_project_start_date()}</FieldLabel>
                <Controller
                  name='startDate'
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      mode='single'
                      selected={field.value ? dayjs(field.value).toDate() : undefined}
                      onSelect={(date) =>
                        field.onChange(date ? dayjs(date).format('YYYY-MM-DD') : '')
                      }
                      placeholder={m.company_project_start_date()}
                    />
                  )}
                />
                <UIFieldError errors={errors.startDate ? [errors.startDate] : undefined} />
              </Field>
              <Field>
                <FieldLabel>{m.company_project_end_date()}</FieldLabel>
                <Controller
                  name='endDate'
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      mode='single'
                      selected={field.value ? dayjs(field.value).toDate() : undefined}
                      onSelect={(date) =>
                        field.onChange(date ? dayjs(date).format('YYYY-MM-DD') : '')
                      }
                      placeholder={m.company_project_end_date()}
                    />
                  )}
                />
              </Field>
              <Field>
                <FieldLabel>{m.company_project_status()}</FieldLabel>
                <Controller
                  name='status'
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
              <Field className='md:col-span-2'>
                <FieldLabel htmlFor='project-description'>
                  {m.company_project_description()}
                </FieldLabel>
                <Textarea id='project-description' {...register('description')} />
              </Field>

              {/* Assign Employees Section */}
              <div className='flex flex-col gap-4 md:col-span-2 rounded-2xl border border-border/70 bg-card p-5 shadow-xs'>
                {/* Search & Department Filters */}
                <div className='grid gap-4 sm:grid-cols-2'>
                  <div>
                    <FieldLabel htmlFor='search-employee' className='text-xs font-semibold text-foreground'>
                      Search Employee
                    </FieldLabel>
                    <Input
                      id='search-employee'
                      placeholder='Search name / NIP / position...'
                      value={employeeSearch}
                      onChange={(e) => setEmployeeSearch(e.target.value)}
                      className='mt-1.5 h-10 text-xs'
                    />
                  </div>
                  <div>
                    <FieldLabel htmlFor='department-filter' className='text-xs font-semibold text-foreground'>
                      Department
                    </FieldLabel>
                    <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                      <SelectTrigger id='department-filter' className='mt-1.5 h-10 text-xs'>
                        <SelectValue placeholder='All departments' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='ALL'>All departments</SelectItem>
                        {departmentOptions.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Employee List with Checkbox Cards */}
                <div className='flex flex-col gap-2.5 max-h-64 overflow-y-auto pr-1'>
                  {filteredEmployees.length === 0 ? (
                    <div className='p-6 text-center text-xs text-muted-foreground rounded-xl border border-border/60 bg-muted/20'>
                      No employees found.
                    </div>
                  ) : (
                    filteredEmployees.map((emp) => {
                      const isChecked = selectedEmployeeIds.includes(emp.id)
                      return (
                        <div
                          key={emp.id}
                          onClick={() => toggleEmployee(emp.id)}
                          className={`flex items-center gap-3.5 rounded-xl border p-3.5 transition-all cursor-pointer ${
                            isChecked
                              ? 'border-primary/60 bg-primary/5 shadow-2xs'
                              : 'border-border/70 bg-card hover:border-border hover:bg-muted/30 shadow-2xs'
                          }`}
                        >
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => toggleEmployee(emp.id)}
                            onClick={(e) => e.stopPropagation()}
                            id={`emp-check-${emp.id}`}
                            className='size-5 rounded-md'
                          />
                          <div className='min-w-0 flex-1'>
                            <p className='text-sm font-semibold text-foreground leading-tight'>
                              {emp.fullName}
                            </p>
                            <p className='mt-0.5 text-xs text-muted-foreground'>
                              {emp.employeeCode} · {emp.departmentName || 'Operations'}
                            </p>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                {/* Assignment Dates (2-columns) */}
                <div className='grid gap-4 sm:grid-cols-2 pt-1'>
                  <div>
                    <FieldLabel className='text-xs font-semibold text-foreground'>
                      Assignment Start Date *
                    </FieldLabel>
                    <Controller
                      name='assignmentStartDate'
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          mode='single'
                          selected={field.value ? dayjs(field.value).toDate() : undefined}
                          onSelect={(date) =>
                            field.onChange(date ? dayjs(date).format('YYYY-MM-DD') : '')
                          }
                          placeholder='12 Sep 2026'
                          className='mt-1.5'
                        />
                      )}
                    />
                  </div>
                  <div>
                    <FieldLabel className='text-xs font-semibold text-foreground'>
                      Assignment End Date
                    </FieldLabel>
                    <Controller
                      name='assignmentEndDate'
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          mode='single'
                          selected={field.value ? dayjs(field.value).toDate() : undefined}
                          onSelect={(date) =>
                            field.onChange(date ? dayjs(date).format('YYYY-MM-DD') : '')
                          }
                          placeholder='Optional'
                          className='mt-1.5'
                        />
                      )}
                    />
                  </div>
                </div>

                {/* Notice / Keterangan Box */}
                <div className='rounded-xl border border-border/50 bg-muted/25 p-4'>
                  <p className='text-sm font-semibold text-foreground'>
                    Assignment to {watchProjectName?.trim() ? watchProjectName : 'BFP Operations'}
                  </p>
                  <p className='mt-0.5 text-xs text-muted-foreground'>
                    Selected employees will be assigned directly to this project.
                  </p>
                </div>
              </div>

              {/* Locations Section with Live Inline Map */}
              <div className='flex flex-col gap-4 md:col-span-2'>
                <div className='flex items-center justify-between gap-3'>
                  <div>
                    <FieldLabel>{m.company_project_address()}</FieldLabel>
                    <p className='text-xs text-muted-foreground'>
                      Peta langsung tampil pada setiap lokasi. Anda dapat mengetik alamat atau langsung memilih titik dari peta.
                    </p>
                  </div>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      append({ address: '', latitude: '', longitude: '', geofenceRadiusMeters: '' })
                    }
                  >
                    <IconPlus data-icon='inline-start' />
                    {m.company_project_add_address()}
                  </Button>
                </div>

                <div className='flex flex-col gap-5'>
                  {fields.map((field, index) => (
                    <ProjectLocationItem
                      key={field.id}
                      fieldId={field.id}
                      index={index}
                      canRemove={fields.length > 1}
                      onRemove={() => remove(index)}
                      register={register}
                      setValue={setValue}
                      watchAddress={addressValues?.[index]?.address}
                      watchLatitude={addressValues?.[index]?.latitude}
                      watchLongitude={addressValues?.[index]?.longitude}
                      errorAddress={errors.addresses?.[index]?.address}
                    />
                  ))}
                </div>
              </div>
            </FieldGroup>
          </CardContent>
        </Card>

        <div className='mt-7 flex justify-end gap-2'>
          <Button variant='outline' asChild>
            <Link to='/company/project'>{m.company_action_cancel()}</Link>
          </Button>
          <Button type='submit'>
            {isEdit ? m.company_action_save() : m.company_action_create()}
          </Button>
        </div>
      </form>
    </AppMain>
  )
}

