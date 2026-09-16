import { IconPlus } from '@tabler/icons-react'
import { useMemo, useState } from 'react'

import { useProjects } from '@/features/company/project/data/dummy-projects'
import { AppMain } from '@/shared/components/app-layout/app-main'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { FieldLabel } from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { snackbar } from '@/shared/lib/snackbar'

import {
  addClient,
  deleteClient,
  updateClient,
  useClients,
} from '../data/dummy-clients'
import type { Client } from '../types'

interface ClientFormData {
  name: string
  code: string
  contactPersonName: string
  contactPersonEmail: string
  contactPersonPhone: string
  address: string
}

const defaultFormData: ClientFormData = {
  name: '',
  code: '',
  contactPersonName: '',
  contactPersonEmail: '',
  contactPersonPhone: '',
  address: '',
}

export function ClientPage() {
  const clients = useClients()
  const projects = useProjects()

  const [search, setSearch] = useState('')
  const [projectUsage, setProjectUsage] = useState<'ALL' | 'USED' | 'UNUSED'>('ALL')

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [addForm, setAddForm] = useState<ClientFormData>(defaultFormData)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [editForm, setEditForm] = useState<ClientFormData>(defaultFormData)
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null)

  // Map each client to project count
  const clientProjectCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const project of projects) {
      if (project.clientId) {
        counts.set(project.clientId, (counts.get(project.clientId) ?? 0) + 1)
      }
    }
    return counts
  }, [projects])

  // Filtered clients list
  const filteredClients = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return clients.filter((client) => {
      const matchKeyword =
        !keyword ||
        [client.code, client.name, client.contactPersonName, client.contactPersonEmail]
          .filter(Boolean)
          .some((val) => val?.toLowerCase().includes(keyword))

      if (!matchKeyword) return false

      const projectCount = clientProjectCounts.get(client.id) ?? 0
      if (projectUsage === 'USED') return projectCount > 0
      if (projectUsage === 'UNUSED') return projectCount === 0
      return true
    })
  }, [clients, search, projectUsage, clientProjectCounts])

  // Open Edit Modal
  const openEditModal = (client: Client) => {
    setEditingClient(client)
    setEditForm({
      name: client.name ?? '',
      code: client.code ?? '',
      contactPersonName: client.contactPersonName ?? '',
      contactPersonEmail: client.contactPersonEmail ?? '',
      contactPersonPhone: client.contactPersonPhone ?? '',
      address: client.address ?? '',
    })
  }

  // Handle Create Client
  const handleSaveNewClient = () => {
    if (!addForm.name.trim() || !addForm.code.trim()) {
      snackbar.error('Please enter Client Name and Client Code.')
      return
    }

    const newClient: Client = {
      id: `client-${Date.now()}`,
      code: addForm.code.trim(),
      name: addForm.name.trim(),
      contactPersonName: addForm.contactPersonName.trim() || null,
      contactPersonEmail: addForm.contactPersonEmail.trim() || null,
      contactPersonPhone: addForm.contactPersonPhone.trim() || null,
      address: addForm.address.trim() || null,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    addClient(newClient)
    snackbar.success('Client created successfully')
    setIsAddOpen(false)
    setAddForm(defaultFormData)
  }

  // Handle Update Client
  const handleSaveEditClient = () => {
    if (!editingClient) return
    if (!editForm.name.trim() || !editForm.code.trim()) {
      snackbar.error('Please enter Client Name and Client Code.')
      return
    }

    updateClient(editingClient.id, {
      name: editForm.name.trim(),
      code: editForm.code.trim(),
      contactPersonName: editForm.contactPersonName.trim() || null,
      contactPersonEmail: editForm.contactPersonEmail.trim() || null,
      contactPersonPhone: editForm.contactPersonPhone.trim() || null,
      address: editForm.address.trim() || null,
    })

    snackbar.success('Client updated successfully')
    setEditingClient(null)
  }

  // Handle Delete Client
  const handleConfirmDelete = () => {
    if (!deleteTarget) return
    deleteClient(deleteTarget.id)
    snackbar.success('Client deleted successfully')
    setDeleteTarget(null)
  }

  return (
    <AppMain
      title='Client'
      subtitle='Manage client master data used by projects.'
      breadcrumbs={[
        { to: '/', label: 'Company' },
        { to: '.', label: 'Client' },
      ]}
      className='w-full max-w-full min-w-0 gap-6'
      actions={
        <Button
          type='button'
          onClick={() => {
            setAddForm(defaultFormData)
            setIsAddOpen(true)
          }}
          className='h-10 gap-1.5 rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white shadow-xs hover:bg-blue-700'
        >
          <IconPlus size={16} />
          Add Client
        </Button>
      }
    >
      <div className='flex flex-col gap-6'>
        {/* Filters Row */}
        <div className='grid gap-4 sm:grid-cols-2'>
          <div>
            <FieldLabel htmlFor='search-client' className='text-xs font-semibold text-foreground'>
              Search Client
            </FieldLabel>
            <Input
              id='search-client'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Search code, name, PIC, or email'
              className='mt-1.5 h-10 text-xs'
            />
          </div>

          <div>
            <FieldLabel htmlFor='project-usage' className='text-xs font-semibold text-foreground'>
              Project Usage
            </FieldLabel>
            <Select
              value={projectUsage}
              onValueChange={(val) => setProjectUsage(val as 'ALL' | 'USED' | 'UNUSED')}
            >
              <SelectTrigger id='project-usage' className='mt-1.5 h-10 text-xs'>
                <SelectValue placeholder='All clients' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ALL'>All clients</SelectItem>
                <SelectItem value='USED'>Used in projects</SelectItem>
                <SelectItem value='UNUSED'>Not used in projects</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Card with Table */}
        <div className='overflow-hidden rounded-2xl border border-border/70 bg-card p-6 shadow-xs'>
          {/* Card Header */}
          <div className='mb-4'>
            <h3 className='text-base font-bold text-foreground'>
              Clients · {filteredClients.length}
            </h3>
            <p className='mt-0.5 text-xs text-muted-foreground'>
              Client master data is used by the Client field when creating or editing a project.
            </p>
          </div>

          {/* Table */}
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow className='hover:bg-transparent'>
                  <TableHead className='font-semibold text-xs text-foreground'>Client Code</TableHead>
                  <TableHead className='font-semibold text-xs text-foreground'>Client Name</TableHead>
                  <TableHead className='font-semibold text-xs text-foreground'>PIC Name</TableHead>
                  <TableHead className='font-semibold text-xs text-foreground'>Email</TableHead>
                  <TableHead className='font-semibold text-xs text-foreground'>Phone</TableHead>
                  <TableHead className='font-semibold text-xs text-foreground'>Projects</TableHead>
                  <TableHead className='font-semibold text-xs text-foreground'>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className='h-32 text-center text-xs text-muted-foreground'>
                      No clients found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClients.map((client) => {
                    const count = clientProjectCounts.get(client.id) ?? 0
                    return (
                      <TableRow key={client.id} className='transition-colors hover:bg-muted/30'>
                        <TableCell className='font-mono text-xs font-medium text-foreground'>
                          {client.code}
                        </TableCell>
                        <TableCell className='text-xs font-semibold text-foreground'>
                          {client.name}
                        </TableCell>
                        <TableCell className='text-xs text-foreground'>
                          {client.contactPersonName || '-'}
                        </TableCell>
                        <TableCell className='text-xs text-foreground'>
                          {client.contactPersonEmail || '-'}
                        </TableCell>
                        <TableCell className='text-xs text-foreground'>
                          {client.contactPersonPhone || '-'}
                        </TableCell>
                        <TableCell className='text-xs text-foreground'>
                          {count} {count === 1 ? 'project' : 'projects'}
                        </TableCell>
                        <TableCell className='text-xs'>
                          <div className='flex items-center gap-3'>
                            <button
                              type='button'
                              onClick={() => openEditModal(client)}
                              className='font-medium text-blue-600 hover:text-blue-700 hover:underline'
                            >
                              Edit
                            </button>
                            <button
                              type='button'
                              onClick={() => setDeleteTarget(client)}
                              className='font-medium text-red-600 hover:text-red-700 hover:underline'
                            >
                              Delete
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Row */}
          <div className='mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground'>
            <span>
              Showing {filteredClients.length > 0 ? 1 : 0}–{filteredClients.length} of {filteredClients.length} clients
            </span>
            <div className='flex items-center gap-3'>
              <button
                type='button'
                disabled
                className='cursor-not-allowed opacity-50 hover:text-foreground'
              >
                ‹ Previous
              </button>
              <span className='font-semibold text-foreground'>1</span>
              <button
                type='button'
                disabled
                className='cursor-not-allowed opacity-50 hover:text-foreground'
              >
                Next ›
              </button>
            </div>
          </div>

          {/* Project Integration Callout */}
          <div className='mt-6 rounded-xl border border-blue-100 bg-blue-50/70 p-4 dark:border-blue-900/40 dark:bg-blue-950/25'>
            <p className='text-xs font-bold text-blue-600 dark:text-blue-400'>
              Project integration
            </p>
            <p className='mt-0.5 text-xs text-muted-foreground'>
              The Project &gt; Client field should load its options from this Client master data.
            </p>
          </div>
        </div>
      </div>

      {/* Add Client Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className='sm:max-w-xl p-6'>
          <DialogHeader>
            <DialogTitle className='text-lg font-bold text-foreground'>Add Client</DialogTitle>
            <DialogDescription className='text-xs text-muted-foreground'>
              Add a client that can be selected in projects.
            </DialogDescription>
          </DialogHeader>

          <div className='flex flex-col gap-4 py-2'>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div>
                <FieldLabel className='text-xs font-semibold text-foreground'>
                  Client Name *
                </FieldLabel>
                <Input
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  placeholder='Enter client name'
                  className='mt-1.5 h-10 text-xs'
                />
              </div>
              <div>
                <FieldLabel className='text-xs font-semibold text-foreground'>
                  Client Code *
                </FieldLabel>
                <Input
                  value={addForm.code}
                  onChange={(e) => setAddForm({ ...addForm, code: e.target.value })}
                  placeholder='Enter client code'
                  className='mt-1.5 h-10 text-xs'
                />
              </div>
            </div>

            <div className='grid gap-4 sm:grid-cols-2'>
              <div>
                <FieldLabel className='text-xs font-semibold text-foreground'>
                  PIC Name *
                </FieldLabel>
                <Input
                  value={addForm.contactPersonName}
                  onChange={(e) => setAddForm({ ...addForm, contactPersonName: e.target.value })}
                  placeholder='Enter contact person'
                  className='mt-1.5 h-10 text-xs'
                />
              </div>
              <div>
                <FieldLabel className='text-xs font-semibold text-foreground'>
                  Email *
                </FieldLabel>
                <Input
                  type='email'
                  value={addForm.contactPersonEmail}
                  onChange={(e) => setAddForm({ ...addForm, contactPersonEmail: e.target.value })}
                  placeholder='name@company.com'
                  className='mt-1.5 h-10 text-xs'
                />
              </div>
            </div>

            <div className='grid gap-4 sm:grid-cols-2'>
              <div>
                <FieldLabel className='text-xs font-semibold text-foreground'>
                  Phone *
                </FieldLabel>
                <Input
                  value={addForm.contactPersonPhone}
                  onChange={(e) => setAddForm({ ...addForm, contactPersonPhone: e.target.value })}
                  placeholder='+62 ...'
                  className='mt-1.5 h-10 text-xs'
                />
              </div>
              <div>
                <FieldLabel className='text-xs font-semibold text-foreground'>
                  Address *
                </FieldLabel>
                <Input
                  value={addForm.address}
                  onChange={(e) => setAddForm({ ...addForm, address: e.target.value })}
                  placeholder='Enter client address'
                  className='mt-1.5 h-10 text-xs'
                />
              </div>
            </div>

            {/* Callout notice */}
            <div className='rounded-xl border border-border/60 bg-muted/30 p-4'>
              <p className='text-xs font-semibold text-foreground'>Used by Project</p>
              <p className='mt-0.5 text-xs text-muted-foreground'>
                Saved clients become options in the Client field when creating or editing a project.
              </p>
            </div>
          </div>

          <DialogFooter className='gap-2 sm:gap-0'>
            <Button
              type='button'
              variant='outline'
              onClick={() => setIsAddOpen(false)}
              className='h-9 rounded-lg text-xs'
            >
              Cancel
            </Button>
            <Button
              type='button'
              onClick={handleSaveNewClient}
              className='h-9 rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white shadow-xs hover:bg-blue-700'
            >
              Save Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog open={!!editingClient} onOpenChange={(open) => !open && setEditingClient(null)}>
        <DialogContent className='sm:max-w-xl p-6'>
          <DialogHeader>
            <DialogTitle className='text-lg font-bold text-foreground'>Edit Client</DialogTitle>
            <DialogDescription className='text-xs text-muted-foreground'>
              Update client information used by projects.
            </DialogDescription>
          </DialogHeader>

          <div className='flex flex-col gap-4 py-2'>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div>
                <FieldLabel className='text-xs font-semibold text-foreground'>
                  Client Name *
                </FieldLabel>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder='Client Name'
                  className='mt-1.5 h-10 text-xs'
                />
              </div>
              <div>
                <FieldLabel className='text-xs font-semibold text-foreground'>
                  Client Code *
                </FieldLabel>
                <Input
                  value={editForm.code}
                  onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                  placeholder='Client Code'
                  className='mt-1.5 h-10 text-xs'
                />
              </div>
            </div>

            <div className='grid gap-4 sm:grid-cols-2'>
              <div>
                <FieldLabel className='text-xs font-semibold text-foreground'>
                  PIC Name *
                </FieldLabel>
                <Input
                  value={editForm.contactPersonName}
                  onChange={(e) => setEditForm({ ...editForm, contactPersonName: e.target.value })}
                  placeholder='PIC Name'
                  className='mt-1.5 h-10 text-xs'
                />
              </div>
              <div>
                <FieldLabel className='text-xs font-semibold text-foreground'>
                  Email *
                </FieldLabel>
                <Input
                  type='email'
                  value={editForm.contactPersonEmail}
                  onChange={(e) => setEditForm({ ...editForm, contactPersonEmail: e.target.value })}
                  placeholder='Email'
                  className='mt-1.5 h-10 text-xs'
                />
              </div>
            </div>

            <div className='grid gap-4 sm:grid-cols-2'>
              <div>
                <FieldLabel className='text-xs font-semibold text-foreground'>
                  Phone *
                </FieldLabel>
                <Input
                  value={editForm.contactPersonPhone}
                  onChange={(e) => setEditForm({ ...editForm, contactPersonPhone: e.target.value })}
                  placeholder='Phone'
                  className='mt-1.5 h-10 text-xs'
                />
              </div>
              <div>
                <FieldLabel className='text-xs font-semibold text-foreground'>
                  Address *
                </FieldLabel>
                <Input
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  placeholder='Address'
                  className='mt-1.5 h-10 text-xs'
                />
              </div>
            </div>

            {/* Callout notice */}
            <div className='rounded-xl border border-border/60 bg-muted/30 p-4'>
              <p className='text-xs font-semibold text-foreground'>Client reference</p>
              <p className='mt-0.5 text-xs text-muted-foreground'>
                Changes will be reflected in the Client field used when creating or editing projects.
              </p>
            </div>
          </div>

          <DialogFooter className='gap-2 sm:gap-0'>
            <Button
              type='button'
              variant='outline'
              onClick={() => setEditingClient(null)}
              className='h-9 rounded-lg text-xs'
            >
              Cancel
            </Button>
            <Button
              type='button'
              onClick={handleSaveEditClient}
              className='h-9 rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white shadow-xs hover:bg-blue-700'
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Client Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className='sm:max-w-md p-6'>
          <DialogHeader>
            <DialogTitle className='text-lg font-bold text-foreground'>Delete Client</DialogTitle>
            <DialogDescription className='text-xs text-muted-foreground'>
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className='py-2'>
            <div className='rounded-xl border border-red-200/80 bg-red-50/70 p-4 dark:border-red-900/50 dark:bg-red-950/30'>
              <p className='text-sm font-semibold text-red-600 dark:text-red-400'>
                {deleteTarget?.name}
              </p>
              <p className='mt-1 text-xs text-red-600/90 dark:text-red-400/90'>
                This client will no longer be available in the Project &gt; Client field.
              </p>
            </div>
            <p className='mt-4 text-xs text-muted-foreground'>
              Review projects that reference this client before deleting it.
            </p>
          </div>

          <DialogFooter className='gap-2 sm:gap-0'>
            <Button
              type='button'
              variant='outline'
              onClick={() => setDeleteTarget(null)}
              className='h-9 rounded-lg text-xs'
            >
              Cancel
            </Button>
            <Button
              type='button'
              onClick={handleConfirmDelete}
              className='h-9 rounded-lg bg-red-600 px-4 text-xs font-semibold text-white shadow-xs hover:bg-red-700'
            >
              Delete Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppMain>
  )
}
