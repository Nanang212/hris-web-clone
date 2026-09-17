import { BProgress } from '@bprogress/core'
import { createRouter } from '@tanstack/react-router'

import { routeTree } from '@/shared/router/route-tree.gen'

export const router = createRouter({ routeTree, defaultViewTransition: true })

BProgress.configure({ showSpinner: false })

router.subscribe('onBeforeNavigate', ({ fromLocation, pathChanged }) => {
  if (fromLocation && pathChanged) BProgress.start()
})

router.subscribe('onResolved', () => {
  BProgress.done()
})
