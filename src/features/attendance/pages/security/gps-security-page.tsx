import { IconAlertTriangle, IconMapPin } from '@tabler/icons-react'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Button } from '@/shared/components/ui/button'
import { Map, MapControls, MapMarker } from '@/shared/components/ui/map'

const rules = [
  ['Attendance Zone', 'Office / allowed area'],
  ['Allow anywhere', 'Disabled'],
  ['GPS Accuracy Min.', '≤ 50 meters'],
  ['Fake GPS Detection', 'Block attendance'],
  ['Mock Location', 'Block attendance'],
  ['Root Detection', 'Block + security flag'],
  ['Jailbreak Detection', 'Block + security flag'],
  ['Suspicious Movement', 'Flag for review'],
]
export function GpsSecurityPage() {
  return (
    <AppMain
      title='GPS Security Overview'
      subtitle='Konfigurasi geofence, anti-spoofing, device integrity, dan accuracy.'
      className='gap-5 bg-muted/30'
    >
      <div className='flex gap-2'>
        <Button size='sm'>Overview</Button>
        <Button size='sm' variant='outline'>
          Geofences
        </Button>
        <Button size='sm' variant='outline'>
          Detection Logs
        </Button>
      </div>
      <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        {[
          ['Geofence', IconMapPin],
          ['Fake GPS Detection', IconMapPin],
          ['Mock Location', IconMapPin],
          ['Root/Jailbreak', IconAlertTriangle],
        ].map(([label, Icon]) => (
          <section key={label as string} className='rounded-2xl border bg-card p-4'>
            <span className='inline-flex rounded-xl bg-emerald-50 p-2 text-emerald-600'>
              <Icon className='size-4' />
            </span>
            <b className='ml-3 text-sm'>{label as string}</b>
            <span className='ml-12 rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-600'>
              Enabled
            </span>
          </section>
        ))}
      </div>
      <div className='grid gap-5 xl:grid-cols-[minmax(0,1.8fr)_320px]'>
        <section className='rounded-2xl border bg-card p-5 shadow-sm'>
          <h2 className='font-bold'>Security Rules</h2>
          <dl className='mt-6 grid grid-cols-[1.2fr_1fr] gap-y-6 text-xs'>
            {rules.map(([label, value]) => (
              <>
                <dt key={`${label}-label`} className='text-muted-foreground'>
                  {label}
                </dt>
                <dd
                  key={`${label}-value`}
                  className={
                    label === 'Allow anywhere' ? 'font-semibold text-destructive' : 'font-semibold'
                  }
                >
                  {value}
                </dd>
              </>
            ))}
          </dl>
          <div className='mt-8 flex justify-end'>
            <Button>Save Rules</Button>
          </div>
        </section>
        <aside className='rounded-2xl border bg-card p-5 shadow-sm'>
          <h2 className='font-bold'>Today Security Events</h2>
          <div className='mt-5 aspect-video overflow-hidden rounded-xl border'>
            <Map center={[106.8456, -6.2088]} zoom={13} className='min-h-full'>
              <MapControls position='top-right' />
              <MapMarker longitude={106.8456} latitude={-6.2088}>
                <span className='flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg'>
                  <IconMapPin className='size-4' />
                </span>
              </MapMarker>
            </Map>
          </div>
          <div className='mt-6 space-y-4 text-xs'>
            {[
              ['Outside geofence', '6'],
              ['Fake GPS blocked', '2'],
              ['Low accuracy', '4'],
              ['Root/Jailbreak', '1'],
            ].map(([label, value]) => (
              <p key={label} className='flex justify-between text-muted-foreground'>
                {label}
                <b className='text-foreground'>{value}</b>
              </p>
            ))}
          </div>
        </aside>
      </div>
    </AppMain>
  )
}
