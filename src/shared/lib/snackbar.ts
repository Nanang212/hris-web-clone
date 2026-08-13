import { toast } from 'sonner'

import axios from 'axios'

import type { Envelope } from '@/shared/types'

export const snackbar = {
  ...toast,
  exception: (err: unknown, message?: string) => {
    if (axios.isAxiosError<Envelope<unknown>>(err)) {
      const messages = err.response?.data.messages ?? [err.message]
      messages.forEach((message) => {
        toast.error(message, { richColors: true })
      })
    } else {
      toast.error(message ?? 'Please try again later!', { richColors: true })
    }
  },
}
