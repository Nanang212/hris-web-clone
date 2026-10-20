import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/overtime/approval/')({
  beforeLoad: () => {
    throw redirect({
      to: '/approval',
      search: { tab: 'overtime' },
    })
  },
})
