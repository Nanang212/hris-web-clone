import { useMutation } from '@tanstack/react-query'

import { signIn, signOut } from '@/features/auth/api'

export const useSignIn = () => {
  return useMutation({
    mutationFn: signIn,
  })
}

export const useSignOut = () => {
  return useMutation({
    mutationFn: signOut,
  })
}
