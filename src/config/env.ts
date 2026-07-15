import { APP_NAME, DEFAULT_API_BASE_URL } from '@/constants/app'

export type AppEnvironment = {
  appName: string
  appVersion: string
  appMode: 'development' | 'staging' | 'production'
  apiBaseUrl: string
  enableMocks: boolean
  apiRateLimitWindowMs: number
  apiRateLimitMax: number
}

function parseBoolean(value: string | undefined, fallbackValue: boolean) {
  if (value === undefined) {
    return fallbackValue
  }

  if (value === 'true') {
    return true
  }

  if (value === 'false') {
    return false
  }

  throw new Error(`Invalid boolean environment value: ${value}`)
}

function normalizeApiBaseUrl(value: string | undefined) {
  if (!value) {
    return DEFAULT_API_BASE_URL
  }

  const trimmedValue = value.trim()
  if (trimmedValue === '') {
    return DEFAULT_API_BASE_URL
  }

  if (!trimmedValue.startsWith('/') && !/^https?:\/\//i.test(trimmedValue)) {
    throw new Error('VITE_API_BASE_URL must start with / or use a valid absolute URL')
  }

  return trimmedValue.replace(/\/+$/, '')
}

function parsePositiveInteger(value: string | undefined, fallbackValue: number) {
  if (value === undefined || value.trim() === '') {
    return fallbackValue
  }

  const parsedValue = Number(value)
  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new Error(`Invalid positive integer environment value: ${value}`)
  }

  return parsedValue
}

export const appEnvironment: AppEnvironment = {
  appName: import.meta.env.VITE_APP_NAME?.trim() || APP_NAME,
  appVersion: import.meta.env.VITE_APP_VERSION?.trim() || '0.1.0',
  appMode: import.meta.env.VITE_APP_ENV || 'development',
  apiBaseUrl: normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL),
  enableMocks: parseBoolean(import.meta.env.VITE_ENABLE_MOCKS, true),
  apiRateLimitWindowMs: parsePositiveInteger(import.meta.env.VITE_API_RATE_LIMIT_WINDOW_MS, 15000),
  apiRateLimitMax: parsePositiveInteger(import.meta.env.VITE_API_RATE_LIMIT_MAX, 8),
}
