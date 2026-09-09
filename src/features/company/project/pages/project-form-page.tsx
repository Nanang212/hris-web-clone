import { zodResolver } from '@hookform/resolvers/zod'
import { IconMapPin, IconPlus, IconTrash } from '@tabler/icons-react'
import { Link, useNavigate } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { useState } from 'react'
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { DatePicker } from '@/shared/components/ui/date-picker'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import { Map, MapControls, MapMarker, MarkerContent } from '@/shared/components/ui/map'
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
import { dummyClients } from '@/features/company/client/data/dummy-clients'
import { m } from '@/i18n/paraglide/messages'

import { dummyProjects } from '../data/dummy-projects'
import type { ProjectStatus } from '../types'

interface ProjectFormPageProps {
  projectId?: string
}

export function ProjectFormPage({ projectId }: Readonly<ProjectFormPageProps>) {
  const navigate = useNavigate()
  const project = projectId ? dummyProjects.find((item) => item.id === projectId) : undefined
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
  type FormValues = z.infer<typeof formSchema>
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
  const [locationPickerIndex, setLocationPickerIndex] = useState<number | null>(null)

  const addressValues = useWatch({ control, name: 'addresses' })
  const selectedAddress =
    locationPickerIndex === null ? addressValues[0] : addressValues[locationPickerIndex]
  const mapLatitude = Number.parseFloat(selectedAddress?.latitude ?? '') || -6.2247
  const mapLongitude = Number.parseFloat(selectedAddress?.longitude ?? '') || 106.8099

  if (isEdit && !project) return <AppMain notFound />

  const onSubmit = () => {
    snackbar.success(isEdit ? m.company_project_toast_updated() : m.company_project_toast_created())
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
                <FieldError errors={errors.code ? [errors.code] : undefined} />
              </Field>
              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor='project-name'>{m.company_project_name()}</FieldLabel>
                <Input id='project-name' aria-invalid={!!errors.name} {...register('name')} />
                <FieldError errors={errors.name ? [errors.name] : undefined} />
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
                          {dummyClients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={errors.clientId ? [errors.clientId] : undefined} />
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
                <FieldError errors={errors.startDate ? [errors.startDate] : undefined} />
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
              <div className='flex flex-col gap-4 md:col-span-2'>
                <div className='flex items-center justify-between gap-3'>
                  <div>
                    <FieldLabel>{m.company_project_address()}</FieldLabel>
                    <p className='text-xs text-muted-foreground'>
                      {m.company_project_location_picker()}
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
                <div className='flex flex-col gap-4'>
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className='rounded-xl border border-border/60 bg-muted/10 p-4'
                    >
                      <div className='mb-4 flex items-center justify-between gap-3'>
                        <p className='text-sm font-semibold'>
                          {m.company_project_address_number({ number: index + 1 })}
                        </p>
                        <div className='flex items-center gap-2'>
                          <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            onClick={() => setLocationPickerIndex(index)}
                          >
                            <IconMapPin data-icon='inline-start' />
                            {m.company_project_location_picker()}
                          </Button>
                          {fields.length > 1 && (
                            <Button
                              type='button'
                              variant='ghost'
                              size='icon-sm'
                              onClick={() => remove(index)}
                              aria-label={m.company_project_remove_address()}
                            >
                              <IconTrash />
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className='grid gap-4 md:grid-cols-2'>
                        <Field
                          data-invalid={!!errors.addresses?.[index]?.address}
                          className='md:col-span-2'
                        >
                          <FieldLabel htmlFor={`project-address-${index}`}>
                            {m.company_project_address()}
                          </FieldLabel>
                          <Textarea
                            id={`project-address-${index}`}
                            aria-invalid={!!errors.addresses?.[index]?.address}
                            {...register(`addresses.${index}.address`)}
                          />
                          <FieldError
                            errors={
                              errors.addresses?.[index]?.address
                                ? [errors.addresses[index].address]
                                : undefined
                            }
                          />
                        </Field>
                        <Field>
                          <FieldLabel htmlFor={`project-latitude-${index}`}>
                            {m.company_project_latitude()}
                          </FieldLabel>
                          <Input
                            id={`project-latitude-${index}`}
                            inputMode='decimal'
                            {...register(`addresses.${index}.latitude`)}
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
                          />
                        </Field>
                        <Field>
                          <FieldLabel htmlFor={`project-radius-${index}`}>
                            {m.company_project_geofence_radius()}
                          </FieldLabel>
                          <Input
                            id={`project-radius-${index}`}
                            inputMode='numeric'
                            {...register(`addresses.${index}.geofenceRadiusMeters`)}
                          />
                        </Field>
                      </div>
                    </div>
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
      <Dialog
        open={locationPickerIndex !== null}
        onOpenChange={(open) => !open && setLocationPickerIndex(null)}
      >
        <DialogContent className='max-w-4xl'>
          <DialogHeader>
            <DialogTitle>
              {locationPickerIndex === null
                ? m.company_project_location_picker()
                : m.company_project_address_number({ number: locationPickerIndex + 1 })}
            </DialogTitle>
            <DialogDescription>{m.company_project_location_picker()}</DialogDescription>
          </DialogHeader>
          {locationPickerIndex !== null && (
            <div className='h-[min(65vh,32rem)] overflow-hidden rounded-xl border border-border/60'>
              <Map
                key={`location-map-${locationPickerIndex}`}
                className='h-full w-full'
                viewport={{
                  center: [mapLongitude, mapLatitude],
                  zoom: 13,
                }}
              >
                <MapControls showCompass showFullscreen />
                <MapMarker
                  longitude={mapLongitude}
                  latitude={mapLatitude}
                  draggable
                  onDragEnd={({ lng, lat }) => {
                    setValue(`addresses.${locationPickerIndex}.longitude`, lng.toFixed(6), {
                      shouldValidate: true,
                    })
                    setValue(`addresses.${locationPickerIndex}.latitude`, lat.toFixed(6), {
                      shouldValidate: true,
                    })
                  }}
                >
                  <MarkerContent>
                    <div className='flex size-6 items-center justify-center rounded-full border-2 border-white bg-primary text-primary-foreground shadow-lg'>
                      <IconMapPin className='size-3.5' />
                    </div>
                  </MarkerContent>
                </MapMarker>
              </Map>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppMain>
  )
}
