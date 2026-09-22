import { zodResolver } from '@hookform/resolvers/zod'
import {
  IconArrowUpRight,
  IconBriefcase,
  IconBuilding,
  IconCalendar,
  IconCalendarTime,
  IconClock,
  IconDeviceLaptop,
  IconFaceId,
  IconHome,
  IconInfoCircle,
  IconLayoutGrid,
  IconMap2,
  IconMapPin,
  IconPlus,
  IconRefresh,
  IconTrash,
  type TablerIcon,
} from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { useMemo } from 'react'
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form'

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
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/shared/components/ui/input-group'
import { Separator } from '@/shared/components/ui/separator'
import { Spinner } from '@/shared/components/ui/spinner'
import { Switch } from '@/shared/components/ui/switch'
import { useSchema } from '@/shared/lib/schema'
import { snackbar } from '@/shared/lib/snackbar'
import { getAttendanceBreadcrumbs } from '@/features/attendance/components/attendance-breadcrumbs'
import { AttendanceTabs } from '@/features/attendance/components/attendance-tabs'
import { useGetAttendanceSettings, useUpdateAttendanceSettings } from '@/features/attendance/hooks'
import { m } from '@/i18n/paraglide/messages'
import type {
  AttendanceSettingsData,
  AttendanceSettingsSession,
  UpdateAttendanceSettingsInput,
} from '../../types'

interface ToggleSettingProps {
  id: string
  icon: TablerIcon
  title: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

interface ChangeEntry {
  label: string
  before: boolean | number | string | AttendanceSettingsSession[]
  after: boolean | number | string | AttendanceSettingsSession[]
}

function toFormValues(settings: AttendanceSettingsData): UpdateAttendanceSettingsInput {
  return {
    workModes: settings.workModes,
    attendanceCategories: settings.attendanceCategories,
    workTimeTypes: settings.workTimeTypes,
    policy: settings.policy,
    validation: settings.validation,
  }
}

function ToggleSetting({
  id,
  icon: Icon,
  title,
  description,
  checked,
  onCheckedChange,
}: Readonly<ToggleSettingProps>) {
  return (
    <Field orientation='horizontal' className='rounded-lg border p-3'>
      <div className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-primary'>
        <Icon className='size-5' aria-hidden />
      </div>
      <FieldContent className='min-w-0'>
        <FieldLabel htmlFor={id} className='font-semibold'>
          {title}
        </FieldLabel>
        <FieldDescription>{description}</FieldDescription>
      </FieldContent>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </Field>
  )
}

function formatChangeValue(value: ChangeEntry['before']) {
  if (typeof value === 'boolean') {
    return value ? m.attendance_settings_enabled() : m.attendance_settings_disabled()
  }
  if (Array.isArray(value)) {
    return value.map((session) => `${session.startTime}–${session.endTime}`).join(', ')
  }
  return String(value)
}

function buildChangeEntries(
  initial: UpdateAttendanceSettingsInput,
  current: UpdateAttendanceSettingsInput,
) {
  const candidates: ChangeEntry[] = [
    [m.attendance_settings_work_mode_wfo(), initial.workModes.wfo, current.workModes.wfo],
    [m.attendance_settings_work_mode_wfh(), initial.workModes.wfh, current.workModes.wfh],
    [
      m.attendance_settings_work_mode_hybrid(),
      initial.workModes.hybridWfa,
      current.workModes.hybridWfa,
    ],
    [
      m.attendance_settings_category_regular(),
      initial.attendanceCategories.regular,
      current.attendanceCategories.regular,
    ],
    [
      m.attendance_settings_category_overtime(),
      initial.attendanceCategories.overtime,
      current.attendanceCategories.overtime,
    ],
    [
      m.attendance_settings_category_business_trip(),
      initial.attendanceCategories.businessTrip,
      current.attendanceCategories.businessTrip,
    ],
    [
      m.attendance_settings_work_time_regular(),
      initial.workTimeTypes.regular.enabled,
      current.workTimeTypes.regular.enabled,
    ],
    [
      m.attendance_settings_default_clock_in_field_label(),
      initial.workTimeTypes.regular.defaultClockIn,
      current.workTimeTypes.regular.defaultClockIn,
    ],
    [
      m.attendance_settings_default_clock_out_field_label(),
      initial.workTimeTypes.regular.defaultClockOut,
      current.workTimeTypes.regular.defaultClockOut,
    ],
    [
      m.attendance_settings_work_time_shifting(),
      initial.workTimeTypes.shifting.enabled,
      current.workTimeTypes.shifting.enabled,
    ],
    [
      m.attendance_settings_work_time_split(),
      initial.workTimeTypes.splitHours.enabled,
      current.workTimeTypes.splitHours.enabled,
    ],
    [
      m.attendance_settings_target_hours_field_label(),
      initial.workTimeTypes.splitHours.targetDailyHours,
      current.workTimeTypes.splitHours.targetDailyHours,
    ],
    [
      m.attendance_settings_sessions_title(),
      initial.workTimeTypes.splitHours.sessions,
      current.workTimeTypes.splitHours.sessions,
    ],
    [
      m.attendance_settings_late_tolerance_field_label(),
      initial.policy.lateToleranceMinutes,
      current.policy.lateToleranceMinutes,
    ],
    [
      m.attendance_settings_early_leave_tolerance_field_label(),
      initial.policy.earlyLeaveToleranceMinutes,
      current.policy.earlyLeaveToleranceMinutes,
    ],
    [
      m.attendance_settings_clock_in_window_field_label(),
      initial.policy.clockInWindowMinutes,
      current.policy.clockInWindowMinutes,
    ],
    [
      m.attendance_settings_clock_out_window_field_label(),
      initial.policy.clockOutWindowMinutes,
      current.policy.clockOutWindowMinutes,
    ],
    [
      m.attendance_settings_missing_clock_title(),
      initial.policy.missingClockReminder,
      current.policy.missingClockReminder,
    ],
    [
      m.attendance_settings_multiple_clock_title(),
      initial.policy.allowMultipleClockInOut,
      current.policy.allowMultipleClockInOut,
    ],
    [
      m.attendance_settings_auto_clock_out_title(),
      initial.policy.autoClockOut,
      current.policy.autoClockOut,
    ],
    [
      m.attendance_settings_auto_clock_out_time_field_label(),
      initial.policy.autoClockOutTime,
      current.policy.autoClockOutTime,
    ],
    [
      m.attendance_settings_face_verification_title(),
      initial.validation.faceVerification,
      current.validation.faceVerification,
    ],
    [
      m.attendance_settings_gps_validation_title(),
      initial.validation.gpsValidation,
      current.validation.gpsValidation,
    ],
    [
      m.attendance_settings_geofencing_title(),
      initial.validation.geofencing,
      current.validation.geofencing,
    ],
  ].map(([label, before, after]) => ({ label, before, after })) as ChangeEntry[]

  return candidates.filter(({ before, after }) => JSON.stringify(before) !== JSON.stringify(after))
}

function AttendanceSettingsForm({ settings }: Readonly<{ settings: AttendanceSettingsData }>) {
  const initialValues = useMemo(() => toFormValues(settings), [settings])
  const formSchema = useSchema((z) => {
    const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, {
      message: m.attendance_settings_time_required(),
    })
    const integer = z
      .number({ message: m.attendance_settings_number_required() })
      .int({ message: m.attendance_settings_number_required() })
      .min(0, { message: m.attendance_settings_number_required() })

    return {
      workModes: z.object({ wfo: z.boolean(), wfh: z.boolean(), hybridWfa: z.boolean() }),
      attendanceCategories: z.object({
        regular: z.boolean(),
        overtime: z.boolean(),
        businessTrip: z.boolean(),
      }),
      workTimeTypes: z.object({
        regular: z.object({
          enabled: z.boolean(),
          defaultClockIn: time,
          defaultClockOut: time,
          useAsWorkHoursReference: z.boolean(),
        }),
        shifting: z.object({ enabled: z.boolean() }),
        splitHours: z.object({
          enabled: z.boolean(),
          targetDailyHours: integer.min(1).max(24),
          sessions: z
            .array(
              z
                .object({ startTime: time, endTime: time })
                .refine((session) => session.endTime > session.startTime, {
                  message: m.attendance_settings_session_time_invalid(),
                  path: ['endTime'],
                }),
            )
            .min(1, { message: m.attendance_settings_session_required() })
            .max(6, { message: m.attendance_settings_session_limit() }),
        }),
      }),
      policy: z.object({
        lateToleranceMinutes: integer.max(240),
        earlyLeaveToleranceMinutes: integer.max(240),
        clockInWindowMinutes: integer.max(1440),
        clockOutWindowMinutes: integer.max(1440),
        missingClockReminder: z.boolean(),
        allowMultipleClockInOut: z.boolean(),
        autoClockOut: z.boolean(),
        autoClockOutTime: time,
      }),
      validation: z.object({
        faceVerification: z.boolean(),
        gpsValidation: z.boolean(),
        geofencing: z.boolean(),
      }),
    }
  })
  const {
    control,
    handleSubmit,
    register,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateAttendanceSettingsInput>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  })
  const {
    fields: sessions,
    append,
    remove,
  } = useFieldArray({
    control,
    name: 'workTimeTypes.splitHours.sessions',
  })
  const currentValues = useWatch({ control }) as UpdateAttendanceSettingsInput
  const changes = useMemo(
    () => buildChangeEntries(initialValues, currentValues),
    [currentValues, initialValues],
  )
  const { mutate: saveSettings, isPending } = useUpdateAttendanceSettings()

  const handleSave = (values: UpdateAttendanceSettingsInput) => {
    saveSettings(values, {
      onSuccess: (response) => {
        reset(toFormValues(response.data))
        snackbar.success(m.attendance_settings_save_success())
      },
      onError: (error) => snackbar.exception(error),
    })
  }

  const workModes = [
    {
      name: 'workModes.wfo' as const,
      id: 'work-mode-wfo',
      icon: IconBuilding,
      title: m.attendance_settings_work_mode_wfo(),
      description: m.attendance_settings_work_mode_wfo_description(),
    },
    {
      name: 'workModes.wfh' as const,
      id: 'work-mode-wfh',
      icon: IconHome,
      title: m.attendance_settings_work_mode_wfh(),
      description: m.attendance_settings_work_mode_wfh_description(),
    },
    {
      name: 'workModes.hybridWfa' as const,
      id: 'work-mode-hybrid',
      icon: IconDeviceLaptop,
      title: m.attendance_settings_work_mode_hybrid(),
      description: m.attendance_settings_work_mode_hybrid_description(),
    },
  ]
  const categories = [
    {
      name: 'attendanceCategories.regular' as const,
      id: 'category-regular',
      icon: IconCalendar,
      title: m.attendance_settings_category_regular(),
      description: m.attendance_settings_category_regular_description(),
    },
    {
      name: 'attendanceCategories.overtime' as const,
      id: 'category-overtime',
      icon: IconClock,
      title: m.attendance_settings_category_overtime(),
      description: m.attendance_settings_category_overtime_description(),
    },
    {
      name: 'attendanceCategories.businessTrip' as const,
      id: 'category-business-trip',
      icon: IconBriefcase,
      title: m.attendance_settings_category_business_trip(),
      description: m.attendance_settings_category_business_trip_description(),
    },
  ]

  return (
    <form onSubmit={handleSubmit(handleSave)} noValidate>
      <FieldGroup className='gap-5'>
        <div className='grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]'>
          <FieldGroup className='min-w-0 gap-5'>
            <div className='grid min-w-0 gap-5 lg:grid-cols-2'>
              {[
                {
                  title: m.attendance_settings_work_modes_title(),
                  description: m.attendance_settings_work_modes_description(),
                  items: workModes,
                },
                {
                  title: m.attendance_settings_categories_title(),
                  description: m.attendance_settings_categories_description(),
                  items: categories,
                },
              ].map((group) => (
                <Card key={group.title}>
                  <CardHeader>
                    <CardTitle>{group.title}</CardTitle>
                    <CardDescription>{group.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FieldGroup className='gap-2'>
                      {group.items.map((item) => (
                        <Controller
                          key={item.name}
                          name={item.name}
                          control={control}
                          render={({ field }) => (
                            <ToggleSetting
                              {...item}
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          )}
                        />
                      ))}
                    </FieldGroup>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{m.attendance_settings_work_time_types_title()}</CardTitle>
                <CardDescription>
                  {m.attendance_settings_work_time_types_description()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='grid min-w-0 gap-3 lg:grid-cols-3'>
                  <Card size='sm' className='shadow-none'>
                    <CardHeader>
                      <Controller
                        name='workTimeTypes.regular.enabled'
                        control={control}
                        render={({ field }) => (
                          <ToggleSetting
                            id='work-time-regular'
                            icon={IconCalendarTime}
                            title={m.attendance_settings_work_time_regular()}
                            description={m.attendance_settings_work_time_regular_description()}
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                    </CardHeader>
                    <CardContent>
                      <FieldGroup className='gap-4'>
                        <div className='grid grid-cols-2 gap-2'>
                          {[
                            {
                              name: 'workTimeTypes.regular.defaultClockIn' as const,
                              id: 'regular-clock-in',
                              label: m.attendance_settings_default_clock_in_field_label(),
                              error: errors.workTimeTypes?.regular?.defaultClockIn,
                            },
                            {
                              name: 'workTimeTypes.regular.defaultClockOut' as const,
                              id: 'regular-clock-out',
                              label: m.attendance_settings_default_clock_out_field_label(),
                              error: errors.workTimeTypes?.regular?.defaultClockOut,
                            },
                          ].map((item) => (
                            <Field key={item.name} data-invalid={!!item.error}>
                              <FieldLabel htmlFor={item.id}>{item.label}</FieldLabel>
                              <Input
                                id={item.id}
                                type='time'
                                aria-invalid={!!item.error}
                                {...register(item.name)}
                              />
                              <FieldError errors={item.error ? [item.error] : undefined} />
                            </Field>
                          ))}
                        </div>
                        <Controller
                          name='workTimeTypes.regular.useAsWorkHoursReference'
                          control={control}
                          render={({ field }) => (
                            <Field orientation='horizontal'>
                              <Checkbox
                                id='regular-reference'
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                              <FieldLabel htmlFor='regular-reference'>
                                {m.attendance_settings_regular_reference_field_label()}
                              </FieldLabel>
                            </Field>
                          )}
                        />
                        <FieldDescription className='flex items-start gap-2'>
                          <IconInfoCircle className='mt-0.5 size-4 shrink-0' aria-hidden />
                          {m.attendance_settings_regular_help()}
                        </FieldDescription>
                      </FieldGroup>
                    </CardContent>
                  </Card>

                  <Card size='sm' className='shadow-none'>
                    <CardHeader>
                      <Controller
                        name='workTimeTypes.shifting.enabled'
                        control={control}
                        render={({ field }) => (
                          <ToggleSetting
                            id='work-time-shifting'
                            icon={IconRefresh}
                            title={m.attendance_settings_work_time_shifting()}
                            description={m.attendance_settings_work_time_shifting_description()}
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                    </CardHeader>
                    <CardContent className='flex flex-col gap-3'>
                      <Alert variant='info-overlay'>
                        <AlertIcon>
                          <IconInfoCircle aria-hidden />
                        </AlertIcon>
                        <div>
                          <AlertTitle>{m.attendance_settings_shift_notice_title()}</AlertTitle>
                          <AlertDescription>
                            {m.attendance_settings_shift_notice_description()}
                          </AlertDescription>
                        </div>
                      </Alert>
                      <Button variant='outline' asChild>
                        <Link to='/attendance/management/shifts'>
                          {m.attendance_settings_open_shift_management()}
                          <IconArrowUpRight data-icon='inline-end' />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>

                  <Card size='sm' className='shadow-none'>
                    <CardHeader>
                      <Controller
                        name='workTimeTypes.splitHours.enabled'
                        control={control}
                        render={({ field }) => (
                          <ToggleSetting
                            id='work-time-split'
                            icon={IconLayoutGrid}
                            title={m.attendance_settings_work_time_split()}
                            description={m.attendance_settings_work_time_split_description()}
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                    </CardHeader>
                    <CardContent>
                      <FieldGroup className='gap-4'>
                        <Field data-invalid={!!errors.workTimeTypes?.splitHours?.targetDailyHours}>
                          <FieldLabel htmlFor='split-target-hours'>
                            {m.attendance_settings_target_hours_field_label()}
                          </FieldLabel>
                          <InputGroup>
                            <InputGroupInput
                              id='split-target-hours'
                              type='number'
                              min={1}
                              max={24}
                              aria-invalid={!!errors.workTimeTypes?.splitHours?.targetDailyHours}
                              {...register('workTimeTypes.splitHours.targetDailyHours', {
                                valueAsNumber: true,
                              })}
                            />
                            <InputGroupAddon align='inline-end'>
                              <InputGroupText>{m.attendance_settings_hours_unit()}</InputGroupText>
                            </InputGroupAddon>
                          </InputGroup>
                          <FieldError
                            errors={
                              errors.workTimeTypes?.splitHours?.targetDailyHours
                                ? [errors.workTimeTypes.splitHours.targetDailyHours]
                                : undefined
                            }
                          />
                        </Field>
                        <Field>
                          <div className='flex flex-wrap items-center justify-between gap-2'>
                            <FieldTitle>{m.attendance_settings_sessions_title()}</FieldTitle>
                            <Button
                              type='button'
                              variant='ghost'
                              size='sm'
                              disabled={sessions.length >= 6}
                              onClick={() => append({ startTime: '08:00', endTime: '12:00' })}
                            >
                              <IconPlus data-icon='inline-start' />
                              {m.attendance_settings_add_session()}
                            </Button>
                          </div>
                          <FieldGroup className='gap-2'>
                            {sessions.map((session, index) => (
                              <Field
                                key={session.id}
                                data-invalid={!!errors.workTimeTypes?.splitHours?.sessions?.[index]}
                              >
                                <FieldLabel htmlFor={`session-${index}-start`}>
                                  {m.attendance_settings_session_label({ number: index + 1 })}
                                </FieldLabel>
                                <div className='grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto] items-center gap-1.5'>
                                  <Input
                                    id={`session-${index}-start`}
                                    type='time'
                                    aria-invalid={
                                      !!errors.workTimeTypes?.splitHours?.sessions?.[index]
                                        ?.startTime
                                    }
                                    {...register(
                                      `workTimeTypes.splitHours.sessions.${index}.startTime`,
                                    )}
                                  />
                                  <span aria-hidden className='text-muted-foreground'>
                                    –
                                  </span>
                                  <Input
                                    id={`session-${index}-end`}
                                    type='time'
                                    aria-label={m.attendance_settings_default_clock_out_field_label()}
                                    aria-invalid={
                                      !!errors.workTimeTypes?.splitHours?.sessions?.[index]?.endTime
                                    }
                                    {...register(
                                      `workTimeTypes.splitHours.sessions.${index}.endTime`,
                                    )}
                                  />
                                  <Button
                                    type='button'
                                    variant='ghost'
                                    size='icon-sm'
                                    disabled={sessions.length === 1}
                                    aria-label={m.attendance_settings_remove_session({
                                      number: index + 1,
                                    })}
                                    onClick={() => remove(index)}
                                  >
                                    <IconTrash data-icon='icon-only' />
                                  </Button>
                                </div>
                                <FieldError
                                  errors={[
                                    errors.workTimeTypes?.splitHours?.sessions?.[index]?.startTime,
                                    errors.workTimeTypes?.splitHours?.sessions?.[index]?.endTime,
                                  ]}
                                />
                              </Field>
                            ))}
                          </FieldGroup>
                          <FieldError
                            errors={
                              errors.workTimeTypes?.splitHours?.sessions?.root
                                ? [errors.workTimeTypes.splitHours.sessions.root]
                                : undefined
                            }
                          />
                          <FieldDescription>
                            {m.attendance_settings_sessions_help()}
                          </FieldDescription>
                        </Field>
                      </FieldGroup>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{m.attendance_settings_policy_title()}</CardTitle>
                <CardDescription>{m.attendance_settings_policy_description()}</CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup className='gap-5'>
                  <div className='grid gap-4 md:grid-cols-2'>
                    {[
                      {
                        name: 'policy.lateToleranceMinutes' as const,
                        id: 'late-tolerance',
                        label: m.attendance_settings_late_tolerance_field_label(),
                        suffix: m.attendance_settings_minutes_unit(),
                        error: errors.policy?.lateToleranceMinutes,
                      },
                      {
                        name: 'policy.earlyLeaveToleranceMinutes' as const,
                        id: 'early-leave-tolerance',
                        label: m.attendance_settings_early_leave_tolerance_field_label(),
                        suffix: m.attendance_settings_minutes_unit(),
                        error: errors.policy?.earlyLeaveToleranceMinutes,
                      },
                      {
                        name: 'policy.clockInWindowMinutes' as const,
                        id: 'clock-in-window',
                        label: m.attendance_settings_clock_in_window_field_label(),
                        suffix: m.attendance_settings_before_shift_suffix(),
                        error: errors.policy?.clockInWindowMinutes,
                      },
                      {
                        name: 'policy.clockOutWindowMinutes' as const,
                        id: 'clock-out-window',
                        label: m.attendance_settings_clock_out_window_field_label(),
                        suffix: m.attendance_settings_after_shift_suffix(),
                        error: errors.policy?.clockOutWindowMinutes,
                      },
                    ].map((item) => (
                      <Field key={item.name} data-invalid={!!item.error}>
                        <FieldLabel htmlFor={item.id}>{item.label}</FieldLabel>
                        <InputGroup>
                          <InputGroupInput
                            id={item.id}
                            type='number'
                            min={0}
                            aria-invalid={!!item.error}
                            {...register(item.name, { valueAsNumber: true })}
                          />
                          <InputGroupAddon align='inline-end'>
                            <InputGroupText>{item.suffix}</InputGroupText>
                          </InputGroupAddon>
                        </InputGroup>
                        <FieldError errors={item.error ? [item.error] : undefined} />
                      </Field>
                    ))}
                  </div>
                  <div className='grid gap-5 md:grid-cols-2'>
                    <FieldGroup className='gap-4'>
                      {[
                        {
                          name: 'policy.missingClockReminder' as const,
                          id: 'missing-clock-reminder',
                          title: m.attendance_settings_missing_clock_title(),
                          description: m.attendance_settings_missing_clock_description(),
                        },
                        {
                          name: 'policy.allowMultipleClockInOut' as const,
                          id: 'multiple-clock',
                          title: m.attendance_settings_multiple_clock_title(),
                          description: m.attendance_settings_multiple_clock_description(),
                        },
                      ].map((item) => (
                        <Controller
                          key={item.name}
                          name={item.name}
                          control={control}
                          render={({ field }) => (
                            <Field orientation='horizontal'>
                              <FieldContent>
                                <FieldLabel htmlFor={item.id}>{item.title}</FieldLabel>
                                <FieldDescription>{item.description}</FieldDescription>
                              </FieldContent>
                              <Switch
                                id={item.id}
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </Field>
                          )}
                        />
                      ))}
                    </FieldGroup>
                    <FieldGroup className='gap-4'>
                      <Controller
                        name='policy.autoClockOut'
                        control={control}
                        render={({ field }) => (
                          <Field orientation='horizontal'>
                            <FieldContent>
                              <FieldLabel htmlFor='auto-clock-out'>
                                {m.attendance_settings_auto_clock_out_title()}
                              </FieldLabel>
                              <FieldDescription>
                                {m.attendance_settings_auto_clock_out_description()}
                              </FieldDescription>
                            </FieldContent>
                            <Switch
                              id='auto-clock-out'
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </Field>
                        )}
                      />
                      <Field data-invalid={!!errors.policy?.autoClockOutTime}>
                        <FieldLabel htmlFor='auto-clock-out-time'>
                          {m.attendance_settings_auto_clock_out_time_field_label()}
                        </FieldLabel>
                        <Input
                          id='auto-clock-out-time'
                          type='time'
                          aria-invalid={!!errors.policy?.autoClockOutTime}
                          {...register('policy.autoClockOutTime')}
                        />
                        <FieldError
                          errors={
                            errors.policy?.autoClockOutTime
                              ? [errors.policy.autoClockOutTime]
                              : undefined
                          }
                        />
                      </Field>
                    </FieldGroup>
                  </div>
                </FieldGroup>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{m.attendance_settings_validation_title()}</CardTitle>
                <CardDescription>{m.attendance_settings_validation_description()}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='grid gap-3 md:grid-cols-3'>
                  {[
                    {
                      name: 'validation.faceVerification' as const,
                      id: 'validation-face',
                      icon: IconFaceId,
                      title: m.attendance_settings_face_verification_title(),
                      description: m.attendance_settings_face_verification_description(),
                    },
                    {
                      name: 'validation.gpsValidation' as const,
                      id: 'validation-gps',
                      icon: IconMapPin,
                      title: m.attendance_settings_gps_validation_title(),
                      description: m.attendance_settings_gps_validation_description(),
                    },
                    {
                      name: 'validation.geofencing' as const,
                      id: 'validation-geofence',
                      icon: IconMap2,
                      title: m.attendance_settings_geofencing_title(),
                      description: m.attendance_settings_geofencing_description(),
                    },
                  ].map((item) => (
                    <Controller
                      key={item.name}
                      name={item.name}
                      control={control}
                      render={({ field }) => (
                        <ToggleSetting
                          {...item}
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </FieldGroup>

          <Card className='h-fit xl:sticky xl:top-5'>
            <CardHeader>
              <CardTitle>{m.attendance_settings_change_summary_title()}</CardTitle>
              <Badge variant={changes.length > 0 ? 'amber' : 'secondary'}>
                {changes.length > 0
                  ? m.attendance_settings_unsaved_changes({ count: changes.length })
                  : m.attendance_settings_no_changes()}
              </Badge>
            </CardHeader>
            <CardContent className='flex flex-col gap-5'>
              {changes.length > 0 && (
                <div className='flex max-h-64 flex-col gap-4 overflow-y-auto pe-1'>
                  {changes.map((change) => (
                    <div key={change.label} className='flex flex-col gap-1 text-sm'>
                      <p className='text-muted-foreground'>{change.label}</p>
                      <p className='font-medium wrap-break-word'>
                        {m.attendance_settings_changed_value({
                          before: formatChangeValue(change.before),
                          after: formatChangeValue(change.after),
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              <Separator />
              <Alert variant='info-overlay'>
                <AlertIcon>
                  <IconInfoCircle aria-hidden />
                </AlertIcon>
                <div>
                  <AlertTitle>{m.attendance_settings_impact_title()}</AlertTitle>
                  <AlertDescription className='flex flex-col gap-2'>
                    <span>
                      {m.attendance_settings_impact_count({
                        employees: settings.impact.employeeCount,
                        branches: settings.impact.branchCount,
                      })}
                    </span>
                    <span>{m.attendance_settings_impact_description()}</span>
                  </AlertDescription>
                </div>
              </Alert>
            </CardContent>
            <CardFooter className='grid grid-cols-2 gap-2'>
              <Button
                type='button'
                variant='outline'
                disabled={!isDirty || isPending}
                onClick={() => reset(initialValues)}
              >
                {m.attendance_settings_cancel_button()}
              </Button>
              <Button type='submit' disabled={!isDirty || isPending}>
                {isPending && <Spinner data-icon='inline-start' />}
                {m.attendance_settings_save_button()}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </FieldGroup>
    </form>
  )
}

export function AttendanceSettingsPage() {
  const { data, isPending, error, refetch } = useGetAttendanceSettings()

  if (isPending || error || !data) {
    return (
      <AppMain
        pending={isPending}
        error={error}
        notFound={!isPending && !error && !data}
        retry={refetch}
      />
    )
  }

  return (
    <AppMain
      title={m.attendance_settings_page_title()}
      subtitle={m.attendance_settings_page_subtitle()}
      breadcrumbs={getAttendanceBreadcrumbs(m.attendance_settings_page_title())}
      className='gap-5 bg-muted/30'
    >
      <AttendanceTabs active='settings' />
      <AttendanceSettingsForm settings={data} />
    </AppMain>
  )
}
