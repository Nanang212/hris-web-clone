import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'
import { Link } from '@tanstack/react-router'

export type SignOutPageProps = React.ComponentProps<'div'>

export function SignOutPage({ className, ...props }: SignOutPageProps) {
  return (
    <div
      className={cn(
        'flex min-h-screen w-full items-center justify-center p-6',
        className
      )}
      {...props}
    >
      <div className="w-full max-w-sm text-center">
        <div className="relative mx-auto mb-6 flex size-16 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-primary/15 blur-xl" />
          <span className="relative flex size-16 animate-in items-center justify-center rounded-full bg-primary text-primary-foreground duration-500 zoom-in-50">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="size-7"
              aria-hidden="true"
            >
              <path
                d="M4 12L10 18L20 6"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight">
          You've been signed out
        </h1>
        <p className="mt-2 text-sm text-balance text-muted-foreground">
          Your session has ended. Sign back in anytime to pick up where you left
          off.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Button asChild className="w-full">
            <Link to="/signin">Sign in again</Link>
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <Link to="/">Back to home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
