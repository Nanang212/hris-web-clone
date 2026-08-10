export interface SignIn {
  email: string
  password: string
  rememberMe?: boolean
}

export interface SignUp {
  email: string
  password: string
  name: string
}

export interface Auth {
  accessToken: string
  refreshToken: string
  csrfToken?: string
  user: {
    id: string
    email: string
    name: string
    roles: string[]
    createdAt: string
    updatedAt: string
  }
}

export interface RefreshToken {
  refreshToken: string
}
