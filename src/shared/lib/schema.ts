import { useMemo } from 'react'
import { z as zod } from 'zod'

import { useLocale } from '@/i18n/local-store'
import { m } from '@/i18n/paraglide/messages'

type Messages = typeof m

export function schema<Shape extends zod.ZodRawShape>(
  builder: (z: typeof zod, messages: Messages) => Shape,
) {
  return zod.object(builder(zod, m))
}

export function useSchema<Shape extends zod.ZodRawShape>(
  builder: (z: typeof zod, messages: Messages) => Shape,
) {
  const locale = useLocale()
  return useMemo(() => schema(builder), [locale])
}
