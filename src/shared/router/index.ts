import { createRouter } from '@tanstack/react-router'

import { routeTree } from '@/shared/router/route-tree.gen'

export const router = createRouter({ routeTree, defaultViewTransition: true })
