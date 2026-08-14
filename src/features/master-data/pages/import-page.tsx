// import-page.tsx
import { useState, useRef } from 'react'
import { IconCloudUpload, IconFileSpreadsheet, IconX, IconCheck, IconLoader2 } from '@tabler/icons-react'
import { AppMain } from '@/shared/components/app-layout/app-main'
import { snackbar } from '@/shared/lib/snackbar'

export function ImportPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragActive, setIsDragActive] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [importSuccess, setImportSuccess] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true)
    } else if (e.type === 'dragleave') {
      setIsDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')) {
        setSelectedFile(file)
        setImportSuccess(false)
      } else {
        snackbar.error('Format file tidak didukung! Gunakan format .xlsx, .xls atau .csv')
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      setImportSuccess(false)
    }
  }

  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  const removeFile = () => {
    setSelectedFile(null)
    setImportSuccess(false)
    setImportProgress(0)
  }

  const handleImport = async () => {
    if (!selectedFile) {
      snackbar.error('Pilih file terlebih dahulu!')
      return
    }

    setImporting(true)
    setImportProgress(10)
    
    // Simulate upload progress
    const timer = setInterval(() => {
      setImportProgress((prev) => {
        if (prev >= 90) {
          clearInterval(timer)
          return 90
        }
        return prev + 20
      })
    }, 300)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1800))
      clearInterval(timer)
      setImportProgress(100)
      setImportSuccess(true)
      snackbar.success('Data master berhasil di-import massal!')
    } catch {
      snackbar.error('Gagal meng-import data master. Silakan periksa kembali template file Anda.')
    } finally {
      setImporting(false)
    }
  }

  return (
    <AppMain
      backTo='/settings/master-data'
      breadcrumbs={[
        { to: '/', label: 'Pengaturan' },
        { to: '/settings/master-data', label: 'Master Data' },
        { to: '.', label: 'Import' },
      ]}
      title='Import Master Data'
      subtitle='Unggah dokumen Excel untuk memproses update data master secara massal'
    >
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]'>
        {/* Main Upload Area */}
        <div className='flex flex-col gap-4'>
          <div className='rounded-2xl bg-card p-6 shadow-sm ring-1 ring-foreground/5'>
            <h3 className='mb-1 text-sm font-bold text-foreground'>Unggah File Template</h3>
            <p className='mb-5 text-xs text-muted-foreground'>Format yang didukung adalah Microsoft Excel (.xlsx, .xls) atau Comma Separated Values (.csv).</p>
            
            {/* Drag & Drop Area */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={selectedFile ? undefined : triggerFileSelect}
              className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed py-12 text-center transition-all duration-150 ${
                selectedFile 
                  ? 'border-emerald-300 bg-emerald-50/10 dark:border-emerald-800 dark:bg-emerald-950/10 cursor-default' 
                  : isDragActive
                    ? 'border-primary bg-primary/5 cursor-pointer scale-[0.99]'
                    : 'border-border bg-background cursor-pointer hover:border-primary/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type='file'
                accept='.xlsx, .xls, .csv'
                onChange={handleFileChange}
                className='hidden'
              />

              {!selectedFile ? (
                <>
                  <div className='flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary'>
                    <IconCloudUpload size={28} />
                  </div>
                  <p className='mt-4 text-xs font-semibold text-foreground'>
                    Klik untuk unggah atau seret file ke sini
                  </p>
                  <p className='mt-1 text-[10px] text-muted-foreground'>
                    Ukuran file maksimal 10MB
                  </p>
                </>
              ) : (
                <div className='flex flex-col items-center gap-3 px-4'>
                  <div className='flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 animate-bounce'>
                    <IconFileSpreadsheet size={28} />
                  </div>
                  <div>
                    <p className='text-xs font-bold text-foreground max-w-sm truncate'>{selectedFile.name}</p>
                    <p className='mt-0.5 text-[10px] text-muted-foreground'>
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  
                  {!importing && !importSuccess && (
                    <button
                      type='button'
                      onClick={(e) => {
                        e.stopPropagation()
                        removeFile()
                      }}
                      className='mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-red-600 hover:underline'
                    >
                      <IconX size={12} />
                      Hapus file
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Progress bar */}
            {(importing || importSuccess) && (
              <div className='mt-5 flex flex-col gap-2 rounded-xl bg-muted/30 p-4 border border-border/50'>
                <div className='flex items-center justify-between text-xs'>
                  <span className='flex items-center gap-1.5 font-semibold text-foreground'>
                    {importing ? (
                      <>
                        <IconLoader2 size={14} className='animate-spin text-primary' />
                        Memproses data...
                      </>
                    ) : (
                      <>
                        <IconCheck size={14} className='text-emerald-600' />
                        Selesai diproses
                      </>
                    )}
                  </span>
                  <span className='font-mono font-bold text-foreground'>{importProgress}%</span>
                </div>
                <div className='h-2 w-full overflow-hidden rounded-full bg-border'>
                  <div 
                    className='h-full bg-primary transition-all duration-300'
                    style={{ width: `${importProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className='mt-6 flex justify-end gap-2 border-t border-border pt-5'>
              {selectedFile && !importSuccess && (
                <button
                  type='button'
                  onClick={handleImport}
                  disabled={importing}
                  className='rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50'
                >
                  {importing ? 'Meng-import...' : 'Import Data'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Info & Instructions */}
        <div className='flex flex-col gap-4'>
          <div className='rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5'>
            <h3 className='mb-3 text-sm font-bold text-foreground'>Unduh Template Excel</h3>
            <p className='text-xs leading-relaxed text-muted-foreground'>
              Gunakan file template Excel kami untuk menghindari kesalahan kolom atau format tipe data master.
            </p>
            <button
              type='button'
              onClick={() => snackbar.info('Sedang mengunduh file template...')}
              className='mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted'
            >
              <IconFileSpreadsheet size={16} className='text-emerald-600' />
              Unduh Template (.xlsx)
            </button>
          </div>

          <div className='rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5'>
            <h3 className='mb-2 text-sm font-bold text-foreground'>Petunjuk Penting</h3>
            <ul className='list-inside list-decimal space-y-2 text-[11px] leading-relaxed text-muted-foreground'>
              <li>Jangan mengubah susunan kolom (header) pada file template.</li>
              <li>Pastikan tipe data string, angka, dan kode unik tidak terduplikasi.</li>
              <li>Kolom status hanya dapat diisi dengan: <strong>active</strong> atau <strong>inactive</strong>.</li>
            </ul>
          </div>
        </div>
      </div>
    </AppMain>
  )
}
