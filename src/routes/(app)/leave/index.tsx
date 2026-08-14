import { createFileRoute } from '@tanstack/react-router'

import { SkeletonPattern } from '@/shared/components/skeleton-pattern'

export const Route = createFileRoute('/(app)/leave/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <SkeletonPattern
        padding={12}
        height={[14, 12, 100]}
        pattern={`
          ============
          ====+=======
          ============
        `}
      />
    </div>
  )
}
