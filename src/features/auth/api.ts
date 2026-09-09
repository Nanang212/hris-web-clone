import { apiClient } from '@/shared/lib/axios'
import type { Envelope } from '@/shared/types'

/**
 * Sign In
 * Authenticate user and return tokens
 * Method: POST /v1/auth/signin
 * Tags: IAM - Auth
 */

export interface SignInInput {
  email: string
  password: string
  rememberMe?: boolean
}

export interface SignInOutput {
  accessToken?: string
  csrfToken?: string
  refreshToken?: string
  userId?: string
}

export const signIn = async (input: SignInInput): Promise<Envelope<SignInOutput>> => {
  const { email, password, rememberMe } = input
  const out = await apiClient.post<Envelope<SignInOutput>>('/api/v1/auth/signin', {
    email,
    password,
    rememberMe,
  })
  return out.data
}

/**
 * Sign Out
 * Invalidate refresh token
 * Method: POST /v1/auth/signout
 * Tags: IAM - Auth
 */

export interface SignOutInput {
  refreshToken: string
}

export const signOut = async (input: SignOutInput): Promise<Envelope<Record<string, string>>> => {
  const { refreshToken } = input
  const out = await apiClient.post<Envelope<Record<string, string>>>('/api/v1/auth/signout', {
    refreshToken,
  })
  return out.data
}

/**
 * Verify email
 * Activate a newly registered account using the verification token sent by email
 * Method: POST /v1/auth/verify-email
 * Tags: IAM - Auth
 */

export interface VerifyUserInput {
  token: string
}

export interface VerifyUserOutput {
  userId?: string
}

export const verifyEmail = async (input: VerifyUserInput): Promise<Envelope<VerifyUserOutput>> => {
  const { token } = input
  const out = await apiClient.post<Envelope<VerifyUserOutput>>('/api/v1/auth/verify-email', {
    token,
  })
  return out.data
}

/**
 * Reset password
 * Set a new password using the OTP sent to the user's email
 * Method: POST /v1/auth/reset-password
 * Tags: IAM - Auth
 */

export interface ResetPasswordInput {
  email: string
  password: string
  confirmPassword: string
  otp: string
}

export interface ResetPasswordOutput {
  id?: string
  shouldActivate?: boolean
}

export const resetPassword = async (
  input: ResetPasswordInput,
): Promise<Envelope<ResetPasswordOutput>> => {
  const { confirmPassword, email, otp, password } = input
  const out = await apiClient.post<Envelope<ResetPasswordOutput>>('/api/v1/auth/reset-password', {
    email,
    password,
    otp,
    confirmPassword,
  })
  return out.data
}

/**
 * Request password reset
 * Request a password reset OTP be sent by email
 * Method: POST /v1/auth/forgot-password
 * Tags: IAM - Auth
 */

export interface ForgotPasswordInput {
  email: string
}

export interface ForgotPasswordOutput {
  userId?: string
}

export const requestPasswordReset = async (
  input: ForgotPasswordInput,
): Promise<Envelope<ForgotPasswordOutput>> => {
  const { email } = input
  const out = await apiClient.post<Envelope<ForgotPasswordOutput>>('/api/v1/auth/forgot-password', {
    email,
  })
  return out.data
}

/**
 * Refresh Tokens
 * Get a new access token and refresh token
 * Method: POST /v1/auth/refresh
 * Tags: IAM - Auth
 */

export interface RefreshInput {
  refreshToken: string
}

export interface RefreshOutput {
  accessToken?: string
  refreshToken?: string
  csrfToken?: string
  userId?: string
}

export const refreshTokens = async (input: RefreshInput): Promise<Envelope<RefreshOutput>> => {
  const { refreshToken } = input
  const out = await apiClient.post<Envelope<RefreshOutput>>('/api/v1/auth/refresh', {
    refreshToken,
  })
  return out.data
}
