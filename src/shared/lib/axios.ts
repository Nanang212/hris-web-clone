import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios'

import { router } from '@/shared/router'
import type { Envelope } from '@/shared/types'

export function isAxiosError<ResponseType = Envelope<unknown>>(
  error: unknown,
): error is AxiosError<ResponseType> {
  return axios.isAxiosError(error)
}

declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean
  }
}

type JsonValue =
  string | number | boolean | null | undefined | JsonValue[] | { [key: string]: JsonValue }

const isPlainObject = (value: unknown): value is Record<string, JsonValue> =>
  Object.prototype.toString.call(value) === '[object Object]'

const snakeToCamel = (str: string): string =>
  str.replace(/_([a-zA-Z0-9])/g, (_match, chr: string) => chr.toUpperCase())

const camelToSnake = (str: string): string =>
  str.replace(/[A-Z]/g, (chr) => `_${chr.toLowerCase()}`)

function convertKeysDeep(data: unknown, converter: (key: string) => string): unknown {
  if (Array.isArray(data)) {
    return data.map((item) => convertKeysDeep(item, converter))
  }

  if (
    data instanceof File ||
    data instanceof Blob ||
    data instanceof FormData ||
    data instanceof Date
  ) {
    return data
  }

  if (isPlainObject(data)) {
    return Object.keys(data).reduce<Record<string, unknown>>((acc, key) => {
      acc[converter(key)] = convertKeysDeep(data[key], converter)
      return acc
    }, {})
  }

  return data
}

export const keysToCamel = <T = unknown>(data: unknown): T =>
  convertKeysDeep(data, snakeToCamel) as T

export const keysToSnake = <T = unknown>(data: unknown): T =>
  convertKeysDeep(data, camelToSnake) as T

const BASE_URL = import.meta.env.VITE_API_BASE_URL
if (!BASE_URL) throw new Error('No Base URL')

export const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // required so httpOnly auth cookies are sent and stored
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (config.data && isPlainObject(config.data)) {
      config.data = keysToSnake(config.data)
    }
    if (config.params && isPlainObject(config.params)) {
      config.params = keysToSnake(config.params)
    }
    return config
  },
  (error: AxiosError) => Promise.reject(error),
)

apiClient.interceptors.response.use(
  (response) => {
    if (response.data) {
      response.data = keysToCamel(response.data)
    }
    return response
  },
  (error: AxiosError) => {
    if (error.response?.data) {
      error.response.data = keysToCamel(error.response.data)
    }
    return Promise.reject(error)
  },
)

let isRefreshing = false

let pendingQueue: Array<{
  resolve: () => void
  reject: (error: unknown) => void
}> = []

function processQueue(error: unknown): void {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve()
    }
  })
  pendingQueue = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig | undefined

    let isTokenExpired = false

    if (isAxiosError<Envelope<unknown>>(error)) {
      isTokenExpired = error.response?.data.code === 'TOKEN_EXPIRED'
    }

    if (!isTokenExpired || !originalRequest || originalRequest._retry) {
      throw error
    }

    if (originalRequest.url?.includes('/auth/refresh')) {
      throw error
    }

    if (isRefreshing) {
      // A refresh is already in progress: queue this request and retry it
      // once the in-flight refresh completes.
      return new Promise<void>((resolve, reject) => {
        pendingQueue.push({ resolve, reject })
      }).then(() => apiClient(originalRequest))
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      await axios.post(`${apiClient.defaults.baseURL}/api/v1/auth/refresh`, {}, {
        withCredentials: true,
      } as AxiosRequestConfig)

      processQueue(null)

      return apiClient(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError)
      router.navigate({ to: '/signin' })
      throw refreshError
    } finally {
      isRefreshing = false
    }
  },
)
