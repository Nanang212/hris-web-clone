import { Link } from '@tanstack/react-router'

import { m } from '@/i18n/paraglide/messages'
import IconHris from '@/shared/components/icon-hris'

export function BackgroundDecor() {
  return (
    <div className='pointer-events-none absolute inset-0 overflow-hidden'>
      <div className='absolute -top-24 -left-24 h-80 w-80 rounded-full bg-primary/10 blur-3xl' />
      <div className='absolute -right-32 -bottom-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl' />
    </div>
  )
}

export function BrandMark() {
  return (
    <Link to='/' className='flex items-center gap-2.5'>
      <span className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
        <IconHris />
      </span>
      <span className='flex flex-col leading-tight'>
        <span className='text-sm font-bold'>{m.auth_activation_brand_name()}</span>
        <span className='text-[0.7rem] text-muted-foreground'>
          {m.auth_activation_brand_tagline()}
        </span>
      </span>
    </Link>
  )
}
