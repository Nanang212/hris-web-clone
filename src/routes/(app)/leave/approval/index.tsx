import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/leave/approval/')({
  beforeLoad: () => {
    throw redirect({
      to: '/approval',
      search: { tab: 'leave' },
    })
  },
})
