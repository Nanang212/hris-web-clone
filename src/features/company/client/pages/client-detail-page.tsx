import { IconEdit, IconMail, IconMapPin, IconPhone, IconTrash, IconUser } from '@tabler/icons-react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { snackbar } from '@/shared/lib/snackbar'
import { m } from '@/i18n/paraglide/messages'

import { dummyClients } from '../data/dummy-clients'

export function ClientDetailPage({ clientId }: Readonly<{ clientId: string }>) {
  const navigate = useNavigate()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const client = dummyClients.find((item) => item.id === clientId)

  if (!client) {
    return <AppMain notFound />
  }

  const handleDelete = () => {
    snackbar.success(m.company_client_toast_deleted())
    navigate({ to: '/company/client' })
  }

  return (
    <AppMain
      title={client.name}
      subtitle={client.code}
      breadcrumbs={[
        { to: '/', label: m.app_layout_nav_company() },
        { to: '/company/client', label: m.app_layout_nav_company_client() },
        { to: '.', label: client.name },
      ]}
      backTo='/company/client'
      className='w-full max-w-full min-w-0 gap-6'
      actions={
        <div className='flex gap-2'>
          <Button variant='outline' size='sm' asChild>
            <Link to='/company/client/$id/update' params={{ id: client.id }}>
              <IconEdit className='size-4' />
              {m.company_action_edit()}
            </Link>
          </Button>
          <Button variant='destructive' size='sm' onClick={() => setDeleteOpen(true)}>
            <IconTrash className='size-4' />
            {m.company_action_delete()}
          </Button>
        </div>
      }
    >
      <div className='grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]'>
        <Card>
          <CardHeader className='border-b'>
            <div className='flex items-center justify-between gap-3'>
              <CardTitle className='text-base'>{m.company_client_table_client()}</CardTitle>
              <Badge variant={client.isActive ? 'green' : 'slate'}>
                {client.isActive ? m.company_status_active() : m.company_status_inactive()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className='pt-6'>
            <dl className='grid gap-5 text-sm md:grid-cols-2'>
              <div>
                <dt className='text-muted-foreground'>{m.company_client_name()}</dt>
                <dd className='font-medium'>{client.name}</dd>
              </div>
              <div>
                <dt className='text-muted-foreground'>{m.company_client_code()}</dt>
                <dd className='font-mono font-medium'>{client.code}</dd>
              </div>
              <div className='md:col-span-2'>
                <dt className='text-muted-foreground'>{m.company_client_address()}</dt>
                <dd className='flex gap-2 font-medium'>
                  <IconMapPin className='mt-0.5 size-4 text-muted-foreground' />
                  {client.address || '-'}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='border-b'>
            <CardTitle className='text-base'>{m.company_client_table_contact()}</CardTitle>
          </CardHeader>
          <CardContent className='flex flex-col gap-4 pt-6 text-sm'>
            <div className='flex items-center gap-2'>
              <IconUser className='size-4 text-muted-foreground' />
              {client.contactPersonName || '-'}
            </div>
            <div className='flex items-center gap-2'>
              <IconMail className='size-4 text-muted-foreground' />
              {client.contactPersonEmail || '-'}
            </div>
            <div className='flex items-center gap-2'>
              <IconPhone className='size-4 text-muted-foreground' />
              {client.contactPersonPhone || '-'}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{m.company_client_delete_title()}</DialogTitle>
            <DialogDescription>{m.company_client_delete_description()}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setDeleteOpen(false)}>
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
