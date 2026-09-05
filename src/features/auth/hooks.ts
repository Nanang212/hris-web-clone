import { useMutation } from '@tanstack/react-query'

import {
  requestPasswordReset,
  resetPassword,
  signIn,
  signOut,
  verifyEmail,
} from '@/features/auth/api'

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

export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: verifyEmail,
  })
}

export const useResetPassword = () => {
  return useMutation({
    mutationFn: resetPassword,
  })
}

export const useRequestPasswordReset = () => {
  return useMutation({
    mutationFn: requestPasswordReset,
  })
}
