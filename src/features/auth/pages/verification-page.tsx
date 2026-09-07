import { Link } from '@tanstack/react-router'

import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Button } from '@/shared/components/ui/button'
import { Spinner } from '@/shared/components/ui/spinner'
import { snackbar } from '@/shared/lib/snackbar'
import { AuthLayout } from '@/features/auth/components/auth-layout'
import { useVerifyEmail } from '@/features/auth/hooks'
import { m } from '@/i18n/paraglide/messages'

interface VerificationPageProps {
  token?: string
}

export function VerificationPage({ token }: Readonly<VerificationPageProps>) {
  const { mutate, isPending, isSuccess, isError } = useVerifyEmail()

  const verify = () => {
    if (!token || isPending || isSuccess) return
    mutate(
      { token },
      {
        onSuccess: () => snackbar.success(m.auth_verification_success()),
        onError: (error) => snackbar.exception(error),
      },
    )
  }

  const getAlertMessage = () => {
    if (!token) return m.auth_verification_missing_token()
    if (isSuccess) return m.auth_verification_success()
    return m.auth_verification_error()
  }

  return (
    <AuthLayout title={m.auth_verification_title()} subtitle={m.auth_verification_subtitle()}>
      {(!token || isSuccess || isError) && (
        <Alert variant={!token || isError ? 'destructive-overlay' : 'info-overlay'}>
          <AlertDescription>{getAlertMessage()}</AlertDescription>
        </Alert>
      )}
      {token && !isSuccess && (
        <Button onClick={verify} disabled={isPending}>
          {isPending && <Spinner data-icon='inline-start' />}
          {m.auth_verification_submit_button()}
        </Button>
      )}
      <Button asChild variant='outline'>
        <Link to='/signin'>{m.auth_back_to_signin()}</Link>
      </Button>
    </AuthLayout>
  )
}
