import { zodResolver } from '@hookform/resolvers/zod'
import { IconCalendarCog, IconInfoCircle, IconShieldCheck } from '@tabler/icons-react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { AppMain } from '@/shared/components/app-layout/app-main'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Switch } from '@/shared/components/ui/switch'
import { useSchema } from '@/shared/lib/schema'
import { snackbar } from '@/shared/lib/snackbar'
import { getAttendanceBreadcrumbs } from '@/features/attendance/components/attendance-breadcrumbs'
import { CalendarTabs } from '@/features/attendance/components/calendar-tabs'

const settingOptions = {
  workWeek: ['monday-friday', 'monday-saturday', 'sunday-thursday'],
  weekend: ['saturday-sunday', 'sunday', 'friday-saturday'],
  timezone: ['asia-jakarta', 'asia-makassar', 'asia-jayapura'],
  calendarYear: ['january-december', 'april-march', 'july-june'],
  holidayObservance: ['same-day', 'next-workday', 'previous-workday'],
  halfDayDuration: ['3', '4', '5'],
} as const

const optionLabels: Record<string, string> = {
  'monday-friday': 'Monday - Friday',
  'monday-saturday': 'Monday - Saturday',
  'sunday-thursday': 'Sunday - Thursday',
  'saturday-sunday': 'Saturday - Sunday',
  sunday: 'Sunday only',
  'friday-saturday': 'Friday - Saturday',
  'asia-jakarta': 'Asia/Jakarta (GMT+7)',
  'asia-makassar': 'Asia/Makassar (GMT+8)',
  'asia-jayapura': 'Asia/Jayapura (GMT+9)',
  'january-december': 'January - December',
  'april-march': 'April - March',
  'july-june': 'July - June',
  'same-day': 'Observe on the same day',
  'next-workday': 'Move to the next workday',
  'previous-workday': 'Move to the previous workday',
  '3': '3 hours',
  '4': '4 hours',
  '5': '5 hours',
}

export function CalendarSettingsPage() {
  const formSchema = useSchema((z) => ({
    workWeek: z.enum(settingOptions.workWeek),
    weekend: z.enum(settingOptions.weekend),
    timezone: z.enum(settingOptions.timezone),
    calendarYear: z.enum(settingOptions.calendarYear),
    holidayObservance: z.enum(settingOptions.holidayObservance),
    halfDayDuration: z.enum(settingOptions.halfDayDuration),
    autoSync: z.boolean(),
  }))
  const {
    control,
    formState: { errors, isDirty },
    handleSubmit,
    reset,
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workWeek: 'monday-friday',
      weekend: 'saturday-sunday',
      timezone: 'asia-jakarta',
      calendarYear: 'january-december',
      holidayObservance: 'next-workday',
      halfDayDuration: '4',
      autoSync: true,
    },
  })

  const saveSettings = (values: z.infer<typeof formSchema>) => {
    reset(values)
    snackbar.success('Calendar settings saved successfully.')
  }

  const fields = [
    { name: 'workWeek', label: 'Work Week' },
    { name: 'weekend', label: 'Weekend' },
    { name: 'timezone', label: 'Timezone' },
    { name: 'calendarYear', label: 'Default Calendar Year' },
    { name: 'holidayObservance', label: 'Holiday Observance' },
    { name: 'halfDayDuration', label: 'Half-day Duration' },
  ] as const

  return (
    <AppMain
      title='Calendar Settings'
      subtitle='Atur work week, weekend, timezone, dan kebijakan hari libur.'
      breadcrumbs={getAttendanceBreadcrumbs('Calendar Settings')}
      backTo='/attendance/calendar'
      className='gap-5 bg-muted/30'
    >
      <CalendarTabs active='settings' />

      <div className='grid items-start gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.8fr)]'>
        <Card className='gap-0 py-0'>
          <CardHeader className='border-b py-5'>
            <div className='flex items-start gap-3'>
              <span className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                <IconCalendarCog className='size-5' />
              </span>
              <div>
                <CardTitle>Calendar Configuration</CardTitle>
                <CardDescription className='mt-1'>
                  Pengaturan berlaku untuk seluruh organisasi.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <form onSubmit={handleSubmit(saveSettings)}>
            <CardContent className='py-6'>
              <FieldGroup className='grid gap-5 md:grid-cols-2'>
                {fields.map(({ name, label }) => (
                  <Controller
                    key={name}
                    control={control}
                    name={name}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>{label}</FieldLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className='w-full'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {settingOptions[name].map((option) => (
                              <SelectItem key={option} value={option}>
                                {optionLabels[option]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FieldError errors={[errors[name]]} />
                      </Field>
                    )}
                  />
                ))}
              </FieldGroup>

              <Controller
                control={control}
                name='autoSync'
                render={({ field }) => (
                  <div className='mt-6 flex items-start justify-between gap-4 rounded-xl border border-primary/20 bg-primary/5 p-4'>
                    <div className='flex min-w-0 items-start gap-3'>
                      <IconInfoCircle className='mt-0.5 size-5 shrink-0 text-primary' />
                      <div>
                        <p className='text-sm font-semibold'>Auto-sync national public holidays</p>
                        <p className='mt-1 text-xs leading-relaxed text-muted-foreground'>
                          Tambahkan kalender hari libur nasional secara otomatis setiap tahun.
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      aria-label='Auto-sync national public holidays'
                    />
                  </div>
                )}
              />
            </CardContent>
            <CardFooter className='justify-end gap-2 border-t py-4'>
              <Button type='button' variant='outline' disabled={!isDirty} onClick={() => reset()}>
                Reset
              </Button>
              <Button type='submit' disabled={!isDirty}>
                Save Calendar Settings
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card size='sm'>
          <CardHeader>
            <div className='flex items-center gap-3'>
              <span className='flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'>
                <IconShieldCheck className='size-5' />
              </span>
              <div>
                <CardTitle>Holiday Policies</CardTitle>
                <CardDescription>Current organization policy summary.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <dl className='grid gap-4'>
              {[
                ['Public Holiday', 'Paid day off'],
                ['Regional Holiday', 'Based on office location'],
                ['Special Workday', 'Requires HR approval'],
                ['Replacement Day', 'Next available workday'],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className='flex items-start justify-between gap-4 border-b pb-3 last:border-b-0 last:pb-0'
                >
                  <dt className='text-xs text-muted-foreground'>{label}</dt>
                  <dd className='text-right text-xs font-semibold'>{value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      </div>
    </AppMain>
  )
}
