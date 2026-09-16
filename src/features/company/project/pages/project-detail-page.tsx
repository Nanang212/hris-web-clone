import { IconCalendar, IconMapPin } from '@tabler/icons-react'
import dayjs from 'dayjs'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Badge } from '@/shared/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Map, MapControls, MapMarker, MarkerContent } from '@/shared/components/ui/map'
import { dummyClients } from '@/features/company/client/data/dummy-clients'
import { m } from '@/i18n/paraglide/messages'

import { useProjects } from '../data/dummy-projects'

interface ProjectDetailPageProps {
  projectId: string
}

export function ProjectDetailPage({ projectId }: Readonly<ProjectDetailPageProps>) {
  const projects = useProjects()
  const project = projects.find((item) => item.id === projectId)
  const client = dummyClients.find((item) => item.id === project?.clientId)

  if (!project) return <AppMain notFound />

  const statusLabel = {
    PLANNING: m.company_project_status_planning(),
    ONGOING: m.company_project_status_ongoing(),
    ON_HOLD: m.company_project_status_on_hold(),
    COMPLETED: m.company_project_status_completed(),
    CANCELLED: m.company_project_status_cancelled(),
  }[project.status]

  return (
    <AppMain
      title={project.name}
      subtitle={project.code}
      breadcrumbs={[
        { to: '/', label: m.app_layout_nav_company() },
        { to: '/company/project', label: m.app_layout_nav_company_project() },
        { to: '.', label: project.name },
      ]}
      backTo='/company/project'
      className='w-full max-w-full min-w-0 gap-6'
    >
      <div className='grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]'>
        <Card>
          <CardHeader className='border-b'>
            <div className='flex items-center justify-between gap-3'>
              <CardTitle className='text-base'>{m.company_project_table_project()}</CardTitle>
              <Badge variant={project.status === 'ONGOING' ? 'green' : 'blue'}>{statusLabel}</Badge>
            </div>
          </CardHeader>
          <CardContent className='pt-6'>
            <dl className='grid gap-5 text-sm md:grid-cols-2'>
              <div>
                <dt className='text-muted-foreground'>{m.company_project_name()}</dt>
                <dd className='font-medium'>{project.name}</dd>
              </div>
              <div>
                <dt className='text-muted-foreground'>{m.company_project_client()}</dt>
                <dd className='font-medium'>{client?.name ?? project.clientId}</dd>
              </div>
              <div>
                <dt className='text-muted-foreground'>{m.company_project_industry()}</dt>
                <dd className='font-medium'>{project.industryField || '-'}</dd>
              </div>
              <div>
                <dt className='text-muted-foreground'>{m.company_project_table_period()}</dt>
                <dd className='flex items-center gap-2 font-medium'>
                  <IconCalendar className='size-4 text-muted-foreground' />
                  {dayjs(project.startDate).format('DD MMM YYYY')} -{' '}
                  {project.endDate ? dayjs(project.endDate).format('DD MMM YYYY') : '-'}
                </dd>
              </div>
              <div className='md:col-span-2'>
                <dt className='text-muted-foreground'>{m.company_project_description()}</dt>
                <dd className='font-medium'>{project.description || '-'}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        <Card className='xl:col-span-2'>
          <CardHeader className='border-b'>
            <CardTitle className='text-base'>{m.company_project_table_location()}</CardTitle>
          </CardHeader>
          <CardContent className='pt-6'>
            <div className='grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]'>
              <div className='flex flex-col gap-3'>
                {project.addresses.map((address, index) => (
                  <div
                    key={address.id ?? `${address.address}-${index}`}
                    className='rounded-xl border border-border/60 bg-muted/10 p-4'
                  >
                    <div className='mb-2 flex items-center gap-2 text-sm font-semibold'>
                      <IconMapPin className='size-4 text-primary' />
                      {m.company_project_address_number({ number: index + 1 })}
                    </div>
                    <p className='text-sm'>{address.address}</p>
                    <dl className='mt-3 grid gap-3 text-xs sm:grid-cols-3'>
                      <div>
                        <dt className='text-muted-foreground'>{m.company_project_latitude()}</dt>
                        <dd>{address.latitude ?? '-'}</dd>
                      </div>
                      <div>
                        <dt className='text-muted-foreground'>{m.company_project_longitude()}</dt>
                        <dd>{address.longitude ?? '-'}</dd>
                      </div>
                      <div>
                        <dt className='text-muted-foreground'>
                          {m.company_project_geofence_radius()}
                        </dt>
                        <dd>{address.geofenceRadiusMeters ?? '-'} m</dd>
                      </div>
                    </dl>
                  </div>
                ))}
              </div>
              <div className='h-72 overflow-hidden rounded-xl border border-border/60'>
                <Map
                  className='h-full w-full'
                  viewport={{
                    center: [
                      project.addresses[0]?.longitude ?? 106.8099,
                      project.addresses[0]?.latitude ?? -6.2247,
                    ],
                    zoom: 12,
                  }}
                >
                  <MapControls showCompass showFullscreen />
                  {project.addresses.map((address, index) =>
                    address.latitude != null && address.longitude != null ? (
                      <MapMarker
                        key={address.id ?? `${address.address}-${index}`}
                        longitude={address.longitude}
                        latitude={address.latitude}
                      >
                        <MarkerContent>
                          <div className='flex size-6 items-center justify-center rounded-full border-2 border-white bg-primary text-primary-foreground shadow-lg'>
                            <IconMapPin className='size-3.5' />
                          </div>
                        </MarkerContent>
                      </MapMarker>
                    ) : null,
                  )}
                </Map>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppMain>
  )
}
