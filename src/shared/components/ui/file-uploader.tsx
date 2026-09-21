import {
  IconDownload,
  IconFile,
  IconLoader2,
  IconSparkles,
  IconUpload,
  IconX,
} from '@tabler/icons-react'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'
import { toast } from 'sonner'

import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { Separator } from '@/shared/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip'
import { apiClient } from '@/shared/lib/axios'
import { cn } from '@/shared/lib/utils'
import type { Envelope } from '@/shared/types'

const multiFileUploadVariants = cva('m-1 transition ease-in-out delay-150 duration-300', {
  variants: {
    variant: {
      default: 'border-foreground/10 text-foreground bg-card hover:bg-card/80',
      secondary:
        'border-foreground/10 bg-secondary text-secondary-foreground hover:bg-secondary/80',
      destructive:
        'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
      inverted: 'inverted',
    },
  },
  defaultVariants: { variant: 'default' },
})

export interface FileUploaderItem {
  id?: string
  name: string
  size: number
  type: string
  preview?: string
  isUploading?: boolean
}

interface FileUploaderBaseProps
  extends
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'value'>,
    VariantProps<typeof multiFileUploadVariants> {
  placeholder?: string
  animation?: number
  maxCount?: number
  accept?: string
  maxSize?: number
  withPreview?: boolean
}

export interface FileUploaderSingleProps extends FileUploaderBaseProps {
  mode?: 'SINGLE'
  value?: string | null
  onFilesChange: (attachmentId: string | null) => void
}

export interface FileUploaderMultipleProps extends FileUploaderBaseProps {
  mode: 'MULTIPLE'
  value?: string[]
  onFilesChange: (attachmentIds: string[]) => void
}

export type FileUploaderProps = FileUploaderSingleProps | FileUploaderMultipleProps

interface GetFileInput {
  fileId: string
}

interface GetFileOutput {
  createdAt: string
  fileSizeBytes: number
  id: string
  mimeType: string
  originalFileName: string
  storageStatus: string
}

interface UploadFileInput {
  file: File
}

interface UploadFileOutput {
  id: string
}

const getFile = async ({ fileId }: GetFileInput): Promise<Envelope<GetFileOutput>> => {
  const out = await apiClient.get<Envelope<GetFileOutput>>(`/v1/files/${fileId}`)
  return out.data
}

const uploadFile = async ({ file }: UploadFileInput): Promise<Envelope<UploadFileOutput>> => {
  const formData = new FormData()
  formData.append('file', file)
  const out = await apiClient.post<Envelope<UploadFileOutput>>('/v1/files', formData)
  return out.data
}

function useGetFiles(ids: string[], enabled: boolean) {
  const [data, setData] = React.useState<GetFileOutput[]>([])
  const [loadedKey, setLoadedKey] = React.useState('')
  const idsKey = JSON.stringify(ids)

  React.useEffect(() => {
    if (!enabled) {
      return
    }

    let cancelled = false
    Promise.all((JSON.parse(idsKey) as string[]).map((id) => getFile({ fileId: id })))
      .then((responses) => {
        if (cancelled) return
        setData(responses.map((response) => response.data))
        setLoadedKey(idsKey)
      })
      .catch(() => {
        if (cancelled) return
        setData([])
        setLoadedKey(idsKey)
      })

    return () => {
      cancelled = true
    }
  }, [enabled, idsKey])

  return { data: enabled ? data : [], isLoading: enabled && loadedKey !== idsKey }
}

function useUploadFiles() {
  return React.useCallback(async (files: File[]) => {
    const responses = await Promise.all(files.map((file) => uploadFile({ file })))
    return responses.map((response, index) => ({ id: response.data.id, file: files[index] }))
  }, [])
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 Bytes'
  const units = ['Bytes', 'KB', 'MB', 'GB']
  const index = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${parseFloat((bytes / 1024 ** index).toFixed(2))} ${units[index]}`
}

export const FileUploader = React.forwardRef<HTMLButtonElement, FileUploaderProps>((props, ref) => {
  const {
    variant,
    placeholder = 'Select files',
    animation = 0,
    maxCount = 3,
    accept,
    maxSize,
    className,
    withPreview = false,
    mode = 'SINGLE',
    value,
    ...buttonProps
  } = props
  const [isAnimating, setIsAnimating] = React.useState(false)
  const [files, setFiles] = React.useState<FileUploaderItem[]>([])
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const uploadFiles = useUploadFiles()
  const attachmentIds = Array.isArray(value) ? value : value ? [value] : []
  const attachmentsQuery = useGetFiles(attachmentIds, attachmentIds.length > 0)

  const emitFilesChange = (ids: string[]) => {
    if (props.mode === 'MULTIPLE') {
      props.onFilesChange(ids)
    } else {
      props.onFilesChange(ids[0] ?? null)
    }
  }

  const mergedFiles = React.useMemo(() => {
    if (attachmentsQuery.isLoading) return files
    if (attachmentsQuery.data.length > 0) {
      return attachmentsQuery.data.map((attachment) => ({
        id: attachment.id,
        name: attachment.originalFileName,
        size: attachment.fileSizeBytes,
        type: attachment.mimeType,
      }))
    }
    return files
  }, [attachmentsQuery.data, attachmentsQuery.isLoading, files])

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? [])
    if (selectedFiles.length === 0) return

    const validFiles = selectedFiles.filter((file) => {
      if (maxSize && file.size > maxSize) {
        toast.error(`${file.name} exceeds the maximum size of ${formatFileSize(maxSize)}`, {
          richColors: true,
        })
        return false
      }
      return true
    })
    if (validFiles.length === 0) return

    const filesToUpload = mode === 'SINGLE' ? validFiles.slice(0, 1) : validFiles
    const temporaryFiles = filesToUpload.map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
      preview: withPreview ? URL.createObjectURL(file) : undefined,
      isUploading: true,
    }))
    setFiles((current) => (mode === 'SINGLE' ? temporaryFiles : [...current, ...temporaryFiles]))

    try {
      const uploadedFiles = await uploadFiles(filesToUpload)
      const uploadedIds = uploadedFiles.map((attachment) => attachment.id)
      setFiles((current) => [
        ...(mode === 'SINGLE' ? [] : current.slice(0, -temporaryFiles.length)),
        ...uploadedFiles.map((attachment, index) => ({
          id: attachment.id,
          name: attachment.file.name,
          size: attachment.file.size,
          type: attachment.file.type,
          preview: temporaryFiles[index].preview,
        })),
      ])
      if (mode === 'MULTIPLE') {
        emitFilesChange([...attachmentIds, ...uploadedIds])
      } else {
        emitFilesChange(uploadedIds)
      }
      toast.success(`${filesToUpload.length} file(s) uploaded successfully`, { richColors: true })
    } catch (error) {
      setFiles((current) => (mode === 'SINGLE' ? [] : current.slice(0, -temporaryFiles.length)))
      toast.error('Failed to upload files', { richColors: true })
      console.error('Upload error:', error)
    } finally {
      event.target.value = ''
    }
  }

  const removeFile = (index: number) => {
    const file = mergedFiles[index]
    if (!file?.id) return
    setFiles((current) => current.filter((item) => item.id !== file.id))
    if (mode === 'MULTIPLE') {
      emitFilesChange(attachmentIds.filter((id) => id !== file.id))
    } else {
      emitFilesChange([])
    }
  }

  const renderFile = (file: FileUploaderItem, index: number) => (
    <Badge
      key={file.id ?? `${file.name}-${index}`}
      className={cn(
        'cursor-default space-x-1',
        isAnimating && 'animate-bounce',
        multiFileUploadVariants({ variant }),
      )}
      style={{ animationDuration: `${animation}s` }}
      onClick={(event) => event.stopPropagation()}
    >
      {file.isUploading ? (
        <IconLoader2 className='h-4 w-4 animate-spin text-muted-foreground' />
      ) : file.preview && file.type.startsWith('image/') ? (
        <img src={file.preview} alt='' className='h-4 w-4 rounded-sm object-cover' />
      ) : (
        <IconFile className='h-4 w-4 text-muted-foreground' />
      )}
      {file.preview && !file.isUploading && (
        <a
          href={file.preview}
          target='_blank'
          rel='noopener noreferrer'
          aria-label={`Download ${file.name}`}
        >
          <IconDownload className='h-4 w-4 cursor-pointer text-muted-foreground' />
        </a>
      )}
      <Tooltip>
        <TooltipTrigger asChild>
          <span className='flex max-w-40 items-center truncate'>{file.name}</span>
        </TooltipTrigger>
        <TooltipContent>
          {file.name} {file.size > 0 && `(${formatFileSize(file.size)})`}
        </TooltipContent>
      </Tooltip>
      {!file.isUploading && (
        <button
          type='button'
          className='cursor-pointer'
          onClick={(event) => {
            event.stopPropagation()
            removeFile(index)
          }}
          aria-label={`Remove ${file.name}`}
        >
          <IconX className='h-4 w-4' />
        </button>
      )}
    </Badge>
  )

  const clearAllFiles = () => {
    setFiles([])
    if (mode === 'MULTIPLE') {
      emitFilesChange([])
    } else {
      emitFilesChange([])
    }
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <input
        ref={fileInputRef}
        type='file'
        multiple={mode === 'MULTIPLE'}
        accept={accept}
        onChange={handleFileChange}
        className='hidden'
      />
      <Button
        ref={ref}
        {...buttonProps}
        type='button'
        onClick={() => fileInputRef.current?.click()}
        className='h-9 w-full min-w-0 rounded-xl border border-border/80 bg-background px-3 py-1 text-sm font-normal shadow-2xs transition-[color,box-shadow,border-color] outline-none hover:bg-background focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 md:text-xs dark:aria-invalid:border-destructive dark:aria-invalid:ring-destructive/40'
      >
        {mergedFiles.length > 0 ? (
          <div className='flex w-full items-center justify-between'>
            <div className='flex flex-wrap items-center'>
              {mergedFiles.slice(0, maxCount).map(renderFile)}
              {mergedFiles.length > maxCount && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(event) => event.stopPropagation()}>
                    <Badge
                      variant='outline'
                      className='border-foreground/10 bg-transparent text-foreground'
                    >
                      + {mergedFiles.length - maxCount} more
                    </Badge>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className='w-full max-w-sm p-2'>
                    {mergedFiles.map((file, index) => (
                      <DropdownMenuItem
                        key={file.id ?? `${file.name}-${index}`}
                        onClick={(event) => event.stopPropagation()}
                      >
                        {renderFile(file, index)}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            <div className='flex items-center'>
              <button
                type='button'
                onClick={(event) => {
                  event.stopPropagation()
                  clearAllFiles()
                }}
                aria-label='Clear all files'
              >
                <IconX className='mx-2 h-4 cursor-pointer text-muted-foreground' />
              </button>
              <Separator orientation='vertical' className='flex h-full min-h-6' />
              <IconUpload className='mx-2 h-4 text-muted-foreground' />
            </div>
          </div>
        ) : (
          <div className='mx-auto flex w-full items-center justify-between'>
            <span className='text-sm text-muted-foreground'>{placeholder}</span>
            <IconUpload className='h-4 text-muted-foreground' />
          </div>
        )}
      </Button>
      {animation > 0 && mergedFiles.length > 0 && (
        <IconSparkles
          className={cn(
            'my-2 h-3 w-3 cursor-pointer self-end bg-background',
            !isAnimating && 'text-muted-foreground',
          )}
          onClick={() => setIsAnimating((current) => !current)}
        />
      )}
    </div>
  )
})

FileUploader.displayName = 'FileUploader'
