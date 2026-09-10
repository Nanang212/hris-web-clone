import { zodResolver } from '@hookform/resolvers/zod'
import {
  IconAlertTriangle,
  IconDeviceMobile,
  IconEdit,
  IconLock,
  IconMapPin,
  IconShieldX,
} from '@tabler/icons-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Field, FieldError, FieldLabel } from '@/shared/components/ui/field'
import { Map, MapControls, MapMarker } from '@/shared/components/ui/map'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { useSchema } from '@/shared/lib/schema'
import { snackbar } from '@/shared/lib/snackbar'

const securityControls = [
  { key: 'geofence', label: 'Geofence', description: 'Validate attendance area', icon: IconMapPin },
  {
    key: 'fakeGps',
    label: 'Fake GPS Detection',
    description: 'Block spoofed coordinates',
    icon: IconShieldX,
  },
  {
    key: 'mockLocation',
    label: 'Mock Location',
    description: 'Detect mock providers',
    icon: IconDeviceMobile,
  },
  {
    key: 'rootJailbreak',
    label: 'Root / Jailbreak',
    description: 'Verify device integrity',
    icon: IconLock,
  },
] as const

const ruleOptions = {
  attendanceZone: ['office-area', 'assigned-geofence', 'any-active-geofence'],
  allowAnywhere: ['disabled', 'approved-only', 'enabled'],
  gpsAccuracy: ['25', '50', '100'],
  fakeGpsAction: ['block', 'flag', 'allow'],
  mockLocationAction: ['block', 'flag', 'allow'],
  rootAction: ['block-flag', 'block', 'flag'],
  jailbreakAction: ['block-flag', 'block', 'flag'],
  suspiciousMovement: ['flag', 'block', 'allow'],
} as const

const optionLabels: Record<string, string> = {
  'office-area': 'Office / allowed area',
  'assigned-geofence': 'Assigned employee geofence',
  'any-active-geofence': 'Any active geofence',
  disabled: 'Disabled',
  'approved-only': 'Approved exception only',
  enabled: 'Enabled',
  '25': 'Maximum 25 meters',
  '50': 'Maximum 50 meters',
  '100': 'Maximum 100 meters',
  block: 'Block attendance',
  flag: 'Flag for review',
  allow: 'Allow and record event',
  'block-flag': 'Block + security flag',
}

const defaultRules = {
  attendanceZone: 'office-area',
  allowAnywhere: 'disabled',
  gpsAccuracy: '50',
  fakeGpsAction: 'block',
  mockLocationAction: 'block',
  rootAction: 'block-flag',
  jailbreakAction: 'block-flag',
  suspiciousMovement: 'flag',
} as const

export function GpsSecurityOverviewTab() {
  const [securityToggles, setSecurityToggles] = useState<Record<string, boolean>>({
    geofence: true,
    fakeGps: true,
    mockLocation: true,
    rootJailbreak: true,
  })
  const [isEditing, setIsEditing] = useState(false)
  const formSchema = useSchema((z) => ({
    attendanceZone: z.enum(ruleOptions.attendanceZone),
    allowAnywhere: z.enum(ruleOptions.allowAnywhere),
    gpsAccuracy: z.enum(ruleOptions.gpsAccuracy),
    fakeGpsAction: z.enum(ruleOptions.fakeGpsAction),
    mockLocationAction: z.enum(ruleOptions.mockLocationAction),
    rootAction: z.enum(ruleOptions.rootAction),
    jailbreakAction: z.enum(ruleOptions.jailbreakAction),
    suspiciousMovement: z.enum(ruleOptions.suspiciousMovement),
  }))
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultRules,
  })

  const ruleFields = [
    { name: 'attendanceZone', label: 'Attendance Zone' },
    { name: 'allowAnywhere', label: 'Allow Anywhere' },
    { name: 'gpsAccuracy', label: 'GPS Accuracy' },
    { name: 'fakeGpsAction', label: 'Fake GPS Detection' },
    { name: 'mockLocationAction', label: 'Mock Location' },
    { name: 'rootAction', label: 'Root Detection' },
    { name: 'jailbreakAction', label: 'Jailbreak Detection' },
    { name: 'suspiciousMovement', label: 'Suspicious Movement' },
  ] as const

  const saveRules = (values: z.infer<typeof formSchema>) => {
    reset(values)
    setIsEditing(false)
    snackbar.success('GPS security rules saved successfully.')
  }

  const cancelEditing = () => {
    reset()
    setIsEditing(false)
  }

  return (
    <div className='flex flex-col gap-5'>
      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {securityControls.map((item) => {
          const enabled = securityToggles[item.key] ?? false
          return (
            <Button
              key={item.key}
              type='button'
              variant='outline'
              aria-pressed={enabled}
              onClick={() =>
                setSecurityToggles((current) => ({ ...current, [item.key]: !enabled }))
              }
              className='h-auto w-full justify-between rounded-xl border-border/70 bg-card p-4 text-left shadow-sm hover:bg-muted/40'
            >
              <span className='flex min-w-0 items-center gap-3'>
                <span
                  className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${enabled ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-muted text-muted-foreground'}`}
                >
                  <item.icon className='size-5' />
                </span>
                <span className='min-w-0'>
                  <span className='block truncate text-xs font-semibold text-foreground'>
                    {item.label}
                  </span>
                  <span className='mt-1 block truncate text-[11px] font-normal text-muted-foreground'>
                    {item.description}
                  </span>
                </span>
              </span>
              <Badge variant={enabled ? 'green' : 'secondary'} className='ml-2 shrink-0'>
                {enabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </Button>
          )
        })}
      </div>

      <div className='grid items-start gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(300px,0.8fr)]'>
        <Card className='gap-0 py-0'>
          <CardHeader className='border-b py-5'>
            <CardTitle>Security Rules</CardTitle>
            <CardDescription>
              {isEditing
                ? 'Adjust the GPS validation policy, then save your changes.'
                : 'Current attendance location and device-integrity policy.'}
            </CardDescription>
            <CardAction>
              {!isEditing && (
                <Button
                  type='button'
                  size='sm'
                  variant='outline'
                  onClick={() => setIsEditing(true)}
                >
                  <IconEdit />
                  Edit Rules
                </Button>
              )}
            </CardAction>
          </CardHeader>

          <form onSubmit={handleSubmit(saveRules)}>
            <CardContent className='grid gap-4 py-6 md:grid-cols-2'>
              {ruleFields.map(({ name, label }) => (
                <Controller
                  key={name}
                  control={control}
                  name={name}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>{label}</FieldLabel>
                      {isEditing ? (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className='w-full'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ruleOptions[name].map((option) => (
                              <SelectItem key={option} value={option}>
                                {optionLabels[option]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className='flex min-h-9 items-center rounded-md border bg-muted/30 px-3 text-xs font-medium'>
                          {optionLabels[field.value]}
                        </div>
                      )}
                      <FieldError errors={[errors[name]]} />
                    </Field>
                  )}
                />
              ))}
            </CardContent>
            {isEditing && (
              <CardFooter className='justify-end gap-2 border-t py-4'>
                <Button type='button' variant='outline' onClick={cancelEditing}>
                  Cancel
                </Button>
                <Button type='submit'>Save Rules</Button>
              </CardFooter>
            )}
          </form>
        </Card>

        <Card size='sm'>
          <CardHeader>
            <CardTitle>Today Security Events</CardTitle>
            <CardDescription>Location and device-integrity incidents.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='aspect-video min-h-44 overflow-hidden rounded-xl border'>
              <Map center={[106.8456, -6.2088]} zoom={13} className='min-h-full'>
                <MapControls position='top-right' />
                <MapMarker longitude={106.8456} latitude={-6.2088}>
                  <span className='flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg'>
                    <IconMapPin className='size-3.5' />
                  </span>
                </MapMarker>
              </Map>
            </div>
            <dl className='mt-5 grid gap-3 text-xs'>
              {[
                ['Outside geofence', '6'],
                ['Fake GPS blocked', '2'],
                ['Low accuracy', '4'],
                ['Root / Jailbreak', '1'],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className='flex justify-between gap-4 border-b pb-3 last:border-b-0 last:pb-0'
                >
                  <dt className='text-muted-foreground'>{label}</dt>
                  <dd className='font-bold'>{value}</dd>
                </div>
              ))}
            </dl>
            <div className='mt-5 flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-muted-foreground'>
              <IconAlertTriangle className='mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400' />
              All blocked events remain available in Detection Logs.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
