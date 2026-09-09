import {
  IconBuildingCommunity,
  IconDotsVertical,
  IconEdit,
  IconEye,
  IconMail,
  IconMapPin,
  IconPhone,
  IconPlus,
  IconSearch,
  IconTrash,
  IconUser,
  IconUserCheck,
  IconUsers,
  IconUserX,
} from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
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
import { m } from '@/i18n/paraglide/messages'

import { dummyClients } from '../data/dummy-clients'
import type { Client } from '../types'

export function ClientPage() {
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null)

  const clients = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return dummyClients

    return dummyClients.filter((client) =>
      [client.code, client.name, client.contactPersonName, client.contactPersonEmail]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(keyword)),
    )
  }, [search])

  const activeCount = dummyClients.filter((client) => client.isActive).length
  const clientsWithContacts = dummyClients.filter(
    (client) => client.contactPersonName || client.contactPersonEmail || client.contactPersonPhone,
  ).length
  const statsCards = [
    {
      label: m.company_client_stat_total(),
      value: dummyClients.length,
      icon: IconUsers,
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
    },
    {
      label: m.company_client_stat_active(),
      value: activeCount,
      icon: IconUserCheck,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    },
    {
      label: m.company_client_stat_inactive(),
      value: dummyClients.length - activeCount,
      icon: IconUserX,
      color: 'text-rose-600',
      bg: 'bg-rose-50 dark:bg-rose-950/30',
    },
    {
      label: m.company_client_stat_contacts(),
      value: clientsWithContacts,
      icon: IconMail,
      color: 'text-amber-600',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
    },
  ]

  const handleDelete = () => {
    snackbar.success(m.company_client_toast_deleted())
    setDeleteTarget(null)
  }

  return (
    <AppMain
      title={m.organization_client_title()}
      subtitle={m.organization_client_subtitle()}
      breadcrumbs={[
        { to: '/', label: m.app_layout_nav_company() },
        { to: '.', label: m.app_layout_nav_company_client() },
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
              placeholder={m.company_client_search_placeholder()}
              className='pl-9'
            />
          </div>
          <div className='ml-auto flex w-full items-center justify-between gap-3 sm:w-auto'>
            <span className='text-xs font-medium text-muted-foreground'>
              {m.company_client_count({ count: clients.length })}
            </span>
            <Button
              type='button'
              size='sm'
              className='h-9 shrink-0 gap-1.5 rounded-xl px-4 text-xs font-bold shadow-xs'
              asChild
            >
              <Link to='/company/client/new'>
                <IconPlus size={15} />
                {m.company_client_add()}
              </Link>
            </Button>
          </div>
        </div>

        <div className='overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm'>
          <div className='border-b border-border/60 p-5'>
            <h3 className='text-sm font-bold text-foreground'>{m.company_client_table_client()}</h3>
            <p className='mt-0.5 text-xs text-muted-foreground'>
              {m.company_client_form_description()}
            </p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-12 text-center'>No</TableHead>
                <TableHead>{m.company_client_table_client()}</TableHead>
                <TableHead>{m.company_client_table_contact()}</TableHead>
                <TableHead>{m.company_client_table_address()}</TableHead>
                <TableHead className='text-center'>{m.company_client_table_status()}</TableHead>
                <TableHead className='text-right'>{m.company_client_table_action()}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className='h-32 text-center text-sm text-muted-foreground'>
                    {m.company_client_empty()}
                  </TableCell>
                </TableRow>
              ) : (
                clients.map((client, index) => (
                  <TableRow key={client.id} className='transition-colors hover:bg-muted/30'>
                    <TableCell className='text-center text-xs font-semibold text-muted-foreground'>
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <Link
                        to='/company/client/$id'
                        params={{ id: client.id }}
                        className='flex items-center gap-3 hover:text-primary'
                      >
                        <div className='flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary'>
                          <IconBuildingCommunity className='size-4' />
                        </div>
                        <div>
                          <div className='font-semibold'>{client.name}</div>
                          <div className='font-mono text-xs text-muted-foreground'>
                            {client.code}
                          </div>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className='flex flex-col gap-1 text-sm'>
                        <div className='flex items-center gap-2'>
                          <IconUser className='size-3.5 text-muted-foreground' />
                          {client.contactPersonName || '-'}
                        </div>
                        <div className='flex items-center gap-2 text-muted-foreground'>
                          <IconMail className='size-3.5' />
                          {client.contactPersonEmail || '-'}
                        </div>
                        <div className='flex items-center gap-2 text-muted-foreground'>
                          <IconPhone className='size-3.5' />
                          {client.contactPersonPhone || '-'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className='max-w-sm'>
                      <div className='flex items-start gap-2 text-sm text-muted-foreground'>
                        <IconMapPin className='mt-0.5 size-3.5 shrink-0' />
                        <span className='line-clamp-2'>{client.address || '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell className='text-center'>
                      <Badge variant={client.isActive ? 'green' : 'slate'}>
                        {client.isActive ? m.company_status_active() : m.company_status_inactive()}
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
                            <Link to='/company/client/$id' params={{ id: client.id }}>
                              <IconEye className='size-4' />
                              {m.company_action_detail()}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to='/company/client/$id/update' params={{ id: client.id }}>
                              <IconEdit className='size-4' />
                              {m.company_action_edit()}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className='text-destructive focus:text-destructive'
                            onClick={() => setDeleteTarget(client)}
                          >
                            <IconTrash className='size-4' />
                            {m.company_action_delete()}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{m.company_client_delete_title()}</DialogTitle>
            <DialogDescription>{m.company_client_delete_description()}</DialogDescription>
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
