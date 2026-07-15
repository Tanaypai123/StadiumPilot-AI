import { appEnvironment } from '@/config/env'

export class ApiError extends Error {
  readonly status: number

  readonly details: unknown

  constructor(message: string, status: number, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

type RequestOptions = {
  method?: string
  headers?: HeadersInit
  body?: unknown
  signal?: AbortSignal
  timeoutMs?: number
}

function normalizePath(path: string) {
  const trimmedPath = path.trim()

  if (trimmedPath === '') {
    throw new Error('Request path cannot be empty')
  }

  if (trimmedPath.includes('..')) {
    throw new Error('Request path cannot contain parent directory traversal')
  }

  return trimmedPath.startsWith('/') ? trimmedPath : `/${trimmedPath}`
}

function createTimeoutSignal(signal: AbortSignal | undefined, timeoutMs: number) {
  if (timeoutMs <= 0) {
    return signal
  }

  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs)

  if (signal) {
    signal.addEventListener('abort', () => controller.abort(), { once: true })
  }

  controller.signal.addEventListener(
    'abort',
    () => window.clearTimeout(timeoutId),
    { once: true },
  )

  return controller.signal
}

function buildRequestUrl(path: string) {
  const normalizedPath = normalizePath(path)

  if (/^https?:\/\//i.test(appEnvironment.apiBaseUrl)) {
    return new URL(normalizedPath, appEnvironment.apiBaseUrl).toString()
  }

  return `${appEnvironment.apiBaseUrl.replace(/\/+$/, '')}${normalizedPath}`
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}) {
  const requestUrl = buildRequestUrl(path)
  const requestBody =
    options.body === undefined
      ? undefined
      : typeof options.body === 'string'
        ? options.body
        : JSON.stringify(options.body)

  const response = await fetch(requestUrl, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: requestBody,
    signal: createTimeoutSignal(options.signal, options.timeoutMs ?? 15000),
  })

  const contentType = response.headers.get('content-type') ?? ''
  const payload = contentType.includes('application/json')
    ? ((await response.json()) as T)
    : ((await response.text()) as T)

  if (!response.ok) {
    throw new ApiError(response.statusText || 'Request failed', response.status, payload)
  }

  return payload
}
