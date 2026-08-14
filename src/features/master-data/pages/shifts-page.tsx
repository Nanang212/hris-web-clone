// shifts-page.tsx
import { useState } from 'react'
import { IconPlus, IconSearch, IconEdit, IconTrash } from '@tabler/icons-react'
import { AppMain } from '@/shared/components/app-layout/app-main'
import { snackbar } from '@/shared/lib/snackbar'
import { cn } from '@/shared/lib/utils'
import {
  useShifts,
  useCreateShift,
  useUpdateShift,
  useDeleteShift,
} from '../hooks'
import type { Shift } from '../types'
import { ShiftModal } from '../components/add-edit-modals'

export function ShiftsPage() {
  const { data: list, isPending, error } = useShifts()
  const { mutateAsync: createShift, isPending: isCreating } = useCreateShift()
  const { mutateAsync: updateShift, isPending: isUpdating } = useUpdateShift()
  const { mutateAsync: deleteShift } = useDeleteShift()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItem, setSelectedItem] = useState<Shift | undefined>()
  const [showModal, setShowModal] = useState(false)

  const shiftsList = list ?? []

  const filteredList = shiftsList.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleSave = async (payload: Omit<Shift, 'id'>) => {
    try {
      if (selectedItem) {
        await updateShift({ id: selectedItem.id, updates: payload })
        snackbar.success('Shift berhasil diperbarui!')
      } else {
        await createShift(payload)
        snackbar.success('Shift baru berhasil ditambahkan!')
      }
      setShowModal(false)
    } catch (err) {
      snackbar.exception(err)
    }
  }

  const handleDelete = async (item: Shift) => {
    if (confirm(`Apakah Anda yakin ingin menghapus shift ${item.name}?`)) {
      try {
        await deleteShift(item.id)
        snackbar.success('Shift berhasil dihapus.')
      } catch (err) {
        snackbar.exception(err)
      }
    }
  }

  return (
    <AppMain
      pending={isPending}
      error={error}
      backTo='/settings/master-data'
      breadcrumbs={[
        { to: '/', label: 'Pengaturan' },
        { to: '/settings/master-data', label: 'Master Data' },
        { to: '.', label: 'Shifts' },
      ]}
      title='Shifts'
      subtitle='Kelola skema jam kerja karyawan, toleransi, dan status keterlambatan'
      actions={
        <button
          type='button'
          onClick={() => {
            setSelectedItem(undefined)
            setShowModal(true)
          }}
          className='inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground transition-all hover:bg-primary/90'
        >
          <IconPlus size={16} />
          Tambah Shift
        </button>
      }
    >
      <div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='relative flex-1 max-w-md'>
          <IconSearch
            size={18}
            className='absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground'
          />
          <input
            type='text'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Cari shift berdasarkan kode atau nama...'
            className='h-10 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-xs focus:ring-2 focus:ring-ring/50 focus:outline-none'
          />
        </div>
      </div>

      <div className='overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm'>
        <div className='overflow-x-auto'>
          <table className='w-full border-collapse text-left'>
            <thead>
              <tr className='border-b border-border bg-muted/30'>
                <th className='py-3.5 pr-2 pl-6 text-xs font-bold text-muted-foreground uppercase'>No</th>
                <th className='px-3 py-3.5 text-xs font-bold text-muted-foreground uppercase'>Kode Shift</th>
                <th className='px-3 py-3.5 text-xs font-bold text-muted-foreground uppercase'>Nama Shift</th>
                <th className='px-3 py-3.5 text-center text-xs font-bold text-muted-foreground uppercase'>Jam Kerja</th>
                <th className='px-3 py-3.5 text-center text-xs font-bold text-muted-foreground uppercase'>Toleransi Keterlambatan</th>
                <th className='px-3 py-3.5 text-center text-xs font-bold text-muted-foreground uppercase'>Status</th>
                <th className='py-3.5 pr-6 pl-3 text-center text-xs font-bold text-muted-foreground uppercase'>Aksi</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border/50'>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className='py-16 text-center text-xs text-muted-foreground'>
                    Tidak ada data shift yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredList.map((item, idx) => (
                  <tr key={item.id} className='group hover:bg-muted/10 transition-colors'>
                    <td className='py-4 pr-2 pl-6 text-xs font-semibold text-muted-foreground'>{idx + 1}</td>
                    <td className='px-3 py-4 text-xs font-bold text-foreground'>{item.code}</td>
                    <td className='px-3 py-4 text-xs font-semibold text-foreground'>{item.name}</td>
                    <td className='px-3 py-4 text-center text-xs text-foreground font-semibold'>
                      {item.startTime} - {item.endTime}
                    </td>
                    <td className='px-3 py-4 text-center text-xs text-muted-foreground font-semibold'>
                      {item.gracePeriod} menit
                    </td>
                    <td className='px-3 py-4 text-center'>
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase',
                          item.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400',
                        )}
                      >
                        {item.status === 'active' ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className='py-4 pr-6 pl-3 text-center'>
                      <div className='flex items-center justify-center gap-1.5'>
                        <button
                          type='button'
                          onClick={() => {
                            setSelectedItem(item)
                            setShowModal(true)
                          }}
                          className='flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
                          title='Ubah'
                        >
                          <IconEdit size={14} />
                        </button>
                        <button
                          type='button'
                          onClick={() => handleDelete(item)}
                          className='flex h-8 w-8 items-center justify-center rounded-lg border border-border text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20'
                          title='Hapus'
                        >
                          <IconTrash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <ShiftModal
          key={selectedItem?.id ?? 'new'}
          item={selectedItem}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          isSaving={isCreating || isUpdating}
        />
      )}
    </AppMain>
  )
}
