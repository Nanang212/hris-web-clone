import { IconLoader2, IconLogout } from '@tabler/icons-react'
import { Link, useNavigate } from '@tanstack/react-router'

import { Button } from '@/shared/components/ui/button'
import { snackbar } from '@/shared/lib/snackbar'
import { cn } from '@/shared/lib/utils'
import { useSignOut } from '@/features/auth/hooks'
import { m } from '@/i18n/paraglide/messages'

export type SignOutPageProps = React.ComponentProps<'div'>

export function SignOutPage({ className, ...props }: SignOutPageProps) {
  const navigate = useNavigate()
  const { mutate: signOut, isPending } = useSignOut()

  const handleSignOut = () => {
    signOut(
      { refreshToken: '' },
      {
        onSuccess: () => {
          snackbar.success(m.auth_signout_toast_success())
          navigate({ to: '/signin', replace: true })
        },
        onError: (error) => {
          snackbar.exception(error)
        },
      },
    )
  }

  return (
    <div
      className={cn('flex min-h-screen w-full items-center justify-center p-6', className)}
      {...props}
    >
      <div className='w-full max-w-sm text-center'>
        <div className='relative mx-auto mb-6 flex size-16 items-center justify-center'>
          <div className='absolute inset-0 rounded-full bg-primary/15 blur-xl' />
          <span className='relative flex size-16 animate-in items-center justify-center rounded-full bg-primary text-primary-foreground duration-500 zoom-in-50'>
            <IconLogout className='size-7' aria-hidden='true' />
          </span>
        </div>

        <h1 className='text-2xl font-semibold tracking-tight'>{m.auth_signout_title()}</h1>
        <p className='mt-2 text-sm text-balance text-muted-foreground'>
          {m.auth_signout_description()}
        </p>

        <div className='mt-8 flex flex-col gap-3'>
          <Button className='w-full' disabled={isPending} onClick={handleSignOut}>
            {isPending && <IconLoader2 data-icon='inline-start' className='animate-spin' />}
            {m.auth_signout_confirm_button()}
          </Button>
          <Button asChild variant='ghost' className='w-full'>
            <Link to='/'>{m.auth_signout_cancel_button()}</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
