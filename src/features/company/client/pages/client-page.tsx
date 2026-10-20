import {
  IconBriefcase,
  IconBuildingSkyscraper,
  IconEdit,
  IconFolderCheck,
  IconFolderOff,
  IconPlus,
  IconSearch,
  IconTrash,
} from '@tabler/icons-react'
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
import { TablePagination } from '@/shared/components/ui/table-pagination'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip'
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
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

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

  const totalPages = Math.max(1, Math.ceil(filteredClients.length / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)

  const paginatedClients = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize
    return filteredClients.slice(start, start + pageSize)
  }, [filteredClients, safeCurrentPage, pageSize])

  const usedClientsCount = clients.filter((c) => (clientProjectCounts.get(c.id) ?? 0) > 0).length
  const unusedClientsCount = clients.filter((c) => (clientProjectCounts.get(c.id) ?? 0) === 0).length
  const statsCards = [
    {
      label: 'Total Klien',
      value: clients.length,
      icon: IconBuildingSkyscraper,
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
    },
    {
      label: 'Klien Aktif (Ada Proyek)',
      value: usedClientsCount,
      icon: IconFolderCheck,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    },
    {
      label: 'Klien Tanpa Proyek',
      value: unusedClientsCount,
      icon: IconFolderOff,
      color: 'text-slate-600',
      bg: 'bg-slate-100 dark:bg-slate-900/50',
    },
    {
      label: 'Total Proyek Terkait',
      value: projects.length,
      icon: IconBriefcase,
      color: 'text-amber-600',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
    },
  ]

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
    >
      <div className='flex flex-col gap-4'>
        {/* ── Top Stats Cards ── */}
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

        {/* ── Filter and Action Bar ── */}
        <div className='flex flex-col items-stretch justify-between gap-3 rounded-2xl border border-border/80 bg-card p-4 lg:flex-row lg:items-center shadow-xs'>
          <div className='flex min-w-0 flex-1 flex-wrap items-center gap-2.5'>
            {/* Search Input */}
            <div className='relative w-full sm:w-64'>
              <IconSearch
                size={14}
                className='absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground'
              />
              <Input
                id='search-client'
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setCurrentPage(1)
                }}
                placeholder='Search code, name, PIC, or email...'
                className='h-9 w-full rounded-xl bg-background pl-9 text-xs'
              />
            </div>

            {/* Project Usage Filter */}
            <Select
              value={projectUsage}
              onValueChange={(val) => {
                setProjectUsage(val as 'ALL' | 'USED' | 'UNUSED')
                setCurrentPage(1)
              }}
            >
              <SelectTrigger id='project-usage' className='h-9 w-full rounded-xl bg-background text-xs sm:w-48'>
                <SelectValue placeholder='All clients' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ALL'>Semua Klien</SelectItem>
                <SelectItem value='USED'>Digunakan di Proyek</SelectItem>
                <SelectItem value='UNUSED'>Belum Ada Proyek</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='flex items-center justify-between gap-3 sm:justify-end'>
            <span className='text-xs font-medium text-muted-foreground'>
              {filteredClients.length} klien ditemukan
            </span>
            <Button
              type='button'
              size='sm'
              className='h-9 shrink-0 gap-1.5 rounded-xl px-4 text-xs font-bold shadow-xs'
              onClick={() => {
                setAddForm(defaultFormData)
                setIsAddOpen(true)
              }}
            >
              <IconPlus size={15} />
              Add Client
            </Button>
          </div>
        </div>

        {/* ── Card with Table ── */}
        <div className='overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm'>
          {/* Card Header */}
          <div className='border-b border-border/60 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
            <div>
              <h3 className='text-sm font-bold text-foreground'>
                Daftar Klien
              </h3>
              <p className='mt-0.5 text-xs text-muted-foreground'>
                Master data klien yang terintegrasi dengan penugasan dan operasional proyek.
              </p>
            </div>
            <span className='text-xs font-medium text-muted-foreground'>
              Menampilkan {paginatedClients.length} dari {filteredClients.length} klien
            </span>
          </div>

          {/* Table */}
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-12 text-center'>No</TableHead>
                  <TableHead>Kode Klien</TableHead>
                  <TableHead>Nama Klien</TableHead>
                  <TableHead>Nama PIC</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telepon</TableHead>
                  <TableHead className='text-center'>Proyek</TableHead>
                  <TableHead className='text-right'>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className='h-32 text-center text-sm text-muted-foreground'>
                      Tidak ada data klien yang ditemukan.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedClients.map((client, index) => {
                    const count = clientProjectCounts.get(client.id) ?? 0
                    return (
                      <TableRow key={client.id} className='transition-colors hover:bg-muted/30'>
                        <TableCell className='text-center text-xs font-semibold text-muted-foreground'>
                          {(safeCurrentPage - 1) * pageSize + index + 1}
                        </TableCell>
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
                        <TableCell className='text-center'>
                          <div className='inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-blue-50/60 dark:bg-blue-950/30 px-2.5 py-1 text-xs font-medium text-foreground'>
                            <IconBriefcase className='size-3.5 text-blue-600 shrink-0' />
                            <span>{count} Proyek</span>
                          </div>
                        </TableCell>
                        <TableCell className='text-right'>
                          <div className='flex items-center justify-end gap-1'>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  type='button'
                                  variant='ghost'
                                  size='icon-sm'
                                  onClick={() => openEditModal(client)}
                                  className='size-8 text-muted-foreground hover:bg-primary/10 hover:text-primary'
                                  aria-label='Edit'
                                >
                                  <IconEdit size={16} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side='top'>
                                <p>Edit</p>
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  type='button'
                                  variant='ghost'
                                  size='icon-sm'
                                  onClick={() => setDeleteTarget(client)}
                                  className='size-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
                                  aria-label='Delete'
                                >
                                  <IconTrash size={16} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side='top'>
                                <p>Delete</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Table Pagination */}
          <TablePagination
            itemLabel='klien'
            totalItems={filteredClients.length}
            currentPage={safeCurrentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize)
              setCurrentPage(1)
            }}
            pageSizeOptions={[5, 10, 20, 50]}
          />
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
