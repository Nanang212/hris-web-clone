// dependency-modal.tsx — Warning modal when trying to delete master data that has active references
import { IconAlertTriangle, IconX } from '@tabler/icons-react'

interface DependencyModalProps {
  isOpen: boolean
  title: string
  dependencies: string[]
  onClose: () => void
}

export function DependencyModal({ isOpen, title, dependencies, onClose }: DependencyModalProps) {
  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm'>
      <div className='w-full max-w-md rounded-2xl bg-card p-6 shadow-xl ring-1 ring-foreground/5 animate-in fade-in-50 zoom-in-95 duration-150'>
        <div className='flex items-center justify-between border-b border-border pb-4'>
          <h3 className='flex items-center gap-1.5 text-sm font-bold text-destructive'>
            <IconAlertTriangle size={18} />
            Master Data Dependency
          </h3>
          <button
            type='button'
            onClick={onClose}
            className='rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground'
          >
            <IconX size={16} />
          </button>
        </div>
        <div className='mt-4 flex flex-col gap-3'>
          <p className='text-xs text-foreground'>
            Anda tidak dapat menghapus data <strong>{title}</strong> karena data ini masih digunakan oleh entitas/karyawan berikut:
          </p>
          <div className='max-h-40 overflow-y-auto rounded-xl bg-muted/50 p-3 ring-1 ring-foreground/5'>
            <ul className='list-inside list-disc space-y-1 text-xs text-muted-foreground'>
              {dependencies.map((dep, idx) => (
                <li key={idx}>{dep}</li>
              ))}
            </ul>
          </div>
          <div className='rounded-xl border border-amber-200 bg-amber-50 p-3.5 dark:border-amber-800 dark:bg-amber-900/20'>
            <p className='text-[10px] leading-relaxed text-amber-700 dark:text-amber-400'>
              <strong>Solusi:</strong> Ubah atau pindahkan data karyawan/entitas terkait ke data referensi lain terlebih dahulu sebelum menghapus data ini.
            </p>
          </div>
        </div>
        <div className='mt-5 flex justify-end gap-2 border-t border-border pt-4'>
          <button
            type='button'
            onClick={onClose}
            className='rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground transition-all hover:bg-primary/90'
          >
            Pahami
          </button>
        </div>
      </div>
    </div>
  )
}
