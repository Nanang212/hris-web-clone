import { IconAlertTriangle, IconCheck, IconCircleCheck, IconLoader2, IconX } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import { m } from '@/i18n/paraglide/messages'
import { cn } from '@/shared/lib/utils'

export interface ApprovalActionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  action: 'approve' | 'reject'
  itemName?: string
  itemDetail?: string
  onConfirm: (note: string) => Promise<void> | void
}

export function ApprovalActionDialog({
  open,
  onOpenChange,
  action,
  itemName,
  itemDetail,
  onConfirm,
}: ApprovalActionDialogProps) {
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isApprove = action === 'approve'

  useEffect(() => {
    if (open) {
      setNote('')
      setSubmitting(false)
    }
  }, [open])

  const handleConfirm = async () => {
    try {
      setSubmitting(true)
      await onConfirm(note)
      onOpenChange(false)
    } catch (err) {
      console.error('Error confirming approval action:', err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md rounded-3xl p-6'>
        <DialogHeader className='flex flex-col items-center text-center gap-2'>
          <div
            className={cn(
              'size-14 rounded-2xl flex items-center justify-center shrink-0 mb-1',
              isApprove
                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
                : 'bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400',
            )}
          >
            {isApprove ? <IconCircleCheck size={32} /> : <IconAlertTriangle size={32} />}
          </div>

          <DialogTitle className='text-base sm:text-lg font-bold text-foreground'>
            {isApprove
              ? m.approval_dialog_confirm_approve_title()
              : m.approval_dialog_confirm_reject_title()}
          </DialogTitle>

          <DialogDescription className='text-xs text-muted-foreground max-w-sm'>
            {isApprove
              ? m.approval_dialog_confirm_approve_desc()
              : m.approval_dialog_confirm_reject_desc()}
          </DialogDescription>
        </DialogHeader>

        {/* Item context banner */}
        {itemName && (
          <div className='rounded-2xl border border-border/70 bg-muted/30 p-3 text-xs space-y-1'>
            <p className='font-bold text-foreground leading-snug'>{itemName}</p>
            {itemDetail && <p className='text-muted-foreground text-[11px]'>{itemDetail}</p>}
          </div>
        )}

        {/* Note / reason input area */}
        <div className='space-y-1.5'>
          <label className='text-xs font-semibold text-foreground flex items-center justify-between'>
            <span>{m.approval_dialog_note_label()}</span>
            {!isApprove && <span className='text-[10px] text-rose-500 font-normal'>(Wajib diisi)</span>}
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={
              isApprove
                ? m.approval_dialog_note_placeholder_approve()
                : m.approval_dialog_note_placeholder_reject()
            }
            rows={3}
            className='w-full rounded-2xl border border-input bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none transition-all'
          />
        </div>

        {/* Action buttons */}
        <DialogFooter className='flex flex-row items-center justify-end gap-2.5 pt-2'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => onOpenChange(false)}
            disabled={submitting}
            className='flex-1 rounded-xl h-9.5 text-xs font-semibold'
          >
            {m.approval_dialog_btn_cancel()}
          </Button>

          <Button
            type='button'
            size='sm'
            onClick={handleConfirm}
            disabled={submitting || (!isApprove && !note.trim())}
            className={cn(
              'flex-1 rounded-xl h-9.5 text-xs font-bold gap-1.5 shadow-sm text-white',
              isApprove
                ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98]'
                : 'bg-rose-600 hover:bg-rose-700 active:scale-[0.98]',
            )}
          >
            {submitting ? (
              <>
                <IconLoader2 size={14} className='animate-spin' />
                {m.approval_drawer_processing()}
              </>
            ) : isApprove ? (
              <>
                <IconCheck size={15} stroke={2.5} />
                {m.approval_dialog_btn_confirm_approve()}
              </>
            ) : (
              <>
                <IconX size={15} stroke={2.5} />
                {m.approval_dialog_btn_confirm_reject()}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
