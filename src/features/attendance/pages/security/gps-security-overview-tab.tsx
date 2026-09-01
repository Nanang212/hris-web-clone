// gps-security-overview-tab.tsx — GPS Security Overview tab
import { IconAlertTriangle, IconMapPin } from '@tabler/icons-react'
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

export function GpsSecurityOverviewTab() {
  return (
    <div className='flex flex-col gap-6'>
      <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        {[
          ['Geofence', IconMapPin],
          ['Fake GPS Detection', IconMapPin],
          ['Mock Location', IconMapPin],
          ['Root/Jailbreak', IconAlertTriangle],
        ].map(([label, Icon]) => (
          <section key={label as string} className='rounded-2xl border border-border/60 bg-card p-4 shadow-sm flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <span className='inline-flex rounded-xl bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'>
                <Icon className='size-4' />
              </span>
              <b className='text-xs font-bold text-foreground'>{label as string}</b>
            </div>
            <span className='rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'>
              Enabled
            </span>
          </section>
        ))}
      </div>

      <div className='grid gap-5 xl:grid-cols-[minmax(0,1.8fr)_340px]'>
        <section className='rounded-2xl border border-border/60 bg-card p-6 shadow-sm'>
          <h2 className='font-bold text-sm text-foreground'>Security Rules</h2>
          <dl className='mt-6 grid grid-cols-[1.2fr_1fr] gap-y-5 text-xs'>
            {rules.map(([label, value]) => (
              <div key={label} className='contents'>
                <dt className='text-muted-foreground'>{label}</dt>
                <dd
                  className={
                    label === 'Allow anywhere'
                      ? 'font-bold text-rose-600 dark:text-rose-400'
                      : 'font-semibold text-foreground'
                  }
                >
                  {value}
                </dd>
              </div>
            ))}
          </dl>
          <div className='mt-8 flex justify-end'>
            <Button size='sm' className='font-semibold text-xs'>Save Rules</Button>
          </div>
        </section>

        <aside className='rounded-2xl border border-border/60 bg-card p-6 shadow-sm flex flex-col justify-between'>
          <div>
            <h2 className='font-bold text-sm text-foreground'>Today Security Events</h2>
            <div className='mt-4 aspect-video overflow-hidden rounded-xl border border-border/60'>
              <Map center={[106.8456, -6.2088]} zoom={13} className='min-h-full'>
                <MapControls position='top-right' />
                <MapMarker longitude={106.8456} latitude={-6.2088}>
                  <span className='flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg'>
                    <IconMapPin className='size-3.5' />
                  </span>
                </MapMarker>
              </Map>
            </div>
            <div className='mt-5 space-y-3.5 text-xs'>
              {[
                ['Outside geofence', '6'],
                ['Fake GPS blocked', '2'],
                ['Low accuracy', '4'],
                ['Root/Jailbreak', '1'],
              ].map(([label, value]) => (
                <p key={label} className='flex justify-between text-muted-foreground'>
                  <span>{label}</span>
                  <b className='text-foreground font-bold'>{value}</b>
                </p>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
