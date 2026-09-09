import {
  IconBriefcase,
  IconCalendar,
  IconCircleCheck,
  IconDotsVertical,
  IconEdit,
  IconEye,
  IconMapPin,
  IconPlayerPlay,
  IconPlus,
  IconSearch,
  IconTrash,
} from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'

import { AppMain } from '@/shared/components/app-layout/app-main'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { Input } from '@/shared/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { snackbar } from '@/shared/lib/snackbar'
import { dummyClients } from '@/features/company/client/data/dummy-clients'
import { m } from '@/i18n/paraglide/messages'

import { dummyProjects } from '../data/dummy-projects'
import type { Project, ProjectStatus } from '../types'

const statusVariant: Record<ProjectStatus, 'blue' | 'green' | 'yellow' | 'slate' | 'red'> = {
  PLANNING: 'blue',
  ONGOING: 'green',
  ON_HOLD: 'yellow',
  COMPLETED: 'slate',
  CANCELLED: 'red',
}

function getStatusLabel(status: ProjectStatus) {
  return {
    PLANNING: m.company_project_status_planning(),
    ONGOING: m.company_project_status_ongoing(),
    ON_HOLD: m.company_project_status_on_hold(),
    COMPLETED: m.company_project_status_completed(),
    CANCELLED: m.company_project_status_cancelled(),
  }[status]
}

function formatDate(value?: string | null) {
  return value ? dayjs(value).format('DD MMM YYYY') : '-'
}

export function ProjectPage() {
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)

  const clientNameById = useMemo(
    () => new Map(dummyClients.map((client) => [client.id, client.name])),
    [],
  )
  const projects = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return dummyProjects

    return dummyProjects.filter((project) =>
      [project.code, project.name, project.industryField, clientNameById.get(project.clientId)]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(keyword)),
    )
  }, [clientNameById, search])

  const activeProjects = dummyProjects.filter((project) => project.status === 'ONGOING').length
  const completedProjects = dummyProjects.filter((project) => project.status === 'COMPLETED').length
  const projectLocationCount = dummyProjects.reduce(
    (total, project) => total + project.addresses.length,
    0,
  )
  const statsCards = [
    {
      label: m.company_project_stat_total(),
      value: dummyProjects.length,
      icon: IconBriefcase,
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
    },
    {
      label: m.company_project_stat_ongoing(),
      value: activeProjects,
      icon: IconPlayerPlay,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    },
    {
      label: m.company_project_stat_completed(),
      value: completedProjects,
      icon: IconCircleCheck,
      color: 'text-slate-600',
      bg: 'bg-slate-100 dark:bg-slate-900/50',
    },
    {
      label: m.company_project_stat_locations(),
      value: projectLocationCount,
      icon: IconMapPin,
      color: 'text-amber-600',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
    },
  ]

  const handleDelete = () => {
    snackbar.success(m.company_project_toast_deleted())
    setDeleteTarget(null)
  }

  return (
    <AppMain
      title={m.organization_project_title()}
      subtitle={m.organization_project_subtitle()}
      breadcrumbs={[
        { to: '/', label: m.app_layout_nav_company() },
        { to: '.', label: m.app_layout_nav_company_project() },
      ]}
      className='w-full max-w-full min-w-0 gap-6'
    >
      <div className='flex flex-col gap-4'>
        <div className='mb-2 grid grid-cols-2 gap-4 lg:grid-cols-4'>
          {statsCards.map((card) => {
            const Icon = card.icon
            return (
              <div
                key={card.label}
                className='flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-sm'
              >
                <div
                  className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${card.bg}`}
                >
                  <Icon size={22} className={card.color} />
                </div>
                <div className='min-w-0'>
                  <p className='text-[11px] font-medium text-muted-foreground'>{card.label}</p>
                  <p className={`text-2xl font-extrabold ${card.color}`}>{card.value}</p>
                </div>
              </div>
            )
          })}
        </div>
        <div className='flex flex-wrap items-center gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-sm'>
          <div className='relative w-full md:max-w-sm'>
            <IconSearch className='absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={m.company_project_search_placeholder()}
              className='pl-9'
            />
          </div>
          <div className='ml-auto flex w-full items-center justify-between gap-3 sm:w-auto'>
            <span className='text-xs font-medium text-muted-foreground'>
              {m.company_project_count({ count: projects.length })}
            </span>
            <Button
              type='button'
              size='sm'
              className='h-9 shrink-0 gap-1.5 rounded-xl px-4 text-xs font-bold shadow-xs'
              asChild
            >
              <Link to='/company/project/new'>
                <IconPlus size={15} />
                {m.company_project_add()}
              </Link>
            </Button>
          </div>
        </div>

        <div className='overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm'>
          <div className='border-b border-border/60 p-5'>
            <h3 className='text-sm font-bold text-foreground'>
              {m.company_project_table_project()}
            </h3>
            <p className='mt-0.5 text-xs text-muted-foreground'>
              {m.company_project_form_description()}
            </p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-12 text-center'>No</TableHead>
                <TableHead>{m.company_project_table_project()}</TableHead>
                <TableHead>{m.company_project_table_client()}</TableHead>
                <TableHead>{m.company_project_table_period()}</TableHead>
                <TableHead>{m.company_project_table_location()}</TableHead>
                <TableHead className='text-center'>{m.company_project_table_status()}</TableHead>
                <TableHead className='text-right'>{m.company_project_table_action()}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className='h-32 text-center text-sm text-muted-foreground'>
                    {m.company_project_empty()}
                  </TableCell>
                </TableRow>
              ) : (
                projects.map((project, index) => {
                  const address = project.addresses[0]

                  return (
                    <TableRow key={project.id} className='transition-colors hover:bg-muted/30'>
                      <TableCell className='text-center text-xs font-semibold text-muted-foreground'>
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <Link
                          to='/company/project/$id'
                          params={{ id: project.id }}
                          className='flex items-center gap-3 hover:text-primary'
                        >
                          <div className='flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary'>
                            <IconBriefcase className='size-4' />
                          </div>
                          <div>
                            <div className='font-semibold'>{project.name}</div>
                            <div className='font-mono text-xs text-muted-foreground'>
                              {project.code}
                            </div>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        {clientNameById.get(project.clientId) ?? project.clientId}
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                          <IconCalendar className='size-3.5' />
                          {formatDate(project.startDate)} - {formatDate(project.endDate)}
                        </div>
                      </TableCell>
                      <TableCell className='max-w-xs'>
                        <div className='flex items-start gap-2 text-sm text-muted-foreground'>
                          <IconMapPin className='mt-0.5 size-3.5 shrink-0' />
                          <span className='line-clamp-2'>{address?.address || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell className='text-center'>
                        <Badge variant={statusVariant[project.status]}>
                          {getStatusLabel(project.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-right'>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant='ghost' size='icon-sm'>
                              <IconDotsVertical className='size-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DropdownMenuItem asChild>
                              <Link to='/company/project/$id' params={{ id: project.id }}>
                                <IconEye className='size-4' />
                                {m.company_action_detail()}
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to='/company/project/$id/update' params={{ id: project.id }}>
                                <IconEdit className='size-4' />
                                {m.company_action_edit()}
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className='text-destructive focus:text-destructive'
                              onClick={() => setDeleteTarget(project)}
                            >
                              <IconTrash className='size-4' />
                              {m.company_action_delete()}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{m.company_project_delete_title()}</DialogTitle>
            <DialogDescription>{m.company_project_delete_description()}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setDeleteTarget(null)}>
              {m.company_action_cancel()}
            </Button>
            <Button variant='destructive' onClick={handleDelete}>
              {m.company_action_delete()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppMain>
  )
}
