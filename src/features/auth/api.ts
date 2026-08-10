import type { Auth, SignIn } from '@/features/auth/types'
import { apiClient } from '@/shared/lib/axios'
import type { Envelope } from '@/shared/types'

export const signIn = async (req: SignIn) => {
  const res = await apiClient.post<Envelope<Auth>>('/api/v1/auth/signin', req)

  return res.data
}

export const signOut = async () => {
  const res = await apiClient.post<Envelope<Auth>>('/api/v1/auth/signout')

  return res.data
}
